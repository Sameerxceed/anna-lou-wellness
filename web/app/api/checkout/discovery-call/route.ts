import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { fetchAPI } from '@/lib/strapi';

/**
 * Discovery Call £10 refundable checkout.
 *
 * Anna's 10 Jul brief:
 *  - Contact page shows the £10 refundable promise + "Why £10?" accordion.
 *  - Book my call goes STRAIGHT to Stripe (not Calendly first). Payment
 *    then calendar, because that is the order that makes the tenner work.
 *  - Refund promise lives on the Stripe checkout page as the product
 *    description, since that is where the hesitation actually happens.
 *  - After payment, redirect to the Calendly booking page.
 *
 * All copy + price + product name + Calendly URL come from the Contact
 * singleton in the CMS so Anna can edit any of them without code changes.
 *
 * Refund flow: Anna refunds via the Stripe dashboard after the call
 * happens. No automated refund on attendance — Anna handles it manually
 * per her preferred rhythm.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadContactDefaults() {
  const { data } = await fetchAPI('/contact-page', {});
  const cms = (data && (Array.isArray(data) ? data[0] : data)) || {};
  return {
    priceGbp: Number(cms.discovery_price_gbp || 10),
    productName: String(cms.discovery_stripe_product_name || 'Discovery call booking'),
    description: String(cms.discovery_stripe_description || ''),
    calendlyUrl: String(cms.discovery_calendly_url || '').trim(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email: string = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    const cfg = await loadContactDefaults();

    if (!cfg.calendlyUrl) {
      return NextResponse.json(
        {
          error:
            'Discovery Call is not yet configured. Please ask Anna to fill the Calendly URL on the Contact page in the CMS.',
        },
        { status: 500 },
      );
    }

    const unitPence = Math.round(cfg.priceGbp * 100);
    if (!Number.isFinite(unitPence) || unitPence < 100) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 500 });
    }

    const siteUrl =
      process.env.PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      'https://staging.annalouwellness.com';

    // success_url appends the Stripe session id so we can later reconcile
    // Stripe payments with Calendly bookings if we ever want to.
    const separator = cfg.calendlyUrl.includes('?') ? '&' : '?';
    const successUrl = `${cfg.calendlyUrl}${separator}stripe_session={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: cfg.productName,
              ...(cfg.description ? { description: cfg.description } : {}),
            },
            unit_amount: unitPence,
          },
          quantity: 1,
        },
      ],
      ...(email ? { customer_email: email } : {}),
      success_url: successUrl,
      cancel_url: `${siteUrl}/contact`,
      allow_promotion_codes: false,
      billing_address_collection: 'auto',
      metadata: {
        source: 'discovery_call',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[checkout/discovery-call] failed:', err?.message);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again in a moment.' },
      { status: 502 },
    );
  }
}
