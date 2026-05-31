import { getProducts, getSiteSettings, getShopSettings } from '@/lib/cms';

/**
 * Build product records matching OpenAI's Agentic Commerce product feed
 * spec exactly.
 *
 * Spec: https://developers.openai.com/commerce/specs/file-upload/products
 *
 * Used by:
 *  - /ai-products.json  (HTTP, JSON array — for validation + general AI agents)
 *  - /ai-products.jsonl (HTTP, newline-delimited — for gzip + SFTP push to OpenAI)
 *
 * Single source of truth for the field shape so both endpoints stay
 * in lockstep.
 *
 * Field naming: snake_case throughout per OpenAI spec.
 *
 * is_eligible_checkout: kept FALSE for now. Setting it true means OpenAI
 * customers can complete a purchase via ChatGPT directly — that requires
 * us to implement the Agentic Commerce checkout protocol on our side
 * (create-cart / complete-payment endpoints that OpenAI calls). When
 * Anna wants that, build the protocol then flip this flag + add the two
 * conditionally-required URLs (seller_privacy_policy, seller_tos).
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com';

function abs(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  return SITE_URL + (url.startsWith('/') ? url : '/' + url);
}

/** OpenAI accepts max 150 chars on title, 5000 on description. */
function clip(s: string | undefined | null, max: number): string {
  if (!s) return '';
  const clean = String(s).replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

export type OpenAIProduct = {
  item_id: string;
  title: string;
  description: string;
  url: string;
  brand: string;
  image_url: string;
  price: string;
  availability: 'in_stock' | 'out_of_stock' | 'pre_order' | 'backorder' | 'unknown';
  is_eligible_search: boolean;
  is_eligible_checkout: boolean;
  seller_name: string;
  seller_url: string;
  target_countries: string[];
  store_country: string;
  // recommended optional
  accepts_returns?: boolean;
  return_deadline_in_days?: number;
  additional_image_urls?: string[];
  product_category?: string;
};

export async function buildOpenAIProductFeed(): Promise<OpenAIProduct[]> {
  const [products, settings, shop] = await Promise.all([
    getProducts().catch(() => []),
    getSiteSettings().catch(() => null),
    getShopSettings().catch(() => null),
  ]);

  const brand = settings?.siteName || 'Anna Lou Wellness';
  const sellerUrl = SITE_URL;

  const active = products.filter((p) => p.isActive);

  return active.map<OpenAIProduct>((p) => {
    const image = abs(p.images?.[0] || null) || '';
    const additional = (p.images || []).slice(1, 6).map(abs).filter(Boolean) as string[];
    const inStock = (p.stock ?? 0) > 0;
    const description = clip(p.description || p.shortDescription || p.name, 5000);

    return {
      item_id: String(p.id),
      title: clip(p.name, 150),
      description,
      url: `${SITE_URL}/shop/${p.slug}`,
      brand: clip(brand, 70),
      image_url: image,
      // OpenAI price format: "<amount> <ISO 4217>"
      price: `${p.price.toFixed(2)} GBP`,
      availability: inStock ? 'in_stock' : 'out_of_stock',
      is_eligible_search: true,
      // Flip to true only when we implement the Agentic Commerce checkout
      // protocol (create-cart / complete-payment endpoints OpenAI calls).
      is_eligible_checkout: false,
      seller_name: clip(brand, 70),
      seller_url: sellerUrl,
      target_countries: ['GB'],
      store_country: 'GB',
      accepts_returns: true,
      return_deadline_in_days: 14,
      additional_image_urls: additional.length > 0 ? additional : undefined,
      product_category: p.category || undefined,
    };
  });
}
