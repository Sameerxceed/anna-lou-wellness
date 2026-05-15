'use strict';

/**
 * Internal-only routes for granting/revoking Reset Room membership.
 * Called by Stripe webhook handler in the Next.js layer.
 *
 * IMPORTANT: protected by RESET_ROOM_ADMIN_SECRET header check
 *            (middleware on the controller, not exposed to public role).
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/reset-room/grant',
      handler: 'reset-room-member-action.grant',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/reset-room/revoke',
      handler: 'reset-room-member-action.revoke',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/reset-room/cancel-at-period-end',
      handler: 'reset-room-member-action.cancelAtPeriodEnd',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/reset-room/update-podcast-url',
      handler: 'reset-room-member-action.updatePodcastUrl',
      config: {
        auth: false,
      },
    },
  ],
};
