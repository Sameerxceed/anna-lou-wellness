import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { verifyTurnstile } from '@/lib/turnstile';

/**
 * Reset Letters dual-push subscribe endpoint.
 *
 * On submit:
 *  1. POST to Mailchimp API → tag based on launch state
 *     - Pre-22 June 2026 OR before 500-subscriber cap → "Founding Members" tag (welcome automation 1A)
 *     - After cap or after launch date → "Standard Subscribers" tag (welcome automation 1B)
 *  2. POST to Substack subscribe API in parallel (newsletter delivery)
 *
 * Returns 200 on success even if one of the two pushes fails (we want partial success
 * so a Mailchimp outage doesn't block Substack signups and vice versa). The error is logged.
 *
 * Env vars (set in Coolify → Next.js → Environment Variables):
 *   MAILCHIMP_API_KEY              - from Mailchimp → Profile → Extras → API keys. Format: 'xxxxxxxx-us8'
 *   MAILCHIMP_LIST_ID              - Audience ID (Audience → Settings → "Unique id for audience")
 *   MAILCHIMP_TAG_FOUNDING         - tag name for founding members (default 'Founding Members')
 *   MAILCHIMP_TAG_STANDARD         - tag name for standard subscribers (default 'Standard Subscribers')
 *   RESET_LETTERS_LAUNCH_DATE      - ISO date when standard tier kicks in (default 2026-06-22)
 *   SUBSTACK_PUBLICATION_URL       - default https://annalouwellness.substack.com
 */

const LAUNCH_DATE = new Date(process.env.RESET_LETTERS_LAUNCH_DATE || '2026-06-22T00:00:00Z');
const SUBSTACK_URL = process.env.SUBSTACK_PUBLICATION_URL || 'https://annalouwellness.substack.com';

function isFoundingWindow(): boolean {
  return new Date() < LAUNCH_DATE;
}

async function pushToMailchimp(email: string, firstName: string, founding: boolean) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const tagFounding = process.env.MAILCHIMP_TAG_FOUNDING || 'Founding Members';
  const tagStandard = process.env.MAILCHIMP_TAG_STANDARD || 'Standard Subscribers';

  if (!apiKey || !listId) {
    return { ok: false, error: 'Mailchimp not configured (missing API key or list ID)' };
  }

  // Datacenter is the suffix after the last '-' in the API key (e.g. '...-us8' → 'us8')
  const dc = apiKey.split('-').pop();
  if (!dc || dc === apiKey) {
    return { ok: false, error: 'Mailchimp API key malformed (missing datacenter suffix)' };
  }

  const baseUrl = `https://${dc}.api.mailchimp.com/3.0`;
  const tag = founding ? tagFounding : tagStandard;
  const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from('any:' + apiKey).toString('base64'),
  };

  try {
    // Step 1: upsert subscriber (PUT — creates if missing, updates if exists)
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

  // Step 2: attach tag (separate endpoint — Mailchimp keeps tags out of member upsert body)
  try {
    const tagRes = await fetch(`${baseUrl}/lists/${listId}/members/${subscriberHash}/tags`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tags: [{ name: tag, status: 'active' }],
      }),
    });
    if (!tagRes.ok) {
      const text = await tagRes.text();
      console.warn(`[mailchimp] tag attach ${tagRes.status}: ${text.slice(0, 200)}`);
    }
  } catch (err: any) {
    console.warn('[mailchimp] tag attach fetch failed:', err?.message);
  }

  return { ok: true };
}

async function pushToSubstack(email: string) {
  try {
    const res = await fetch(`${SUBSTACK_URL}/api/v1/free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, first_url: SUBSTACK_URL, first_referrer: 'https://staging.annalouwellness.com/reset-letters' }),
    });
    if (!res.ok) return { ok: false, error: `Substack ${res.status}` };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: `Substack fetch failed: ${err?.message}` };
  }
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

  // Cloudflare Turnstile CAPTCHA — blocks bots from flooding the list.
  // Token comes from the <TurnstileWidget /> on the signup form.
  const captcha = await verifyTurnstile(
    body?.turnstileToken,
    req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
  );
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  const founding = isFoundingWindow();

  const [mailchimp, substack] = await Promise.all([
    pushToMailchimp(email, firstName, founding),
    pushToSubstack(email),
  ]);

  if (!mailchimp.ok) console.warn('[reset-letters subscribe] Mailchimp error:', mailchimp.error);
  if (!substack.ok) console.warn('[reset-letters subscribe] Substack error:', substack.error);

  // Origin attribution — captured client-side from ?utm_source=...
  // Adds a SECOND tag like "Origin: substack" so Anna can fork the
  // welcome journey for Substack-arrival visitors.
  const utmSource = typeof body?.utm_source === 'string' ? body.utm_source.trim().toLowerCase() : '';
  if (mailchimp.ok && utmSource && /^[a-z0-9_-]{1,40}$/.test(utmSource)) {
    const { addTag } = await import('@/lib/mailchimp');
    addTag(email, `Origin: ${utmSource}`).catch((e) => console.warn('[reset-letters subscribe] origin tag failed:', e?.message));
  }

  if (mailchimp.ok) {
    return NextResponse.json({
      ok: true,
      founding,
      mailchimp: mailchimp.ok,
      substack: substack.ok,
    });
  }

  return NextResponse.json({
    error: 'We could not save your subscription. Please try again or email hello@annalouwellness.com.',
    detail: mailchimp.error,
  }, { status: 502 });
}
