import { NextRequest, NextResponse } from 'next/server';
import { stripe, type StripeEvent } from '@/lib/stripe';
import { fetchPurchasable, type PurchasableType } from '@/lib/strapi-purchasable';
import { subscribeAndTag, removeTag } from '@/lib/mailchimp';
import {
  grantResetRoomMembership,
  revokeResetRoomMembership,
  grantRegulatedAccess,
  grantShopCustomerAccount,
  fetchOrder,
  fetchOrderByNumber,
  markOrderPaid,
  decrementProductStock,
  fetchProductsByIds,
  createOrder,
  fetchRecordingById,
  fetchCurrentRecording,
  attachRecordingToUser,
} from '@/lib/strapi-admin';
import { incrementCouponUsage } from '@/lib/strapi-coupon';
import { sendFromTemplate } from '@/lib/email';

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

type StrapiRefType = PurchasableType | 'order' | 'shop_order';
type StrapiRef = { strapi_type: StrapiRefType; strapi_id: string };

function readStrapiRef(metadata: Record<string, string> | null | undefined): StrapiRef | null {
  if (!metadata) return null;
  const strapi_type = metadata.strapi_type as StrapiRefType | undefined;
  // shop_order uses order_number (no strapi_id — order doesn't exist yet)
  if (strapi_type === 'shop_order') {
    return { strapi_type, strapi_id: metadata.order_number || '' };
  }
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

/**
 * New flow (strapi_type = 'shop_order'): the Strapi Order does not exist yet.
 * The /api/checkout route packed everything into Stripe session metadata, and
 * we only create the Order here, on confirmed payment. Status starts at 'paid'.
 *
 * Idempotency: enforced by looking up order_number first — Stripe can retry.
 */
async function handleShopOrderCreate(event: StripeEvent, orderNumber: string, email: string) {
  if (!orderNumber) {
    console.warn('[stripe webhook] shop_order missing order_number in metadata — skipping');
    return;
  }

  // Idempotency check — has this webhook already created the order?
  let existing: any = null;
  try {
    existing = await fetchOrderByNumber(orderNumber);
  } catch (err: any) {
    console.warn(`[stripe webhook] fetchOrderByNumber ${orderNumber} failed:`, err?.message);
  }
  if (existing) {
    console.info(`[stripe webhook] order ${orderNumber} already exists — idempotent skip`);
    return;
  }

  const obj = event.data.object as any;
  const md = (obj?.metadata || {}) as Record<string, string>;
  const stripePaymentId = String(obj?.payment_intent || obj?.id || event.id);

  // Parse cart pairs [[productId, qty], ...]
  let cartPairs: Array<[number, number]> = [];
  try {
    cartPairs = JSON.parse(md.cart_items || '[]');
  } catch {
    console.error(`[stripe webhook] cart_items JSON parse failed for ${orderNumber}`);
    return;
  }
  if (!Array.isArray(cartPairs) || cartPairs.length === 0) {
    console.error(`[stripe webhook] cart_items empty for ${orderNumber}`);
    return;
  }

  // Refetch products from Strapi to capture names + slugs (don't trust metadata
  // for human-facing strings, and we need to preserve product info even if Anna
  // later renames or deletes the product).
  const productIds = cartPairs.map(([id]) => Number(id)).filter((n) => Number.isFinite(n) && n > 0);
  let products;
  try {
    products = await fetchProductsByIds(productIds);
  } catch (err: any) {
    console.error(`[stripe webhook] fetchProductsByIds failed for ${orderNumber}:`, err?.message);
    return;
  }

  const items: Array<{ id: number; name: string; price: number; qty: number; slug?: string }> = [];
  for (const [pid, qty] of cartPairs) {
    const product = products.find((p) => p.id === Number(pid));
    if (!product) {
      console.warn(`[stripe webhook] product ${pid} not found at fulfilment — using placeholder`);
      items.push({ id: Number(pid), name: `Product #${pid}`, price: 0, qty: Number(qty) });
      continue;
    }
    items.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      qty: Number(qty),
      slug: product.slug,
    });
  }

  // Gift wrap line — reconstructed from metadata flag + gift_wrap_pence.
  const giftWrapPence = Number(md.gift_wrap_pence || 0);
  const giftWrapAmount = giftWrapPence / 100;
  if (md.gift_wrap === '1' && giftWrapPence > 0) {
    items.push({ id: -1, name: 'Gift wrap', price: giftWrapAmount, qty: 1 });
  }

  const subtotal = Number(md.subtotal_pence || 0) / 100;
  const shipping_cost = Number(md.shipping_pence || 0) / 100;
  const discount_amount = Number(md.discount_pence || 0) / 100;
  const total = Number(md.total_pence || obj?.amount_total || 0) / 100;

  // Ensure customer has an account (same user across shop / Reset Room / REGULATED).
  let accountResult: Awaited<ReturnType<typeof grantShopCustomerAccount>> | null = null;
  const customerName = md.customer_name || 'Customer';
  try {
    accountResult = await grantShopCustomerAccount({
      email,
      firstName: customerName.split(' ')[0] || undefined,
      lastName: customerName.split(' ').slice(1).join(' ') || undefined,
    });
  } catch (err: any) {
    console.warn(`[stripe webhook] grantShopCustomerAccount failed for ${email} (non-fatal):`, err?.message);
  }

  // Create order with status='paid' immediately — payment is already confirmed.
  let createdOrder;
  try {
    createdOrder = await createOrder({
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: email,
      customer_phone: md.customer_phone || undefined,
      shipping_address: md.shipping_address || '',
      items,
      subtotal,
      shipping_cost,
      total,
      currency: 'gbp',
      payment_method: 'stripe',
      notes: md.notes || undefined,
      coupon_code: md.coupon_code || undefined,
      discount_amount: discount_amount > 0 ? discount_amount : undefined,
      user: accountResult?.userId,
    });
    // Stamp it paid + record the Stripe payment id.
    await markOrderPaid(createdOrder.documentId, stripePaymentId);
    console.info(`[stripe webhook] order ${orderNumber} created + marked paid`);
  } catch (err: any) {
    console.error(`[stripe webhook] createOrder failed for ${orderNumber}:`, err?.message);
    return;
  }

  // First-time customer → welcome + set-password email
  if (accountResult?.created && accountResult.resetToken) {
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://staging.annalouwellness.com';
    const setPasswordUrl = `${siteUrl}/login/reset?code=${encodeURIComponent(accountResult.resetToken)}&welcome=1`;
    sendFromTemplate('shop_account_invite', {
      account: {
        email,
        first_name: customerName.split(' ')[0] || customerName,
        set_password_url: setPasswordUrl,
      },
    }).catch((e) => console.warn(`[stripe webhook] welcome email failed:`, e?.message));
  }

  // Decrement stock for real products (skip gift-wrap line id:-1).
  for (const it of items) {
    if (it.id > 0 && it.qty > 0) {
      await decrementProductStock(it.id, it.qty);
    }
  }

  // Bump coupon usage post-payment.
  if (md.coupon_document_id) {
    try { await incrementCouponUsage(md.coupon_document_id); }
    catch (err: any) { console.warn(`[stripe webhook] coupon usage bump failed:`, err?.message); }
  }

  // Tag in Mailchimp.
  const tagResult = await subscribeAndTag(email, 'Shop Customers');
  if (!tagResult.ok) {
    console.error(`[stripe webhook] Shop Customers tag failed for ${email}:`, tagResult.error);
  }

  // Customer confirmation + owner notification — copy comes from the Email
  // Template collection in Strapi (Anna edits without touching code).
  const orderForEmail = {
    order_number: orderNumber,
    customer_name: md.customer_name || 'Customer',
    customer_email: email,
    customer_phone: md.customer_phone || undefined,
    shipping_address: md.shipping_address || '',
    items,
    subtotal,
    shipping_cost,
    discount_amount,
    total,
    payment_method: 'stripe' as const,
  };
  sendFromTemplate('order_paid', { order: orderForEmail })
    .catch((e) => console.warn(`[stripe webhook] customer email failed:`, e?.message));
  sendFromTemplate('admin_new_order', { order: orderForEmail })
    .catch((e) => console.warn(`[stripe webhook] owner email failed:`, e?.message));
}

