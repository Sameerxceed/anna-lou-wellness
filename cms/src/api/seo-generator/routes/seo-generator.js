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
      config: { auth: false },
    },
    {
      // Admin JWT verified inside the controller. The v5
      // admin::isAuthenticatedAdmin policy is unreliable on /api/*
      // routes (same issue as manual-help + internal-routes).
      method: 'POST',
      path: '/seo-generator/backfill-start',
      handler: 'seo-generator.backfillStart',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/seo-generator/backfill-status',
      handler: 'seo-generator.backfillStatus',
      config: { auth: false },
    },
    {
      // On-demand regenerate SEO for a single entry. Powers the "Regenerate
      // SEO" button on the edit view. Admin JWT verified inside the
      // controller because Strapi v5's admin::isAuthenticatedAdmin policy
      // is unreliable on /api routes (same issue as manual-help + internal-routes).
      method: 'POST',
      path: '/seo-generator/regenerate-entry',
      handler: 'seo-generator.regenerateEntry',
      config: { auth: false },
    },
  ],
};
