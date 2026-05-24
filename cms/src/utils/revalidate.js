'use strict';

/**
 * Shared helper for Strapi content-type lifecycle hooks to trigger
 * Next.js on-demand revalidation.
 *
 * Each content type's lifecycles.js file declares which public paths
 * should refresh when an entry is created / updated / deleted, then
 * calls notifyRevalidate(strapi, paths) to POST to the Next.js API.
 *
 * Special path "*" triggers a layout-level revalidation (every page on
 * the site). Use for changes to navigation / footer / site-settings
 * that visibly affect every page.
 *
 * Required env vars (set on the Strapi container in Coolify):
 *   PUBLIC_SITE_URL     e.g. https://staging.annalouwellness.com
 *   REVALIDATE_SECRET   long random string, same value on Next.js side
 *
 * Failure is non-fatal: if Next.js is unreachable or the secret is wrong,
 * we log a warning but the save still succeeds. Editor's experience is
 * never blocked by a revalidation hiccup.
 */

async function notifyRevalidate(strapi, paths) {
  if (!Array.isArray(paths) || paths.length === 0) return;
  const baseUrl = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!baseUrl || !secret) {
    strapi.log.warn('[revalidate] PUBLIC_SITE_URL or REVALIDATE_SECRET not set — skipping');
    return;
  }
  try {
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths, secret }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      strapi.log.warn(`[revalidate] ${res.status}: ${text}`);
    } else {
      strapi.log.info(`[revalidate] refreshed ${paths.join(', ')}`);
    }
  } catch (err) {
    strapi.log.warn(`[revalidate] network error: ${err.message}`);
  }
}

// Convenience: wraps every standard lifecycle (afterCreate/Update/Delete)
// with the same revalidate call. Use when paths don't depend on entry data.
//   module.exports = simpleLifecycles(['/the-work', '/the-work/sessions']);
function simpleLifecycles(paths) {
  const run = async () => {
    await notifyRevalidate(global.strapi, paths);
  };
  return {
    afterCreate: run,
    afterUpdate: run,
    afterDelete: run,
  };
}

module.exports = { notifyRevalidate, simpleLifecycles };
