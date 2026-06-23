'use strict';

/**
 * Manual Help controller.
 *
 * POST /api/manual-help/ask { question, history?: [{role, content}] }
 *
 * Loads ANNA_USER_MANUAL.md (bundled at cms/src/data/anna-manual.md),
 * sends it as the system prompt to Claude Haiku along with Anna's
 * question + recent chat history, and returns the answer.
 *
 * Streaming is not used — Strapi's koa response handling makes SSE
 * fiddly, and Haiku's answers come back in 1-2s anyway. JSON response
 * with a single `answer` field keeps the admin-side UI simple.
 *
 * Cost per question (manual ~32k input tokens, ~400 output tokens):
 *   Haiku 4.5: ~$0.001 per question. Sonnet would be ~$0.1 per question.
 *   We use Haiku — the manual is the source of truth and Haiku is more
 *   than capable of finding the right section and quoting it back.
 */

const fs = require('fs');
const path = require('path');

const MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MAX_HISTORY = 8;

let cachedManual = null;
function loadManual() {
  if (cachedManual) return cachedManual;
  const manualPath = path.join(__dirname, '..', '..', '..', 'data', 'anna-manual.md');
  cachedManual = fs.readFileSync(manualPath, 'utf-8');
  return cachedManual;
}

function buildSystemPrompt(manual) {
  return [
    "You are the in-CMS help assistant for Anna Lou Wellness. Anna is the site owner; she edits content from her phone and gets lost in Strapi's UI. Your only job is to answer her CMS questions by quoting the user manual.",
    '',
    'HARD RULES:',
    "- Only answer using information from the manual below. If the manual doesn't cover the question, say so plainly: \"That isn't in the manual — WhatsApp Sameer.\" Do not improvise CMS paths.",
    '- Always cite the section heading in your reply (e.g. "See §16.7 Programme pages"). The section number lets Anna scroll to the source if she wants more detail.',
    "- Lead with the answer in 1-2 sentences. Then give the exact CMS click path as a bullet list (Content Manager → ... → field name). End with the section citation.",
    '- Use plain language. No jargon. No em-dashes (use commas, full stops, or hyphens).',
    "- If the question is vague (e.g. \"how do I edit the homepage\"), ask ONE clarifying question first.",
    '- Never make up field names, page paths, or features. If unsure, say so.',
    '',
    '=== ANNA USER MANUAL ===',
    manual,
    '=== END MANUAL ===',
  ].join('\n');
}

async function callAnthropic({ apiKey, system, messages }) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      system: [
        {
          type: 'text',
          text: system,
          // 5-min cache on the manual block. Cuts Haiku cost ~10x for
          // repeat queries in the same session.
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  const blocks = Array.isArray(data?.content) ? data.content : [];
  const text = blocks
    .filter((b) => b?.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
  return text || '(No response — try rephrasing.)';
}

// Verify that the request carries a valid Strapi admin JWT. We do this
// manually because Strapi v5's admin::isAuthenticatedAdmin policy is
// unreliable on /api routes. Checks (in order):
//   1. Authorization: Bearer <token>
//   2. Several known cookie names Strapi v5 has shipped under different
//      builds: jwtToken, strapi_jwt, strapi-jwt
//   3. (Future) custom secret header for trusted internal callers
async function verifyAdminJwt(ctx) {
  const auth = ctx.request.header.authorization || '';
  const headerToken = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';

  const COOKIE_NAMES = ['jwtToken', 'strapi_jwt', 'strapi-jwt'];
  let cookieToken = '';
  for (const name of COOKIE_NAMES) {
    const val = ctx.cookies?.get(name);
    if (val) { cookieToken = val; break; }
  }

  const token = headerToken || cookieToken;

  // Diagnostic log so we can see in Coolify what each request actually
  // carried. Strip after the fix lands.
  const cookieKeys = (ctx.request.header.cookie || '')
    .split(';').map((c) => c.trim().split('=')[0]).filter(Boolean);
  strapi.log.info(
    `[manual-help] auth probe — bearer:${headerToken ? 'yes' : 'no'} ` +
    `cookieToken:${cookieToken ? 'yes' : 'no'} cookieKeys:[${cookieKeys.join(',')}]`
  );

  if (!token) return null;

  // Decode directly with jsonwebtoken + admin JWT secret. strapi.service
  // ('admin::token') returns null in this v5 build, so we skip it. The
  // secret lives at admin.auth.secret in config (set via ADMIN_JWT_SECRET
  // env var on Coolify) — same secret Strapi itself uses to sign admin
  // sessions, so anything that decodes here is a real admin login.
  try {
    const jwt = require('jsonwebtoken');
    const secret = strapi.config.get('admin.auth.secret');
    if (!secret) {
      strapi.log.warn('[manual-help] admin.auth.secret not configured');
      return null;
    }
    const payload = jwt.verify(token, secret);
    if (payload && (payload.id || payload.userId)) return payload;
    return null;
  } catch (err) {
    strapi.log.warn(`[manual-help] JWT verify failed: ${err.message}`);
    return null;
  }
}

module.exports = {
  async ask(ctx) {
    const adminUser = await verifyAdminJwt(ctx);
    if (!adminUser) {
      ctx.status = 401;
      ctx.body = { error: 'Admin login required. Please log out and back in.' };
      return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      ctx.status = 500;
      ctx.body = { error: 'Server is missing ANTHROPIC_API_KEY.' };
      return;
    }

    const body = ctx.request.body || {};
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    if (!question) {
      ctx.status = 400;
      ctx.body = { error: 'No question provided.' };
      return;
    }

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history = rawHistory
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim()
      )
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content }));

    let manual;
    try {
      manual = loadManual();
    } catch (err) {
      strapi.log.error('[manual-help] Failed to load manual:', err.message);
      ctx.status = 500;
      ctx.body = { error: 'Manual file missing on server.' };
      return;
    }

    const messages = [...history, { role: 'user', content: question }];

    try {
      const answer = await callAnthropic({
        apiKey,
        system: buildSystemPrompt(manual),
        messages,
      });
      ctx.body = { answer };
    } catch (err) {
      strapi.log.error('[manual-help] Upstream error:', err.message);
      ctx.status = 502;
      ctx.body = { error: 'Help assistant is briefly unreachable. Try again in a moment.' };
    }
  },
};
