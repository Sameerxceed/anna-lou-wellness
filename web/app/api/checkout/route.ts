import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import {
  fetchProductsByIds,
  createOrder,
  type CreateOrderInput,
} from '@/lib/strapi-admin';
import { fetchCouponByCode, validateCoupon, incrementCouponUsage } from '@/lib/strapi-coupon';
import { getShopSettings } from '@/lib/cms';

/**
 * Shop checkout endpoint.
 *
 * POST body:
 *   {
 *     customer: { name, email, phone?, address },
 *     items: [{ productId: number, qty: number }],
 *     paymentMethod: 'stripe' | 'bank',
 *     couponCode?: string,
 *     giftWrap?: boolean,
 *     notes?: string
 *   }
 *
 * Flow:
 *  1. Fetch products from Strapi by ID (source of truth for price + stock)
 *  2. Validate availability + active flag
 *  3. Calculate subtotal from Strapi prices (never trust client-side)
 *  4. Re-validate coupon server-side (don't trust client) and compute discount
 *  5. Apply shipping rule from Site Settings (free above threshold else flat rate)
 *  6. Add gift-wrap line item if requested (price from Site Settings)
 *  7. Create Order in Strapi as pending, recording coupon code + discount
 *  8. If stripe: build Checkout Session with line_items + optional one-off
 *     discount line (negative price isn't allowed by Stripe so we apply the
 *     discount by sending a `coupons` parameter via the lookup; simplest path
 *     here is to deduct from each line proportionally OR add a synthetic
 *     "discount applied at cart" message and rely on the total stored in
 *     Strapi being authoritative — we use Stripe's `discounts` via a one-off
 *     coupon created on the fly).
 *  9. If bank: return order number + bank details for confirmation page.
 *
 * On payment success the Stripe webhook bumps coupon usage + marks order paid.
 */

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://staging.annalouwellness.com';

