'use strict';

/**
 * generic-page lifecycle — refresh the specific URL on every change.
 *
 * Each entry's `slug` IS the URL path (`mission` → /mission). When Anna
 * edits a standalone page, refresh that path AND the homepage (in case
 * the footer/nav links to it). Also runs auto-SEO so Anna doesn't have
 * to fill seo_title/seo_description manually.
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');
const autoSeo = require('../../../../utils/auto-seo');

const SEO_FIELDS = { nameFields: ['title', 'name'], bodyFields: ['intro', 'body', 'description', 'content'] };

function pathsFor(entry) {
  const paths = ['/'];
  if (entry?.slug) paths.push(`/${entry.slug}`);
  return paths;
}

module.exports = {
  async afterCreate(event) {
    autoSeo.runAfter(event, 'api::generic-page.generic-page', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterUpdate(event) {
    autoSeo.runAfter(event, 'api::generic-page.generic-page', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
};
