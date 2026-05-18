import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

/**
 * Create a Stripe Checkout Session for a given product.
 *
 * POST body: { product: string, email?: string }
 *   product = key from PRODUCT_TO_ENV_PRICE map (e.g. 'reset-room', 'the-reset')
 *   email   = optional, pre-fills Stripe Checkout
 *
 * Returns { url } — frontend redirects user to this URL.
 *
 * Configure success/cancel URLs via env:
 *   PUBLIC_SITE_URL (default https://staging.annalouwellness.com)
 */

const PRODUCT_TO_ENV_PRICE: Record<string, { envVar: string; mode: 'subscription' | 'payment' }> = {
  'reset-room': { envVar: 'STRIPE_PRICE_RESET_ROOM', mode: 'subscription' },
  'the-reset': { envVar: 'STRIPE_PRICE_THE_RESET', mode: 'payment' },
  signal: { envVar: 'STRIPE_PRICE_SIGNAL', mode: 'payment' },
  'signal-build': { envVar: 'STRIPE_PRICE_SIGNAL_BUILD', mode: 'payment' },
  'one-day': { envVar: 'STRIPE_PRICE_ONE_DAY', mode: 'payment' },
  'signal-collective': { envVar: 'STRIPE_PRICE_SIGNAL_COLLECTIVE', mode: 'payment' },
  'reset-session': { envVar: 'STRIPE_PRICE_RESET_SESSION', mode: 'payment' },
  workshop: { envVar: 'STRIPE_PRICE_WORKSHOP', mode: 'payment' },
};

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://staging.annalouwellness.com';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const product = (body?.product || '').trim();
  const email = (body?.email || '').trim().toLowerCase() || undefined;
  const mapping = PRODUCT_TO_ENV_PRICE[product];

  if (!mapping) {
    return NextResponse.json({ error: `Unknown product: ${product}` }, { status: 400 });
  }

  const priceId = process.env[mapping.envVar];
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price not configured for ${product} (set ${mapping.envVar})` },
      { status: 500 },
    );
  }

  try {
    const successPath = product === 'reset-room' ? '/community/reset-room/dashboard' : '/thank-you';
    const cancelPath = product === 'reset-room' ? '/community/reset-room' : `/${product}`;

    const session = await stripe.checkout.sessions.create({
      mode: mapping.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${SITE_URL}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}${cancelPath}`,
      // Pass product key in metadata so webhook can route without re-reading the price
      metadata: { product },
      // For subscriptions, allow promo codes
      ...(mapping.mode === 'subscription' && { allow_promotion_codes: true }),
    });

    if (!session.url) {
      return NextResponse.json({ error: 'No session URL returned by Stripe' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe checkout] error:', err?.message);
    return NextResponse.json({ error: `Stripe error: ${err?.message}` }, { status: 502 });
  }
}
