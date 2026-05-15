'use strict';

/**
 * Reset Room member lifecycle actions.
 *
 * Authentication: every request must include header
 *   x-reset-room-secret: <RESET_ROOM_ADMIN_SECRET env var>
 *
 * This keeps the endpoints callable from the Next.js Stripe webhook handler
 * without exposing them to the public.
 */

function assertSecret(ctx) {
  const sent = ctx.request.headers['x-reset-room-secret'];
  const expected = process.env.RESET_ROOM_ADMIN_SECRET;
  if (!expected) {
    return ctx.internalServerError('RESET_ROOM_ADMIN_SECRET not configured');
  }
  if (sent !== expected) {
    return ctx.unauthorized('Invalid reset-room secret');
  }
}

async function getResetRoomRoleId(strapi) {
  const role = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'reset-room-member' },
  });
  if (!role) throw new Error('reset-room-member role missing — restart Strapi');
  return role.id;
}

async function getAuthenticatedRoleId(strapi) {
  const role = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });
  return role?.id;
}

async function upsertUserByEmail(strapi, { email, firstName, lastName, stripeCustomerId }) {
  const existing = await strapi.query('plugin::users-permissions.user').findOne({
    where: { email: email.toLowerCase() },
  });

  if (existing) return existing;

  // Create with a random password — user resets via "forgot password" flow on first login.
  const randomPwd = require('crypto').randomBytes(24).toString('hex');
  const created = await strapi.query('plugin::users-permissions.user').create({
    data: {
      username: email.toLowerCase(),
      email: email.toLowerCase(),
      password: randomPwd,
      confirmed: true,
      blocked: false,
      provider: 'local',
      firstName: firstName || null,
      lastName: lastName || null,
      stripeCustomerId: stripeCustomerId || null,
    },
  });
  return created;
}

module.exports = {
  // POST /api/reset-room/grant
  // Body: { email, firstName?, lastName?, stripeCustomerId, stripeSubscriptionId, subscriptionStatus?, currentPeriodEnd? }
  async grant(ctx) {
    const failed = assertSecret(ctx);
    if (failed) return;
    const body = ctx.request.body || {};
    if (!body.email) return ctx.badRequest('email required');

    const roleId = await getResetRoomRoleId(strapi);
    const user = await upsertUserByEmail(strapi, body);

    const updated = await strapi.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: {
        role: roleId,
        firstName: body.firstName || user.firstName,
        lastName: body.lastName || user.lastName,
        stripeCustomerId: body.stripeCustomerId || user.stripeCustomerId,
        stripeSubscriptionId: body.stripeSubscriptionId || user.stripeSubscriptionId,
        subscriptionStatus: body.subscriptionStatus || 'active',
        memberSince: user.memberSince || new Date().toISOString(),
        accessUntil: null,
      },
    });

    ctx.body = { ok: true, userId: updated.id, email: updated.email };
  },

  // POST /api/reset-room/cancel-at-period-end
  // Body: { stripeSubscriptionId, currentPeriodEnd }
  // Marks access to expire — Strapi cron revokes role after that timestamp.
  async cancelAtPeriodEnd(ctx) {
    const failed = assertSecret(ctx);
    if (failed) return;
    const { stripeSubscriptionId, currentPeriodEnd } = ctx.request.body || {};
    if (!stripeSubscriptionId || !currentPeriodEnd) {
      return ctx.badRequest('stripeSubscriptionId and currentPeriodEnd required');
    }
    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { stripeSubscriptionId },
    });
    if (!user) return ctx.notFound('No user for that subscription');

    await strapi.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: {
        accessUntil: new Date(currentPeriodEnd * 1000).toISOString(),
        subscriptionStatus: 'canceled',
      },
    });
    ctx.body = { ok: true, accessUntil: new Date(currentPeriodEnd * 1000).toISOString() };
  },

  // POST /api/reset-room/revoke
  // Body: { stripeSubscriptionId } OR { email }
  // Immediately downgrades user to 'authenticated' role.
  async revoke(ctx) {
    const failed = assertSecret(ctx);
    if (failed) return;
    const { stripeSubscriptionId, email } = ctx.request.body || {};
    if (!stripeSubscriptionId && !email) {
      return ctx.badRequest('stripeSubscriptionId or email required');
    }

    const where = stripeSubscriptionId
      ? { stripeSubscriptionId }
      : { email: email.toLowerCase() };
    const user = await strapi.query('plugin::users-permissions.user').findOne({ where });
    if (!user) return ctx.notFound('User not found');

    const authRoleId = await getAuthenticatedRoleId(strapi);
    await strapi.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: {
        role: authRoleId,
        subscriptionStatus: 'canceled',
        accessUntil: new Date().toISOString(),
      },
    });
    ctx.body = { ok: true, userId: user.id };
  },

};