/**
 * Legacy flow (strapi_type = 'order'): Strapi Order was pre-created with
 * status='pending' before the customer reached Stripe. We just mark it paid.
 * Kept so any in-flight Stripe sessions started before the deploy still
 * complete cleanly. New checkouts use 'shop_order' above.
 */
async function handleShopOrder(event: StripeEvent, ref: StrapiRef, email: string) {
  const order = await fetchOrder(ref.strapi_id);
  if (!order) {
    console.warn(`[stripe webhook] legacy order ${ref.strapi_id} not found in Strapi`);
    return;
  }
  if (order.status === 'paid') {
    console.info(`[stripe webhook] order ${order.order_number} already paid — idempotent skip`);
    return;
  }

  const obj = event.data.object as any;
  const stripePaymentId = String(obj?.payment_intent || obj?.id || event.id);

  try {
    await markOrderPaid(order.documentId, stripePaymentId);
    console.info(`[stripe webhook] order ${order.order_number} marked paid (legacy flow)`);
  } catch (err: any) {
    console.error('[stripe webhook] markOrderPaid failed:', err?.message);
  }

  if (Array.isArray(order.items)) {
    for (const item of order.items) {
      if (item?.id && Number(item.id) > 0 && item?.qty) {
        await decrementProductStock(Number(item.id), Number(item.qty));
      }
    }
  }

  const couponDocId = (event.data.object as any)?.metadata?.coupon_document_id;
  if (couponDocId) {
    try { await incrementCouponUsage(String(couponDocId)); }
    catch (err: any) { console.warn('[stripe webhook] coupon usage bump failed:', err?.message); }
  }

  const tagResult = await subscribeAndTag(email, 'Shop Customers');
  if (!tagResult.ok) {
    console.error(`[stripe webhook] Shop Customers tag failed for ${email}:`, tagResult.error);
  }
}

