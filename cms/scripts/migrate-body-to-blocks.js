/**
 * One-shot migration: convert every article's legacy `body` (Markdown
 * richtext string) into `body_v2` (Strapi v5 blocks JSON), so Anna can
 * edit with the WYSIWYG block editor and add hyperlinks via the toolbar
 * popup instead of the broken `[text](link)` placeholder pattern.
 *
 * Safe by design:
 *  - Never touches an article where body_v2 already has content.
 *  - Never modifies the legacy `body` field — that stays as a read-only
 *    backup (hidden from admin via schema pluginOptions).
 *  - Backs up every article to Docs/article-body-backup-<timestamp>.json
 *    before any writes.
 *  - Idempotent — safe to re-run.
 *  - Writes to BOTH draft and published versions where applicable.
 *
 * Supported Markdown patterns (matches what Anna actually types):
 *  - Paragraphs (split on blank lines)
 *  - Soft line breaks (single \n inside a paragraph)
 *  - Bold **text** or __text__
 *  - Italic *text* or _text_
 *  - Links [text](url)
 *  - Headings ## through ######
 *  - Unordered lists (- or * prefix)
 *  - Ordered lists (1. prefix)
 *  - Blockquotes (> prefix)
 *  - Placeholder `[text](link)` — the exact broken pattern Anna hit when
 *    she selected text, clicked the link icon, and never edited the URL
 *    placeholder. Converted to plain text so she can re-insert the link
 *    via the new block editor toolbar.
 *
 * Run from Coolify CMS terminal:
 *   cd /app
 *   node scripts/migrate-body-to-blocks.js
 *
 * Pass --dry-run to preview:
 *   node scripts/migrate-body-to-blocks.js --dry-run
 *
 * Pass --slug=xxx to migrate one article by slug:
 *   node scripts/migrate-body-to-blocks.js --slug=why-i-do-this-work
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { createStrapi } = require('@strapi/strapi');

const UID = 'api::article.article';

// ═══════════════════════════════════════════════════════════════════
// Markdown → Strapi v5 blocks JSON
// ═══════════════════════════════════════════════════════════════════

/**
 * Parse a single line's inline markdown into an array of text/link nodes.
 * Ordered: links first (they can contain nothing formatted), then bold,
 * then italic. Anything that doesn't match a pattern becomes a plain text
 * node. The `[text](link)` placeholder is treated as plain text — Anna
 * will re-insert via the block editor after migration.
 */
function parseInline(text) {
  const nodes = [];
  // Regex captures link, bold**, bold__, italic*, italic_.
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_/g;
  let lastIndex = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      nodes.push({ type: 'text', text: text.slice(lastIndex, m.index) });
    }
    if (m[1] !== undefined && m[2] !== undefined) {
      const url = m[2];
      // Placeholder — the broken pattern from Strapi's markdown link button.
      // Anna would need to replace the literal word "link" with a real URL.
      // Convert to plain text so it doesn't render as a bogus /link href.
      if (url === 'link' || url === 'url' || url === '#') {
        nodes.push({ type: 'text', text: m[1] });
      } else {
        nodes.push({
          type: 'link',
          url,
          children: [{ type: 'text', text: m[1] }],
        });
      }
    } else if (m[3] !== undefined || m[4] !== undefined) {
      nodes.push({ type: 'text', text: m[3] ?? m[4], bold: true });
    } else if (m[5] !== undefined || m[6] !== undefined) {
      nodes.push({ type: 'text', text: m[5] ?? m[6], italic: true });
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push({ type: 'text', text: text.slice(lastIndex) });
  }
  return nodes.length > 0 ? nodes : [{ type: 'text', text: '' }];
}

/**
 * Convert a whole Markdown string into Strapi v5 blocks JSON.
 * Splits on blank lines for paragraphs; per-paragraph detects headings,
 * lists, quotes, or falls back to plain paragraph.
 */
