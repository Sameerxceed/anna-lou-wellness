'use strict';

// Circle Recording — when Anna ticks/unticks is_available_for_purchase or
// creates a new entry, /community/the-returning-circle needs to refresh so
// the buy card shows/hides the current recording. Also refresh the members
// dashboard so buyers see new attached recordings without waiting for the
// 24h ISR TTL.
const { simpleLifecycles } = require('../../../../utils/revalidate');
module.exports = simpleLifecycles([
  '/community/the-returning-circle',
  '/community/reset-room/dashboard',
]);
