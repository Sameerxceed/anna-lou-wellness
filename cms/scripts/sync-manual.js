#!/usr/bin/env node
'use strict';

/**
 * Sync ANNA_USER_MANUAL.md from /Docs into cms/src/data/anna-manual.md
 * so the Strapi build bundles the latest version of the manual for the
 * Help · Ask admin page.
 *
 * Run after any edit to Docs/ANNA_USER_MANUAL.md, then commit BOTH files.
 *
 * Usage:
 *   node cms/scripts/sync-manual.js
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'Docs', 'ANNA_USER_MANUAL.md');
const DEST = path.join(__dirname, '..', 'src', 'data', 'anna-manual.md');

if (!fs.existsSync(SRC)) {
  console.error(`[sync-manual] Source missing: ${SRC}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.copyFileSync(SRC, DEST);
const bytes = fs.statSync(DEST).size;
console.log(`[sync-manual] Copied → ${DEST} (${bytes.toLocaleString()} bytes)`);
