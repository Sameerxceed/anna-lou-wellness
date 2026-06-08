'use strict';

/**
 * Custom admin-only route for the "Generate SEO" button injected into the
 * content-manager edit view.
 *
 * Called from cms/src/admin/extensions/GenerateSeoPanel.tsx — the admin
 * fetch helper attaches the admin JWT, and the `admin::isAuthenticatedAdmin`
 * policy gates the route so only logged-in CMS users can spend Anthropic
 * tokens. No public access.
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/seo-generator/generate',
      handler: 'seo-generator.generate',
      config: {
        auth: false,
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
