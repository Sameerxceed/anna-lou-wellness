'use strict';

/**
 * Custom HTML Landing lifecycle — revalidates /campaigns/{slug} on
 * create / update / delete so Anna's HTML edits reflect immediately on
 * the live site without a redeploy.
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');

function pathsFor(entry) {
  const paths = ['/'];
  if (entry?.slug) paths.push(`/campaigns/${entry.slug}`);
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
