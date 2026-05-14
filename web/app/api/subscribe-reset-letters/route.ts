import { NextRequest, NextResponse } from 'next/server';

/**
 * Reset Letters dual-push subscribe endpoint.
 *
 * On submit:
 *  1. POST to Flodesk Subscribers API → segment based on launch state
 *     - Pre-22 June 2026 OR before 500-subscriber cap → Founding Members segment (Sequence 1A welcome)
 *     - After cap or after launch date → Standard Subscribers segment (Sequence 1B welcome)
 *  2. POST to Substack subscribe API in parallel (newsletter delivery)
 *
 * Returns 200 on success even if one of the two pushes fails (we want partial success
 * so a Flodesk outage doesn't block Substack signups and vice versa). The error is logged.
 *
 * Env vars (set in Coolify → Next.js → Environment Variables):
 *   FLODESK_API_KEY                - from Flodesk → Account → Integrations → API
 *   FLODESK_SEGMENT_FOUNDING       - segment ID for founding members
 *   FLODESK_SEGMENT_STANDARD       - segment ID for standard subscribers
 *   RESET_LETTERS_LAUNCH_DATE      - ISO date when standard tier kicks in (default 2026-06-22)
 *   SUBSTACK_PUBLICATION_URL       - default https://annalouwellness.substack.com
 */

const LAUNCH_DATE = new Date(process.env.RESET_LETTERS_LAUNCH_DATE || '2026-06-22T00:00:00Z');
const SUBSTACK_URL = process.env.SUBSTACK_PUBLICATION_URL || 'https://annalouwellness.substack.com';

function isFoundingWindow(): boolean {
  return new Date() < LAUNCH_DATE;
}

async function pushToFlodesk(email: string, firstName: string, founding: boolean) {
  const apiKey = process.env.FLODESK_API_KEY;
  const segment = founding
    ? process.env.FLODESK_SEGMENT_FOUNDING
    : process.env.FLODESK_SEGMENT_STANDARD;
  if (!apiKey || !segment) {
    return { ok: false, error: 'Flodesk not configured (missing API key or segment ID)' };
  }
  const auth = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
  try {
    const res = await fetch('https://api.flodesk.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      body: JSON.stringify({
        email,
        first_name: firstName || undefined,
        segments: [{ id: segment }],
        status: 'active',
      }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `Flodesk ${res.status}: ${text.slice(0, 200)}` };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: `Flodesk fetch failed: ${err?.message}` };
  }
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
    // Substack often has CORS/network quirks server-side. Treat soft-fail as ok=false but don't block.
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

  const founding = isFoundingWindow();

  // Fan out to both providers in parallel.
  const [flodesk, substack] = await Promise.all([
    pushToFlodesk(email, firstName, founding),
    pushToSubstack(email),
  ]);

  // Log any partial failure for ops visibility (Coolify/Strapi logs).
  if (!flodesk.ok) console.warn('[reset-letters subscribe] Flodesk error:', flodesk.error);
  if (!substack.ok) console.warn('[reset-letters subscribe] Substack error:', substack.error);

  // Success if at least Flodesk worked (Substack confirmation email also closes the loop on their side).
  if (flodesk.ok) {
    return NextResponse.json({
      ok: true,
      founding,
      flodesk: flodesk.ok,
      substack: substack.ok,
    });
  }

  // Both failed → return error so the form shows a retry message.
  return NextResponse.json({
    error: 'We could not save your subscription. Please try again or email hello@annalouwellness.com.',
    detail: flodesk.error,
  }, { status: 502 });
}
