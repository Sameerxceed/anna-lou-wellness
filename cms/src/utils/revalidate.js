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

async function notifyRevalidate(strapi, requestedPaths) {
  // Anna 23 Jul: kept hitting "my edit isn't showing" on pages that were
  // never listed in a specific lifecycle's paths array (e.g. Page entries
  // served at /the-work/<slug> vs the lifecycle only knowing /p/<slug>).
  // Each individual gap was a whack-a-mole fix.
  //
  // Structural fix: every save now triggers a SITE-WIDE layout refresh.
  // Whatever paths a specific lifecycle passes are ignored here; we always
  // ask Next.js to revalidate the whole tree via the "*" sentinel. Cost is
  // ~30 extra ISR writes per save (well under Vercel/self-hosted budget for
  // this site's traffic + save cadence) and eliminates the entire class of
  // "did I remember to add this path?" bugs.
  //
  // The requestedPaths argument is kept for logging visibility only.
  const baseUrl = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!baseUrl || !secret) {
    strapi.log.warn('[revalidate] PUBLIC_SITE_URL or REVALIDATE_SECRET not set — skipping');
    return;
  }
  const label = Array.isArray(requestedPaths) && requestedPaths.length > 0
    ? requestedPaths.join(', ')
    : '(no paths passed)';
  try {
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: ['*'], secret }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      strapi.log.warn(`[revalidate] ${res.status}: ${text} (triggered by ${label})`);
    } else {
      strapi.log.info(`[revalidate] site-wide refresh (triggered by ${label})`);
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
