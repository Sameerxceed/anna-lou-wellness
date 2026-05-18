/**
 * Strapi is the source of truth for products. Stripe is just the payment gateway.
 *
 * This module fetches any "purchasable" content type from Strapi and returns
 * a normalized shape used by the Stripe checkout endpoint and webhook handler.
 *
 * Supported types (Strapi singular name):
 *  - 'membership'       (singleType) - Reset Room subscription
 *  - 'programme'        (collection) - The Reset, Signal, Founder Reset, etc.
 *  - 'experience-page'  (collection) - Workshops, Retreats, etc.
 *
 * Adding new purchasable types: extend PurchasableType + add a case in fetchPurchasable().
 *
 * Env vars:
 *   STRAPI_URL  (or NEXT_PUBLIC_STRAPI_URL) - base URL of the Strapi instance
 */

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export type PurchasableType = 'membership' | 'programme' | 'experience-page';

export type Purchasable = {
  type: PurchasableType;
  id: number;
  documentId: string;
  name: string;
  pricePence: number;
  currency: string;
  isRecurring: boolean;
  recurringInterval: 'month' | 'year' | null;
  mailchimpTag: string | null;
  grantsResetRoomAccess: boolean;
};

function normalize(type: PurchasableType, raw: any): Purchasable | null {
  if (!raw) return null;
  const pricePence = Number(raw.pricePence ?? 0);
  if (!Number.isFinite(pricePence) || pricePence < 0) return null;
  return {
    type,
    id: raw.id,
    documentId: raw.documentId,
    name: String(raw.title || raw.name || 'Untitled'),
    pricePence,
    currency: String(raw.currency || 'gbp').toLowerCase(),
    isRecurring: Boolean(raw.isRecurring),
    recurringInterval: raw.recurringInterval || null,
    mailchimpTag: raw.mailchimpTag || null,
    grantsResetRoomAccess: Boolean(raw.grantsResetRoomAccess),
  };
}

/**
 * Fetch a purchasable record by type + identifier.
 * Identifier rules:
 *  - 'membership': identifier is ignored (singleType — only one record)
 *  - 'programme' and 'experience-page': identifier is the slug (preferred) or numeric id
 */
export async function fetchPurchasable(
  type: PurchasableType,
  identifier?: string | number,
): Promise<Purchasable | null> {
  if (type === 'membership') {
    // singleType — Strapi's GET /api/membership returns the one record
    const res = await fetch(`${STRAPI_URL}/api/membership`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return normalize(type, json?.data);
  }

  if (!identifier) return null;

  const pluralPath = type === 'programme' ? 'programmes' : 'experience-pages';

  // Try slug first (preferred — stable across DB resets)
  if (typeof identifier === 'string' && !/^\d+$/.test(identifier)) {
    const url = new URL(`${STRAPI_URL}/api/${pluralPath}`);
    url.searchParams.set('filters[slug][$eq]', identifier);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const first = Array.isArray(json?.data) ? json.data[0] : null;
      if (first) return normalize(type, first);
    }
    return null;
  }

  // Numeric id fallback
  const res = await fetch(`${STRAPI_URL}/api/${pluralPath}/${identifier}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return normalize(type, json?.data);
}

/**
 * Sanity-check a purchasable record before sending it to Stripe.
 * Returns an error message if anything's wrong, or null if valid.
 */
export function validateForCheckout(p: Purchasable): string | null {
  if (!p.pricePence || p.pricePence <= 0) {
    return `${p.name} is not priced (pricePence is 0). Set a price in Strapi or contact for booking.`;
  }
  if (p.pricePence < 30) {
    // Stripe's minimum charge is around 30p in GBP — refuse before Stripe does
    return `Price too low (${p.pricePence}p). Stripe minimum is around 30p.`;
  }
  if (p.isRecurring && !p.recurringInterval) {
    return `${p.name} is marked recurring but has no recurringInterval — set month or year in Strapi.`;
  }
  return null;
}
