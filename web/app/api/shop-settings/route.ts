import { NextResponse } from 'next/server';
import { getShopSettings } from '@/lib/cms';

/**
 * Public read-only endpoint for the shop UI to fetch the few editable
 * settings the cart + checkout pages need (free-shipping threshold + label,
 * flat shipping rate, gift-wrap config). Cached for one minute so a hot
 * cart page doesn't hammer Strapi on every keystroke.
 *
 * Source of truth is the Site Settings singleton in Strapi. If Strapi is
 * unreachable, the hardcoded fallback in src/data/site.ts is returned.
 */
export const revalidate = 60;

export async function GET() {
  try {
    const settings = await getShopSettings();
    return NextResponse.json(settings, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load shop settings' }, { status: 500 });
  }
}
