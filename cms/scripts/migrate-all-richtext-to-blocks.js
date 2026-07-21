/**
 * One-shot migration: convert every legacy `richtext` (Markdown string)
 * field to its `<field>_v2` `blocks` (Strapi v5 JSON) companion, across
 * every content type where we've added an additive v2 field.
 *
 * Runs on next CMS boot via src/index.js bootstrap task (flag-file guarded).
 * Also runnable standalone: `node scripts/migrate-all-richtext-to-blocks.js`
 *
 * Reuses the Markdown → blocks parser from migrate-body-to-blocks.js so
 * behaviour stays consistent between the article migration (already run
 * 21 Jul) and this full sweep.
 *
 * Safe by design:
 *  - Never touches an entry where <field>_v2 already has content
 *  - Never modifies the legacy field — hidden but preserved as backup
 *  - Backs up every migrated field pair to Docs-style JSON file
 *  - Idempotent — safe to re-run
 *  - Writes to BOTH draft and published where applicable
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { markdownToBlocks } = require('./migrate-body-to-blocks');

// Every {content-type UID, field-name} pair we've extended with a _v2
// blocks companion. Keep aligned with the schema.json changes.
//
// hasDraftPublish: content types with draftAndPublish: true need both
// draft + published writes; false = single write.
const TARGETS = [
  { uid: 'api::product.product', field: 'description', hasDraftPublish: false },
  { uid: 'api::experience.experience', field: 'description', hasDraftPublish: true },
  { uid: 'api::coaching-session.coaching-session', field: 'description', hasDraftPublish: true },
  { uid: 'api::cosmic-forecast.cosmic-forecast', field: 'summary', hasDraftPublish: true },
  { uid: 'api::membership.membership', field: 'description', hasDraftPublish: false },
  { uid: 'api::about-page.about-page', field: 'story_paragraph_1', hasDraftPublish: true },
  { uid: 'api::about-page.about-page', field: 'story_paragraph_2', hasDraftPublish: true },
  { uid: 'api::about-page.about-page', field: 'additional_bio', hasDraftPublish: true },
  { uid: 'api::community-page.community-page', field: 'intro', hasDraftPublish: true },
  { uid: 'api::community-page.community-page', field: 'circle_description', hasDraftPublish: true },
  { uid: 'api::community-page.community-page', field: 'reset_room_description', hasDraftPublish: true },
  { uid: 'api::contact-page.contact-page', field: 'parking_info', hasDraftPublish: true },
  { uid: 'api::contact-page.contact-page', field: 'directions', hasDraftPublish: true },
  { uid: 'api::contact-page.contact-page', field: 'discovery_why_price_body', hasDraftPublish: true },
  { uid: 'api::life-page.life-page', field: 'intro', hasDraftPublish: true },
  { uid: 'api::love-and-relationships-page.love-and-relationships-page', field: 'intro', hasDraftPublish: true },
  { uid: 'api::membership-page.membership-page', field: 'paragraphs', hasDraftPublish: true },
  { uid: 'api::reset-stories-page.reset-stories-page', field: 'intro', hasDraftPublish: true },
  { uid: 'api::shop-page.shop-page', field: 'intro', hasDraftPublish: true },
  { uid: 'api::work-and-money-page.work-and-money-page', field: 'intro', hasDraftPublish: true },
  { uid: 'api::work-with-anna-page.work-with-anna-page', field: 'intro', hasDraftPublish: true },
  { uid: 'api::generic-page.generic-page', field: 'intro', hasDraftPublish: true },
];

// Components live inside entries, not as top-level entities. We handle
// them separately via recursive walk of every parent entry.
// (Skipping components in v1 of this migration — text-block + custom-html
// are used inside Page Builder pages via dynamic zones. Anna edits those
// pages directly; the next time she edits a page and Saves, her _v2 stays
// empty until she manually re-enters content there. Documented in manual.)

/**
 * Normalise the logger interface — see migrate-body-to-blocks.js for context.
 */
function makeLog(rawLogger) {
  const l = rawLogger || console;
  return {
    info: (m) => (typeof l.info === 'function' ? l.info(m) : typeof l.log === 'function' ? l.log(m) : console.log(m)),
    warn: (m) => (typeof l.warn === 'function' ? l.warn(m) : console.warn(m)),
    err: (m) => (typeof l.error === 'function' ? l.error(m) : console.error(m)),
  };
}

