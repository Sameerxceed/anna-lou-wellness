import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstile } from '@/lib/turnstile';
import { ASK_ANNA_SYSTEM_PROMPT } from '@/lib/ask-anna-prompt';

/**
 * AskAnna AI assessment proxy — keeps the Anthropic API key server-side.
 *
 * Two modes (both stream the response):
 *  - mode: "recommend"  → 4 assessment answers + turnstile token → personalised recommendation
 *  - mode: "follow_up"  → chat history + new question → conversational reply
 *
 * Turnstile gates the FIRST call only. Follow-ups carry no token (the user
 * would be friction'd off the page if every chat turn re-challenged them);
 * the conversation history acts as soft proof of legitimate use.
 *
 * Prompt caching: the system prompt is large + identical across all calls.
 * `cache_control: { type: "ephemeral" }` on the last system block puts the
 * 5-minute cache breakpoint there. First call writes (~1.25x base cost),
 * subsequent calls in any 5-min window read at ~10% cost. See
 * https://platform.claude.com/docs/en/build-with-claude/prompt-caching
 *
 * Required env vars (set in Coolify → Next.js → Environment Variables):
 *   ANTHROPIC_API_KEY      from Anna's Anthropic console
 *   TURNSTILE_SECRET_KEY   already set for /reset-letters signups
 */

export const runtime = 'nodejs';

const MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function streamFromAnthropic(messages: ChatMessage[], maxTokens: number): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server is missing ANTHROPIC_API_KEY.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const upstream = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      stream: true,
      system: [
        {
          type: 'text',
          text: ASK_ANNA_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '');
    console.error('[ask-anna] upstream error', upstream.status, text.slice(0, 500));
    return new Response(JSON.stringify({ error: 'Anna is briefly unreachable. Please try again in a moment.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Re-emit ONLY the text deltas as plain text chunks to the browser.
  // The client doesn't need raw SSE envelopes — it just appends each
  // chunk to the visible message as it arrives.
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // SSE events are separated by blank lines. Process complete events.
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';
          for (const event of events) {
            const dataLine = event.split('\n').find((l) => l.startsWith('data: '));
            if (!dataLine) continue;
            const payload = dataLine.slice(6).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const obj = JSON.parse(payload);
              if (obj.type === 'content_block_delta' && obj.delta?.type === 'text_delta') {
                const text: string = obj.delta.text || '';
                if (text) controller.enqueue(new TextEncoder().encode(text));
              } else if (obj.type === 'message_stop') {
                // done — fall through, outer loop will break on next read
              } else if (obj.type === 'error') {
                console.error('[ask-anna] anthropic stream error:', obj.error);
              }
            } catch {
              // ignore non-JSON keepalives
            }
          }
        }
      } catch (err) {
        console.error('[ask-anna] stream forwarding error', err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const mode = body?.mode === 'follow_up' ? 'follow_up' : 'recommend';

  // ── Mode 1: initial recommendation ──────────────────────────────────
  if (mode === 'recommend') {
    const answers = Array.isArray(body?.answers) ? body.answers.map(String) : [];
    if (answers.length !== 4 || answers.some((a: string) => !a)) {
      return NextResponse.json({ error: 'Four answers required.' }, { status: 400 });
    }

    // Turnstile only on the first call. Follow-ups skip CAPTCHA.
    const captcha = await verifyTurnstile(
      body?.turnstileToken,
      req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
    );
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 });
    }

    const userMessage = [
      'Here are my assessment answers:',
      `Question 1 — Where I am right now: ${answers[0]}`,
      `Question 2 — What my body feels like most of the time: ${answers[1]}`,
      `Question 3 — What "better" would feel like: ${answers[2]}`,
      `Question 4 — What feels most true right now: ${answers[3]}`,
      '',
      'Please give me your honest assessment and recommendation.',
    ].join('\n');

    return streamFromAnthropic(
      [{ role: 'user', content: userMessage }],
      1200,
    );
  }

  // ── Mode 2: follow-up chat ──────────────────────────────────────────
  // Two entry points:
  //   - /ask-anna page: the first follow_up always has history (the streamed
  //     recommendation is in there), so Turnstile is skipped — the user
  //     already passed CAPTCHA in mode=recommend.
  //   - Floating widget: the FIRST follow_up has empty history (no prior
  //     assessment). Require Turnstile here to gate abuse, then skip it on
  //     subsequent turns once the chat is established.
  const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];
  const question: string = typeof body?.question === 'string' ? body.question.trim() : '';

  if (!question) {
    return NextResponse.json({ error: 'No question provided.' }, { status: 400 });
  }

  if (history.length === 0) {
    const captcha = await verifyTurnstile(
      body?.turnstileToken,
      req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
    );
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 });
    }
  }

  // Sanity-cap the history Claude sees — 16 turns is plenty for a coaching chat
  // and keeps us well under any cost surprise from a runaway loop.
  const cleanHistory = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-16);

  const messages: ChatMessage[] = [...cleanHistory, { role: 'user', content: question }];
  return streamFromAnthropic(messages, 800);
}
