/**
 * Stripe SDK init.
 *
 * Stripe is ONLY a payment gateway — products, prices, and business rules live
 * in Strapi (see lib/strapi-purchasable.ts). We never store price IDs in env
 * vars or stripe.ts. The checkout endpoint builds inline price_data from the
 * Strapi record at request time, and the webhook reads metadata to look up
 * which Strapi record was bought.
 *
 * Env vars (Next.js):
 *   STRIPE_SECRET_KEY      - sk_test_... or sk_live_...
 *   STRIPE_WEBHOOK_SECRET  - whsec_... (registered when webhook endpoint added in Stripe dashboard)
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

export const STRIPE_API_VERSION = '2024-12-18.acacia';
