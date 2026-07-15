import { NextResponse } from 'next/server';
import { buildOpenAIProductFeed } from '@/lib/openai-product-feed';

/**
 * AI product feed in OpenAI's exact Agentic Commerce spec.
 *
 * Spec source: https://developers.openai.com/commerce/specs/file-upload/products
 *
 * Format: JSON array of product objects matching OpenAI's required +
 * recommended fields (item_id, title, description, url, brand, image_url,
 * price, availability, is_eligible_search/checkout, seller_*,
 * target_countries, store_country, accepts_returns, etc.)
 *
 * Delivery to OpenAI itself happens via SFTP (push, not pull) — Anna
 * applies as a merchant at developers.openai.com/commerce, OpenAI
 * verifies her business, then issues SFTP credentials. A cron job
 * uploads the gzipped JSONL daily once credentials are in hand.
 *
 * This HTTP endpoint serves two purposes meanwhile:
 *  1. Live preview / validation — Anna sends OpenAI the sample-100 row
 *     for spec validation by pointing them at this URL.
 *  2. Any other AI agent (Custom GPTs, third-party AI shopping tools)
 *     that consumes a JSON product feed directly without SFTP.
 *
 * Pair endpoint: /ai-products.jsonl (newline-delimited, ready for
 * gzip + SFTP push to OpenAI when credentials arrive).
 *
 * 1h TTL — Product lifecycle already busts this on save. Was 600s.
 */
export const revalidate = 3600;

export async function GET() {
  const products = await buildOpenAIProductFeed();

  return NextResponse.json(
    {
      spec: 'openai-agentic-commerce-product-feed',
      spec_url: 'https://developers.openai.com/commerce/specs/file-upload/products',
      generated_at: new Date().toISOString(),
      refresh_interval_seconds: 600,
      product_count: products.length,
      products,
    },
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 's-maxage=600, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}
