'use strict';

// Decoder Quiz page singleton drives /free/nervous-system-decoder/quiz + the
// three per-state result pages rendered under it. Anna edits copy here; the
// public page picks it up on the next request thanks to this webhook.
const { simpleLifecycles } = require('../../../../utils/revalidate');
module.exports = simpleLifecycles([
  '/free/nervous-system-decoder',
  '/free/nervous-system-decoder/quiz',
]);
