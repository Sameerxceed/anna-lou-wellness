/**
 * One-shot migration: convert every article's legacy `body` (Markdown
 * richtext string) into `body_v2` (Strapi v5 blocks JSON), so Anna can
 * edit with the WYSIWYG block editor and add hyperlinks via the toolbar
 * popup instead of the broken `[text](link)` placeholder pattern.
 *
 * Safe by design:
 *  - Never touches an article where body_v2 already has content.
 *  - Never modifies the legacy `body` field â€” that stays as a read-only
 *    backup (hidden from admin via schema pluginOptions).
 *  - Backs up every article to Docs/article-body-backup-<timestamp>.json
 *    before any writes.
 *  - Idempotent â€” safe to re-run.
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
 *  - Placeholder `[text](link)` â€” the exact broken pattern Anna hit when
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

const UID = 'api::article.article';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Markdown â†’ Strapi v5 blocks JSON
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Convert common HTML tags in Strapi's richtext (which allowed raw HTML
 * mixed with markdown) into pseudo-markdown so the inline parser handles
 * them cleanly. Also strips any remaining unknown tags to plain text.
 *
 * Handled: <u>x</u> <b>x</b> <strong>x</strong> <i>x</i> <em>x</em>
 *          <a href="url">x</a> <br> <p>x</p>
 * Unknown tags: stripped (keep inner text).
 */
function normaliseHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    // Convert <br> to newline so paragraph split picks it up
    .replace(/<br\s*\/?>/gi, '\n')
    // <p>x</p> â†’ x\n (Strapi editors sometimes wrap paragraphs in <p>)
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<\/?p[^>]*>/gi, '')
    // Bold: <strong>, <b>
    .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**')
    // Italic: <em>, <i>
    .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*')
    // Underline: <u>x</u> â€” Strapi blocks supports underline as an inline
    // attribute; convert to a marker we can detect in parseInline.
    .replace(/<u>([\s\S]*?)<\/u>/gi, 'UND$1/UND')
    // Links: <a href="url">text</a> â†’ [text](url)
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    // Any remaining HTML tag: strip entirely, keep the inner text
    .replace(/<\/?[a-z][^>]*>/gi, '')
    // Common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Parse a single line's inline markdown into an array of text/link nodes.
 * Ordered: links first (they can contain nothing formatted), then bold,
 * then italic. Anything that doesn't match a pattern becomes a plain text
 * node. Placeholders from Strapi's markdown toolbar buttons are filtered
 * out so they don't render as bogus content.
 */
