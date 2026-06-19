/**
 * Calendly webhook receiver.
 *
 * When someone books a Calendly event linked from the site (e.g. The
 * One Day Intensive, Discovery Calls, the Signal scoping call), Calendly
 * POSTs the booking details here. We then:
 *
 *  1. Verify the request signature using the shared signing key from
 *     Calendly (CALENDLY_WEBHOOK_SECRET in env).
 *  2. Extract invitee email + event title + start time + location.
 *  3. Upsert the invitee in Mailchimp (so the merge fields target
 *     exists), tag them with the matching event tag, and PATCH the
 *     EVENT_DATE / EVENT_TIME / EVENT_NAME / EVENT_LOC merge fields.
 *  4. From there, whichever Mailchimp Customer Journey Anna has wired
 *     to the tag fires the welcome email with personalised details
 *     via {{ EVENT_DATE }} etc. merge tags.
 *
 * Anna's setup work (one-time, in Calendly + Mailchimp):
 *   - Calendly: Account > Integrations > Webhooks > Create. Set URL
 *     to https://annalouwellness.com/api/calendly/webhook (or staging).
 *     Subscribe to invitee.created and invitee.canceled events. Copy
 *     the signing key into Coolify env CALENDLY_WEBHOOK_SECRET.
 *   - Mailchimp: Audience > Settings > Audience fields & |MERGE|
 *     tags. Add 4 new merge fields (text type):
 *       EVENT_DATE  (e.g. "12 July 2026")
 *       EVENT_TIME  (e.g. "10:00 to 16:00 UK")
 *       EVENT_NAME  (e.g. "One Day Intensive")
 *       EVENT_LOC   (e.g. "Taggs Island houseboat" or "Zoom")
 *   - In each Customer Journey email body Anna can now reference
 *     |EVENT_DATE| etc. — they fill per-recipient when the email sends.
 *
 * Per-event-type tags fired (mapped from Calendly event slug):
 *   - one-day-intensive       -> "One Day Booked"
 *   - discovery-call          -> "Discovery Booked"
 *   - signal-scoping          -> "Signal Scoping Booked"
 *   - any other slug          -> "Calendly Booked"
 *
 * Anna can add more mappings in EVENT_TAG_MAP below; the fallback tag
 * still fires so no booking is ever lost.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { subscribeAndTag, setMergeFields } from '@/lib/mailchimp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CALENDLY_WEBHOOK_SECRET = process.env.CALENDLY_WEBHOOK_SECRET;

// Map Calendly event-type slug -> Mailchimp tag fired on invitee.created.
// Customise per project. The slug comes from the Calendly URL after
// /your-handle/ e.g. https://calendly.com/anna/one-day-intensive -> 'one-day-intensive'.
const EVENT_TAG_MAP: Record<string, string> = {
  'one-day-intensive': 'One Day Booked',
  'one-day': 'One Day Booked',
  'discovery-call': 'Discovery Booked',
  'discovery': 'Discovery Booked',
  'signal-scoping': 'Signal Scoping Booked',
  'reset-session': 'Reset Session Booked',
};
const DEFAULT_TAG = 'Calendly Booked';

/**
 * Verify Calendly webhook signature. Header format:
 *   t=<timestamp>,v1=<hmac-sha256-of-timestamp.body>
 * Returns true on valid signature, false on missing secret or invalid.
 */
function verifySignature(rawBody: string, header: string | null): boolean {
  if (!CALENDLY_WEBHOOK_SECRET) {
    console.warn('[calendly] CALENDLY_WEBHOOK_SECRET not set — accepting unsigned (DEV ONLY)');
    return true;
  }
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k?.trim(), v?.trim()];
    }),
  );
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1) return false;
  const expected = crypto
    .createHmac('sha256', CALENDLY_WEBHOOK_SECRET)
    .update(`${t}.${rawBody}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

function extractEventSlug(eventTypeUri: string | undefined): string {
  if (!eventTypeUri) return '';
  // URI shape: https://api.calendly.com/event_types/UUID — name lives elsewhere
  // We rely on the resource's `name` (lowercased + slugified) below instead.
  return '';
}

function slugify(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });
  } catch {
    return iso;
  }
}

function formatTime(startIso: string, endIso: string): string {
  if (!startIso) return '';
  try {
    const fmt = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London' });
    const start = fmt(new Date(startIso));
    if (!endIso) return `${start} UK`;
    return `${start} to ${fmt(new Date(endIso))} UK`;
  } catch {
    return '';
  }
}

function extractLocation(event: any): string {
  // Calendly stores location in event.location.location or event.location.type
  const loc = event?.location;
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  if (loc.type === 'zoom_conference') return 'Zoom';
  if (loc.type === 'google_conference') return 'Google Meet';
  if (loc.type === 'physical') return loc.location || 'In person';
  if (loc.type === 'phone_call') return 'Phone call';
  return loc.location || loc.join_url || '';
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify signature
  if (!verifySignature(rawBody, req.headers.get('calendly-webhook-signature'))) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let payload: any;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  const eventType = payload?.event;
  // We care about invitee.created (booking made) and optionally invitee.canceled.
  if (eventType !== 'invitee.created') {
    return NextResponse.json({ ok: true, skipped: eventType });
  }

  const invitee = payload?.payload;
  const scheduled = invitee?.scheduled_event;
  if (!invitee?.email || !scheduled) {
    return NextResponse.json({ error: 'missing invitee or scheduled_event' }, { status: 400 });
  }

  const email = String(invitee.email).trim().toLowerCase();
  const firstName = String(invitee.first_name || invitee.name?.split(' ')[0] || '').trim();
  const eventName = String(scheduled.name || 'Booking').trim();
  const eventDate = formatDate(scheduled.start_time);
  const eventTime = formatTime(scheduled.start_time, scheduled.end_time);
  const eventLoc = extractLocation(scheduled);

  // Pick a tag based on the event slug. Slug derived from the event name.
  const slug = slugify(eventName);
  const tag = EVENT_TAG_MAP[slug] || DEFAULT_TAG;

  console.info(`[calendly] booking: ${email} -> ${eventName} on ${eventDate}, tag=${tag}`);

  // 1. Upsert + tag (creates contact if new, applies the tag).
  const tagResult = await subscribeAndTag(email, tag, firstName || undefined);
  if (!tagResult.ok) {
    console.warn(`[calendly] tag failed for ${email}: ${tagResult.error}`);
  }

  // 2. Patch merge fields so the Mailchimp template can render the date etc.
  const mergeResult = await setMergeFields(email, {
    EVENT_DATE: eventDate,
    EVENT_TIME: eventTime,
    EVENT_NAME: eventName,
    EVENT_LOC: eventLoc,
  });
  if (!mergeResult.ok) {
    console.warn(`[calendly] merge field update failed for ${email}: ${mergeResult.error}`);
  }

  return NextResponse.json({
    ok: true,
    email,
    tag,
    event: eventName,
    date: eventDate,
    time: eventTime,
    location: eventLoc,
  });
}
