'use strict';

/**
 * admin-endpoint-proxy
 *
 * Intercepts specific paths under /admin/* and dispatches them to our
 * custom /api/* controllers BEFORE Strapi's admin SPA catch-all handler
 * would serve index.html. The reason we need to run under /admin/*
 * instead of /api/*: Strapi 5.40+ scopes its admin session cookie to
 * `Path=/admin` (verified 9 Sep 2026 via DevTools — cookie name
 * `jwtToken`, HttpOnly, Path=/admin). Browsers correctly strip that
 * cookie from any request outside /admin/*, so our /api/* endpoints
 * receive no auth. Serving the same handlers under /admin/* means the
 * browser DOES send the cookie, our controllers' existing broadened
 * cookie scan finds `jwtToken` and verifies it against admin.auth.secret.
 *
 * Why a middleware and not routes: Strapi's admin server has a static-
 * file catch-all that intercepts every /admin/* GET/POST for the SPA.
 * strapi.server.routes with type:'admin' at bootstrap ran AFTER that
 * catch-all, so our routes never fired (proven with 405 Method Not
 * Allowed + Allow: HEAD, GET). A middleware registered BEFORE the
 * admin static handler in config/middlewares.js runs first and can
 * return before the fallback ever sees the request.
 *
 * Why not the cookie-broadener approach we tried yesterday: touching
 * the Set-Cookie response header on shared middlewares corrupted
 * /admin/init's response and locked Anna out of the CMS entirely.
 * This middleware never mutates response headers, only intercepts
 * specific paths. If the intercept fails for any reason we fall
 * through to Strapi's normal handling.
 */

const ROUTES = [
  { method: 'POST', path: '/admin/manual-help/ask', module: '../api/manual-help/controllers/manual-help', handler: 'ask' },
  { method: 'GET',  path: '/admin/internal-routes/list', module: '../api/internal-routes/controllers/internal-routes', handler: 'list' },
  { method: 'POST', path: '/admin/seo-generator/generate', module: '../api/seo-generator/controllers/seo-generator', handler: 'generate' },
  { method: 'POST', path: '/admin/seo-generator/regenerate-entry', module: '../api/seo-generator/controllers/seo-generator', handler: 'regenerateEntry' },
  { method: 'POST', path: '/admin/seo-generator/backfill-start', module: '../api/seo-generator/controllers/seo-generator', handler: 'backfillStart' },
  { method: 'GET',  path: '/admin/seo-generator/backfill-status', module: '../api/seo-generator/controllers/seo-generator', handler: 'backfillStatus' },
];

module.exports = () => {
  return async (ctx, next) => {
    for (const route of ROUTES) {
      if (ctx.path === route.path && ctx.method === route.method) {
        try {
          const controller = require(route.module);
          await controller[route.handler](ctx);
        } catch (err) {
          strapi.log.error(`[admin-endpoint-proxy] ${route.method} ${route.path} failed: ${err.message}`);
          ctx.status = 500;
          ctx.body = { error: err.message };
        }
        return;
      }
    }
    await next();
  };
};
