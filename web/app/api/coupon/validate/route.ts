import { NextRequest, NextResponse } from 'next/server';
import { fetchCouponByCode, validateCoupon } from '@/lib/strapi-coupon';
import { fetchProductsByIds } from '@/lib/strapi-admin';

/**
 * Validate a coupon code against the current cart contents.
 *
 * POST body:
 *   {
 *     code: string,
 *     items: [{ productId: number, qty: number }]
 *   }
 *
 * Re-fetches each product from Strapi to use authoritative prices + categories
 * (never trusts client-side price), then runs the coupon validation rules.
 * Returns { valid, message, discount, freeShipping, code, type }.
 *
 * Note: this only checks the coupon — it does NOT apply or persist it.
 * The final application happens in /api/checkout which re-runs validation
 * server-side so a tampered client payload cannot bypass the rules.
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, message: 'Invalid JSON', discount: 0, freeShipping: false }, { status: 400 });
  }

  const code = String(body?.code || '').trim();
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (!code) {
    return NextResponse.json(
      { valid: false, message: 'Enter a coupon code', discount: 0, freeShipping: false },
      { status: 400 },
    );
  }
  if (rawItems.length === 0) {
    return NextResponse.json(
      { valid: false, message: 'Add an item to your cart first', discount: 0, freeShipping: false },
      { status: 400 },
    );
  }

  const productIds = rawItems
    .map((i: any) => Number(i?.productId))
    .filter((n: number) => Number.isFinite(n) && n > 0);
  if (productIds.length !== rawItems.length) {
    return NextResponse.json(
      { valid: false, message: 'Cart contains an invalid item', discount: 0, freeShipping: false },
      { status: 400 },
    );
  }

  let products;
  try {
    products = await fetchProductsByIds(productIds);
  } catch (err: any) {
    console.error('[coupon validate] product fetch failed:', err?.message);
    return NextResponse.json(
      { valid: false, message: 'Could not check cart against catalogue', discount: 0, freeShipping: false },
      { status: 502 },
    );
  }

  const cart: { productId: number; categoryId?: number | null; price: number; qty: number }[] = [];
  let subtotal = 0;
  for (const i of rawItems) {
    const p = products.find((pp) => pp.id === Number(i.productId));
    if (!p) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(i.qty || 1))));
    const price = Number(p.price);
    subtotal += price * qty;
    cart.push({
      productId: p.id,
      categoryId: (p as any).category?.id ?? null,
      price,
      qty,
    });
  }

  let coupon;
  try {
    coupon = await fetchCouponByCode(code);
  } catch (err: any) {
    console.error('[coupon validate] coupon lookup failed:', err?.message);
    return NextResponse.json(
      { valid: false, message: 'Could not check coupon code', discount: 0, freeShipping: false },
      { status: 502 },
    );
  }

  const result = validateCoupon(coupon, cart, subtotal);
  return NextResponse.json(result, { status: result.valid ? 200 : 400 });
}
