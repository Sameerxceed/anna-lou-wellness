'use strict';

// Shop Category — drives the shop nav (top-level categories) and the /shop
// landing page's auto-derived sub-links. When Anna renames a category, adds
// a new one, or changes the parent relationship, we need the shop pages +
// the site-wide nav (via layout revalidate) to refresh so the change is
// visible immediately instead of waiting for the 24h ISR TTL.
//
// product-review, product-variant, product-option are all marked
// "zz · (unused)" in their schemas — no lifecycles needed for those.
const { simpleLifecycles } = require('../../../../utils/revalidate');
module.exports = simpleLifecycles([
  '*',                                  // nav + footer live in the layout
  '/shop',
  '/shop/new-in',
  '/shop/personalised',
  '/shop/emotional-support-jewellery',
]);
