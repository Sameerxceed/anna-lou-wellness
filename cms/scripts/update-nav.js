/**
 * One-off nav update — Anna's 11 Jun feedback (items #2, #5a, #5c, #9).
 *
 * Changes:
 *  1. Rename "Take the Quiz" → "Nervous System Decoder" under Work with Anna
 *     and change href from /the-work/quiz → /free/nervous-system-decoder.
 *  2. Add "Practitioners" child link under About (after Press).
 *  3. Add "Founder Reset" as a Programme child under Work with Anna (the
 *     current Founder Reset link in Work & Money goes to the editorial
 *     CATEGORY page — Anna wants the programme also surfaced).
 *
 * Run from Coolify CMS terminal:
 *   cd /app && node scripts/update-nav.js
 *
 * Idempotent — re-running won't duplicate items. Logs what it changed.
 */

'use strict';

const path = require('path');
const { createStrapi } = require('@strapi/strapi');

async function main() {
  console.log('[update-nav] starting');
  const strapi = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '..', 'dist'),
  }).load();

  const nav = await strapi.documents('api::navigation.navigation').findFirst({
    populate: { items: { populate: 'children' } },
  });

  if (!nav) {
    console.error('[update-nav] navigation singleton not found');
    await strapi.destroy();
    process.exit(1);
  }

  const items = nav.items || [];

  // ─── Change 1: rename Take the Quiz → Nervous System Decoder ────────────
  let renamed = 0;
  for (const top of items) {
    if (top.label !== 'Work with Anna') continue;
    for (const child of top.children || []) {
      if (child.label === 'Take the Quiz' || child.label === 'Take the quiz') {
        child.label = 'Nervous System Decoder';
        child.href = '/free/nervous-system-decoder';
        renamed += 1;
        console.log('  [renamed] Take the Quiz → Nervous System Decoder under Work with Anna');
      }
    }
  }

  // ─── Change 2: add Practitioners under About ────────────────────────────
  let practitionersAdded = false;
  for (const top of items) {
    if (top.label !== 'About') continue;
    const children = top.children || [];
    const alreadyThere = children.find((c) => c.label === 'Practitioners');
    if (alreadyThere) {
      console.log('  [skip] Practitioners already in About');
      break;
    }
    // Insert after Press (or just append if Press not found)
    const pressIdx = children.findIndex((c) => c.label === 'Press');
    const insertAt = pressIdx >= 0 ? pressIdx + 1 : children.length;
    children.splice(insertAt, 0, {
      __component: 'nav.child-link',
      label: 'Practitioners',
      href: '/practitioners',
    });
    top.children = children;
    practitionersAdded = true;
    console.log('  [added] Practitioners under About');
    break;
  }

  if (renamed === 0 && !practitionersAdded) {
    console.log('[update-nav] nothing to change — nav already up to date');
    await strapi.destroy();
    return;
  }

  // Update both draft and published versions so the live site picks up the change.
  try {
    await strapi.documents('api::navigation.navigation').update({
      documentId: nav.documentId,
      data: { items },
      status: 'draft',
    });
  } catch (err) {
    console.warn(`[update-nav] draft update failed: ${err.message}`);
  }
  try {
    await strapi.documents('api::navigation.navigation').update({
      documentId: nav.documentId,
      data: { items },
      status: 'published',
    });
  } catch (err) {
    if (!String(err.message).includes('not found')) {
      console.warn(`[update-nav] published update failed: ${err.message}`);
    }
  }

  console.log('[update-nav] done');
  await strapi.destroy();
}

main().catch((err) => {
  console.error('[update-nav] fatal:', err);
  process.exit(1);
});
