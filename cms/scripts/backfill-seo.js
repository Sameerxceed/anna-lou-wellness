/**
 * Bulk backfill SEO title + description for every entry across the 6
 * content types where auto-SEO is wired (Article, Programme, Experience,
 * Coaching Session, Generic Page, Page Builder).
 *
 * Auto-SEO only fires on save going forward — existing entries stay empty
 * until someone touches them. This script does the catch-up pass.
 *
 * Behaviour:
 *  - Skips entries where BOTH seo_title and seo_description are already
 *    filled. Anna's manual edits are NEVER overwritten.
 *  - Skips entries where the source text is too thin to generate good copy.
 *  - 700ms delay between Claude calls so we stay well under rate limits.
 *  - Updates both draft AND published versions where applicable.
 *  - Logs every action with [backfill-seo] prefix.
 *
 * Run from Coolify CMS terminal:
 *   cd /app
 *   node scripts/backfill-seo.js
 *
 * Pass --dry-run to see what WOULD be filled without writing anything:
 *   node scripts/backfill-seo.js --dry-run
 *
 * Pass --uid=api::article.article to only process one content type:
 *   node scripts/backfill-seo.js --uid=api::article.article
 */

'use strict';

const path = require('path');
const { createStrapi } = require('@strapi/strapi');

// Mirror the field map declared in each content type's lifecycles.js so this
// script and the runtime auto-SEO produce identical results.
const CONTENT_TYPES = [
  {
    uid: 'api::article.article',
    nameFields: ['title', 'name'],
    bodyFields: ['intro', 'body_v2', 'body', 'description', 'excerpt'],
  },
  {
    uid: 'api::programme.programme',
    nameFields: ['title'],
    bodyFields: ['tagline', 'intro', 'whatsIncludedItems', 'approachBody', 'outcomesBody'],
  },
  {
    uid: 'api::experience.experience',
    nameFields: ['name', 'title'],
    bodyFields: ['description', 'tagline', 'priceLabel', 'location'],
  },
  {
    uid: 'api::coaching-session.coaching-session',
    nameFields: ['name'],
    bodyFields: ['description', 'tagline', 'duration', 'price_label'],
  },
  {
    uid: 'api::generic-page.generic-page',
    nameFields: ['title', 'name'],
    bodyFields: ['intro', 'body', 'description', 'content'],
  },
  {
    uid: 'api::page.page',
    nameFields: ['title', 'name'],
    bodyFields: ['intro', 'description', 'body', 'sections'],
  },
  {
    uid: 'api::custom-html-landing.custom-html-landing',
    nameFields: ['title'],
    // raw_html is full HTML markup — send it through the same extractor
    // used in the lifecycle so Claude gets visible text, not tag soup.
    bodyFields: ['raw_html'],
    extractFromHtml: true,
  },
];

// Cheap HTML → text extractor (mirrors the one in custom-html-landing
// lifecycles.js). Only applied when the content-type spec has
// extractFromHtml: true.
function extractText(html) {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000);
}

const SEO_TITLE_CANDIDATES = ['seo_title', 'seoTitle'];
const SEO_DESCRIPTION_CANDIDATES = ['seo_description', 'seoDescription'];

const SYSTEM_PROMPT = `You write SEO metadata for Anna Lou Wellness — a UK-based nervous-system / somatic coaching practice and editorial site. Tone: warm, specific, calm, never clickbait, never corporate. Anna's voice is editorial — think Cup of Jo crossed with a quiet therapy practice.

Given an entry's name and body text, return EXACTLY this JSON shape and nothing else:

{
  "seo_title": "...",
  "seo_description": "..."
}

Rules for seo_title (50–60 chars):
- Lead with the topic / offer, not the brand.
- Use concrete words a real person would type into Google: "Nervous System Reset London", "Somatic coaching for founders", "Thames houseboat workshop".
- Avoid filler verbs: 'discover', 'unlock', 'transform', 'embark on a journey'.
- Title Case is fine. No emojis. No exclamation marks. No ALL CAPS.
- NEVER use em-dashes (—) or en-dashes (–). Use commas, full stops, or hyphens (-) instead.

Rules for seo_description (140–160 chars):
- ONE clear sentence, two at most. Written to be SEEN in a Google search result and convince a real human to click.
- Must include AT LEAST TWO of: who it's for (e.g. "founders", "women in their 40s"), the format (e.g. "one-day workshop", "12-week 1:1 programme", "retreat"), the place (e.g. "Thames houseboat", "London", "online"), the outcome in plain words.
- Use the language people search with — "nervous system reset", "trauma-informed coaching", "ADHD-friendly", "burnout recovery" — not abstract phrases like "step into your power" or "alignment journey".
- Avoid: 'discover', 'unlock', 'embark', 'journey', 'transformation' as marketing fluff.
- Never invent facts that aren't in the source text. If the price isn't in the source, don't mention a price.
- No emojis, no exclamation marks.
- NEVER use em-dashes (—) or en-dashes (–). Use commas, full stops, or hyphens (-) instead.

Examples Anna likes:
- "An exclusive one-day immersion for founders and leaders on a private Thames houseboat. Reset your nervous system and release subconscious blocks with Anna Lou."
- "12-week 1:1 trauma-informed coaching for women navigating burnout in London. Somatic practices, dating-pattern work, founder reset."

If the source text is too short to write meaningfully, use the name verbatim for the title and a one-line factual restatement for the description.

Return raw JSON only. No markdown fences, no preamble.`;

function flattenContent(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value
      .map((node) => {
        if (!node) return '';
        if (typeof node === 'string') return node;
        if (Array.isArray(node.children)) {
          return node.children
            .map((c) => (typeof c === 'string' ? c : c?.text || ''))
            .join('');
        }
        return node?.text || '';
      })
      .filter(Boolean)
      .join('\n\n');
  }
  if (typeof value === 'object') {
    if (Array.isArray(value.children)) {
      return value.children.map((c) => c?.text || '').join('');
    }
  }
  return String(value);
}

