import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const NON_INDEXABLE_HOSTS = new Set([
  'staging.annalouwellness.com',
]);

export function GET(req: NextRequest) {
  const host = req.headers.get('host')?.toLowerCase() || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com';

  if (NON_INDEXABLE_HOSTS.has(host)) {
    const body = [
      'User-agent: *',
      'Disallow: /',
      '',
    ].join('\n');
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  const lines: string[] = [
    'User-agent: *',
    'Allow: /',
    'Allow: /llms.txt',
    'Allow: /feed.xml',
    'Allow: /products.xml',
    'Allow: /ai-products.json',
    'Allow: /ai-products.jsonl',
    'Disallow: /api/',
    'Disallow: /admin/',
    'Disallow: /checkout/',
    'Disallow: /cart/',
    'Disallow: /wishlist',
    '',
  ];

  const aiCrawlers = [
    'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended',
    'CCBot', 'Bingbot', 'Applebot-Extended', 'anthropic-ai',
    'cohere-ai', 'OAI-SearchBot',
  ];
  for (const ua of aiCrawlers) {
    lines.push(`User-agent: ${ua}`);
    lines.push('Allow: /');
    lines.push('');
  }

  lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
  lines.push('');

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
