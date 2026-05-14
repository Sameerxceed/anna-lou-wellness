'use strict';

/**
 * Cron Tasks
 *
 * Format: '* * * * *' (minute hour day month weekday)
 */

const { pullSubstackFeed } = require('./tasks/substack-rss');

module.exports = {
  // Abandoned cart recovery — every hour at :00
  '0 * * * *': async ({ strapi }) => {
    try {
      await strapi.service('api::cart.abandoned-cart').processAbandonedCarts();
    } catch (err) {
      strapi.log.error('Abandoned cart cron failed:', err.message);
    }
  },

  // Substack RSS pull — every hour at :15
  '15 * * * *': async ({ strapi }) => {
    try {
      const result = await pullSubstackFeed(strapi);
      strapi.log.info(`Substack RSS pull: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`);
    } catch (err) {
      strapi.log.error('Substack RSS pull failed:', err.message);
    }
  },
};