function firstFilled(obj, candidates) {
  for (const k of candidates) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return { key: k, value: v.trim() };
    if (v && Array.isArray(v) && v.length > 0) return { key: k, value: flattenContent(v) };
    if (v && typeof v === 'object') {
      const flat = flattenContent(v);
      if (flat.trim()) return { key: k, value: flat };
    }
  }
  return null;
}

function firstKey(obj, candidates) {
  for (const k of candidates) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k)) return k;
  }
  return candidates[0];
}

async function callClaude(name, description) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  const userText = `Entry name: ${name}\n\nBody text:\n${description || '(no body content yet)'}\n\nProduce the JSON now.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userText }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const block = data?.content?.[0];
  const raw = block && block.type === 'text' ? block.text : '';
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/, '').replace(/```$/, '').trim();
  const parsed = JSON.parse(cleaned);
  const seoTitle = String(parsed.seo_title || '').trim();
  const seoDescription = String(parsed.seo_description || '').trim();
  if (!seoTitle || !seoDescription) throw new Error('empty SEO fields from Claude');
  return { seoTitle, seoDescription };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function processContentType(strapi, ctConfig, dryRun) {
  const { uid, nameFields, bodyFields, extractFromHtml } = ctConfig;
  console.log(`\n[backfill-seo] ── ${uid} ──`);
  let entries;
  try {
    entries = await strapi.documents(uid).findMany({
      pagination: { pageSize: 500 },
      status: 'published',
    });
  } catch (err) {
    console.warn(`[backfill-seo] ${uid}: findMany failed: ${err.message}`);
    return { processed: 0, updated: 0, skipped: 0, errors: 0 };
  }

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of entries) {
    processed += 1;
    const documentId = entry.documentId;
    if (!documentId) {
      skipped += 1;
      continue;
    }
    const label = entry.title || entry.name || documentId;

    const titleHit = firstFilled(entry, SEO_TITLE_CANDIDATES);
    const descHit = firstFilled(entry, SEO_DESCRIPTION_CANDIDATES);
    if (titleHit && descHit) {
      console.log(`  SKIP  ${label} (SEO already filled)`);
      skipped += 1;
      continue;
    }

    const nameSource = firstFilled(entry, nameFields);
    if (!nameSource || !nameSource.value) {
      console.log(`  SKIP  ${label} (no name/title content)`);
      skipped += 1;
      continue;
    }

    const bodyChunks = [];
    for (const f of bodyFields) {
      const hit = firstFilled(entry, [f]);
      if (hit?.value) {
        const rawValue = String(hit.value);
        bodyChunks.push(extractFromHtml ? extractText(rawValue) : rawValue);
      }
    }
    const bodyText = bodyChunks.join('\n\n').slice(0, 4000);

    let generated;
    try {
      generated = await callClaude(nameSource.value, bodyText);
    } catch (err) {
      console.warn(`  FAIL  ${label}: ${err.message}`);
      errors += 1;
      await sleep(700);
      continue;
    }

    const patch = {};
    const titleKey = firstKey(entry, SEO_TITLE_CANDIDATES);
    const descKey = firstKey(entry, SEO_DESCRIPTION_CANDIDATES);
    if (!titleHit) patch[titleKey] = generated.seoTitle;
    if (!descHit) patch[descKey] = generated.seoDescription;

    if (dryRun) {
      console.log(`  DRY   ${label}`);
      console.log(`         → ${patch[titleKey] || '(kept)'}`);
      console.log(`         → ${(patch[descKey] || '(kept)').slice(0, 100)}…`);
      updated += 1;
    } else {
      // Update both draft and published so the live page sees the new SEO.
      try {
        await strapi.documents(uid).update({ documentId, data: patch, status: 'draft' });
      } catch (err) {
        console.warn(`  DRAFT WRITE FAIL ${label}: ${err.message}`);
      }
      try {
        await strapi.documents(uid).update({ documentId, data: patch, status: 'published' });
      } catch (err) {
        if (!String(err.message).includes('not found')) {
          console.warn(`  PUB WRITE FAIL ${label}: ${err.message}`);
        }
      }
      console.log(`  OK    ${label}`);
      updated += 1;
    }
    await sleep(700);
  }

  return { processed, updated, skipped, errors };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const uidArg = args.find((a) => a.startsWith('--uid='));
  const targetUid = uidArg ? uidArg.split('=')[1] : null;

  console.log('[backfill-seo] starting');
  console.log(`[backfill-seo] dry-run: ${dryRun ? 'YES (no writes)' : 'NO (will write)'}`);
  if (targetUid) console.log(`[backfill-seo] only processing: ${targetUid}`);

  const strapi = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '..', 'dist'),
  }).load();

  const summary = { processed: 0, updated: 0, skipped: 0, errors: 0 };
  for (const ct of CONTENT_TYPES) {
    if (targetUid && ct.uid !== targetUid) continue;
    const r = await processContentType(strapi, ct, dryRun);
    summary.processed += r.processed;
    summary.updated += r.updated;
    summary.skipped += r.skipped;
    summary.errors += r.errors;
  }

  console.log('\n[backfill-seo] ── SUMMARY ──');
  console.log(`  processed: ${summary.processed}`);
  console.log(`  updated:   ${summary.updated}`);
  console.log(`  skipped:   ${summary.skipped}`);
  console.log(`  errors:    ${summary.errors}`);
  console.log('[backfill-seo] done');

  await strapi.destroy();
  process.exit(summary.errors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('[backfill-seo] fatal:', err);
  process.exit(1);
});
