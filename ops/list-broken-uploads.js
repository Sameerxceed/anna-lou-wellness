#!/usr/bin/env node
/**
 * list-broken-uploads.js
 *
 * Walk every Strapi media record and HEAD-check its public URL. Print the
 * ones whose URL returns 404 — those are the files we lost when the
 * /uploads volume wasn't persisted across redeploys.
 *
 * Output:
 *   - Pretty list to stdout (paste-into-WhatsApp friendly)
 *   - broken-uploads.json saved next to this script (machine-readable list
 *     used by restore-uploads.js to match incoming files to records)
 *
 * Usage:
 *   node ops/list-broken-uploads.js
 *
 * Env (set on the command line or in a .env beside the script):
 *   STRAPI_URL          default https://cms.annalouwellness.com
 *   STRAPI_ADMIN_TOKEN  required — admin API token with read access
 *                       (Strapi admin → Settings → API Tokens → Create new
 *                        token, type "Full access", duration "Unlimited",
 *                        name e.g. "media-recovery". COPY THE TOKEN
 *                        IMMEDIATELY — it's only shown once.)
 *
 * Notes:
 *  - Strapi v5 media records live under /api/upload/files (plugin endpoint),
 *    not /api/files. We use that.
 *  - We paginate 100 at a time so this scales to thousands of files.
 *  - HEAD requests so we don't download the actual image bytes.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const STRAPI_URL = (process.env.STRAPI_URL || 'https://cms.annalouwellness.com').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('ERROR: STRAPI_ADMIN_TOKEN env var is required.');
  console.error('Create one at: ' + STRAPI_URL + '/admin → Settings → API Tokens → Create new');
  console.error('Then run:  $env:STRAPI_ADMIN_TOKEN="..."; node ops/list-broken-uploads.js  (PowerShell)');
  console.error('Or:        STRAPI_ADMIN_TOKEN="..." node ops/list-broken-uploads.js          (bash)');
  process.exit(1);
}

async function fetchPage(page, pageSize = 100) {
  const url = `${STRAPI_URL}/api/upload/files?page=${page}&pageSize=${pageSize}&sort=createdAt:asc`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Strapi files API ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function checkUrl(absoluteUrl) {
  try {
    const res = await fetch(absoluteUrl, { method: 'HEAD' });
    return res.status;
  } catch (err) {
    return 0;
  }
}

async function main() {
  console.log(`Checking media records on ${STRAPI_URL}\n`);

  // Strapi v5 returns either { results, pagination } directly or
  // { data, meta } depending on version. Handle both.
  let allFiles = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const data = await fetchPage(page);
    const results = Array.isArray(data?.results) ? data.results
                  : Array.isArray(data?.data)    ? data.data
                  : Array.isArray(data)          ? data
                  : [];
    const pagination = data?.pagination || data?.meta?.pagination || { pageCount: 1 };
    totalPages = pagination.pageCount || 1;
    allFiles = allFiles.concat(results);
    process.stdout.write(`  fetched page ${page}/${totalPages} (${results.length} records)\r`);
    page += 1;
  }
  console.log(`\nTotal records: ${allFiles.length}`);

  // Filter to image files only (skip PDFs, MP3s — they're rarely "missing
  // image previews" Anna would notice, and we don't want to clutter the
  // restore list)
  const images = allFiles.filter((f) => (f.mime || '').startsWith('image/'));
  console.log(`Image records: ${images.length}\n`);

  // HEAD-check each in batches of 10
  const broken = [];
  const ok = [];
  const BATCH = 10;
  for (let i = 0; i < images.length; i += BATCH) {
    const slice = images.slice(i, i + BATCH);
    await Promise.all(slice.map(async (file) => {
      const url = file.url.startsWith('http') ? file.url : `${STRAPI_URL}${file.url}`;
      const status = await checkUrl(url);
      if (status === 200) ok.push(file);
      else broken.push({ ...file, _status: status, _checkedUrl: url });
    }));
    process.stdout.write(`  checked ${Math.min(i + BATCH, images.length)}/${images.length}\r`);
  }
  console.log('\n');

  console.log(`OK:     ${ok.length}`);
  console.log(`BROKEN: ${broken.length}\n`);

  if (broken.length === 0) {
    console.log('All image URLs resolve. No restore needed.');
    return;
  }

  // Pretty-print the list of original filenames for Anna
  // (group by extension for tidiness)
  const names = broken
    .map((f) => f.name || `id-${f.id}`)
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  console.log('═══ Files to ask Anna for ═══');
  console.log('Copy + paste this list to Anna:\n');
  console.log('---');
  names.forEach((n) => console.log(`• ${n}`));
  console.log('---\n');

  // Save machine-readable JSON for restore-uploads.js
  const outPath = path.join(__dirname, 'broken-uploads.json');
  const payload = broken.map((f) => ({
    id: f.id,
    documentId: f.documentId,
    name: f.name,                    // original filename Anna saw (e.g. "031.jpeg")
    hash: f.hash,                    // Strapi's slugified base (e.g. "031_df35c6cf28")
    ext: f.ext,                      // e.g. ".jpeg"
    mime: f.mime,
    url: f.url,                      // e.g. "/uploads/031_df35c6cf28.jpeg"
    width: f.width,
    height: f.height,
    formats: f.formats || null,      // responsive variants Strapi expects
  }));
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Saved ${broken.length} broken records to: ${outPath}`);
  console.log('\nNext step: ask Anna for those files, then run ops/restore-uploads.js');
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
