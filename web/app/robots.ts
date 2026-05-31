import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt', '/feed.xml', '/products.xml', '/ai-products.json', '/ai-products.jsonl'],
        // /wishlist is a private utility page (per-device localStorage only) — not useful to index
        disallow: ['/api/', '/admin/', '/checkout/', '/cart/', '/wishlist'],
      },
      // AI crawler allowlist — explicit allow so AI engines know they're welcome
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
