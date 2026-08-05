'use strict';

/**
 * Product lifecycle — refresh shop pages on every change.
 *
 * CRITICAL: stale product data can mean orders placed for deleted or
 * disabled products, wrong prices on checkout, out-of-stock items still
 * appearing in stock. We refresh aggressively on every change.
 *
 * Paths refreshed:
 *   /shop                                 — main catalogue
 *   /shop/[slug]                          — specific product detail
 *   /shop/new-in                          — if tagged "new-in"
 *   /shop/personalised                    — if tagged "personalised"
 *   /shop/emotional-support-jewellery     — if tagged "esj"
 *   /                                     — homepage (shows shop preview)
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');
const autoSeo = require('../../../../utils/auto-seo');

// Auto-fill seo_title + seo_description on save when Anna leaves them
// blank. Runs Claude against the product's name + description +
// short_description to generate one-liner SEO copy she can edit later.
// Anna 30 Jul: reported products had no SEO/AEO info showing on live —
// this closes the gap end-to-end (schema fields + auto-fill + page
// metadata prefers CMS values when set).
const SEO_FIELDS = {
  nameFields: ['name'],
  bodyFields: ['short_description', 'description'],
};

function pathsForProduct(product) {
  const paths = ['/', '/shop'];
  if (!product) return paths;
  if (product.slug) paths.push(`/shop/${product.slug}`);
  // tags is a comma-separated string. Check each sub-page tag.
  const tags = typeof product.tags === 'string' ? product.tags.toLowerCase() : '';
  if (tags.includes('new-in')) paths.push('/shop/new-in');
  if (tags.includes('personalised')) paths.push('/shop/personalised');
  if (tags.includes('esj')) paths.push('/shop/emotional-support-jewellery');
  return paths;
}

module.exports = {
  async afterCreate(event) {
    autoSeo.runAfter(event, 'api::product.product', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsForProduct(event.result));
  },
  async afterUpdate(event) {
    autoSeo.runAfter(event, 'api::product.product', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsForProduct(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsForProduct(event.result));
  },
};
