import { NextResponse } from 'next/server';
import { buildOpenAIProductFeed } from '@/lib/openai-product-feed';

/**
 * Newline-delimited JSON variant of the OpenAI Agentic Commerce product
 * feed. This is the format OpenAI's SFTP ingestion expects (typically
 * gzipped: `ai-products.jsonl.gz`).
 *
 * Delivery flow once Anna is onboarded as a merchant at
 * developers.openai.com/commerce:
 *   1. OpenAI issues SFTP credentials.
 *   2. A cron job (server-level, not in this Next app) curls this
 *      endpoint, pipes through gzip, and `sftp put` to OpenAI nightly.
 *   3. No npm deps needed — pure shell.
 *
 * Until SFTP credentials arrive, this endpoint exists for:
 *  - Validation: Anna sends OpenAI a sample (~100 rows) by pointing
 *    them at this URL during the spec-validation step.
 *  - Manual fallback: Anna can `curl -o feed.jsonl` and upload by hand
 *    if she gets credentials before automation is wired.
 *
 * Same data + same field shape as /ai-products.json — only the wire
 * format differs.
 */
// 1h TTL — Product lifecycle already busts this on save. Was 600s.
export const revalidate = 3600;

export async function GET() {
  const products = await buildOpenAIProductFeed();
  const body = products.map((p) => JSON.stringify(p)).join('\n') + '\n';

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=3600',
      'Access-Control-Allow-Origin': '*',
      'Content-Disposition': 'inline; filename="ai-products.jsonl"',
    },
  });
}
