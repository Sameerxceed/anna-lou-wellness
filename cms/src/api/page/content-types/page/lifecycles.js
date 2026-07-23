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
const autoSeo = require('../../../../utils/auto-seo');

const SEO_FIELDS = { nameFields: ['title', 'name'], bodyFields: ['intro', 'description', 'body', 'sections'] };

function pathsFromEvent(event) {
  const data = (event && event.result) || (event && event.params && event.params.data) || {};
  const slug = data.slug;
  // Always refresh the listing-style parent route in case the page
  // appears in a "Recent pages" component somewhere down the line.
  const paths = ['/p'];
  if (slug) {
    // Page entries are served at MULTIPLE mount points via the [slug]
    // catch-all routes. If we only revalidate /p/<slug> the change won't
    // reach /the-work/<slug> where the REGULATED sales page and any
    // future Page Builder pages actually live. Anna 23 Jul: reported
    // REGULATED edits not reflecting — this was the cause. Revalidate
    // every catch-all mount that reads Page entries.
    paths.push(`/p/${slug}`);
    paths.push(`/the-work/${slug}`);
  }
  return paths;
}

async function run(event, withSeo) {
  if (withSeo) autoSeo.runAfter(event, 'api::page.page', SEO_FIELDS);
  await notifyRevalidate(global.strapi, pathsFromEvent(event));
}

module.exports = {
  afterCreate: (e) => run(e, true),
  afterUpdate: (e) => run(e, true),
  afterDelete: (e) => run(e, false),
};