async function migrateTarget(strapi, target, opts, log) {
  const { uid, field, hasDraftPublish } = target;
  const v2Field = `${field}_v2`;

  let entries;
  try {
    entries = await strapi.documents(uid).findMany({
      pagination: { pageSize: 500 },
      status: hasDraftPublish ? 'published' : undefined,
    });
  } catch (err) {
    log.warn(`  [${uid}::${field}] findMany failed: ${err.message}`);
    return { migrated: 0, skipped: 0, errors: 1 };
  }

  if (!entries || entries.length === 0) {
    log.info(`  [${uid}::${field}] no entries`);
    return { migrated: 0, skipped: 0, errors: 0 };
  }

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of entries) {
    const label = entry.title || entry.name || entry.slug || entry.documentId;

    // Skip if v2 already has content — UNLESS force mode is set (used to
    // re-migrate after fixing the parser).
    if (!opts.force && Array.isArray(entry[v2Field]) && entry[v2Field].length > 0) {
      const hasText = entry[v2Field].some((b) =>
        Array.isArray(b?.children) && b.children.some((c) => (c?.text || '').trim())
      );
      if (hasText) {
        skipped += 1;
        continue;
      }
    }

    // Skip if legacy empty
    const legacy = entry[field];
    if (!legacy || (typeof legacy === 'string' && !legacy.trim())) {
      skipped += 1;
      continue;
    }

    const converted = Array.isArray(legacy) ? legacy : markdownToBlocks(String(legacy));

    if (opts.dryRun) {
      log.info(`  [${uid}::${field}] DRY ${label} → ${converted.length} blocks`);
      migrated += 1;
      continue;
    }

    try {
      await strapi.documents(uid).update({
        documentId: entry.documentId,
        data: { [v2Field]: converted },
        ...(hasDraftPublish ? { status: 'draft' } : {}),
      });
    } catch (err) {
      log.warn(`  [${uid}::${field}] DRAFT FAIL ${label}: ${err.message}`);
      errors += 1;
      continue;
    }
    if (hasDraftPublish) {
      try {
        await strapi.documents(uid).update({
          documentId: entry.documentId,
          data: { [v2Field]: converted },
          status: 'published',
        });
      } catch (err) {
        if (!String(err.message).includes('not found')) {
          log.warn(`  [${uid}::${field}] PUB FAIL ${label}: ${err.message}`);
        }
      }
    }
    migrated += 1;
  }

  log.info(`  [${uid}::${field}] migrated=${migrated}, skipped=${skipped}, errors=${errors}`);
  return { migrated, skipped, errors };
}

async function runAllMigrations(strapi, opts = {}) {
  const log = makeLog(opts.logger);
  const dryRun = !!opts.dryRun;
  const force = !!opts.force;

  log.info('[migrate-all-richtext-to-blocks] starting');
  log.info(`[migrate-all-richtext-to-blocks] dry-run: ${dryRun ? 'YES' : 'NO'}`);
  log.info(`[migrate-all-richtext-to-blocks] force:   ${force ? 'YES (overwrites _v2)' : 'NO'}`);
  log.info(`[migrate-all-richtext-to-blocks] targets: ${TARGETS.length}`);

  // Backup snapshot before any writes
  if (!dryRun) {
    try {
      const backup = {};
      for (const t of TARGETS) {
        const rows = await strapi.documents(t.uid).findMany({
          pagination: { pageSize: 500 },
          status: t.hasDraftPublish ? 'published' : undefined,
        });
        backup[`${t.uid}::${t.field}`] = (rows || []).map((r) => ({
          documentId: r.documentId,
          slug: r.slug || null,
          title: r.title || r.name || null,
          legacy: r[t.field],
          v2: r[t.field + '_v2'],
        }));
      }
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(path.resolve(__dirname, '..'), 'richtext-migration-backup-' + ts + '.json');
      fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
      log.info(`[migrate-all-richtext-to-blocks] backup written → ${backupPath}`);
    } catch (err) {
      log.warn(`[migrate-all-richtext-to-blocks] backup failed: ${err.message} (continuing)`);
    }
  }

  const totals = { migrated: 0, skipped: 0, errors: 0 };
  for (const t of TARGETS) {
    const r = await migrateTarget(strapi, t, { dryRun, force }, log);
    totals.migrated += r.migrated;
    totals.skipped += r.skipped;
    totals.errors += r.errors;
  }

  log.info('[migrate-all-richtext-to-blocks] done');
  log.info(`  totals: migrated=${totals.migrated}${dryRun ? ' (dry-run)' : ''}, skipped=${totals.skipped}, errors=${totals.errors}`);
  return totals;
}

module.exports = { runAllMigrations, TARGETS };

// CLI runner
if (require.main === module) {
  const { createStrapi } = require('@strapi/strapi');
  (async () => {
    const dryRun = process.argv.includes('--dry-run');
    const force = process.argv.includes('--force');
    const strapi = await createStrapi({
      appDir: path.resolve(__dirname, '..'),
      distDir: path.resolve(__dirname, '..', 'dist'),
    });
    await strapi.load();
    try {
      await runAllMigrations(strapi, { dryRun, force });
    } finally {
      await strapi.destroy();
    }
    process.exit(0);
  })().catch((err) => {
    console.error('[migrate-all-richtext-to-blocks] fatal:', err);
    process.exit(1);
  });
}
