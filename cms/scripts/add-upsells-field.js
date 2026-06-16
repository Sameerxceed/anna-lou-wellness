/**
 * Add the `upsells` repeatable component (shared.upsell-reference) to
 * every page singleton + key collection that currently lacks it.
 *
 * The component itself already exists at:
 *   cms/src/components/shared/upsell-reference.json
 *
 * It has: label, link, eyebrow, blurb, image.
 *
 * This script adds the `upsells` attribute (repeatable, max 3) to each
 * target schema. Idempotent — skips any schema that already has it.
 *
 * Excluded: Footer, Navigation, Site Settings, the two quiz singletons —
 * those aren't pages, no upsell needed.
 *
 * Run:
 *   node cms/scripts/add-upsells-field.js
 *
 * Then redeploy CMS. The new field appears at the bottom of each entry's
 * edit form labelled "Upsells".
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Slugs to skip — these aren't user-facing pages, so an upsell block on
// them makes no sense.
const SKIP = new Set([
  'footer',
  'navigation',
  'site-settings',
  'decoder-quiz-page',
  'quiz-page',
  'cart',
  'order',
  'customer',
  'wishlist-item',
  'currency-rate',
  'coupon',
  'product-variant',
  'product-option',
  'shipping-method',
  'shipping-zone',
  'tax-rule',
  'return-request',
  'membership', // Reset Room subscription — internal, not a public page
  'event', // unused
  'product-review', // unused
  'cosmic-forecast', // editorial item not a page
]);

const UPSELL_FIELD = {
  type: 'component',
  repeatable: true,
  component: 'shared.upsell-reference',
  max: 3,
  description: "Up to 3 'next step' cards shown at the bottom of this page. Each card has an image + label + short blurb + link. Leave empty to hide the upsell block entirely. Example use: on the About page, point to the Reset Room and Reset Letters.",
};

function processSchema(file, slug) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); }
  catch { return { skipped: 'read failed' }; }
  let json;
  try { json = JSON.parse(raw); }
  catch { return { skipped: 'parse failed' }; }
  if (!json.attributes) return { skipped: 'no attributes' };
  if (json.attributes.upsells) return { skipped: 'already present' };

  json.attributes.upsells = UPSELL_FIELD;
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
  return { added: true };
}

const root = path.resolve(__dirname, '..', 'src', 'api');
const apis = fs.readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const added = [];
const skipped = [];

for (const slug of apis) {
  if (SKIP.has(slug)) { skipped.push({ slug, reason: 'in SKIP list' }); continue; }
  const schemaPath = path.join(root, slug, 'content-types', slug, 'schema.json');
  if (!fs.existsSync(schemaPath)) {
    skipped.push({ slug, reason: 'no schema.json' });
    continue;
  }
  const result = processSchema(schemaPath, slug);
  if (result.added) added.push(slug);
  else skipped.push({ slug, reason: result.skipped });
}

console.log(`Added upsells field to ${added.length} schemas:`);
for (const s of added) console.log(`  + ${s}`);
console.log(`\nSkipped ${skipped.length}:`);
for (const s of skipped) console.log(`  - ${s.slug}: ${s.reason}`);
