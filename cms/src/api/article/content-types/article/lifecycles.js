'use strict';

/**
 * Article lifecycle hooks — trigger Next.js revalidation on every change.
 *
 * Without these, Next.js serves the cached version of an article for up to
 * 1 hour after Anna edits it (ISR revalidate: 3600 in web/src/lib/strapi.ts).
 * With these, the public page reflects the change within seconds.
 *
 * Hooks fire on:
 *   - afterCreate: new article published
 *   - afterUpdate: existing article edited (including shop_tags add/remove)
 *   - afterDelete: article deleted
 *
 * Each hook computes which public paths need refreshing:
 *   - the article's own detail page (/[section]/[slug])
 *   - the section landing page (/[section]) — lists all articles in section
 *   - the homepage (/) — featured / recent article grid
 *
 * Then POSTs to /api/revalidate on the Next.js side with the shared secret.
 *
 * Failure modes are non-fatal: if Next.js is down or the secret is wrong,
 * we log a warning but DON'T block the save. Anna can always force a
 * redeploy from Coolify as a backup.
 */

// Section slug → public URL path prefix. Articles live under
// /[section]/[slug] where section is derived from the article's category.
const SECTION_PATHS = {
  'reset-stories': '/reset-stories',
  'life': '/life',
  'love-and-relationships': '/love-and-relationships',
  'work-and-money': '/work-and-money',
};

async function notifyRevalidate(strapi, paths) {
  const baseUrl = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!baseUrl || !secret) {
    strapi.log.warn('[article-lifecycles] PUBLIC_SITE_URL or REVALIDATE_SECRET not set — skipping revalidation');
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
      strapi.log.warn(`[article-lifecycles] revalidate ${res.status}: ${text}`);
    } else {
      strapi.log.info(`[article-lifecycles] revalidated ${paths.length} paths`);
    }
  } catch (err) {
    strapi.log.warn(`[article-lifecycles] revalidate error: ${err.message}`);
  }
}

// Given an Article event, compute every public path that should refresh.
// Always includes homepage and section landing. Includes article detail
// when slug + section are known.
async function pathsForArticle(strapi, article) {
  const paths = ['/'];
  if (!article) return paths;
  // Article may not have category populated in the event payload — fetch it.
  let sectionSlug = null;
  if (article.category?.section) {
    sectionSlug = article.category.section;
  } else if (article.id) {
    try {
      const fresh = await strapi.documents('api::article.article').findOne({
        documentId: article.documentId,
        populate: { category: true },
      });
      sectionSlug = fresh?.category?.section || null;
    } catch { /* swallow */ }
  }
  const sectionPath = SECTION_PATHS[sectionSlug];
  if (sectionPath) {
    paths.push(sectionPath);
    if (article.slug) paths.push(`${sectionPath}/${article.slug}`);
  }
  return paths;
}

module.exports = {
  async afterCreate(event) {
    const paths = await pathsForArticle(strapi, event.result);
    await notifyRevalidate(strapi, paths);
  },
  async afterUpdate(event) {
    const paths = await pathsForArticle(strapi, event.result);
    await notifyRevalidate(strapi, paths);
  },
  async afterDelete(event) {
    const paths = await pathsForArticle(strapi, event.result);
    await notifyRevalidate(strapi, paths);
  },
};
