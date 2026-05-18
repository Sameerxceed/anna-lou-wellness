/**
 * Stripe SDK init + helpers.
 *
 * Env vars (Next.js):
 *   STRIPE_SECRET_KEY      - sk_test_... or sk_live_...
 *   STRIPE_WEBHOOK_SECRET  - whsec_... (created when webhook endpoint registered in Stripe dashboard)
 *
 * Plus price-ID env vars per product (paste from Stripe → Products):
 *   STRIPE_PRICE_RESET_ROOM      - £25/mo subscription
 *   STRIPE_PRICE_THE_RESET       - £X one-off (6-week 1:1)
 *   STRIPE_PRICE_SIGNAL          - £X one-off (12-week)
 *   STRIPE_PRICE_SIGNAL_BUILD    - £X one-off
 *   STRIPE_PRICE_ONE_DAY         - £X one-off
 *   STRIPE_PRICE_SIGNAL_COLLECTIVE - £X
 *   STRIPE_PRICE_RESET_SESSION   - £X (90-min)
 *   STRIPE_PRICE_WORKSHOP        - £15 or £200 (Anna may want multiple)
 *
 * The product-to-tag map below is the single source of truth for what
 * Mailchimp tag each Stripe price triggers.
 */

import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set — checkout/webhook endpoints will fail at runtime');
}

export const stripe = new Stripe(secretKey || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

/**
 * Map env price-ID -> { tag, productName, grantRole }.
 * Used by the webhook handler to decide what tag to apply and whether
 * to grant the user the reset-room-member role in Strapi.
 *
 * grantRole = true means the user gets gated access on the website
 * (only Reset Room subscription does this today).
 */
export type ProductConfig = {
  tag: string;
  productName: string;
  grantRole: boolean;
};

export function getProductConfig(priceId: string): ProductConfig | null {
  const map: Record<string, ProductConfig> = {};

  const register = (envVar: string, config: ProductConfig) => {
    const id = process.env[envVar];
    if (id) map[id] = config;
  };

  register('STRIPE_PRICE_RESET_ROOM', {
    tag: 'Reset Room Members',
    productName: 'Reset Room (monthly)',
    grantRole: true,
  });
  register('STRIPE_PRICE_THE_RESET', {
    tag: 'The Reset (6-week)',
    productName: 'The Reset (6-week)',
    grantRole: false,
  });
  register('STRIPE_PRICE_SIGNAL', {
    tag: 'Signal (12-week)',
    productName: 'Signal (12-week)',
    grantRole: false,
  });
  register('STRIPE_PRICE_SIGNAL_BUILD', {
    tag: 'Signal & Build (founders)',
    productName: 'Signal & Build',
    grantRole: false,
  });
  register('STRIPE_PRICE_ONE_DAY', {
    tag: 'One Day Intensive',
    productName: 'One Day Intensive',
    grantRole: false,
  });
  register('STRIPE_PRICE_SIGNAL_COLLECTIVE', {
    tag: 'Signal Collective',
    productName: 'Signal Collective',
    grantRole: false,
  });
  register('STRIPE_PRICE_RESET_SESSION', {
    tag: 'Reset Session (90-min)',
    productName: 'Reset Session (90-min)',
    grantRole: false,
  });
  register('STRIPE_PRICE_WORKSHOP', {
    tag: 'Workshop Buyers',
    productName: 'Workshop',
    grantRole: false,
  });

  return map[priceId] || null;
}

export const STRIPE_API_VERSION = '2024-12-18.acacia';
