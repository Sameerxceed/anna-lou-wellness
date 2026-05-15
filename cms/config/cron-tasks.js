'use strict';

/**
 * Cron Tasks
 *
 * Format: '* * * * *' (minute hour day month weekday)
 */

const { pullSubstackFeed } = require('./tasks/substack-rss');
const { revokeExpiredResetRoomAccess } = require('./tasks/reset-room-access-revoke');

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

  // Reset Room access revocation — every hour at :30
  '30 * * * *': async ({ strapi }) => {
    try {
      const result = await revokeExpiredResetRoomAccess(strapi);
      if (result.revoked > 0) {
        strapi.log.info(`[reset-room] Cron revoked access for ${result.revoked} members`);
      }
    } catch (err) {
      strapi.log.error('Reset Room access cron failed:', err.message);
    }
  },
};
