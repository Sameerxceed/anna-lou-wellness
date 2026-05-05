import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com';
  const now = new Date();

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/reset-stories', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/life', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/love-and-relationships', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/work-and-money', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/experiences', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/the-work', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/the-work/ways-to-work-with-me', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/the-work/quiz', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/the-work/client-stories', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/the-work/sessions', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/shop', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/community', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/community/the-returning-circle', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/community/membership', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/community/events', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/community/resources', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/about/press', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/about/contact', priority: 0.5, changeFrequency: 'yearly' as const },
    { url: '/cosmic-forecast', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/mantras', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.2, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.2, changeFrequency: 'yearly' as const },
  ];

  return staticPages.map(page => ({
    url: `${siteUrl}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // TODO: Add dynamic pages from Strapi (blog posts, products) when CMS is connected
}
