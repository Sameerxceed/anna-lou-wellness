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

async function notifyRevalidate(strapi, requestedPaths, options = {}) {
  // Anna 23 Jul: kept hitting "my edit isn't showing" on pages that were
  // never listed in a specific lifecycle's paths array. Each individual
  // gap was a whack-a-mole fix. Structural fix was site-wide layout
  // refresh on every save via "*" sentinel.
  //
  // Anna 30 Oct: site-wide refresh via revalidatePath('/', 'layout')
  // invalidates the rendered page cache, but Next.js keeps fetch()
  // results in a SEPARATE Data Cache keyed by URL. Without cache tags,
  // the page re-renders after invalidation but pulls stale Strapi data
  // from the 24h TTL. Reset-room-page edits showed in API but not HTML
  // until next deploy.
  //
  // Fix: send cache tags matching the Strapi endpoint affected. The web
  // side auto-tags every fetchAPI call with `strapi:${endpoint}`, so
  // sending the same tag here invalidates the data cache for every
  // page that fetches that content type.
  //
  // options.tags: string[] of cache tags to invalidate
  // options.endpoint: convenience — if passed, we add `strapi:${endpoint}`
  //   to the tags array automatically.
  const baseUrl = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!baseUrl || !secret) {
    strapi.log.warn('[revalidate] PUBLIC_SITE_URL or REVALIDATE_SECRET not set — skipping');
    return;
  }

  const tags = Array.from(new Set([
    ...(Array.isArray(options.tags) ? options.tags : []),
    ...(options.endpoint ? [`strapi:${options.endpoint}`] : []),
  ]));

  const label = Array.isArray(requestedPaths) && requestedPaths.length > 0
    ? requestedPaths.join(', ')
    : '(no paths passed)';
  try {
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: ['*'], tags, secret }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      strapi.log.warn(`[revalidate] ${res.status}: ${text} (triggered by ${label})`);
    } else {
      strapi.log.info(`[revalidate] site-wide refresh + ${tags.length} tag(s): ${tags.join(', ') || '(none)'} (triggered by ${label})`);
    }
  } catch (err) {
    strapi.log.warn(`[revalidate] network error: ${err.message}`);
  }
}

// Convenience: wraps every standard lifecycle (afterCreate/Update/Delete)
// with the same revalidate call. Auto-derives a cache tag from the
// content-type UID so Next.js data cache gets busted correctly, not just
// the page cache. If a lifecycle needs extra tags beyond the auto-derived
// one, pass them as the second arg.
//   module.exports = simpleLifecycles(['/the-work', '/the-work/sessions']);
//   module.exports = simpleLifecycles(['/'], ['strapi:/site-settings']);
function simpleLifecycles(paths, extraTags = []) {
  const run = async (event) => {
    // Strapi 5 lifecycle events carry { model: { uid, info } } — derive
    // the Strapi REST endpoint from the UID so we tag the exact fetch
    // the web side made for this content type.
    //   'api::reset-room-page.reset-room-page' → '/reset-room-page'
    //   'api::article.article' → '/articles' (pluralised for collections)
    let endpoint = null;
    try {
      const info = event && event.model && event.model.info;
      const uid = event && event.model && event.model.uid;
      if (info) {
        // Collection types use pluralName; single types use singularName.
        // Strapi 5 REST paths follow kebab-case of these names.
        const kind = event.model.kind;
        const name = kind === 'singleType' ? info.singularName : info.pluralName;
        if (name) endpoint = `/${name}`;
      } else if (uid) {
        // Fallback: last segment of UID (works for singletons; collections
        // may be wrong if pluralName differs from singularName).
        endpoint = `/${uid.split('.').pop()}`;
      }
    } catch { /* swallow — endpoint stays null */ }

    const tags = Array.isArray(extraTags) ? extraTags.slice() : [];
    await notifyRevalidate(global.strapi, paths, { tags, endpoint });
  };
  return {
    afterCreate: run,
    afterUpdate: run,
    afterDelete: run,
  };
}

module.exports = { notifyRevalidate, simpleLifecycles };
