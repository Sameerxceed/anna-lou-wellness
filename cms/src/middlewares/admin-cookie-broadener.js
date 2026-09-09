'use strict';

/**
 * admin-cookie-broadener
 *
 * Why this exists: Strapi v5.40+ sets its admin session cookie with
 * `Path=/admin`. That means when Anna's browser calls one of our custom
 * endpoints under /api/* (manual-help/ask, internal-routes/list,
 * seo-generator/*), the browser strips the admin cookie and no auth
 * reaches the endpoint. Every request 401s with "Admin login required."
 * Confirmed 9 Sep 2026 by inspecting live CMS logs — every real browser
 * request arrived with cookies=[] and headerPresent=false.
 *
 * What we do: on any response that Set-Cookies an admin session cookie
 * with `path=/admin`, we emit a SECOND Set-Cookie header for the same
 * cookie name+value but with `Path=/` (and matching HttpOnly / Secure /
 * SameSite). The browser stores both. Subsequent requests to /api/*
 * carry the broader-path copy, our controllers' cookie scan verifies
 * it against admin.auth.secret, and auth works.
 *
 * Safety: we only duplicate cookies that were already Set-Cookied by
 * Strapi's own admin login flow. We add no new tokens. Verification
 * still requires admin.auth.secret so a broader path exposes nothing.
 */

module.exports = () => {
  return async (ctx, next) => {
    await next();

    const setCookieHeader = ctx.response.headers['set-cookie'];
    if (!setCookieHeader) return;

    const list = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const extras = [];

    for (const raw of list) {
      if (typeof raw !== 'string') continue;
      // Match any Strapi admin cookie: names have shifted across builds
      // (strapi_admin_at, jwtToken, strapi-jwt, admin_jwt, …). We key on
      // the fact that it's Set-Cookie'd from an /admin/* path.
      if (!/Path=\/admin(?:;|$|,)/i.test(raw)) continue;
      // Duplicate with Path=/
      const broadened = raw.replace(/Path=\/admin/gi, 'Path=/');
      // Rename cookie by prefixing so it doesn't clash with the original
      // admin-scoped cookie (browser would otherwise merge them under the
      // same name for the same domain). Our controllers' scan tries every
      // cookie, so any prefixed name still gets verified.
      const renamed = broadened.replace(/^([^=]+)=/, '$1_broad=');
      extras.push(renamed);
    }

    if (extras.length) {
      const all = list.concat(extras);
      ctx.response.set('Set-Cookie', all);
    }
  };
};
