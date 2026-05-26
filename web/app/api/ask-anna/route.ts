import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstile } from '@/lib/turnstile';
import { ASK_ANNA_SYSTEM_PROMPT } from '@/lib/ask-anna-prompt';
import { TOOL_DEFINITIONS, executeTool } from '@/lib/ask-anna-tools';

/**
 * AskAnna AI assessment proxy — keeps the Anthropic API key server-side.
 *
 * Modes (both stream the final text response back to the browser):
 *  - mode: "recommend"  — 4 assessment answers → personalised recommendation
 *  - mode: "follow_up"  — chat history + new question → conversational reply
 *
 * Turnstile gates: required on `recommend` and on the FIRST `follow_up` (empty
 * history). Skipped after that to keep the chat fluid.
 *
 * Tool use: Claude can call tools (search_experiences / search_articles /
 * search_products) defined in `lib/ask-anna-tools.ts`. The agentic loop:
 *   1. Send messages + tools to Claude (non-streaming).
 *   2. If response is text-only, stream it.
 *   3. If response has tool_use blocks, execute the tools server-side,
 *      append the tool results as a user turn, repeat from step 1.
 *   4. Cap at MAX_TOOL_TURNS to prevent runaway loops.
 *
 * Prompt caching: system prompt + tool definitions are stable across calls,
 * so the `cache_control` breakpoint on the last system block caches both
 * tier-1 (tools render first in the cache key). 5-min TTL → ~10x cost
 * reduction on repeated calls in any 5-min window.
 *
 * Required env vars (set in Coolify → Next.js → Environment Variables):
 *   ANTHROPIC_API_KEY      from Anna's Anthropic console
 *   TURNSTILE_SECRET_KEY   already set for /reset-letters signups
 */

export const runtime = 'nodejs';

const MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
// Maximum number of tool-call rounds before we force a final answer. In
// practice 1-2 is enough for any realistic query; 4 leaves headroom for
// chained lookups (e.g. find product → look up reviews of that product).
const MAX_TOOL_TURNS = 4;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: unknown; // string OR array of content blocks (tool_use, tool_result)
}

function jsonError(message: string, status = 502): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface AnthropicCallOpts {
  messages: ChatMessage[];
  maxTokens: number;
  stream: boolean;
}

async function callAnthropic({ messages, maxTokens, stream }: AnthropicCallOpts): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonError('Server is missing ANTHROPIC_API_KEY.', 500);
  }
  return fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      stream,
      tools: TOOL_DEFINITIONS,
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
}

/**
 * Run the agentic loop: call Claude with tools, if it asks to use one,
 * execute it server-side and feed the result back, repeat until Claude
 * gives a final answer. Returns the FINAL response (with stream: true)
 * so the caller can pipe it to the browser.
 */
async function runWithTools(initialMessages: ChatMessage[], maxTokens: number): Promise<Response> {
  let messages: ChatMessage[] = [...initialMessages];

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    // Non-streaming probe to detect tool calls. Tool-use responses are
    // small (just the tool_use blocks), so the extra round-trip is cheap.
    const probe = await callAnthropic({ messages, maxTokens, stream: false });
    if (!probe.ok) {
      const text = await probe.text().catch(() => '');
      console.error('[ask-anna] upstream error', probe.status, text.slice(0, 500));
      return jsonError('Anna is briefly unreachable. Please try again in a moment.');
    }
    const payload = await probe.json();
    const stopReason: string | undefined = payload?.stop_reason;
    const contentBlocks: any[] = Array.isArray(payload?.content) ? payload.content : [];

    if (stopReason !== 'tool_use') {
      // Final answer. Re-issue the same messages WITH stream:true so the
      // browser gets word-by-word output (better UX than ms-of-silence
      // followed by a wall of text).
      return streamFinalResponse(messages, maxTokens);
    }

    // Append the assistant turn that contains the tool_use blocks. Required
    // by the API — the next user turn (with tool_result) must reference the
    // tool_use_id, and Claude needs to see what it asked for.
    messages.push({ role: 'assistant', content: contentBlocks });

    // Execute every tool_use block in this turn. The API supports parallel
    // tool calls in a single turn, so collect all results before sending.
    const toolResults: any[] = [];
    for (const block of contentBlocks) {
      if (block?.type !== 'tool_use') continue;
      const name = String(block.name || '');
      const input = block.input;
      const toolUseId = String(block.id || '');
      try {
        const result = await executeTool(name, input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUseId,
          content: JSON.stringify(result),
        });
        console.info(`[ask-anna] tool ${name} → ok`);
      } catch (err: any) {
        console.error(`[ask-anna] tool ${name} failed:`, err?.message);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUseId,
          content: JSON.stringify({ error: 'Tool execution failed.' }),
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
    // Loop continues — next probe call will either be a final answer or
    // more tool calls.
  }

  // Hit the max — force a final answer by re-asking without tools.
  console.warn('[ask-anna] hit MAX_TOOL_TURNS, forcing final answer');
  return streamFinalResponse(messages, maxTokens);
}

/**
 * Stream the final text answer. Same shape as the original streamer —
 * passes Anthropic SSE chunks through, emitting only the text deltas.
 */
async function streamFinalResponse(messages: ChatMessage[], maxTokens: number): Promise<Response> {
  const upstream = await callAnthropic({ messages, maxTokens, stream: true });
  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '');
    console.error('[ask-anna] final stream error', upstream.status, text.slice(0, 500));
    return jsonError('Anna is briefly unreachable. Please try again in a moment.');
  }

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
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';
          for (const event of events) {
            const dataLine = event.split('\n').find((l) => l.startsWith('data: '));
            if (!dataLine) continue;
            const data = dataLine.slice(6).trim();
            if (!data || data === '[DONE]') continue;
            try {
              const obj = JSON.parse(data);
              if (obj.type === 'content_block_delta' && obj.delta?.type === 'text_delta') {
                const text: string = obj.delta.text || '';
                if (text) controller.enqueue(new TextEncoder().encode(text));
              } else if (obj.type === 'error') {
                console.error('[ask-anna] anthropic stream error:', obj.error);
              }
            } catch { /* keepalive */ }
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

  // ── Mode 1: initial recommendation (4-question assessment) ──────────
  if (mode === 'recommend') {
    const answers = Array.isArray(body?.answers) ? body.answers.map(String) : [];
    if (answers.length !== 4 || answers.some((a: string) => !a)) {
      return NextResponse.json({ error: 'Four answers required.' }, { status: 400 });
    }

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

    return runWithTools(
      [{ role: 'user', content: userMessage }],
      1200,
    );
  }

  // ── Mode 2: follow-up chat ──────────────────────────────────────────
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

  const cleanHistory = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-16);

  const messages: ChatMessage[] = [...cleanHistory, { role: 'user', content: question }];
  return runWithTools(messages, 1000);
}
