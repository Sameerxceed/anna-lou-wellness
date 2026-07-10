'use strict';

/**
 * Claude-powered bulk H2 promotion for articles migrated from the old
 * plain-text body field.
 *
 * The blocks migration (migrate-articles-to-blocks.js) converts every
 * article's plain-text body into paragraph blocks. But Anna's existing
 * articles had headings that lived as short lines mixed into the text —
 * those all became paragraphs, which reads badly on a long piece.
 *
 * This second pass sends each article's paragraph text to Claude Haiku
 * with a system prompt: "which of these lines are section headings?"
 * Claude returns a list of heading strings, we match them back to the
 * paragraph blocks, and convert those blocks to heading blocks (level 2).
 *
 * Cost: ~$0.01 per article on Haiku 4.5 (78 articles ≈ $0.78 for the
 * whole archive). Idempotent behaviour: skips articles whose body
 * already contains at least one heading block.
 *
 * Gated behind AI_DETECT_HEADINGS_ONCE=true env var so it only fires
 * when you deliberately opt in. Set the env var on Coolify, redeploy
 * once, then unset it — Anna's future edits are preserved.
 */

const MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT =
  'You are helping an editor identify section headings inside a plain-text article body. ' +
  'You will receive the article title and a numbered list of paragraphs. ' +
  'Some of those paragraphs are actually section headings (short, standalone, ' +
  'often a phrase without terminal punctuation, and followed by a longer paragraph that expands on the topic). ' +
  'Return ONLY a JSON array of the paragraph numbers (integers) that are section headings. ' +
  'No prose, no markdown, just the array — for example: [3, 12, 27]. ' +
  'If there are NO headings, return: []. ' +
  'Never guess — if a paragraph is a full sentence or ends in a period, it is NOT a heading. ' +
  'Never mark the very first paragraph as a heading — that role belongs to the article title, which is separate.';

async function callClaude(apiKey, title, paragraphs) {
  const numbered = paragraphs
    .map((p, i) => `${i + 1}. ${p.slice(0, 300)}`)
    .join('\n');
  const userMessage = `Article title: ${title}\n\nParagraphs:\n${numbered}\n\nWhich are headings?`;

  // Hard 20s timeout on the Anthropic call. Without this a single hung
  // request can block Strapi bootstrap forever, Coolify healthcheck fails,
  // container restarts, migration re-runs, we crash-loop.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  let res;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const blocks = Array.isArray(data?.content) ? data.content : [];
  const text = blocks.filter((b) => b?.type === 'text').map((b) => b.text).join('').trim();
  // Extract JSON array from the response.
  const match = text.match(/\[[^\]]*\]/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return [];
    return arr.filter((n) => Number.isInteger(n) && n >= 1);
  } catch {
    return [];
  }
}

// Extract just the text from a paragraph or heading block (flatten
// children into one string).
function blockText(block) {
  if (!block || !Array.isArray(block.children)) return '';
  return block.children
    .map((c) => (typeof c?.text === 'string' ? c.text : ''))
    .join('')
    .trim();
}

function hasHeading(blocks) {
  return blocks.some((b) => b?.type === 'heading');
}

async function promoteArticleHeadings(strapi) {
  if (String(process.env.AI_DETECT_HEADINGS_ONCE || '').toLowerCase() !== 'true') {
    return; // opt-in only
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    strapi.log.warn('[promote-article-headings] ANTHROPIC_API_KEY missing');
    return;
  }

  const uid = 'api::article.article';
  let articles;
  try {
    articles = await strapi.entityService.findMany(uid, {
      publicationState: 'preview',
      pagination: { pageSize: 500 },
      fields: ['id', 'documentId', 'title', 'body'],
    });
  } catch (err) {
    strapi.log.warn('[promote-article-headings] load failed:', err.message);
    return;
  }
  if (!Array.isArray(articles)) return;

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const a of articles) {
    if (!Array.isArray(a.body) || a.body.length < 2) {
      skipped++;
      continue;
    }
    if (hasHeading(a.body)) {
      skipped++;
      continue;
    }
    processed++;

    // Only paragraph blocks are candidates. Preserve the original index.
    const candidates = a.body
      .map((block, idx) => ({ block, idx, text: blockText(block) }))
      .filter((x) => x.block?.type === 'paragraph' && x.text.length > 0);
    if (candidates.length < 3) {
      skipped++;
      continue;
    }

    let headingNumbers;
    try {
      headingNumbers = await callClaude(apiKey, a.title || '', candidates.map((c) => c.text));
    } catch (err) {
      failed++;
      strapi.log.warn(`[promote-article-headings] "${a.title}" Claude failed: ${err.message}`);
      continue;
    }
    if (!headingNumbers || headingNumbers.length === 0) {
      // Claude found no headings — that's a legitimate answer, don't touch.
      continue;
    }

    // Build a new blocks array, replacing selected paragraph blocks with
    // heading blocks. Preserves order and non-paragraph blocks.
    const headingIndexSet = new Set(headingNumbers.map((n) => candidates[n - 1]?.idx).filter((i) => i != null));
    const newBody = a.body.map((block, idx) => {
      if (!headingIndexSet.has(idx)) return block;
      return {
        type: 'heading',
        level: 2,
        children: Array.isArray(block?.children) ? block.children : [{ type: 'text', text: '' }],
      };
    });

    try {
      if (a.documentId) {
        await strapi.documents(uid).update({
          documentId: a.documentId,
          data: { body: newBody },
          status: 'draft',
        });
        try {
          await strapi.documents(uid).update({
            documentId: a.documentId,
            data: { body: newBody },
            status: 'published',
          });
        } catch { /* published version may not exist */ }
      } else {
        await strapi.entityService.update(uid, a.id, { data: { body: newBody } });
      }
      updated++;
      strapi.log.info(
        `[promote-article-headings] "${a.title}" — added ${headingNumbers.length} heading(s)`,
      );
    } catch (err) {
      failed++;
      strapi.log.warn(`[promote-article-headings] "${a.title}" update failed: ${err.message}`);
    }
  }

  strapi.log.info(
    `[promote-article-headings] done — processed ${processed}, updated ${updated}, skipped ${skipped}, failed ${failed}`,
  );
}

module.exports = promoteArticleHeadings;
