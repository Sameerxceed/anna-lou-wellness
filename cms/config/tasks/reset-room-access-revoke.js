'use strict';

/**
 * Hourly task — revoke Reset Room access for any user whose accessUntil has passed.
 * Triggered by `customer.subscription.deleted` Stripe webhook setting accessUntil = current_period_end.
 *
 * Downgrades them to 'authenticated' so member portal redirects them to the public landing.
 */

async function revokeExpiredResetRoomAccess(strapi) {
  const resetRoomRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'reset-room-member' },
  });
  const authRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });
  if (!resetRoomRole || !authRole) return { revoked: 0 };

  const now = new Date().toISOString();
  const expired = await strapi.query('plugin::users-permissions.user').findMany({
    where: {
      role: resetRoomRole.id,
      accessUntil: { $lt: now },
      $not: { accessUntil: null },
    },
  });

  for (const user of expired) {
    await strapi.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: { role: authRole.id, subscriptionStatus: 'canceled' },
    });
    strapi.log.info(`[reset-room] Revoked access for ${user.email} (accessUntil ${user.accessUntil})`);
  }

  return { revoked: expired.length };
}

module.exports = { revokeExpiredResetRoomAccess };
