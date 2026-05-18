import { NextRequest, NextResponse } from 'next/server';
import { stripe, getProductConfig } from '@/lib/stripe';
import { subscribeAndTag, removeTag } from '@/lib/mailchimp';
import { grantResetRoomMembership, revokeResetRoomMembership } from '@/lib/strapi-admin';
import type Stripe from 'stripe';

/**
 * Stripe webhook handler.
 *
 * Signature verification: uses STRIPE_WEBHOOK_SECRET to verify Stripe-Signature header.
 *
 * Events handled:
 *  - checkout.session.completed       -> Tag user in Mailchimp based on product
 *  - customer.subscription.created    -> If Reset Room: grant Strapi role + tag in Mailchimp
 *  - customer.subscription.deleted    -> If Reset Room: revoke Strapi role + untag in Mailchimp
 *  - invoice.payment_failed           -> Log (Anna can follow up manually)
 *
 * Idempotent: same event fired twice causes no harm (Mailchimp tag add and
 * Strapi role grant are both idempotent).
 *
 * Env vars:
 *   STRIPE_WEBHOOK_SECRET - whsec_... from Stripe Dashboard -> Developers -> Webhooks
 */

export const runtime = 'nodejs'; // Stripe SDK needs Node, not Edge
export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

async function getEmailFromEvent(event: Stripe.Event): Promise<string | null> {
  // Try multiple paths because different events surface email differently
  const obj = event.data.object as any;

  if (obj?.customer_email) return String(obj.customer_email).toLowerCase();
  if (obj?.customer_details?.email) return String(obj.customer_details.email).toLowerCase();

  // Fall back to fetching the customer object
  if (obj?.customer) {
    try {
      const customer = await stripe.customers.retrieve(obj.customer as string);
      if (!customer.deleted && customer.email) return customer.email.toLowerCase();
    } catch (err: any) {
      console.warn('[stripe webhook] customer fetch failed:', err?.message);
    }
  }

  return null;
}

async function getPriceIdFromEvent(event: Stripe.Event): Promise<string | null> {
  const obj = event.data.object as any;

  // Subscription events: obj.items.data[0].price.id
  if (obj?.items?.data?.[0]?.price?.id) return obj.items.data[0].price.id;

  // Checkout session: need to expand line_items (not in default payload)
  if (event.type === 'checkout.session.completed' && obj?.id) {
    try {
      const fullSession = await stripe.checkout.sessions.retrieve(obj.id, {
        expand: ['line_items'],
      });
      const item = fullSession.line_items?.data?.[0];
      if (item?.price?.id) return item.price.id;
    } catch (err: any) {
      console.warn('[stripe webhook] session expand failed:', err?.message);
    }
  }

  return null;
}

async function handleSuccessfulPurchase(event: Stripe.Event) {
  const email = await getEmailFromEvent(event);
  const priceId = await getPriceIdFromEvent(event);

  if (!email) {
    console.warn(`[stripe webhook] ${event.type}: no email found`);
    return;
  }
  if (!priceId) {
    console.warn(`[stripe webhook] ${event.type}: no price ID found`);
    return;
  }

  const product = getProductConfig(priceId);
  if (!product) {
    console.warn(`[stripe webhook] ${event.type}: price ${priceId} not in product map — skipping`);
    return;
  }

  console.info(`[stripe webhook] ${event.type}: ${email} -> ${product.productName} (${product.tag})`);

  // 1. Tag in Mailchimp (triggers welcome Customer Journey)
  const tagResult = await subscribeAndTag(email, product.tag);
  if (!tagResult.ok) {
    console.error(`[stripe webhook] Mailchimp tag failed for ${email}:`, tagResult.error);
  }

  // 2. If this product grants Reset Room access, set up the Strapi user + role
  if (product.grantRole) {
    try {
      const result = await grantResetRoomMembership({ email });
      console.info(`[stripe webhook] Reset Room ${result.created ? 'created' : 'updated'} user ${result.userId}`);
    } catch (err: any) {
      console.error(`[stripe webhook] Strapi grant failed for ${email}:`, err?.message);
    }
  }
}

async function handleSubscriptionCancelled(event: Stripe.Event) {
  const email = await getEmailFromEvent(event);
  const priceId = await getPriceIdFromEvent(event);

  if (!email || !priceId) {
    console.warn(`[stripe webhook] ${event.type}: missing email or price`);
    return;
  }

  const product = getProductConfig(priceId);
  if (!product || !product.grantRole) return; // only Reset Room needs revocation

  console.info(`[stripe webhook] ${event.type}: revoking access for ${email}`);

  try {
    await revokeResetRoomMembership(email);
  } catch (err: any) {
    console.error(`[stripe webhook] Strapi revoke failed for ${email}:`, err?.message);
  }

  await removeTag(email, product.tag);
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // Read raw body for signature verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.warn('[stripe webhook] signature verification failed:', err?.message);
    return NextResponse.json({ error: `Webhook signature failed: ${err?.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // For one-off purchases (workshops, programmes), this is the success event
        await handleSuccessfulPurchase(event);
        break;

      case 'customer.subscription.created':
        // For subscriptions (Reset Room), this fires after checkout completes
        await handleSuccessfulPurchase(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event);
        break;

      case 'invoice.payment_failed':
        console.warn('[stripe webhook] payment failed — Anna should follow up:', event.id);
        break;

      default:
        // Ignore other event types
        break;
    }
  } catch (err: any) {
    // Log but return 200 so Stripe doesn't retry forever for non-recoverable errors
    console.error('[stripe webhook] handler error:', err?.message);
  }

  return NextResponse.json({ received: true });
}
