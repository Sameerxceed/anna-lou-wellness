import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { fetchCurrentRecording } from '@/lib/strapi-admin';

/**
 * One-off checkout for the current Returning Circle recording.
 *
 * Data source: the Recording collection (api::recording.recording).
 * Anna creates one entry per weekly Circle. The one flagged
 * is_available_for_purchase = true becomes the buyable one on
 * /community/the-returning-circle. Price + title + YouTube URL all
 * come from that entry — so different weeks can be different prices
 * (Anna can charge £25 for a guest facilitator week).
 *
 * After payment:
 *  - Stripe webhook creates/finds the buyer's user account
 *  - Attaches the Recording to their purchased_recordings list
 *  - Buyer gets the YouTube link by email + on the confirmation page
 *  - They can log into /community/reset-room/dashboard any time to see
 *    all recordings they've bought, alongside anything else they have
 *    access to (Reset Room, REGULATED)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const recording = await fetchCurrentRecording();
    if (!recording) {
      return NextResponse.json(
        {
          error:
            "This week's recording isn't available yet. Please check back after the session, or email hello@annalouwellness.com.",
        },
        { status: 503 },
      );
    }
    if (!recording.youtube_url) {
      return NextResponse.json(
        {
          error:
            "This week's recording is being uploaded — please try again in a few minutes.",
        },
        { status: 503 },
      );
    }

    const priceGbp = Number(recording.price_gbp || 10);
    const unitPence = Math.round(priceGbp * 100);
    if (!Number.isFinite(unitPence) || unitPence < 100) {
      return NextResponse.json({ error: 'Invalid price on this recording.' }, { status: 500 });
    }

    const siteUrl =
      process.env.PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      'https://staging.annalouwellness.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: recording.title,
              ...(recording.description ? { description: recording.description } : {}),
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
        recording_id: String(recording.id),
        recording_title: recording.title,
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
