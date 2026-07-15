import { NextResponse } from 'next/server';
import { getShopSettings } from '@/lib/cms';

/**
 * Public read-only endpoint for the shop UI to fetch the few editable
 * settings the cart + checkout pages need (free-shipping threshold + label,
 * flat shipping rate, gift-wrap config).
 *
 * force-dynamic on the handler + 24h cache on the underlying Strapi fetch
 * (via fetchAPI in strapi.ts). Result: Anna's edits reflect in the returned
 * JSON on the next request after the site-settings lifecycle revalidates
 * the fetch cache. Strapi is only hit when the fetch cache expires (or a
 * lifecycle busts it). Was revalidate=60 which burnt ~43K ISR writes/month
 * for one endpoint.
 *
 * Source of truth is the Site Settings singleton in Strapi. If Strapi is
 * unreachable, the hardcoded fallback in src/data/site.ts is returned.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getShopSettings();
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load shop settings' }, { status: 500 });
  }
}
