/**
 * Strapi 5 REST API Client (Next.js)
 *
 * Fetches content from the Strapi CMS.
 * Server components use ISR revalidation.
 * Client components use NEXT_PUBLIC_ env vars.
 */

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';

export { STRAPI_URL };

// ISR revalidation period (seconds). 24h safety-net TTL — Strapi lifecycle
// hooks call /api/revalidate on every content change so pages reflect edits
// within seconds. This TTL only kicks in if the webhook is skipped (secret
// missing, network hiccup) or for content whose collection lacks a
// lifecycles.js. Was 3600 (1h) — bumped to 86400 to keep ISR write volume
// well under Vercel Hobby's 200K/mo limit (xceed-website hit 260K on 1h TTL).
const REVALIDATE = 86400; // 24 hours

// ═══ Fetch helper ═══

export async function fetchAPI<T = any>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`/api${endpoint}`, STRAPI_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    },
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) throw new Error(`Strapi ${res.status}: ${res.statusText}`);
  return res.json();
}

// ═══ Media helpers (Strapi 5 flat format) ═══

export type MediaSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' | 'original';

/**
 * Strapi auto-generates resized variants on upload (see cms/config/plugins.js
 * breakpoints: thumbnail 245, small 500, medium 750, large 1200, xlarge 1920).
 * Pass a `size` to opt into the smaller variant for cards/thumbnails — saves
 * payload weight. Default returns the original (full-res), so all existing
 * call sites keep working unchanged.
 *
 * Use:
 *   - article/product card thumbnails: 'medium' (750)
 *   - page hero / featured image: 'large' (1200)
 *   - logo / icon / cert badge: 'small' (500) or 'thumbnail' (245)
 *   - OG / share image: 'large'
 */
export function mediaUrl(media: any, size: MediaSize = 'original'): string {
  if (!media?.url) return '';
  if (size !== 'original' && media.formats?.[size]?.url) {
    const u = media.formats[size].url as string;
    return u.startsWith('http') ? u : `${STRAPI_URL}${u}`;
  }
  if (media.url.startsWith('http')) return media.url;
  return `${STRAPI_URL}${media.url}`;
}

/** Extract URLs from a Strapi media array (multiple files field) */
export function mediaUrls(media: any): string[] {
  if (!media) return [];
  if (Array.isArray(media)) return media.map(m => mediaUrl(m)).filter(Boolean);
  if (media.url) return [mediaUrl(media)];
  return [];
}

// ═══ Order API (client-side, POST) ═══

export async function createOrder(orderData: any) {
  const baseUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337')
    : STRAPI_URL;

  const res = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: orderData }),
  });
  return res.json();
}