/**
 * Returning Circle recording: one-off purchase of a specific week's recording.
 *
 * The Recording collection is the source of truth — each week Anna adds
 * an entry (title, session_date, unlisted YouTube URL, price). Price is
 * per-recording, so guest facilitator weeks can be £25 while standard
 * weeks stay at £10.
 *
 * On payment we:
 *  1. Look up the exact Recording that was bought (from metadata.recording_id)
 *  2. Ensure the buyer has a user account (creates one + password-reset email
 *     if not — same pattern as shop_account_invite)
 *  3. Attach the Recording to their purchased_recordings list so it shows up
 *     in their members dashboard forever
 *  4. Fire the delivery email (with the direct link) + owner notification
 *  5. Tag the buyer in Mailchimp for optional nurture journeys
 */
async function handleReturningCircleRecording(event: StripeEvent, email: string) {
  const obj = event.data.object as any;
  const md = (obj?.metadata || {}) as Record<string, string>;
  const recordingIdRaw = md.recording_id;
  const recordingTitleFromCheckout = (md.recording_title || '').trim();
  const firstName = (md.first_name || '').trim();

  // Look up the recording that was bought. If the metadata carries an id
  // we use that; otherwise fall back to the current available recording.
  let recording: Awaited<ReturnType<typeof fetchRecordingById>> = null;
  if (recordingIdRaw && Number.isFinite(Number(recordingIdRaw))) {
    recording = await fetchRecordingById(Number(recordingIdRaw));
  }
  if (!recording) {
    recording = await fetchCurrentRecording();
  }
  if (!recording) {
    console.warn(
      `[stripe webhook] returning_circle_recording: no Recording found for id=${recordingIdRaw || 'none'}, email=${email} — sale succeeded but library attach skipped`,
    );
  }

  const recordingContext = {
    week_label: recording?.title || recordingTitleFromCheckout || '',
    youtube_url: recording?.youtube_url || '',
    price_gbp: Number(
      recording?.price_gbp ??
        (obj?.amount_total ? obj.amount_total / 100 : 10),
    ),
    help_note: recording?.description || '',
  };

  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://staging.annalouwellness.com';

  // Ensure the buyer has a user account so the recording can be attached
  // to them and they can log in. First-time buyers get a "set password"
  // welcome email; existing users are just returned.
  let accountResult: Awaited<ReturnType<typeof grantShopCustomerAccount>> | null = null;
  try {
    accountResult = await grantShopCustomerAccount({
      email,
      firstName: firstName || undefined,
    });
  } catch (err: any) {
    console.warn(
      `[stripe webhook] recording account create failed for ${email} (non-fatal):`,
      err?.message,
    );
  }

  // Attach the recording to the user's library.
  if (accountResult?.userId && recording?.id) {
    try {
      await attachRecordingToUser(accountResult.userId, recording.id);
    } catch (err: any) {
      console.warn(
        `[stripe webhook] attach recording ${recording.id} to user ${accountResult.userId} failed:`,
        err?.message,
      );
    }
  }

  // First-time buyer → welcome + set-password email so they can log in later.
  if (accountResult?.created && accountResult.resetToken) {
    const setPasswordUrl = `${siteUrl}/login/reset?code=${encodeURIComponent(accountResult.resetToken)}&welcome=1`;
    sendFromTemplate('shop_account_invite', {
      account: {
        email,
        first_name: firstName || email.split('@')[0] || 'there',
        set_password_url: setPasswordUrl,
      },
    }).catch((e) =>
      console.warn(`[stripe webhook] recording welcome email failed:`, e?.message),
    );
  }

  console.info(
    `[stripe webhook] returning_circle_recording: ${email} <- ${recordingContext.week_label || '(no title)'}`,
  );

  // Mailchimp tag so Anna has a segment of recording buyers to nurture.
  const tagResult = await subscribeAndTag(email, 'Returning Circle Recording');
  if (!tagResult.ok) {
    console.warn(`[stripe webhook] Recording tag failed for ${email}:`, tagResult.error);
  }

  // Customer delivery + owner notification. Both fire template-driven emails
  // so Anna can edit the copy in the Email Template collection.
  sendFromTemplate('returning_circle_recording', {
    account: { email, first_name: firstName || 'there' },
    recording: recordingContext,
  }).catch((e) =>
    console.warn(`[stripe webhook] recording delivery email failed:`, e?.message),
  );
  sendFromTemplate('admin_returning_circle_recording', {
    account: { email, first_name: firstName || '' },
    recording: recordingContext,
  }).catch((e) =>
    console.warn(`[stripe webhook] recording admin email failed:`, e?.message),
  );
}

