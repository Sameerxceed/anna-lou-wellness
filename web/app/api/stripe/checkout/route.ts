import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { fetchPurchasable, validateForCheckout, type PurchasableType } from '@/lib/strapi-purchasable';

/**
 * Create a Stripe Checkout Session for any Strapi-managed purchasable.
 *
 * POST body:
 *   {
 *     strapi_type: 'membership' | 'programme' | 'experience-page',
 *     strapi_id?:  string | number,   // slug or numeric id (ignored for membership)
 *     email?:      string,            // pre-fills Stripe Checkout
 *   }
 *
 * The Strapi record drives price, recurring/one-off, tag, role grant.
 * Stripe sees only an inline price built at request time. No price IDs anywhere.
 *
 * Returns { url } — frontend redirects user.
 *
 * Env:
 *   PUBLIC_SITE_URL (default https://staging.annalouwellness.com)
 */

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://staging.annalouwellness.com';

const VALID_TYPES: PurchasableType[] = ['membership', 'programme', 'experience-page'];

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const strapiType = String(body?.strapi_type || '') as PurchasableType;
  const strapiId = body?.strapi_id;
  const email = (body?.email || '').trim().toLowerCase() || undefined;
  const pwycAmountPenceRaw = Number(body?.amountPence);
  const requestedAmountPence =
    Number.isFinite(pwycAmountPenceRaw) && pwycAmountPenceRaw > 0
      ? Math.round(pwycAmountPenceRaw)
      : null;

  if (!VALID_TYPES.includes(strapiType)) {
    return NextResponse.json({ error: `Invalid strapi_type. Must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 });
  }

  const purchasable = await fetchPurchasable(strapiType, strapiId);
  if (!purchasable) {
    return NextResponse.json(
      { error: `Could not find ${strapiType}${strapiId ? ` "${strapiId}"` : ''} in Strapi` },
      { status: 404 },
    );
  }

  const invalid = validateForCheckout(purchasable);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  // Pay-what-you-can: if the programme has pwyc options AND the client sent
  // an amountPence, we validate the amount against the allowed list. This is
  // server-side enforcement — the client can't submit an arbitrary price.
  let finalPricePence = purchasable.pricePence;
  if (purchasable.pwycOptionsPence.length > 0) {
    const picked =
      requestedAmountPence && purchasable.pwycOptionsPence.includes(requestedAmountPence)
        ? requestedAmountPence
        : purchasable.pwycDefaultPence || purchasable.pwycOptionsPence[0];
    finalPricePence = picked;
  }

  const mode = purchasable.isRecurring ? 'subscription' : 'payment';
  // Success URL priority:
  //   1. postCheckoutCalendlyUrl on the programme — used when Anna wants the
  //      buyer to book their first session in Calendly straight after payment
  //      (Anna 22 Jul feedback: "we don't want people going to Calendly
  //      first, we need them to pay first, then book").
  //   2. Reset Room dashboard for memberships.
  //   3. REGULATED course access for regulated purchases.
  //   4. Generic /thank-you fallback.
  //
  // For Calendly redirects we can't rely on session_id substitution the way
  // we can with internal paths — but we still append it as a query string so
  // downstream tracking (if Anna wires GA cross-domain) has the correlation.
  const successPath = purchasable.grantsResetRoomAccess
    ? '/community/reset-room/dashboard'
    : purchasable.grantsRegulatedAccess
      ? '/the-work/regulated/access'
      : '/thank-you';
  const successUrlOverride = purchasable.postCheckoutCalendlyUrl;
  const cancelPath = purchasable.grantsResetRoomAccess
    ? '/community/reset-room'
    : purchasable.grantsRegulatedAccess
      ? '/the-work/regulated'
      : '/';

  // Metadata flows from checkout session -> subscription (via subscription_data) -> webhook event.
  // The webhook re-fetches from Strapi using strapi_type + strapi_id rather than trusting the metadata
  // tag/grant flags — Strapi is the source of truth even at webhook time.
  const metadata = {
    strapi_type: purchasable.type,
    strapi_id: String(purchasable.id),
    strapi_document_id: purchasable.documentId,
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price_data: {
            currency: purchasable.currency,
            product_data: { name: purchasable.name },
            unit_amount: finalPricePence,
            ...(purchasable.isRecurring &&
              purchasable.recurringInterval && {
                recurring: { interval: purchasable.recurringInterval },
              }),
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: successUrlOverride
        ? `${successUrlOverride}${successUrlOverride.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`
        : `${SITE_URL}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}${cancelPath}`,
      metadata,
      // For subscriptions, copy metadata onto the subscription itself so
      // customer.subscription.* events carry it
      ...(mode === 'subscription' && {
        subscription_data: { metadata },
        allow_promotion_codes: true,
      }),
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
