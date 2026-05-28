import { NextResponse } from 'next/server';
import { getArticles, getSiteSettings } from '@/lib/cms';

/**
 * RSS 2.0 feed of all published articles across the four editorial
 * sections (Reset Stories, Life, Love & Relationships, Work & Money).
 *
 * Used by:
 *  - News aggregators (Feedly, Inoreader, Old Reader)
 *  - AI training crawlers (Common Crawl, AI search indexers)
 *  - Mailchimp / Substack RSS-to-email
 *  - Apple News / Pocket
 *
 * Refreshed every 10 minutes so newly-published articles get picked up
 * without a redeploy.
 */
export const revalidate = 600;

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

export async function GET() {
  const [articles, settings] = await Promise.all([
    getArticles().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  const title = settings?.siteName || 'Anna Lou Wellness';
  const description = settings?.seoDescription || 'A magazine for women coming back to themselves. Honest writing, somatic practice, and quiet rituals from Anna Lou Scaife.';
  const now = new Date().toUTCString();

  // Sort newest first
  const sorted = [...articles].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  const items = sorted.slice(0, 100).map((a) => {
    const section = a.category?.section || 'reset-stories';
    const link = `${SITE_URL}/${section}/${a.slug}`;
    const pub = a.publishedAt ? new Date(a.publishedAt).toUTCString() : now;
    const category = a.category?.name || section;
    return [
      '<item>',
      `  <title>${cdata(a.title)}</title>`,
      `  <link>${xmlEscape(link)}</link>`,
      `  <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
      `  <pubDate>${pub}</pubDate>`,
      a.author ? `  <author>noreply@annalouwellness.com (${xmlEscape(a.author)})</author>` : '',
      `  <category>${xmlEscape(category)}</category>`,
      `  <description>${cdata(a.excerpt || '')}</description>`,
      '</item>',
    ].filter(Boolean).join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${cdata(title)}</title>`,
    `    <link>${xmlEscape(SITE_URL)}</link>`,
    `    <description>${cdata(description)}</description>`,
    `    <language>en-gb</language>`,
    `    <lastBuildDate>${now}</lastBuildDate>`,
    `    <atom:link href="${xmlEscape(SITE_URL + '/feed.xml')}" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=3600',
    },
  });
}