async function handleSuccessfulPurchase(event: StripeEvent) {
  const email = await getEmailFromEvent(event);
  const ref = await getStrapiRefFromEvent(event);
  const obj = event.data.object as any;
  const md = (obj?.metadata || {}) as Record<string, string>;

  if (!email) {
    console.warn(`[stripe webhook] ${event.type}: no email found`);
    return;
  }

  // Source-tagged one-off flows that don't carry a Strapi ref (Discovery
  // Call, Returning Circle recording, etc.). Dispatch by metadata.source.
  if (md.source === 'returning_circle_recording') {
    return handleReturningCircleRecording(event, email);
  }

  if (!ref) {
    console.warn(`[stripe webhook] ${event.type}: no Strapi ref in metadata — skipping (likely test event)`);
    return;
  }

  // Shop orders — new flow creates the Strapi Order here (status='paid')
  if (ref.strapi_type === 'shop_order') {
    return handleShopOrderCreate(event, ref.strapi_id, email);
  }
  // Legacy in-flight orders created before the deploy
  if (ref.strapi_type === 'order') {
    return handleShopOrder(event, ref, email);
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

  if (purchasable.grantsRegulatedAccess) {
    try {
      const result = await grantRegulatedAccess({ email });
      console.info(`[stripe webhook] REGULATED access ${result.created ? 'granted (new user)' : 'granted (existing user)'}: ${result.userId}`);
    } catch (err: any) {
      console.error(`[stripe webhook] REGULATED grant failed for ${email}:`, err?.message);
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

  // Shop orders are one-off payments, not subscriptions — nothing to revoke
  if (ref.strapi_type === 'order' || ref.strapi_type === 'shop_order') return;

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
