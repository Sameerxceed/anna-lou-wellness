'use strict';

/**
 * Shared lifecycle helper: auto-generate seo_title + seo_description on
 * create + update when those fields are blank.
 *
 * Anna asked for this on 10 Jun — "Can it not automatically fill it in
 * what it thinks? AI should be doing this part so. Don't need to enter it
 * each time on each page." She doesn't want a button she has to remember;
 * she wants the system to just handle it.
 *
 * Behaviour:
 *   - Runs on afterCreate + afterUpdate.
 *   - If the entry already has BOTH seo_title and seo_description filled
 *     in (Anna or a previous run wrote them), we leave them alone.
 *   - Else: gather the entry's name + body, call the SEO controller's
 *     callClaude helper, write back via strapi.documents.update.
 *   - Strapi update triggers afterUpdate again, but on the second pass
 *     both fields are now filled, so we skip — no infinite loop.
 *   - Fire-and-forget: never blocks the save. If Claude fails or env var
 *     is missing, logs a warning and continues.
 *
 * Usage in any content type's lifecycles.js:
 *
 *   const autoSeo = require('../../../../utils/auto-seo');
 *
 *   module.exports = {
 *     async afterCreate(event) {
 *       autoSeo.runAfter(event, 'api::programme.programme', {
 *         nameField: 'title',
 *         bodyFields: ['intro', 'tagline', 'whatsIncludedItems'],
 *       });
 *     },
 *     async afterUpdate(event) {
 *       autoSeo.runAfter(event, 'api::programme.programme', { ... });
 *     },
 *   };
 *
 * The content-type UID and field map MUST be passed in by the caller — we
 * can't introspect them safely from inside the helper.
 */

const path = require('path');

// Same helpers as the controller — duplicated here so we don't have to
// require the controller (which loads the @strapi factories etc.).
const MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

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
- NEVER use em-dashes (—) or en-dashes (–). Use commas, full stops, or hyphens (-) instead. Em-dashes look AI-written and Anna asked us to stop.

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

async function callClaude(name, description) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  const userText = `Entry name: ${name}\n\nBody text:\n${description || '(no body content yet)'}\n\nProduce the JSON now.`;
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userText }],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 200)}`);
  }
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

/**
 * Field-name candidates supported on most content types. The helper picks
 * the FIRST one it finds non-empty for the body source.
 */
const DEFAULT_NAME_FIELDS = ['title', 'name', 'displayName', 'heading'];
const DEFAULT_BODY_FIELDS = ['intro', 'description', 'body', 'tagline', 'content', 'opening'];

/**
 * The two field NAMES Anna sees in her CMS for SEO. Both supported because
 * different content types use different conventions.
 */
const SEO_TITLE_CANDIDATES = ['seo_title', 'seoTitle'];
const SEO_DESCRIPTION_CANDIDATES = ['seo_description', 'seoDescription'];

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

/**
 * Run inside an afterCreate / afterUpdate lifecycle. Fire-and-forget:
 * never blocks, never throws into the lifecycle.
 *
 * @param {object} event  Strapi lifecycle event (we read .result).
 * @param {string} uid    Content-type UID, e.g. 'api::programme.programme'.
 * @param {object} opts   { nameFields?, bodyFields? } overrides.
 */
function runAfter(event, uid, opts = {}) {
  const strapi = global.strapi;
  if (!strapi) return;
  // CRITICAL: do NOT use setImmediate here. Strapi v5 fires lifecycle hooks
  // WITHIN the open Knex transaction; setImmediate runs in the same tick as
  // the commit, so any DB write we do races with the closing transaction
  // and throws "Transaction query already complete". A short setTimeout
  // (500ms) defers our work past the transaction close + connection release.
  setTimeout(async () => {
    try {
      const result = event?.result;
      if (!result) return;
      const documentId = result.documentId;
      if (!documentId) return;

      // Bail if BOTH SEO fields already have content. We never overwrite
      // what Anna or a previous run has put there.
      const titleHit = firstFilled(result, SEO_TITLE_CANDIDATES);
      const descHit = firstFilled(result, SEO_DESCRIPTION_CANDIDATES);
      if (titleHit && descHit) return;

      // Pull the source text for the prompt.
      const nameFields = opts.nameFields || DEFAULT_NAME_FIELDS;
      const bodyFields = opts.bodyFields || DEFAULT_BODY_FIELDS;
      const nameSource = firstFilled(result, nameFields);
      if (!nameSource || !nameSource.value) return; // nothing to work with

      // Concatenate every body field that has content.
      const bodyChunks = [];
      for (const f of bodyFields) {
        const hit = firstFilled(result, [f]);
        if (hit?.value) bodyChunks.push(hit.value);
      }
      const bodyText = bodyChunks.join('\n\n').slice(0, 4000); // cap prompt size

      let generated;
      try {
        generated = await callClaude(nameSource.value, bodyText);
      } catch (err) {
        strapi.log.warn(`[auto-seo] ${uid}/${documentId}: ${err.message}`);
        return;
      }

      // Build the patch — only fill blanks; preserve anything Anna wrote.
      const patch = {};
      const titleKey = firstKey(result, SEO_TITLE_CANDIDATES);
      const descKey = firstKey(result, SEO_DESCRIPTION_CANDIDATES);
      if (!titleHit) patch[titleKey] = generated.seoTitle;
      if (!descHit) patch[descKey] = generated.seoDescription;
      if (Object.keys(patch).length === 0) return;

      // Update both DRAFT and PUBLISHED status so the new SEO copy is on
      // whichever version is live. Strapi v5 docs API needs `status` set
      // explicitly when draftAndPublish is enabled — without it, the update
      // only writes to the draft and the published page sees stale SEO.
      try {
        await strapi.documents(uid).update({
          documentId,
          data: patch,
          status: 'draft',
        });
      } catch (err) {
        strapi.log.warn(`[auto-seo] ${uid}/${documentId} draft update: ${err.message}`);
      }
      try {
        await strapi.documents(uid).update({
          documentId,
          data: patch,
          status: 'published',
        });
      } catch (err) {
        // Published may not exist yet for fresh drafts — that's fine.
        if (!String(err.message).includes('not found')) {
          strapi.log.warn(`[auto-seo] ${uid}/${documentId} published update: ${err.message}`);
        }
      }
      strapi.log.info(`[auto-seo] ${uid}/${documentId} filled SEO fields`);
    } catch (err) {
      strapi.log.warn(`[auto-seo] unexpected: ${err.message}`);
    }
  }, 500);
}

module.exports = { runAfter };
