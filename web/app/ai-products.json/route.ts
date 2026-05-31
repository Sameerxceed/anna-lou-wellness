import { NextResponse } from 'next/server';
import { getProducts, getSiteSettings, getShopSettings } from '@/lib/cms';

/**
 * AI-readable product feed for agentic commerce.
 *
 * Why this exists separate from /products.xml (Google Merchant):
 *  - Google Merchant Centre accepts RSS-XML — its schema is fixed by Google.
 *  - AI agents (ChatGPT shopping, Perplexity, Claude, custom GPTs) prefer
 *    JSON with rich semantic fields. Some emerging programs (OpenAI's
 *    catalog ingestion partner pipeline, Anthropic tool-use catalogs)
 *    take JSON feeds directly.
 *  - This endpoint emits both schema.org Product fields (so traditional
 *    AI crawlers reading the file get a familiar shape) AND the extended
 *    "agentic commerce" fields the OpenAI / Microsoft Shopping product
 *    spec lists (identifiers, inventory, seller_info, fulfilment).
 *
 * Anna's brother flagged that products need to be discoverable by AI
 * with accurate price + stock, not just articles. Today AI engines pick
 * this up three ways: (1) Schema.org JSON-LD on each /shop/{slug} page
 * (already shipped), (2) the /products.xml Google feed (already shipped),
 * (3) this aggregate JSON feed (shipped now). All three are referenced
 * in /llms.txt so AI agents that read it discover them.
 *
 * Refreshed every 10 minutes so stock + price changes propagate fast.
 * Served with permissive CORS so AI ingestion services can read it.
 */
export const revalidate = 600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com';

function abs(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  return SITE_URL + (url.startsWith('/') ? url : '/' + url);
}

export async function GET() {
  const [products, settings, shop] = await Promise.all([
    getProducts().catch(() => []),
    getSiteSettings().catch(() => null),
    getShopSettings().catch(() => null),
  ]);

  const active = products.filter((p) => p.isActive);
  const brand = settings?.siteName || 'Anna Lou Wellness';
  const sellerUrl = SITE_URL;
  const contactEmail = settings?.email || 'hello@annalouwellness.com';
  const currency = 'GBP';

  const freeShippingThreshold = shop?.freeShippingThreshold ?? 50;
  const flatShippingRate = shop?.shippingFlatRate ?? 4.95;

  const items = active.map((p) => {
    const url = `${SITE_URL}/shop/${p.slug}`;
    const image = abs(p.images?.[0] || null);
    const additionalImages = (p.images || []).slice(1, 6).map(abs).filter(Boolean) as string[];
    const inStock = (p.stock ?? 0) > 0;
    const description = p.description?.trim() || p.shortDescription?.trim() || p.name;
    const qualifiesFreeShipping = p.price >= freeShippingThreshold;
    const shippingCost = qualifiesFreeShipping ? 0 : flatShippingRate;

    return {
      // ─── Core identifiers ───
      id: String(p.id),
      sku: p.slug,
      gtin: null,
      mpn: null,
      product_url: url,

      // ─── Listing ───
      title: p.name,
      description,
      short_description: p.shortDescription || null,
      brand,
      category: p.category || 'Shop',
      condition: 'new',

      // ─── Media ───
      image_url: image,
      additional_image_urls: additionalImages,

      // ─── Pricing ───
      price: {
        amount: p.price,
        currency,
        formatted: `£${p.price.toFixed(2)}`,
      },

      // ─── Availability + inventory ───
      availability: inStock ? 'in_stock' : 'out_of_stock',
      inventory_count: p.stock ?? 0,
      in_stock: inStock,

      // ─── Seller ───
      seller: {
        name: brand,
        url: sellerUrl,
        contact_email: contactEmail,
        country: 'GB',
      },

      // ─── Fulfilment ───
      shipping: {
        country: 'GB',
        service: qualifiesFreeShipping ? 'Free UK shipping' : 'UK standard',
        cost: shippingCost,
        currency,
        formatted: shippingCost === 0 ? 'Free' : `£${shippingCost.toFixed(2)}`,
        estimated_days_min: 3,
        estimated_days_max: 7,
      },
      returns: {
        accepted: true,
        window_days: 14,
        policy_url: `${SITE_URL}/returns`,
      },

      // ─── Schema.org Product (mirrored so JSON-LD-aware AI gets a familiar shape) ───
      '@type': 'Product',
      '@context': 'https://schema.org',
      offers: {
        '@type': 'Offer',
        url,
        price: p.price,
        priceCurrency: currency,
        availability: inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        seller: {
          '@type': 'Organization',
          name: brand,
          url: sellerUrl,
        },
      },
    };
  });

  const body = {
    feed_version: '1.0',
    title: `${brand} — Product Catalogue`,
    description: 'AI-readable product feed for agentic commerce. Schema.org Product + extended fulfilment fields. Refreshed every 10 minutes.',
    site_url: SITE_URL,
    contact_email: contactEmail,
    generated_at: new Date().toISOString(),
    refresh_interval_seconds: 600,
    currency,
    product_count: items.length,
    products: items,
  };

  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=3600',
      // Allow AI ingestion services to fetch this cross-origin without proxy.
      'Access-Control-Allow-Origin': '*',
    },
  });
}