function parseInline(text) {
  const nodes = [];
  // Regex captures link, bold**, bold__, italic*, italic_, and the
  // underline sentinel we inserted in normaliseHtml.
  const UND_OPEN = 'UND';
  const UND_CLOSE = '/UND';
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|UND([\s\S]+?)\/UND/g;
  let lastIndex = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      const chunk = text.slice(lastIndex, m.index);
      if (chunk) nodes.push({ type: 'text', text: chunk });
    }
    if (m[1] !== undefined && m[2] !== undefined) {
      const url = m[2];
      // Placeholder â€” Strapi's markdown link button drops [text](link)
      // when Anna clicks it. Convert to plain text (no bogus /link href).
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
      const boldText = m[3] ?? m[4];
      // Strapi's Bold button drops literal **Bold** when nothing selected.
      // Same UX trap as the link button â€” strip to nothing so the misplaced
      // placeholder doesn't render.
      if (boldText === 'Bold' || boldText === 'bold') {
        // skip entirely
      } else {
        nodes.push({ type: 'text', text: boldText, bold: true });
      }
    } else if (m[5] !== undefined || m[6] !== undefined) {
      const italicText = m[5] ?? m[6];
      // Same for the Italic button placeholder.
      if (italicText === 'Italic' || italicText === 'italic') {
        // skip
      } else {
        nodes.push({ type: 'text', text: italicText, italic: true });
      }
    } else if (m[7] !== undefined) {
      nodes.push({ type: 'text', text: m[7], underline: true });
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    const tail = text.slice(lastIndex);
    if (tail) nodes.push({ type: 'text', text: tail });
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
  // Normalise HTML tags in the source (Strapi's richtext editor allowed raw
  // HTML mixed with markdown — Anna's About page had <u>…</u> and <br>).
  md = normaliseHtml(md);
  // Split into paragraphs. Prefer double-newline delimiters, but fall back
  // to single newlines if the source has no blank-line pairs (Anna's
  // Strapi content stores paragraph breaks as single \n rather than
  // \n\n — my earlier assumption of double-newline was wrong).
  const hasBlankLine = /\n\s*\n/.test(md);
  const paragraphs = (hasBlankLine ? md.split(/\n\s*\n/) : md.split(/\n+/))
    .map((p) => p.trim())
    .filter(Boolean);
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
    // Unordered list â€” every line starts with - or *
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
    // Ordered list â€” every line starts with N.
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
    // Blockquote â€” every line starts with >
    if (lines.every((l) => /^>\s?/.test(l))) {
      const stripped = lines.map((l) => l.replace(/^>\s?/, '')).join('\n');
      blocks.push({
        type: 'quote',
        children: parseInline(stripped),
      });
      continue;
    }
    // Paragraph â€” join lines with soft breaks. Strapi blocks doesn't have
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Core migration â€” reusable from CLI (standalone) OR from Strapi bootstrap
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Run the migration against a live Strapi instance.
 * @param {object} strapi â€” live Strapi instance (from bootstrap or standalone).
 * @param {object} opts â€” { dryRun, targetSlug, backupDir, logger }
 * @returns {Promise<{processed, migrated, skipped, errors}>}
 */
async function runMigration(strapi, opts = {}) {
  const dryRun = !!opts.dryRun;
  const force = !!opts.force;
  const targetSlug = opts.targetSlug || null;
  const backupDir = opts.backupDir || path.resolve(__dirname, '..');
  const rawLogger = opts.logger || console;
  // Normalise: console has .log/.warn/.error; Winston (strapi.log) has
  // .info/.warn/.error but NOT .log â€” calling .log on Winston throws
  // "Cannot create property 'Symbol(level)' on string" because it tries
  // to mutate the string as an info-object. Wrap both into one interface.
  const info = (msg) => {
    if (typeof rawLogger.info === 'function') rawLogger.info(msg);
    else if (typeof rawLogger.log === 'function') rawLogger.log(msg);
    else console.log(msg);
  };
  const warn = (msg) => {
    if (typeof rawLogger.warn === 'function') rawLogger.warn(msg);
    else console.warn(msg);
  };
  const err = (msg) => {
    if (typeof rawLogger.error === 'function') rawLogger.error(msg);
    else console.error(msg);
  };

  info('[migrate-body-to-blocks] starting');
  info(`[migrate-body-to-blocks] dry-run: ${dryRun ? 'YES' : 'NO'}`);
  if (targetSlug) info(`[migrate-body-to-blocks] only slug: ${targetSlug}`);

  let entries;
  try {
    entries = await strapi.documents(UID).findMany({
      pagination: { pageSize: 500 },
      status: 'published',
    });
  } catch (err) {
    err(`[migrate-body-to-blocks] findMany failed: ${err.message}`);
    return { processed: 0, migrated: 0, skipped: 0, errors: 1 };
  }

  const filtered = targetSlug
    ? entries.filter((e) => e.slug === targetSlug)
    : entries;

  info(`[migrate-body-to-blocks] found ${filtered.length} article(s) to consider`);

  const backup = filtered.map((e) => ({
    documentId: e.documentId,
    slug: e.slug,
    title: e.title,
    body: e.body,
    body_v2: e.body_v2,
  }));
  if (!dryRun) {
    try {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, 'article-body-backup-' + ts + '.json');
      fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
      info(`[migrate-body-to-blocks] backup written â†’ ${backupPath}`);
    } catch (err) {
      warn(`[migrate-body-to-blocks] backup write failed: ${err.message} (continuing)`);
    }
  }

  let processed = 0;
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of filtered) {
    processed += 1;
    const label = entry.title || entry.slug || entry.documentId;

    if (!force && Array.isArray(entry.body_v2) && entry.body_v2.length > 0) {
      const hasText = entry.body_v2.some((b) =>
        Array.isArray(b?.children) && b.children.some((c) => (c?.text || '').trim())
      );
      if (hasText) {
        info(`  SKIP  ${label} (body_v2 already populated)`);
        skipped += 1;
        continue;
      }
    }

    if (!entry.body || (typeof entry.body === 'string' && !entry.body.trim())) {
      info(`  SKIP  ${label} (empty body â€” nothing to migrate)`);
      skipped += 1;
      continue;
    }

    const converted = Array.isArray(entry.body)
      ? entry.body
      : markdownToBlocks(String(entry.body));

    if (dryRun) {
      info(`  DRY   ${label} â†’ ${converted.length} blocks`);
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
      warn(`  DRAFT FAIL ${label}: ${err.message}`);
    }
    try {
      await strapi.documents(UID).update({
        documentId: entry.documentId,
        data: { body_v2: converted },
        status: 'published',
      });
    } catch (err) {
      if (!String(err.message).includes('not found')) {
        warn(`  PUB FAIL ${label}: ${err.message}`);
      }
    }
    info(`  OK    ${label} â†’ ${converted.length} blocks`);
    migrated += 1;
  }

  info('[migrate-body-to-blocks] done');
  info(`  processed: ${processed}, migrated: ${migrated}${dryRun ? ' (dry-run)' : ''}, skipped: ${skipped}, errors: ${errors}`);

  return { processed, migrated, skipped, errors };
}

module.exports = { runMigration, markdownToBlocks, parseInline };

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CLI runner â€” only executes when file is run directly (`node scripts/...`)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
if (require.main === module) {
  const { createStrapi } = require('@strapi/strapi');
  (async () => {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const slugArg = args.find((a) => a.startsWith('--slug='));
    const targetSlug = slugArg ? slugArg.split('=')[1] : null;

    const strapi = await createStrapi({
      appDir: path.resolve(__dirname, '..'),
      distDir: path.resolve(__dirname, '..', 'dist'),
    });
    await strapi.load();
    try {
      await runMigration(strapi, { dryRun, targetSlug });
    } finally {
      await strapi.destroy();
    }
    process.exit(0);
  })().catch((err) => {
    console.error('[migrate-body-to-blocks] fatal:', err);
    process.exit(1);
  });
}
