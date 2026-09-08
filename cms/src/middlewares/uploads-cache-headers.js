'use strict';

/**
 * uploads-cache-headers — sets long-lived Cache-Control on /uploads/*
 * so the browser (and any CDN in front) caches Strapi media forever.
 *
 * Every asset in /uploads is content-addressed by Strapi (the hash suffix
 * `_82b3af86d6` in filenames like `Citrine_Cathedral_Point_..._82b3af86d6.jpg`
 * is per-upload). When Anna re-uploads a photo, Strapi generates a NEW
 * filename with a new hash, so cached URLs are automatically invalidated
 * on the next page render (Strapi returns the new URL). We can therefore
 * cache the old URLs indefinitely — they will never point to different
 * content.
 *
 * Adds:
 *   Cache-Control: public, max-age=31536000, immutable
 * only on GET/HEAD requests to /uploads/*, skipping the admin API and
 * REST endpoints.
 *
 * Before this: browsers made a conditional GET for every image on every
 * page visit (200-500ms each × ~10 images per shop page). After this:
 * second visit fetches zero images from the network — all from disk cache.
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();
    // Only tag GET/HEAD responses under /uploads with the long cache. Do
    // not touch admin/API responses or write methods.
    if (
      (ctx.method === 'GET' || ctx.method === 'HEAD') &&
      ctx.path &&
      ctx.path.startsWith('/uploads/') &&
      ctx.status >= 200 && ctx.status < 400
    ) {
      // 1 year, immutable — safe because Strapi filenames include a
      // content hash. If Anna re-uploads the same photo, the URL changes.
      ctx.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
  };
};
