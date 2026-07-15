import { NextResponse } from 'next/server';
import { getProducts, getSiteSettings } from '@/lib/cms';

/**
 * Google Merchant Centre product feed.
 *
 * Submit this URL in Google Merchant Centre → Products → Feeds. Google then
 * imports the catalogue into Google Shopping and Search rich results.
 * "Single fastest traffic recovery lever for jewellery stores" per the
 * original proposal.
 *
 * Spec: https://support.google.com/merchants/answer/7052112
 *
 * Refreshed every 10 minutes so stock + price changes propagate fast.
 * Same format also accepted by Bing Merchant Centre, Pinterest catalogues,
 * and Facebook Catalog Manager — submit once, syndicate everywhere.
 */
// 1h TTL — merchant feed crawlers pull at most hourly. Was 600s.
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com';

function xmlEscape(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(s: string): string {
  return '<![CDATA[' + String(s).replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';
}

function absoluteImage(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  return SITE_URL + (url.startsWith('/') ? url : '/' + url);
}

export async function GET() {
  const [products, settings] = await Promise.all([
    getProducts().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);
  const active = products.filter((p) => p.isActive);
  const brand = settings?.siteName || 'Anna Lou Wellness';
  const now = new Date().toUTCString();

  const items = active.map((p) => {
    const url = `${SITE_URL}/shop/${p.slug}`;
    const image = absoluteImage(p.images?.[0] || '');
    const inStock = (p.stock ?? 0) > 0;
    const description = p.description?.trim() || p.shortDescription?.trim() || p.name;
    return [
      '<item>',
      `  <g:id>${xmlEscape(String(p.id))}</g:id>`,
      `  <title>${cdata(p.name)}</title>`,
      `  <description>${cdata(description)}</description>`,
      `  <link>${xmlEscape(url)}</link>`,
      image ? `  <g:image_link>${xmlEscape(image)}</g:image_link>` : '',
      `  <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>`,
      `  <g:price>${p.price.toFixed(2)} GBP</g:price>`,
      `  <g:condition>new</g:condition>`,
      `  <g:brand>${xmlEscape(brand)}</g:brand>`,
      `  <g:identifier_exists>false</g:identifier_exists>`,
      p.category ? `  <g:product_type>${xmlEscape(p.category)}</g:product_type>` : '',
      `  <g:shipping><g:country>GB</g:country><g:service>Standard</g:service><g:price>${(settings as any)?.freeShippingThreshold && (settings as any)?.shippingFlatRate ? (p.price >= (settings as any).freeShippingThreshold ? '0.00 GBP' : (settings as any).shippingFlatRate.toFixed(2) + ' GBP') : '4.95 GBP'}</g:price></g:shipping>`,
      '</item>',
    ].filter(Boolean).join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">',
    '  <channel>',
    `    <title>${cdata(brand + ' — Shop')}</title>`,
    `    <link>${xmlEscape(SITE_URL + '/shop')}</link>`,
    `    <description>${cdata('Emotional support jewellery and gifts by ' + brand + '.')}</description>`,
    `    <lastBuildDate>${now}</lastBuildDate>`,
    ...items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=3600',
    },
  });
}
