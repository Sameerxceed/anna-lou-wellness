'use strict';

/**
 * generic-page lifecycle — refresh the specific URL on every change.
 *
 * Each entry's `slug` IS the URL path (`mission` → /mission). When Anna
 * edits a standalone page, refresh that path AND the homepage (in case
 * the footer/nav links to it).
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');

function pathsFor(entry) {
  const paths = ['/'];
  if (entry?.slug) paths.push(`/${entry.slug}`);
  return paths;
}

module.exports = {
  async afterCreate(event) {
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterUpdate(event) {
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
};
