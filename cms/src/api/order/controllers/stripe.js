'use strict';

module.exports = {
  async handleWebhook(ctx) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = ctx.request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(ctx.request.body, sig, endpointSecret);
    } catch (err) {
      strapi.log.error('Stripe webhook signature verification failed:', err.message);
      return ctx.badRequest('Webhook signature verification failed');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.order_id;
        
        if (orderId) {
          // Find order by stripe_payment_id and update status
          const orders = await strapi.entityService.findMany('api::order.order', {
            filters: { stripe_payment_id: paymentIntent.id },
          });

          if (orders.length > 0) {
            await strapi.entityService.update('api::order.order', orders[0].id, {
              data: { status: 'paid' },
            });
            strapi.log.info(`Order ${orders[0].order_number} auto-confirmed via Stripe`);

            // Send confirmation email
            try {
              await strapi.plugins['email']?.services.email.send({
                to: orders[0].customer_email,
                subject: `Payment Confirmed — ${orders[0].order_number}`,
                text: `Hi ${orders[0].customer_name},\n\nYour payment for order ${orders[0].order_number} has been confirmed.\nTotal: €${orders[0].total}\n\nWe'll notify you when your order ships.\n\nThank you!\nAnna Lou Wellness`,
              });
            } catch (err) {
              strapi.log.warn('Confirmation email failed:', err.message);
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        strapi.log.warn(`Payment failed for PaymentIntent: ${paymentIntent.id}`);
        break;
      }

      default:
        strapi.log.info(`Unhandled Stripe event: ${event.type}`);
    }

    ctx.send({ received: true });
  },
};
