'use strict';

/**
 * Abandoned Cart Recovery Service
 *
 * Cron-compatible service that:
 * 1. Finds carts with email, inactive > X hours, not converted
 * 2. Sends recovery email
 * 3. Tracks if recovery email was sent (prevent spam)
 *
 * Register cron in config/cron-tasks.js:
 *   '0 * * * *': async ({ strapi }) => {
 *     await strapi.service('api::cart.abandoned-cart').processAbandonedCarts();
 *   }
 */

module.exports = ({ strapi }) => ({

  /**
   * Process all abandoned carts and send recovery emails
   */
  async processAbandonedCarts() {
    // Get delay from site settings
    const siteSettings = await strapi.documents('api::site-settings.site-settings').findMany({ limit: 1 });
    const settings = siteSettings[0];
    const delayHours = settings?.abandoned_cart_email_delay_hours || 24;

    const cutoff = new Date(Date.now() - delayHours * 60 * 60 * 1000).toISOString();

    // Find abandoned carts: has email, not converted, inactive > delay, no recovery email sent
    const abandonedCarts = await strapi.documents('api::cart.cart').findMany({
      filters: {
        is_converted: false,
        recovery_email_sent: false,
        email: { $notNull: true, $ne: '' },
        last_active: { $lt: cutoff },
      },
      limit: 50, // Process in batches
    });

    if (abandonedCarts.length === 0) return { processed: 0 };

    let sent = 0;
    const shopUrl = process.env.FRONTEND_URL || 'https://yourshop.com';

    for (const cart of abandonedCarts) {
      const items = cart.items || [];
      if (items.length === 0) continue;

      const itemList = items.map(i => `• ${i.name} × ${i.qty}`).join('\n');
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);

      try {
        await strapi.plugins['email']?.services.email.send({
          to: cart.email,
          subject: 'You left something behind!',
          text: [
            `Hi there,`,
            ``,
            `You left some items in your cart:`,
            ``,
            itemList,
            ``,
            `Subtotal: €${subtotal}`,
            ``,
            `Complete your order: ${shopUrl}/cart`,
            ``,
            `If you have any questions, just reply to this email.`,
          ].join('\n'),
          html: [
            `<h2>You left something behind!</h2>`,
            `<p>You left some items in your cart:</p>`,
            `<ul>${items.map(i => `<li>${i.name} × ${i.qty} — €${(i.price * i.qty).toFixed(2)}</li>`).join('')}</ul>`,
            `<p><strong>Subtotal: €${subtotal}</strong></p>`,
            `<p><a href="${shopUrl}/cart" style="display:inline-block;padding:12px 24px;background:#333;color:#fff;text-decoration:none;border-radius:4px;">Complete Your Order</a></p>`,
            `<p style="color:#888;font-size:12px;">If you have any questions, just reply to this email.</p>`,
          ].join(''),
        });

        // Mark as sent
        await strapi.documents('api::cart.cart').update({
          documentId: cart.documentId,
          data: { recovery_email_sent: true },
        });

        sent++;
      } catch (err) {
        strapi.log.warn(`Abandoned cart email failed for ${cart.email}:`, err.message);
      }
    }

    strapi.log.info(`Abandoned cart recovery: ${sent}/${abandonedCarts.length} emails sent`);
    return { processed: sent, total: abandonedCarts.length };
  },
});
