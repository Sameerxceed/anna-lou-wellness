import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import {
  fetchProductsByIds,
  createOrder,
  type CreateOrderInput,
} from '@/lib/strapi-admin';

/**
 * Shop checkout endpoint.
 *
 * POST body:
 *   {
 *     customer: { name, email, phone?, address },
 *     items: [{ productId: number, qty: number }],
 *     paymentMethod: 'stripe' | 'bank',
 *     notes?: string
 *   }
 *
 * Flow:
 *  1. Fetch products from Strapi by ID (source of truth for price + stock)
 *  2. Validate availability + active flag
 *  3. Calculate totals from Strapi prices (never trust client-side total)
 *  4. Generate ALW-XXXXXXXX order number
 *  5. Create Order in Strapi as pending
 *  6. If stripe: build Checkout Session with line_items + metadata { strapi_type: 'order', strapi_id: documentId }
 *  7. If bank: return order number + bank details for confirmation page
 *
 * The Stripe webhook (api/stripe/webhook) handles the rest on payment success:
 *  - Marks order paid
 *  - Decrements product stock
 *  - Tags buyer in Mailchimp as 'Shop Customers'
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
  }

  // Shipping: free for now. Anna can wire actual shipping zones/methods later.
  const shippingPence = 0;
  const totalPence = subtotalPence + shippingPence;
  const subtotal = subtotalPence / 100;
  const total = totalPence / 100;
  const shipping_cost = shippingPence / 100;

  // Stripe minimum charge in GBP is around 30p
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
    });
  } catch (err: any) {
    console.error('[checkout] createOrder failed:', err?.message);
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 502 });
  }

  // ── Bank transfer: return order details (no Stripe session) ──
  if (paymentMethod === 'bank') {
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
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems,
      customer_email: order.customer_email,
      success_url: `${SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
      metadata: {
        strapi_type: 'order',
        strapi_id: order.documentId,
        order_number: orderNumber,
      },
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
    // Order already created as 'pending' — Anna can manually mark it cancelled if customer never pays
    return NextResponse.json(
      { error: `Stripe error: ${err?.message}`, orderNumber },
      { status: 502 },
    );
  }
}
