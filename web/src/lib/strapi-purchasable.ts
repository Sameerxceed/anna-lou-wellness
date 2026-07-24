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

export type PurchasableType = 'membership' | 'programme' | 'experience-page' | 'experience';

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
  grantsRegulatedAccess: boolean;
  /**
   * PAY-WHAT-YOU-CAN. Allowed amounts in pence. Empty when the programme
   * uses a single fixed price (default). Anna sets a comma-separated
   * pounds list on the Programme entry (e.g. "50, 100, 200, 500") and
   * we parse it here.
   */
  pwycOptionsPence: number[];
  pwycDefaultPence: number | null;
  pwycLabel: string | null;
  /**
   * Optional Calendly URL used as success_url after Stripe payment. When set,
   * the customer lands directly on Calendly to book their first session
   * instead of the generic /thank-you page. Programme-only field for now.
   */
  postCheckoutCalendlyUrl: string | null;
  /** Experience-only: ISO date string (YYYY-MM-DD). Null otherwise. */
  eventDate: string | null;
  /** Experience-only: location string. Null otherwise. */
  eventLocation: string | null;
  /** Experience-only: time-of-day free-text (e.g. "10am to 4pm UK"). Null otherwise. */
  eventTime: string | null;
};

function parsePwycOptions(raw: unknown): number[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw
    .split(',')
    .map((s) => Number(String(s).trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((pounds) => Math.round(pounds * 100));
}

function normalize(type: PurchasableType, raw: any): Purchasable | null {
  if (!raw) return null;
  // Experience uses `price` (decimal £). Everything else uses `pricePence` (integer).
  // Anna 24 Jul: added experience support for retreat/workshop Stripe checkout —
  // buyers pay before booking so we can lock the seat + fire Mailchimp tag.
  const pricePence = type === 'experience'
    ? Math.round(Number(raw.price ?? 0) * 100)
    : Number(raw.pricePence ?? 0);
  if (!Number.isFinite(pricePence) || pricePence < 0) return null;
  const pwycOptionsPence = parsePwycOptions(raw.pwycOptions);
  const pwycDefaultRaw = Number(raw.pwycDefault ?? 0);
  const pwycDefaultPence =
    pwycOptionsPence.length > 0 && Number.isFinite(pwycDefaultRaw) && pwycDefaultRaw > 0
      ? Math.round(pwycDefaultRaw * 100)
      : null;
  return {
    type,
    id: raw.id,
    documentId: raw.documentId,
    name: String(raw.title || raw.name || 'Untitled'),
    pricePence,
    currency: String(raw.currency || 'gbp').toLowerCase(),
    isRecurring: Boolean(raw.isRecurring),
    recurringInterval: raw.recurringInterval || null,
    mailchimpTag: raw.mailchimpTag || raw.mailchimp_tag || null,
    grantsResetRoomAccess: Boolean(raw.grantsResetRoomAccess),
    grantsRegulatedAccess: Boolean(raw.grantsRegulatedAccess),
    pwycOptionsPence,
    pwycDefaultPence,
    pwycLabel: typeof raw.pwycLabel === 'string' && raw.pwycLabel.trim() ? raw.pwycLabel : null,
    postCheckoutCalendlyUrl: typeof raw.postCheckoutCalendlyUrl === 'string' && raw.postCheckoutCalendlyUrl.trim()
      ? raw.postCheckoutCalendlyUrl.trim()
      : (typeof raw.booking_url === 'string' && raw.booking_url.trim() ? raw.booking_url.trim() : null),
    // Experience-only event details (retreats, workshops). Undefined for
    // membership/programme/experience-page. Used to populate Mailchimp
    // merge fields on purchase so Anna's journey emails can render
    // *|EVENT_DATE|* / *|EVENT_LOC|* / *|EVENT_NAME|*.
    eventDate: type === 'experience' && typeof raw.date === 'string' ? raw.date : null,
    eventLocation: type === 'experience' && typeof raw.location === 'string' ? raw.location.trim() : null,
    eventTime: type === 'experience' && typeof raw.time === 'string' ? raw.time.trim() : null,
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

  const pluralPath = type === 'programme'
    ? 'programmes'
    : type === 'experience'
      ? 'experiences'
      : 'experience-pages';

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

  // Numeric id fallback — Strapi 5 expects documentId for direct path lookups,
  // so we use a filter query on the `id` field instead. Works for both legacy
  // numeric IDs and the new documentId hashes.
  const url = new URL(`${STRAPI_URL}/api/${pluralPath}`);
  const idStr = String(identifier);
  // Try numeric id filter (works for legacy IDs from Strapi 4 metadata + new Strapi 5 numeric IDs)
  url.searchParams.set('filters[id][$eq]', idStr);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (res.ok) {
    const json = await res.json();
    const first = Array.isArray(json?.data) ? json.data[0] : null;
    if (first) return normalize(type, first);
  }
  // Last resort: try documentId match in case identifier IS a documentId hash
  const url2 = new URL(`${STRAPI_URL}/api/${pluralPath}`);
  url2.searchParams.set('filters[documentId][$eq]', idStr);
  const res2 = await fetch(url2.toString(), { cache: 'no-store' });
  if (!res2.ok) return null;
  const json2 = await res2.json();
  const first2 = Array.isArray(json2?.data) ? json2.data[0] : null;
  return first2 ? normalize(type, first2) : null;
}

/**
 * Sanity-check a purchasable record before sending it to Stripe.
 * Returns an error message if anything's wrong, or null if valid.
 */
export function validateForCheckout(p: Purchasable): string | null {
  // PAY-WHAT-YOU-CAN programmes don't need a fixed pricePence — the buyer
  // picks from pwycOptionsPence. Skip the fixed-price checks in that case.
  if (p.pwycOptionsPence.length > 0) {
    if (p.pwycOptionsPence.some((cents) => cents < 30)) {
      return `${p.name} pay-what-you-can option is below Stripe's ~30p minimum.`;
    }
    if (p.isRecurring && !p.recurringInterval) {
      return `${p.name} is marked recurring but has no recurringInterval — set month or year in Strapi.`;
    }
    return null;
  }
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
