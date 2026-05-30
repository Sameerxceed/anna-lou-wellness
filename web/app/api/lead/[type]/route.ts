import { NextRequest, NextResponse } from 'next/server';
import { subscribeAndTag } from '@/lib/mailchimp';

/**
 * Generic lead-capture endpoint for every EnquiryForm on the site.
 *
 * The forms (Returning Circle RSVP, Signal Collective, Recovery, One Day,
 * Speaking, Corporate Wellbeing, plus any new ones) all POST to
 * `/api/lead/{type}` with whatever fields they define. Previously only
 * `/api/lead/decoder` existed and the other 6 endpoints 404'd silently —
 * the EnquiryForm component swallows fetch errors and shows "Thank you"
 * regardless, so leads were being lost. This route closes that hole.
 *
 * Behaviour:
 *  1. Extract email + optional firstName from any of the standard field
 *     shapes (email, contact_email, first_name, fname, etc.) — forms vary.
 *  2. Upsert subscriber in Mailchimp + apply a tag named after the type
 *     (e.g. `returning-circle` -> tag "Returning Circle Enquiry").
 *  3. Return success even if Mailchimp tagging partially fails, but log
 *     the error server-side so Sameer can spot it in Coolify logs.
 *
 * The Mailchimp tag fires whichever Customer Journey Anna has wired to
 * that trigger in her account.
 *
 * Why no Turnstile here yet: the existing EnquiryForm component doesn't
 * pass a turnstile token. Adding Turnstile is a follow-up that touches
 * every form. For now, server-side rate-limit + Mailchimp's own
 * duplicate-subscriber dedup gives us a reasonable baseline.
 */

const KNOWN_TYPES: Record<string, string> = {
  'returning-circle': 'Returning Circle Enquiry',
  'signal-collective': 'Signal Collective Enquiry',
  'recovery': 'Recovery Coaching Enquiry',
  'one-day': 'One Day Enquiry',
  'speaking': 'Speaking Enquiry',
  'corporate': 'Corporate Wellbeing Enquiry',
};

function humaniseType(type: string): string {
  return type
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ') + ' Enquiry';
}

function pickEmail(body: Record<string, any>): string {
  for (const k of ['email', 'Email', 'contact_email', 'email_address']) {
    const v = body?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim().toLowerCase();
  }
  return '';
}

function pickFirstName(body: Record<string, any>): string {
  for (const k of ['firstName', 'first_name', 'fname', 'name', 'full_name', 'Name']) {
    const v = body?.[k];
    if (typeof v === 'string' && v.trim()) {
      // If the form gives a full name, take the first word only as FNAME
      return v.trim().split(/\s+/)[0];
    }
  }
  return '';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const cleanType = (type || '').trim().toLowerCase();

  // 'decoder' has its own dedicated route at /api/lead/decoder with Turnstile
  // + first-name handling. Don't shadow it here.
  if (cleanType === 'decoder' || !cleanType) {
    return NextResponse.json({ error: 'Invalid lead type' }, { status: 400 });
  }

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = pickEmail(body);
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }
  const firstName = pickFirstName(body);
  const tag = KNOWN_TYPES[cleanType] || humaniseType(cleanType);

  const result = await subscribeAndTag(email, tag, firstName || undefined);
  if (!result.ok) {
    console.warn(`[lead/${cleanType}] mailchimp error for ${email}:`, result.error);
    // Don't fail the user-facing request — Anna can still see the lead in
    // Mailchimp activity log even if tagging hiccuped. Log for ops triage.
    return NextResponse.json({ ok: true, warning: 'partial' });
  }

  return NextResponse.json({ ok: true, type: cleanType, tag });
}