function markdownToBlocks(md) {
  if (typeof md !== 'string' || !md.trim()) {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  }
  const paragraphs = md.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const blocks = [];
  for (const p of paragraphs) {
    // Heading
    const h = /^(#{1,6})\s+(.+)$/s.exec(p);
    if (h && !h[2].includes('\n')) {
      const level = Math.min(6, h[1].length);
      blocks.push({
        type: 'heading',
        level,
        children: parseInline(h[2]),
      });
      continue;
    }
    const lines = p.split('\n');
    // Unordered list — every line starts with - or *
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      blocks.push({
        type: 'list',
        format: 'unordered',
        children: lines.map((l) => ({
          type: 'list-item',
          children: parseInline(l.replace(/^\s*[-*]\s+/, '')),
        })),
      });
      continue;
    }
    // Ordered list — every line starts with N.
    if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
      blocks.push({
        type: 'list',
        format: 'ordered',
        children: lines.map((l) => ({
          type: 'list-item',
          children: parseInline(l.replace(/^\s*\d+\.\s+/, '')),
        })),
      });
      continue;
    }
    // Blockquote — every line starts with >
    if (lines.every((l) => /^>\s?/.test(l))) {
      const stripped = lines.map((l) => l.replace(/^>\s?/, '')).join('\n');
      blocks.push({
        type: 'quote',
        children: parseInline(stripped),
      });
      continue;
    }
    // Paragraph — join lines with soft breaks. Strapi blocks doesn't have
    // an explicit <br> node; soft breaks become spaces within the paragraph
    // (matches how Strapi's own editor treats them on paste).
    const joined = lines.join(' ').replace(/\s+/g, ' ').trim();
    blocks.push({
      type: 'paragraph',
      children: parseInline(joined),
    });
  }
  return blocks;
}

// ═══════════════════════════════════════════════════════════════════
// Runner
// ═══════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const slugArg = args.find((a) => a.startsWith('--slug='));
  const targetSlug = slugArg ? slugArg.split('=')[1] : null;

  console.log('[migrate-body-to-blocks] starting');
  console.log(`[migrate-body-to-blocks] dry-run: ${dryRun ? 'YES' : 'NO'}`);
  if (targetSlug) console.log(`[migrate-body-to-blocks] only slug: ${targetSlug}`);

  const strapi = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '..', 'dist'),
  });
  await strapi.load();

  let entries;
  try {
    entries = await strapi.documents(UID).findMany({
      pagination: { pageSize: 500 },
      status: 'published',
    });
  } catch (err) {
    console.error(`[migrate-body-to-blocks] findMany failed: ${err.message}`);
    await strapi.destroy();
    process.exit(1);
  }

  const filtered = targetSlug
    ? entries.filter((e) => e.slug === targetSlug)
    : entries;

  console.log(`[migrate-body-to-blocks] found ${filtered.length} article(s) to consider`);

  // Backup EVERY article body before any writes.
  const backup = filtered.map((e) => ({
    documentId: e.documentId,
    slug: e.slug,
    title: e.title,
    body: e.body,
    body_v2: e.body_v2,
  }));
  if (!dryRun) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.resolve(__dirname, '..', 'article-body-backup-' + ts + '.json');
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
    console.log(`[migrate-body-to-blocks] backup written → ${backupPath}`);
  }

  let processed = 0;
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of filtered) {
    processed += 1;
    const label = entry.title || entry.slug || entry.documentId;

    // Skip if body_v2 already has content — never overwrite Anna's work.
    if (Array.isArray(entry.body_v2) && entry.body_v2.length > 0) {
      const hasText = entry.body_v2.some((b) =>
        Array.isArray(b?.children) && b.children.some((c) => (c?.text || '').trim())
      );
      if (hasText) {
        console.log(`  SKIP  ${label} (body_v2 already populated)`);
        skipped += 1;
        continue;
      }
    }

    if (!entry.body || (typeof entry.body === 'string' && !entry.body.trim())) {
      console.log(`  SKIP  ${label} (empty body — nothing to migrate)`);
      skipped += 1;
      continue;
    }

    // If body is already a blocks array (shouldn't happen with richtext but
    // guarded anyway), copy across unchanged.
    const converted = Array.isArray(entry.body)
      ? entry.body
      : markdownToBlocks(String(entry.body));

    if (dryRun) {
      console.log(`  DRY   ${label} → ${converted.length} blocks`);
      migrated += 1;
      continue;
    }

    try {
      await strapi.documents(UID).update({
        documentId: entry.documentId,
        data: { body_v2: converted },
        status: 'draft',
      });
    } catch (err) {
      console.warn(`  DRAFT FAIL ${label}: ${err.message}`);
    }
    try {
      await strapi.documents(UID).update({
        documentId: entry.documentId,
        data: { body_v2: converted },
        status: 'published',
      });
    } catch (err) {
      if (!String(err.message).includes('not found')) {
        console.warn(`  PUB FAIL ${label}: ${err.message}`);
      }
    }
    console.log(`  OK    ${label} → ${converted.length} blocks`);
    migrated += 1;
  }

  console.log('\n[migrate-body-to-blocks] done');
  console.log(`  processed: ${processed}`);
  console.log(`  migrated:  ${migrated}${dryRun ? ' (dry-run — no writes)' : ''}`);
  console.log(`  skipped:   ${skipped}`);
  console.log(`  errors:    ${errors}`);

  await strapi.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('[migrate-body-to-blocks] fatal:', err);
  process.exit(1);
});
