'use strict';

/**
 * Manual Help — admin-only endpoint that answers Anna's CMS questions
 * by feeding her question + the full ANNA_USER_MANUAL.md to Claude.
 *
 * Called from the "Help · Ask" admin page (ManualHelpPage.tsx).
 * Admin-cookie auth via admin::isAuthenticatedAdmin so only logged-in
 * Strapi admins can invoke it.
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/manual-help/ask',
      handler: 'manual-help.ask',
      config: {
        auth: false,
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
