import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { verifyTurnstile } from '@/lib/turnstile';

/**
 * Decoder signup endpoint.
 *
 * Triggered by the form on /free/nervous-system-decoder. On submit:
 *   1. Verify Turnstile token (blocks bots)
 *   2. Upsert subscriber in Mailchimp audience
 *   3. Apply the "Decoder Subscriber" tag → fires Anna's Decoder Upsell
 *      Customer Journey (3 emails over 4 days, exits if REGULATED purchased)
 *
 * Returns 200 even if Mailchimp tagging fails partially — the subscriber
 * row gets created either way, Anna can manually re-tag if she sees a gap.
 *
 * Env (set in Coolify → Next.js → Environment Variables):
 *   MAILCHIMP_API_KEY              - format: 'xxxxxxxx-us8'
 *   MAILCHIMP_LIST_ID              - default audience '8bcbe7b0d1'
 *   MAILCHIMP_TAG_DECODER          - default 'Decoder Subscriber'
 *   TURNSTILE_SECRET_KEY           - Cloudflare Turnstile secret
 */

async function pushToMailchimp(email: string, firstName: string) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID || '8bcbe7b0d1';
  const tag = process.env.MAILCHIMP_TAG_DECODER || 'Decoder Subscriber';

  if (!apiKey) {
    return { ok: false, error: 'Mailchimp not configured (missing API key)' };
  }

  const dc = apiKey.split('-').pop();
  if (!dc || dc === apiKey) {
    return { ok: false, error: 'Mailchimp API key malformed (missing datacenter suffix)' };
  }

  const baseUrl = `https://${dc}.api.mailchimp.com/3.0`;
  const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from('any:' + apiKey).toString('base64'),
  };

  // Step 1: upsert subscriber
  try {
    const upsertRes = await fetch(`${baseUrl}/lists/${listId}/members/${subscriberHash}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'subscribed',
        merge_fields: firstName ? { FNAME: firstName } : {},
      }),
    });
    if (!upsertRes.ok) {
      const text = await upsertRes.text();
      return { ok: false, error: `Mailchimp upsert ${upsertRes.status}: ${text.slice(0, 200)}` };
    }
  } catch (err: any) {
    return { ok: false, error: `Mailchimp upsert fetch failed: ${err?.message}` };
  }

  // Step 2: apply Decoder Subscriber tag (this is what triggers Anna's journey)
  try {
    const tagRes = await fetch(`${baseUrl}/lists/${listId}/members/${subscriberHash}/tags`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tags: [{ name: tag, status: 'active' }] }),
    });
    if (!tagRes.ok) {
      const text = await tagRes.text();
      console.warn(`[decoder] tag attach ${tagRes.status}: ${text.slice(0, 200)}`);
    }
  } catch (err: any) {
    console.warn('[decoder] tag attach fetch failed:', err?.message);
  }

  return { ok: true };
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = (body?.email || '').trim().toLowerCase();
  const firstName = (body?.firstName || '').trim();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const captcha = await verifyTurnstile(
    body?.turnstileToken,
    req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
  );
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  const mailchimp = await pushToMailchimp(email, firstName);
  if (!mailchimp.ok) {
    console.warn('[decoder signup] Mailchimp error:', mailchimp.error);
    return NextResponse.json({
      error: 'We could not save your subscription. Please try again or email hello@annalouwellness.com.',
      detail: mailchimp.error,
    }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
