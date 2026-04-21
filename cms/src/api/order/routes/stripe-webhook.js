'use strict';

/**
 * Stripe Webhook Handler
 * 
 * Receives Stripe webhook events and auto-confirms order payments.
 * 
 * Setup:
 * 1. Add STRIPE_WEBHOOK_SECRET to .env
 * 2. Configure webhook URL in Stripe Dashboard: https://your-strapi.com/api/stripe/webhook
 * 3. Subscribe to events: payment_intent.succeeded, payment_intent.payment_failed
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/stripe/webhook',
      handler: 'stripe.handleWebhook',
      config: {
        auth: false, // Stripe webhooks don't use Strapi auth
        policies: [],
      },
    },
  ],
};
