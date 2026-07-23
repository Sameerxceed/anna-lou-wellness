'use strict';

/**
 * REGULATED module lifecycle — refresh both the access page (where members
 * see the module list) AND the sales page at /the-work/regulated (which
 * may reference module count / titles / previews in Page Builder blocks).
 *
 * Anna 23 Jul: reported edits not reflecting on REGULATED — was probably
 * the sales page missing from the revalidation list.
 */
const { simpleLifecycles } = require('../../../../utils/revalidate');
module.exports = simpleLifecycles([
  '/the-work/regulated/access',
  '/the-work/regulated',
]);
