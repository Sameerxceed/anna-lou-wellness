import { NextRequest, NextResponse } from 'next/server';
import { stripe, type StripeEvent } from '@/lib/stripe';
import { fetchPurchasable, type PurchasableType } from '@/lib/strapi-purchasable';
import { subscribeAndTag, removeTag } from '@/lib/mailchimp';
import { grantResetRoomMembership, revokeResetRoomMembership } from '@/lib/strapi-admin';

/**
 * Stripe webhook handler.
 *
 * Architecture: Strapi is the source of truth. Stripe events carry only
 * { strapi_type, strapi_id } in metadata. We re-fetch the Strapi record
 * at webhook time to get the current mailchimpTag and grantsResetRoomAccess
 * flag — Anna can change either in CMS without redeploying.
 *
 * Events handled:
 *  - checkout.session.completed      -> Tag user (+ grant role if applicable)
 *  - customer.subscription.created   -> Same (covers subscriptions)
 *  - customer.subscription.deleted   -> Revoke role + remove tag
 *  - invoice.payment_failed          -> Log (Anna follows up manually)
 *
 * Idempotent: same event fired twice causes no harm.
 *
 * Env: STRIPE_WEBHOOK_SECRET (from Stripe dashboard -> Webhooks -> endpoint -> signing secret)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

type StrapiRef = { strapi_type: PurchasableType; strapi_id: string };

function readStrapiRef(metadata: Record<string, string> | null | undefined): StrapiRef | null {
  if (!metadata) return null;
  const strapi_type = metadata.strapi_type as PurchasableType | undefined;
  const strapi_id = metadata.strapi_id;
  if (!strapi_type || !strapi_id) return null;
  return { strapi_type, strapi_id };
}

async function getEmailFromEvent(event: StripeEvent): Promise<string | null> {
  const obj = event.data.object as any;
  if (obj?.customer_email) return String(obj.customer_email).toLowerCase();
  if (obj?.customer_details?.email) return String(obj.customer_details.email).toLowerCase();
  if (obj?.customer && typeof obj.customer === 'string') {
    try {
      const customer = await stripe.customers.retrieve(obj.customer);
      if (!customer.deleted && customer.email) return customer.email.toLowerCase();
    } catch (err: any) {
      console.warn('[stripe webhook] customer fetch failed:', err?.message);
    }
  }
  return null;
}

async function getStrapiRefFromEvent(event: StripeEvent): Promise<StrapiRef | null> {
  const obj = event.data.object as any;

  const direct = readStrapiRef(obj?.metadata);
  if (direct) return direct;

  if (event.type.startsWith('customer.subscription.') && obj?.metadata) {
    const fromSub = readStrapiRef(obj.metadata);
    if (fromSub) return fromSub;
  }

  if (obj?.subscription && typeof obj.subscription === 'string') {
    try {
      const sub = await stripe.subscriptions.retrieve(obj.subscription);
      const fromSub = readStrapiRef(sub.metadata);
      if (fromSub) return fromSub;
    } catch (err: any) {
      console.warn('[stripe webhook] subscription fetch failed:', err?.message);
    }
  }

  return null;
}

async function handleSuccessfulPurchase(event: StripeEvent) {
  const email = await getEmailFromEvent(event);
  const ref = await getStrapiRefFromEvent(event);

  if (!email) {
    console.warn(`[stripe webhook] ${event.type}: no email found`);
    return;
  }
  if (!ref) {
    console.warn(`[stripe webhook] ${event.type}: no Strapi ref in metadata — skipping (likely test event)`);
    return;
  }

  const purchasable = await fetchPurchasable(ref.strapi_type, ref.strapi_id);
  if (!purchasable) {
    console.warn(`[stripe webhook] ${event.type}: ${ref.strapi_type}/${ref.strapi_id} not found in Strapi`);
    return;
  }

  console.info(`[stripe webhook] ${event.type}: ${email} -> ${purchasable.name}`);

  if (purchasable.mailchimpTag) {
    const tagResult = await subscribeAndTag(email, purchasable.mailchimpTag);
    if (!tagResult.ok) {
      console.error(`[stripe webhook] Mailchimp tag failed for ${email}:`, tagResult.error);
    }
  } else {
    console.info(`[stripe webhook] ${purchasable.name}: no mailchimpTag set — skipping tag step`);
  }

  if (purchasable.grantsResetRoomAccess) {
    try {
      const result = await grantResetRoomMembership({ email });
      console.info(`[stripe webhook] Reset Room ${result.created ? 'created' : 'updated'} user ${result.userId}`);
    } catch (err: any) {
      console.error(`[stripe webhook] Strapi grant failed for ${email}:`, err?.message);
    }
  }
}

async function handleSubscriptionCancelled(event: StripeEvent) {
  const email = await getEmailFromEvent(event);
  const ref = await getStrapiRefFromEvent(event);

  if (!email || !ref) {
    console.warn(`[stripe webhook] ${event.type}: missing email or Strapi ref`);
    return;
  }

  const purchasable = await fetchPurchasable(ref.strapi_type, ref.strapi_id);
  if (!purchasable || !purchasable.grantsResetRoomAccess) return;

  console.info(`[stripe webhook] ${event.type}: revoking access for ${email}`);

  try {
    await revokeResetRoomMembership(email);
  } catch (err: any) {
    console.error(`[stripe webhook] Strapi revoke failed for ${email}:`, err?.message);
  }

  if (purchasable.mailchimpTag) {
    await removeTag(email, purchasable.mailchimpTag);
  }
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: StripeEvent;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.warn('[stripe webhook] signature verification failed:', err?.message);
    return NextResponse.json({ error: `Webhook signature failed: ${err?.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.created':
        await handleSuccessfulPurchase(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event);
        break;
      case 'invoice.payment_failed':
        console.warn('[stripe webhook] payment failed — Anna should follow up:', event.id);
        break;
      default:
        break;
    }
  } catch (err: any) {
    console.error('[stripe webhook] handler error:', err?.message);
  }

  return NextResponse.json({ received: true });
}
