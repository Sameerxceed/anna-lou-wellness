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

// ISR revalidation period (seconds)
const REVALIDATE = 3600; // 1 hour

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

/** Get full URL from a Strapi media object */
export function mediaUrl(media: any): string {
  if (!media?.url) return '';
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
