'use strict';

/**
 * One-shot migration: article.body: richtext (plain-text string) -> blocks (JSON).
 *
 * Runs on Strapi bootstrap. For each article whose body is still a string,
 * convert to blocks JSON (every paragraph becomes a paragraph block).
 *
 * Design decision: DO NOT try to auto-detect headings. Any heuristic
 * (short-line-followed-by-longer, title case, etc.) will produce false
 * positives on some articles and false negatives on others, leaving Anna
 * to review every result anyway. Cleaner to leave everything as
 * paragraphs and let Anna eyeball each article once — clicking H2 on the
 * heading lines is a 30-second job per piece.
 *
 * Idempotent: if body is already blocks (an array), skips.
 */

function textToBlocks(text) {
  if (typeof text !== 'string') return null;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  }

  return paragraphs.map((p) => ({
    type: 'paragraph',
    children: [{ type: 'text', text: p }],
  }));
}

async function migrateArticlesToBlocks(strapi) {
  const uid = 'api::article.article';
  let articles;
  try {
    // Get every article — draft AND published.
    articles = await strapi.entityService.findMany(uid, {
      publicationState: 'preview',
      pagination: { pageSize: 500 },
      fields: ['id', 'documentId', 'title', 'body'],
    });
  } catch (err) {
    strapi.log.warn('[migrate-articles-to-blocks] load failed:', err.message);
    return;
  }
  if (!Array.isArray(articles) || articles.length === 0) return;

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const a of articles) {
    // Already blocks (array of block objects)? Skip.
    if (Array.isArray(a.body)) {
      skipped++;
      continue;
    }
    if (a.body == null) {
      skipped++;
      continue;
    }

    const blocks = textToBlocks(a.body);
    if (!blocks) {
      skipped++;
      continue;
    }

    try {
      if (a.documentId) {
        await strapi.documents(uid).update({
          documentId: a.documentId,
          data: { body: blocks },
          status: 'draft',
        });
        try {
          await strapi.documents(uid).update({
            documentId: a.documentId,
            data: { body: blocks },
            status: 'published',
          });
        } catch { /* published version may not exist */ }
      } else {
        await strapi.entityService.update(uid, a.id, { data: { body: blocks } });
      }
      migrated++;
    } catch (err) {
      failed++;
      strapi.log.warn(
        `[migrate-articles-to-blocks] failed on "${a.title}" (id=${a.id}): ${err.message}`,
      );
    }
  }

  strapi.log.info(
    `[migrate-articles-to-blocks] done — migrated ${migrated}, skipped ${skipped} (already blocks), failed ${failed}`,
  );
}

module.exports = migrateArticlesToBlocks;
