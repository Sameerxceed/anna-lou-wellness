'use strict';

/**
 * Cron Tasks
 *
 * Define scheduled tasks here.
 * Format: '* * * * *' (minute hour day month weekday)
 */

module.exports = {
  // Run abandoned cart recovery every hour
  '0 * * * *': async ({ strapi }) => {
    try {
      await strapi.service('api::cart.abandoned-cart').processAbandonedCarts();
    } catch (err) {
      strapi.log.error('Abandoned cart cron failed:', err.message);
    }
  },
};
