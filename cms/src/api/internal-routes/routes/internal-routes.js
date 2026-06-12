'use strict';

/**
 * Site URLs lookup — admin-only endpoint that lists every public URL on
 * the site (static routes + every published Programme / Experience /
 * Page Builder entry / Article / Practitioner).
 *
 * Called from the Site URLs admin page (SiteUrlsPage.tsx) so Anna can
 * copy URLs when editing nav, Mailchimp emails, social posts etc.
 * without having to remember slugs or risk typos.
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/internal-routes/list',
      handler: 'internal-routes.list',
      config: {
        auth: false,
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
