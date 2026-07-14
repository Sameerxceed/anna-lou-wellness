import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { fetchAPI } from '@/lib/strapi';

/**
 * One-off GBP 10 checkout for a Returning Circle recording.
 *
 * Anna 13 Jul brief:
 *  - GBP 10 for a single week's recording (Tuesday session).
 *  - Unlisted YouTube link is the deliverable. Anna pastes it into the
 *    Community Event singleton each week.
 *  - Button hides on the page when the YouTube URL is blank -- prevents
 *    selling access to a recording that isn't ready yet.
 *  - After payment: success page shows the link + Resend emails it.
 *
 * The recurring GBP 10/week + skip-a-week self-serve is a separate,
 * bigger build (see memory: returning_circle_recording_subscription).
 * This route is one-off only.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadRecordingConfig() {
  const { data } = await fetchAPI('/community-event-pages', {
    'filters[slug][$eq]': 'the-returning-circle',
    'pagination[pageSize]': 1,
  });
  const cms = Array.isArray(data) && data.length > 0 ? (data[0] as Record<string, unknown>) : {};
  return {
    priceGbp: Number(cms.recording_price_gbp || 10),
    productName:
      String(cms.recording_stripe_product_name || 'Returning Circle - weekly recording'),
    description: String(cms.recording_stripe_description || ''),
    weekLabel: String(cms.recording_week_label || '').trim(),
    youtubeUrl: String(cms.recording_youtube_url || '').trim(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email: string =
      typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const firstName: string =
      typeof body?.firstName === 'string' ? body.firstName.trim().slice(0, 60) : '';

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address so we can send you the recording.' },
        { status: 400 },
      );
    }

    const cfg = await loadRecordingConfig();

    if (!cfg.youtubeUrl) {
      return NextResponse.json(
        {
          error:
            'This week\'s recording is not ready yet. Please check back after the session, or email hello@annalouwellness.com.',
        },
        { status: 503 },
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

    const productName = cfg.weekLabel
      ? `${cfg.productName} (${cfg.weekLabel})`
      : cfg.productName;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: productName,
              ...(cfg.description ? { description: cfg.description } : {}),
            },
            unit_amount: unitPence,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${siteUrl}/community/the-returning-circle/watch?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/community/the-returning-circle`,
      allow_promotion_codes: false,
      billing_address_collection: 'auto',
      metadata: {
        source: 'returning_circle_recording',
        week_label: cfg.weekLabel,
        first_name: firstName,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[checkout/returning-circle-recording] failed:', err?.message);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again in a moment.' },
      { status: 502 },
    );
  }
}
