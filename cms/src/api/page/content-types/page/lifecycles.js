'use strict';

/**
 * Revalidate /p/<slug> on save/update/delete so Anna's edits go live
 * within 1-2 seconds without a full deploy.
 *
 * Strategy: we don't always have the slug on the event payload (some
 * Strapi lifecycle events don't include relations / full data), so when
 * a slug is missing we refresh the whole `/p/*` prefix by hitting the
 * Next.js revalidate endpoint with the parent path. Better to over-
 * refresh than miss an update.
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');

function pathsFromEvent(event) {
  const data = (event && event.result) || (event && event.params && event.params.data) || {};
  const slug = data.slug;
  // Always refresh the listing-style parent route in case the page
  // appears in a "Recent pages" component somewhere down the line.
  const paths = ['/p'];
  if (slug) paths.push(`/p/${slug}`);
  return paths;
}

async function run(event) {
  await notifyRevalidate(global.strapi, pathsFromEvent(event));
}

module.exports = {
  afterCreate: run,
  afterUpdate: run,
  afterDelete: run,
};