function newOrderNumber(): string {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(36))
    .join('')
    .slice(0, 8)
    .toUpperCase();
  return `ALW-${random}`;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ── Validate input ──
  const customer = body?.customer || {};
  const items = body?.items;
  const paymentMethod = body?.paymentMethod;
  const couponCodeRaw = typeof body?.couponCode === 'string' ? body.couponCode.trim() : '';
  const wantsGiftWrap = body?.giftWrap === true;

  if (!customer.name || !customer.email || !customer.address) {
    return NextResponse.json({ error: 'Missing required customer fields (name, email, address)' }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }
  if (paymentMethod !== 'stripe' && paymentMethod !== 'bank') {
    return NextResponse.json({ error: 'Invalid paymentMethod (must be "stripe" or "bank")' }, { status: 400 });
  }

  // ── Fetch products from Strapi (source of truth) ──
  const productIds = items
    .map((it: any) => Number(it.productId))
    .filter((id: number) => Number.isFinite(id) && id > 0);
  if (productIds.length !== items.length) {
    return NextResponse.json({ error: 'Each item must have a numeric productId' }, { status: 400 });
  }

  let products;
  try {
    products = await fetchProductsByIds(productIds);
  } catch (err: any) {
    return NextResponse.json({ error: `Failed to fetch products: ${err?.message}` }, { status: 502 });
  }

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more products not found' }, { status: 404 });
  }

  // ── Validate + build order line items ──
  const orderItems: CreateOrderInput['items'] = [];
  let subtotalPence = 0;
  const stripeLineItems: any[] = [];
  const couponCartContext: { productId: number; categoryId?: number | null; price: number; qty: number }[] = [];

  for (const cartItem of items) {
    const product = products.find((p) => p.id === Number(cartItem.productId));
    if (!product) {
      return NextResponse.json({ error: `Product ${cartItem.productId} not found` }, { status: 404 });
    }
    if (!product.is_active) {
      return NextResponse.json({ error: `${product.name} is no longer available` }, { status: 400 });
    }
    const qty = Math.max(1, Math.min(99, Math.floor(Number(cartItem.qty || 1))));
    if (product.stock < qty) {
      return NextResponse.json({ error: `${product.name} only has ${product.stock} left in stock` }, { status: 409 });
    }
    const unitPence = Math.round(Number(product.price) * 100);
    if (!Number.isFinite(unitPence) || unitPence < 0) {
      return NextResponse.json({ error: `${product.name} has an invalid price` }, { status: 500 });
    }

    orderItems.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      qty,
      slug: product.slug,
    });
    subtotalPence += unitPence * qty;

    stripeLineItems.push({
      price_data: {
        currency: 'gbp',
        product_data: { name: product.name },
        unit_amount: unitPence,
      },
      quantity: qty,
    });

    couponCartContext.push({
      productId: product.id,
      categoryId: (product as any).category?.id ?? null,
      price: Number(product.price),
      qty,
    });
  }

  // ── Load shop settings (shipping + gift wrap config) ──
  const shopSettings = await getShopSettings().catch(() => null);
  const freeShippingThreshold = shopSettings?.freeShippingThreshold ?? 50;
  const shippingFlatRate = shopSettings?.shippingFlatRate ?? 4.95;
  const giftWrapEnabled = shopSettings?.giftWrapEnabled ?? true;
  const giftWrapPrice = shopSettings?.giftWrapPrice ?? 3.5;
  const giftWrapLabel = shopSettings?.giftWrapLabel || 'Gift wrap';

  // ── Validate coupon server-side (don't trust client) ──
  let discountPence = 0;
  let couponFreeShipping = false;
  let appliedCouponCode = '';
  let appliedCouponDocId = '';
  if (couponCodeRaw) {
    try {
      const coupon = await fetchCouponByCode(couponCodeRaw);
      const subtotalForCoupon = subtotalPence / 100;
      const result = validateCoupon(coupon, couponCartContext, subtotalForCoupon);
      if (!result.valid) {
        return NextResponse.json({ error: result.message || 'Coupon is not valid' }, { status: 400 });
      }
      discountPence = Math.round(Number(result.discount) * 100);
      couponFreeShipping = result.freeShipping;
      appliedCouponCode = result.code || couponCodeRaw.toUpperCase();
      appliedCouponDocId = result.documentId || '';
    } catch (err: any) {
      console.error('[checkout] coupon validation failed:', err?.message);
      return NextResponse.json({ error: 'Could not validate coupon. Please try again or remove it.' }, { status: 502 });
    }
  }

  // ── Shipping ──
  const subtotalForShipping = (subtotalPence - discountPence) / 100;
  const qualifiesFreeShipping = couponFreeShipping || subtotalForShipping >= freeShippingThreshold;
  const shippingPence = qualifiesFreeShipping ? 0 : Math.round(shippingFlatRate * 100);

  // ── Gift wrap (add as a separate line item) ──
  const giftWrapPence = wantsGiftWrap && giftWrapEnabled ? Math.round(giftWrapPrice * 100) : 0;
  if (giftWrapPence > 0) {
    orderItems.push({
      id: -1,
      name: giftWrapLabel,
      price: giftWrapPrice,
      qty: 1,
    });
    stripeLineItems.push({
      price_data: {
        currency: 'gbp',
        product_data: { name: giftWrapLabel },
        unit_amount: giftWrapPence,
      },
      quantity: 1,
    });
  }

  // Add shipping as its own Stripe line item so the total matches the order.
  if (shippingPence > 0) {
    stripeLineItems.push({
      price_data: {
        currency: 'gbp',
        product_data: { name: 'Shipping (UK)' },
        unit_amount: shippingPence,
      },
      quantity: 1,
    });
  }

  const totalPence = Math.max(0, subtotalPence - discountPence + shippingPence + giftWrapPence);
  const subtotal = subtotalPence / 100;
  const total = totalPence / 100;
  const shipping_cost = shippingPence / 100;
  const discount_amount = discountPence / 100;

  if (paymentMethod === 'stripe' && totalPence < 30) {
    return NextResponse.json({ error: 'Cart total below Stripe minimum charge' }, { status: 400 });
  }

  // ── Create Order in Strapi ──
  const orderNumber = newOrderNumber();
  let order;
  try {
    order = await createOrder({
      order_number: orderNumber,
      customer_name: String(customer.name).trim(),
      customer_email: String(customer.email).trim().toLowerCase(),
      customer_phone: customer.phone ? String(customer.phone).trim() : undefined,
      shipping_address: String(customer.address).trim(),
      items: orderItems,
      subtotal,
      shipping_cost,
      total,
      currency: 'gbp',
      payment_method: paymentMethod === 'stripe' ? 'stripe' : 'bank_transfer',
      notes: body?.notes ? String(body.notes).trim() : undefined,
      coupon_code: appliedCouponCode || undefined,
      discount_amount: discount_amount > 0 ? discount_amount : undefined,
    });
  } catch (err: any) {
    console.error('[checkout] createOrder failed:', err?.message);
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 502 });
  }

  // ── Bank transfer: return order details (no Stripe session) ──
  if (paymentMethod === 'bank') {
    // Bump coupon usage now (no payment provider to confirm later for bank
    // transfers — Anna will manually reconcile if customer never pays).
    if (appliedCouponDocId) {
      incrementCouponUsage(appliedCouponDocId).catch((e) => console.warn('[checkout] coupon usage bump failed:', e?.message));
    }
    return NextResponse.json({
      ok: true,
      orderNumber,
      total,
      paymentMethod: 'bank',
      bankDetails: {
        accountName: 'Anna Lou Wellness',
        sortCode: 'XX-XX-XX',
        accountNumber: 'XXXXXXXX',
        iban: 'GB00 XXXX XXXX XXXX XXXX XX',
        reference: orderNumber,
      },
    });
  }

  // ── Stripe: create Checkout Session ──
  try {
    // If a fixed-amount discount applies, attach it via a one-off Stripe coupon
    // so the total Stripe charges matches what we stored on the order.
    let stripeDiscounts: any[] | undefined;
    if (discountPence > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: discountPence,
        currency: 'gbp',
        duration: 'once',
        name: appliedCouponCode || 'Discount',
      });
      stripeDiscounts = [{ coupon: stripeCoupon.id }];
    }

    const sessionMetadata: Record<string, string> = {
      strapi_type: 'order',
      strapi_id: order.documentId,
      order_number: orderNumber,
    };
    if (appliedCouponCode) sessionMetadata.coupon_code = appliedCouponCode;
    if (appliedCouponDocId) sessionMetadata.coupon_document_id = appliedCouponDocId;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems,
      customer_email: order.customer_email,
      success_url: `${SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
      metadata: sessionMetadata,
      ...(stripeDiscounts ? { discounts: stripeDiscounts } : {}),
    });

    if (!session.url) {
      return NextResponse.json({ error: 'No session URL returned by Stripe' }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      orderNumber,
      total,
      paymentMethod: 'stripe',
      url: session.url,
    });
  } catch (err: any) {
    console.error('[checkout] Stripe session create failed:', err?.message);
    return NextResponse.json(
      { error: `Stripe error: ${err?.message}`, orderNumber },
      { status: 502 },
    );
  }
}
