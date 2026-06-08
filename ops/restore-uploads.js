#!/usr/bin/env node
/**
 * restore-uploads.js
 *
 * Given a local folder of source images from Anna, find each one in the
 * broken-uploads.json list (produced by list-broken-uploads.js) and re-
 * upload it INTO the existing Strapi media record so all content
 * references stay intact.
 *
 * How we re-link without losing references
 * ----------------------------------------
 * Strapi v5 exposes POST /api/upload?id=<fileId> which REPLACES the binary
 * of an existing media record. The record's id + documentId stay the same,
 * meaning every content type that references it (homepage hero, programme
 * images, page builder sections, etc.) keeps working automatically.
 *
 * Matching strategy
 * -----------------
 * For each file in the source folder, we look for a broken record whose
 * `name` matches. Match logic, in order:
 *   1. Exact match on the original filename ("031.jpeg" → "031.jpeg")
 *   2. Case-insensitive match
 *   3. Match on the basename (without extension), so "031.jpg" matches
 *      a broken "031.jpeg" record
 *
 * Files in the source folder with no match are reported but NOT uploaded
 * (we don't want to create new records by accident).
 *
 * Usage:
 *   node ops/restore-uploads.js path/to/source-folder
 *
 * Env:
 *   STRAPI_URL          default https://cms.annalouwellness.com
 *   STRAPI_ADMIN_TOKEN  required — same admin token used by list-broken-uploads
 *   BROKEN_LIST         default ops/broken-uploads.json
 *   DRY_RUN             set to 1 to preview matches without uploading
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const STRAPI_URL = (process.env.STRAPI_URL || 'https://cms.annalouwellness.com').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_ADMIN_TOKEN;
const LIST_PATH = process.env.BROKEN_LIST || path.join(__dirname, 'broken-uploads.json');
const DRY_RUN = process.env.DRY_RUN === '1';

if (!TOKEN) {
  console.error('ERROR: STRAPI_ADMIN_TOKEN env var is required.');
  process.exit(1);
}

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error('Usage: node ops/restore-uploads.js <path-to-source-folder>');
  console.error('Example: node ops/restore-uploads.js "C:\\Users\\Sameer\\Downloads\\anna-photos"');
  process.exit(1);
}
if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  console.error(`ERROR: source folder does not exist: ${sourceDir}`);
  process.exit(1);
}
if (!fs.existsSync(LIST_PATH)) {
  console.error(`ERROR: broken-uploads.json not found at ${LIST_PATH}`);
  console.error('Run: node ops/list-broken-uploads.js first');
  process.exit(1);
}

const brokenRecords = JSON.parse(fs.readFileSync(LIST_PATH, 'utf8'));
console.log(`Loaded ${brokenRecords.length} broken records from ${LIST_PATH}`);

// Walk source folder (one level deep — Anna won't ship nested folders)
function listSourceFiles(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      // Recurse one level so a flat zip-extracted folder structure works
      for (const subname of fs.readdirSync(full)) {
        const subfull = path.join(full, subname);
        if (fs.statSync(subfull).isFile()) out.push(subfull);
      }
    } else if (stat.isFile()) {
      out.push(full);
    }
  }
  return out;
}

const sourceFiles = listSourceFiles(sourceDir);
console.log(`Found ${sourceFiles.length} files in ${sourceDir}\n`);

// Match each source file to a broken record by name
function findMatch(filename) {
  const lower = filename.toLowerCase();
  const baseLower = path.basename(filename, path.extname(filename)).toLowerCase();

  // Tier 1: exact
  let m = brokenRecords.find((r) => r.name === filename);
  if (m) return { record: m, tier: 'exact' };

  // Tier 2: case-insensitive full name
  m = brokenRecords.find((r) => (r.name || '').toLowerCase() === lower);
  if (m) return { record: m, tier: 'caseInsensitive' };

  // Tier 3: basename (ignore extension)
  m = brokenRecords.find((r) => {
    const rBase = path.basename(r.name || '', r.ext || '').toLowerCase();
    return rBase === baseLower;
  });
  if (m) return { record: m, tier: 'basenameOnly' };

  return null;
}

const matched = [];
const unmatched = [];
const recordsUsed = new Set();

for (const filepath of sourceFiles) {
  const name = path.basename(filepath);
  const result = findMatch(name);
  if (result && !recordsUsed.has(result.record.id)) {
    matched.push({ filepath, name, ...result });
    recordsUsed.add(result.record.id);
  } else {
    unmatched.push(filepath);
  }
}

const orphanRecords = brokenRecords.filter((r) => !recordsUsed.has(r.id));

console.log(`Matched   : ${matched.length}`);
console.log(`Unmatched source files: ${unmatched.length}`);
console.log(`Broken records with no source file in folder: ${orphanRecords.length}\n`);

if (unmatched.length) {
  console.log('Source files with no matching broken record (these will NOT be uploaded):');
  unmatched.forEach((f) => console.log(`  - ${path.basename(f)}`));
  console.log('');
}
if (orphanRecords.length) {
  console.log('Broken records still missing from source folder:');
  orphanRecords.forEach((r) => console.log(`  - ${r.name}`));
  console.log('');
}

if (DRY_RUN) {
  console.log('DRY_RUN=1 — exiting without uploading.');
  process.exit(0);
}

if (matched.length === 0) {
  console.log('Nothing to restore. Exiting.');
  process.exit(0);
}

// Upload each matched file, replacing the existing record.
// Strapi POST /api/upload?id=<id> with multipart 'files' field replaces.
async function replace({ filepath, record }) {
  const blob = new Blob([fs.readFileSync(filepath)]);
  const form = new FormData();
  form.append('files', blob, record.name); // use the ORIGINAL recorded name
  const res = await fetch(`${STRAPI_URL}/api/upload?id=${record.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

(async () => {
  console.log(`Uploading ${matched.length} file(s) to ${STRAPI_URL}\n`);
  let okCount = 0;
  let failCount = 0;
  for (const m of matched) {
    process.stdout.write(`  ${m.name} (${m.tier})... `);
    try {
      await replace(m);
      console.log('OK');
      okCount += 1;
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      failCount += 1;
    }
  }
  console.log(`\nDone. ${okCount} restored, ${failCount} failed.`);
  if (orphanRecords.length) {
    console.log(`\nStill broken (${orphanRecords.length}) — ask Anna for these next:`);
    orphanRecords.forEach((r) => console.log(`  - ${r.name}`));
  }
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
