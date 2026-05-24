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
    await notifyRevalidate(strapi, pathsForProduct(event.result));
  },
  async afterUpdate(event) {
    await notifyRevalidate(strapi, pathsForProduct(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsForProduct(event.result));
  },
};
