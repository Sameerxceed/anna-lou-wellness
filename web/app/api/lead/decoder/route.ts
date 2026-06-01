import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { verifyTurnstile } from '@/lib/turnstile';

/**
 * Decoder signup endpoint.
 *
 * Two surfaces submit here:
 *   1. The landing-page form on /free/nervous-system-decoder
 *      (just collects email — no quiz result)
 *   2. The quiz email gate at /free/nervous-system-decoder/quiz
 *      (sends `result` = 'clear' | 'scrambled' | 'faint')
 *
 * On submit:
 *   1. Verify Turnstile token IF supplied (landing-page form sends it;
 *      the quiz email gate does not, accepted)
 *   2. Upsert subscriber in Mailchimp audience
 *   3. Apply tags:
 *      - Always: "Decoder Subscriber" (broad)
 *      - If `result` was sent: also "Decoder · Signal Clear" /
 *        "Decoder · Signal Scrambled" / "Decoder · Signal Faint"
 *
 * Anna's Mailchimp Customer Journeys listen for these tags — the broad
 * one for the general welcome flow, the result-specific ones for the
 * branched follow-up flows (meditation for Clear, REGULATED upsell for
 * Scrambled + Faint).
 *
 * Returns 200 even if tag attach partially fails (the subscriber row is
 * created either way; Anna can re-tag if needed).
 *
 * Env (set in Coolify → Next.js → Environment Variables):
 *   MAILCHIMP_API_KEY              - format: 'xxxxxxxx-us8'
 *   MAILCHIMP_LIST_ID              - default audience '8bcbe7b0d1'
 *   MAILCHIMP_TAG_DECODER          - default 'Decoder Subscriber'
 *   TURNSTILE_SECRET_KEY           - Cloudflare Turnstile secret
 */

const RESULT_TAGS: Record<string, string> = {
  clear: 'Decoder · Signal Clear',
  scrambled: 'Decoder · Signal Scrambled',
  faint: 'Decoder · Signal Faint',
};

async function pushToMailchimp(email: string, firstName: string, extraTags: string[] = []) {
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

  // Step 2: apply Decoder Subscriber tag (broad) + any result-specific tags
  // (which fire Anna's branched Customer Journeys).
  try {
    const tags = [
      { name: tag, status: 'active' },
      ...extraTags.map((t) => ({ name: t, status: 'active' })),
    ];
    const tagRes = await fetch(`${baseUrl}/lists/${listId}/members/${subscriberHash}/tags`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tags }),
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
  const result = String(body?.result || '').trim().toLowerCase();
  const resultTag = String(body?.resultTag || '').trim();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Turnstile only required if the caller sent a token (landing-page form does;
  // quiz email gate doesn't, since the quiz itself is friction enough).
  if (body?.turnstileToken) {
    const captcha = await verifyTurnstile(
      body?.turnstileToken,
      req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
    );
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 });
    }
  }

  // Build the list of extra tags for this submission:
  //  - explicit resultTag from the quiz client (preferred — keeps tag names in one place)
  //  - else derive from result if it's one of our known states
  const extraTags: string[] = [];
  if (resultTag) {
    extraTags.push(resultTag);
  } else if (result && RESULT_TAGS[result]) {
    extraTags.push(RESULT_TAGS[result]);
  }

  const mailchimp = await pushToMailchimp(email, firstName, extraTags);
  if (!mailchimp.ok) {
    console.warn('[decoder signup] Mailchimp error:', mailchimp.error);
    return NextResponse.json({
      error: 'We could not save your subscription. Please try again or email hello@annalouwellness.com.',
      detail: mailchimp.error,
    }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
