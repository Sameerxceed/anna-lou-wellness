/**
 * Coupon helpers — server-side only. Uses the long-lived STRAPI_ADMIN_API_TOKEN
 * so we can look up coupon records without exposing the whole coupon list
 * publicly. Mirrors the validation logic in
 * cms/src/api/coupon/services/coupon-validation.js but runs in Next so we
 * never have to call Strapi twice (lookup + validate).
 */

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const ADMIN_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN;

function authHeaders() {
  if (!ADMIN_TOKEN) throw new Error('STRAPI_ADMIN_API_TOKEN not set');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  };
}

type StrapiCoupon = {
  id: number;
  documentId: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number | string;
  min_order_amount?: number | string | null;
  max_uses?: number;
  times_used?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  applicable_products?: Array<{ id: number; documentId: string }>;
  applicable_categories?: Array<{ id: number; documentId: string }>;
};

export type CouponValidation = {
  valid: boolean;
  message: string;
  discount: number;
  freeShipping: boolean;
  code?: string;
  type?: 'percentage' | 'fixed_amount' | 'free_shipping';
  documentId?: string;
};

export async function fetchCouponByCode(code: string): Promise<StrapiCoupon | null> {
  if (!code) return null;
  const url = new URL(`${STRAPI_URL}/api/coupons`);
  url.searchParams.set('filters[code][$eqi]', code.trim().toUpperCase());
  url.searchParams.set('populate', 'applicable_products,applicable_categories');
  url.searchParams.set('pagination[limit]', '1');

  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchCouponByCode ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const data = Array.isArray(json?.data) ? json.data[0] : null;
  return (data || null) as StrapiCoupon | null;
}

export async function incrementCouponUsage(documentId: string): Promise<void> {
  try {
    const cur = await fetch(`${STRAPI_URL}/api/coupons/${encodeURIComponent(documentId)}`, {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!cur.ok) return;
    const json = await cur.json();
    const c = json?.data as StrapiCoupon | null;
    if (!c) return;
    await fetch(`${STRAPI_URL}/api/coupons/${encodeURIComponent(documentId)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ data: { times_used: (c.times_used || 0) + 1 } }),
    });
  } catch (err: any) {
    console.warn('[coupon] incrementUsage failed:', err?.message);
  }
}

/**
 * Validate a coupon against cart context. Pure: does not mutate the coupon
 * record. Caller increments times_used only after a successful checkout.
 */
export function validateCoupon(
  coupon: StrapiCoupon | null,
  cart: { productId: number; categoryId?: number | null; price: number; qty: number }[],
  subtotal: number,
): CouponValidation {
  if (!coupon) return { valid: false, message: 'Coupon not found', discount: 0, freeShipping: false };

  if (!coupon.is_active) {
    return { valid: false, message: 'This coupon is no longer active', discount: 0, freeShipping: false };
  }
  const now = Date.now();
  if (coupon.starts_at && Date.parse(coupon.starts_at) > now) {
    return { valid: false, message: 'This coupon is not yet valid', discount: 0, freeShipping: false };
  }
  if (coupon.expires_at && Date.parse(coupon.expires_at) < now) {
    return { valid: false, message: 'This coupon has expired', discount: 0, freeShipping: false };
  }
  if ((coupon.max_uses || 0) > 0 && (coupon.times_used || 0) >= (coupon.max_uses || 0)) {
    return { valid: false, message: 'This coupon has reached its usage limit', discount: 0, freeShipping: false };
  }
  const minOrder = Number(coupon.min_order_amount || 0);
  if (minOrder > 0 && subtotal < minOrder) {
    return {
      valid: false,
      message: `Minimum order of £${minOrder.toFixed(2)} required`,
      discount: 0,
      freeShipping: false,
    };
  }

  const productIds = (coupon.applicable_products || []).map((p) => p.id);
  const categoryIds = (coupon.applicable_categories || []).map((c) => c.id);
  let eligible = cart;
  if (productIds.length > 0 || categoryIds.length > 0) {
    eligible = cart.filter(
      (i) => productIds.includes(i.productId) || (i.categoryId != null && categoryIds.includes(i.categoryId)),
    );
    if (eligible.length === 0) {
      return { valid: false, message: 'Coupon does not apply to items in your cart', discount: 0, freeShipping: false };
    }
  }

  const eligibleTotal = eligible.reduce((s, i) => s + i.price * i.qty, 0);
  const value = Number(coupon.value);

  let discount = 0;
  let freeShipping = false;
  switch (coupon.type) {
    case 'percentage':
      discount = Math.round(eligibleTotal * (value / 100) * 100) / 100;
      break;
    case 'fixed_amount':
      discount = Math.min(value, subtotal);
      break;
    case 'free_shipping':
      freeShipping = true;
      break;
  }

  return {
    valid: true,
    message: freeShipping
      ? 'Free shipping applied'
      : `Discount of £${discount.toFixed(2)} applied`,
    discount,
    freeShipping,
    code: coupon.code,
    type: coupon.type,
    documentId: coupon.documentId,
  };
}
