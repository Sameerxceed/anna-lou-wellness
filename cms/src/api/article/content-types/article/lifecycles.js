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

const { notifyRevalidate } = require('../../../../utils/revalidate');
const autoSeo = require('../../../../utils/auto-seo');

// Field map for auto-SEO. Article uses title + intro/body_v2 for the prompt.
// body_v2 (blocks) is preferred over legacy body (richtext markdown).
const SEO_FIELDS = { nameFields: ['title', 'name'], bodyFields: ['intro', 'body_v2', 'body', 'description', 'excerpt'] };

// Given an Article event, compute every public path that should refresh.
// Always includes homepage. Adds the primary category's section landing
// + article detail page. Also adds section + category pages for every
// entry in additional_categories, so a cross-listed article surfaces on
// each section/category feed it has been tagged into.
async function pathsForArticle(strapi, article) {
  const paths = ['/'];
  if (!article) return paths;

  // Refetch with category + additional_categories populated. Event payload
  // rarely carries either relation.
  let primary = article.category || null;
  let extras = Array.isArray(article.additional_categories) ? article.additional_categories : null;
  if (article.documentId && (!primary || !extras)) {
    try {
      const fresh = await strapi.documents('api::article.article').findOne({
        documentId: article.documentId,
        populate: { category: true, additional_categories: true },
      });
      primary = fresh?.category || primary;
      extras = Array.isArray(fresh?.additional_categories) ? fresh.additional_categories : (extras || []);
    } catch { /* swallow */ }
  }
  if (!Array.isArray(extras)) extras = [];

  const primarySectionPath = SECTION_PATHS[primary?.section];
  if (primarySectionPath) {
    paths.push(primarySectionPath);
    if (article.slug) paths.push(`${primarySectionPath}/${article.slug}`);
    if (primary?.slug) {
      const catPath = `${primarySectionPath}/${primary.slug}`;
      if (!paths.includes(catPath)) paths.push(catPath);
    }
  }

  for (const extra of extras) {
    const extraSectionPath = SECTION_PATHS[extra?.section];
    if (!extraSectionPath) continue;
    if (!paths.includes(extraSectionPath)) paths.push(extraSectionPath);
    if (extra?.slug) {
      const extraCatPath = `${extraSectionPath}/${extra.slug}`;
      if (!paths.includes(extraCatPath)) paths.push(extraCatPath);
    }
  }

  return paths;
}

module.exports = {
  async afterCreate(event) {
    autoSeo.runAfter(event, 'api::article.article', SEO_FIELDS);
    const paths = await pathsForArticle(strapi, event.result);
    await notifyRevalidate(strapi, paths);
  },
  async afterUpdate(event) {
    autoSeo.runAfter(event, 'api::article.article', SEO_FIELDS);
    const paths = await pathsForArticle(strapi, event.result);
    await notifyRevalidate(strapi, paths);
  },
  async afterDelete(event) {
    const paths = await pathsForArticle(strapi, event.result);
    await notifyRevalidate(strapi, paths);
  },
};
