/**
 * Analytics helpers — client-side wrappers around window.gtag and window.fbq.
 *
 * Why a wrapper:
 *  - Components shouldn't have to know whether GA / Pixel are configured.
 *  - If consent is denied or the IDs aren't set, the call no-ops silently.
 *  - One place to add a new analytics destination (Plausible, PostHog) later.
 *
 * Privacy posture:
 *  - Default consent is DENIED. Tags only fire after the visitor accepts
 *    the cookie banner. See CookieBanner + Analytics components.
 *  - GA4 is loaded with `consent: 'denied'` so it queues pings until granted
 *    (Google Consent Mode v2 — what the EU now requires for ad personalisation).
 *  - Meta Pixel only loads AFTER consent is granted (Meta has no equivalent
 *    queueing mode; cleaner to defer loading entirely).
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    __alwAnalyticsLoaded?: boolean;
  }
}

const CONSENT_KEY = 'alw-cookies';
export type Consent = 'granted' | 'denied' | 'unknown';

export function getConsent(): Consent {
  if (typeof window === 'undefined') return 'unknown';
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === 'accepted') return 'granted';
  if (v === 'declined') return 'denied';
  return 'unknown';
}

export function setConsent(state: 'granted' | 'denied') {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, state === 'granted' ? 'accepted' : 'declined');
  // Update Google Consent Mode v2 if gtag is loaded.
  if (window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }
  window.dispatchEvent(new CustomEvent('alw-consent-changed', { detail: { state } }));
}

/**
 * Lazy load FB Pixel after consent — Meta has no consent-mode queue.
 *
 * This is Meta's standard bootstrap snippet, transliterated to TS. The
 * inner `n` is a function the snippet later attaches properties to
 * (callMethod, queue, push, loaded, version). Strict TS infers `n` as
 * `() => void`, so the property assignments don't typecheck. The whole
 * IIFE is the canonical Meta snippet — we keep its shape and just
 * declare `n: any` to silence the strict checker.
 */
function loadFacebookPixel(pixelId: string) {
  if (!pixelId || typeof window === 'undefined' || (window as any).fbq) return;
  (function (f: any, b: any, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t: any = b.createElement(e);
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  const w = window as any;
  if (w.fbq) {
    w.fbq('init', pixelId);
    w.fbq('track', 'PageView');
  }
}

/** Public: track an event to whichever destinations are configured. */
export function trackEvent(
  name: string,
  params: Record<string, any> = {},
  fbName?: string,
) {
  if (typeof window === 'undefined') return;
  try {
    if (window.gtag) window.gtag('event', name, params);
  } catch { /* noop */ }
  try {
    if (window.fbq) window.fbq('track', fbName || mapToFbEvent(name), params);
  } catch { /* noop */ }
}

/** Map GA4 event names to Meta Pixel standard events. */
function mapToFbEvent(ga: string): string {
  switch (ga) {
    case 'add_to_cart': return 'AddToCart';
    case 'begin_checkout': return 'InitiateCheckout';
    case 'purchase': return 'Purchase';
    case 'add_to_wishlist': return 'AddToWishlist';
    case 'sign_up': return 'CompleteRegistration';
    case 'generate_lead': return 'Lead';
    case 'view_item': return 'ViewContent';
    case 'search': return 'Search';
    default: return 'CustomEvent';
  }
}

/** Public: standardised purchase event for Stripe / bank-transfer success. */
export function trackPurchase(args: {
  transactionId: string;
  value: number;
  currency?: string;
  items?: Array<{ id: string | number; name: string; price: number; qty: number; category?: string }>;
}) {
  const currency = (args.currency || 'GBP').toUpperCase();
  const gaItems = (args.items || []).map((i) => ({
    item_id: String(i.id),
    item_name: i.name,
    price: i.price,
    quantity: i.qty,
    item_category: i.category,
  }));
  trackEvent('purchase', {
    transaction_id: args.transactionId,
    value: args.value,
    currency,
    items: gaItems,
  }, 'Purchase');
  // Also fire a Meta-specific shape so the Ads Manager reports clean revenue.
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'Purchase', {
        value: args.value,
        currency,
        contents: (args.items || []).map((i) => ({ id: String(i.id), quantity: i.qty })),
        content_ids: (args.items || []).map((i) => String(i.id)),
        content_type: 'product',
        num_items: (args.items || []).reduce((s, i) => s + i.qty, 0),
      });
    } catch { /* noop */ }
  }
}

/** Activate FB pixel post-consent. Called by Analytics component. */
export function activatePixelIfConsented(pixelId: string) {
  if (!pixelId) return;
  if (getConsent() === 'granted') loadFacebookPixel(pixelId);
}
