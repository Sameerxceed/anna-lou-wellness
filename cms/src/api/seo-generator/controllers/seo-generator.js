'use strict';

/**
 * Generate an SEO title + meta description from raw entry text via Claude.
 *
 * Called by the "Generate SEO" button in the admin edit view (see
 * cms/src/admin/extensions/GenerateSeoPanel.tsx).
 *
 * Input body:
 *   {
 *     name:         the entry's title/name field (REQUIRED — used as fallback if AI fails)
 *     description:  long-form body content (richtext, plain text, or strapi blocks — we stringify)
 *     hints:        optional { brand, audience, callToAction } — added to the prompt
 *   }
 *
 * Output:
 *   { ok: true, seo_title, seo_description }
 *
 * Env:
 *   ANTHROPIC_API_KEY — same key already in use for AskAnna on the web side.
 *                       Set in Coolify env vars for the Strapi service.
 */

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

Rules for seo_description (140–160 chars):
- ONE clear sentence, two at most. Written to be SEEN in a Google search result and convince a real human to click.
- Must include AT LEAST TWO of: who it's for (e.g. "founders", "women in their 40s"), the format (e.g. "one-day workshop", "12-week 1:1 programme", "retreat"), the place (e.g. "Thames houseboat", "London", "online"), the outcome in plain words.
- Use the language people search with — "nervous system reset", "trauma-informed coaching", "ADHD-friendly", "burnout recovery" — not abstract phrases like "step into your power" or "alignment journey".
- Avoid: 'discover', 'unlock', 'embark', 'journey', 'transformation' as marketing fluff.
- Never invent facts that aren't in the source text. If the price isn't in the source, don't mention a price.
- No emojis, no exclamation marks.

Examples Anna likes:
- "An exclusive one-day immersion for founders and leaders on a private Thames houseboat. Reset your nervous system and release subconscious blocks with Anna Lou."
- "12-week 1:1 trauma-informed coaching for women navigating burnout in London. Somatic practices, dating-pattern work, founder reset."

If the source text is too short to write meaningfully, use the name verbatim for the title and a one-line factual restatement for the description.

Return raw JSON only. No markdown fences, no preamble.`;

// Flatten Strapi richtext / blocks into plain prose for the prompt.
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

async function callClaude(name, description, hints) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured on the CMS server');
  }

  const hintLine = hints && Object.keys(hints).length
    ? `Additional context: ${JSON.stringify(hints)}\n\n`
    : '';

  const userText = `Entry name: ${name}\n\nBody text:\n${description || '(no body content yet)'}\n\n${hintLine}Produce the JSON now.`;

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
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const block = data?.content?.[0];
  const raw = (block && block.type === 'text') ? block.text : '';

  // Strip accidental code fences if Claude slips one in.
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/, '').replace(/```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Claude returned non-JSON: ${cleaned.slice(0, 200)}`);
  }

  const seoTitle = String(parsed.seo_title || '').trim();
  const seoDescription = String(parsed.seo_description || '').trim();

  if (!seoTitle || !seoDescription) {
    throw new Error('Claude returned an empty title or description');
  }
  return { seoTitle, seoDescription };
}

module.exports = {
  async generate(ctx) {
    const body = ctx.request.body || {};
    const name = String(body.name || '').trim();
    const description = flattenContent(body.description).trim();
    const hints = body.hints && typeof body.hints === 'object' ? body.hints : {};

    if (!name) {
      return ctx.badRequest('A "name" field is required');
    }

    try {
      const { seoTitle, seoDescription } = await callClaude(name, description, hints);
      ctx.body = { ok: true, seo_title: seoTitle, seo_description: seoDescription };
    } catch (err) {
      strapi.log.error('[seo-generator] failed:', err.message);
      ctx.status = 502;
      ctx.body = { ok: false, error: err.message };
    }
  },
};
