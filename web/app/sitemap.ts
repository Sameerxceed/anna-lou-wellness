import { MetadataRoute } from 'next';
import { getArticles, getProducts } from '@/lib/cms';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://annalouwellness.com';
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/reset-stories`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/life`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/love-and-relationships`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/work-and-money`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/experiences`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/experiences/retreats`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/experiences/workshops`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/experiences/corporate-wellbeing`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/experiences/speaking`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/the-work`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/the-work/ways-to-work-with-me`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/the-work/sessions`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/the-work/the-reset`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/the-work/signal`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/the-work/signal-and-build`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/the-work/one-day`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/the-work/signal-collective`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/the-work/recovery`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/the-work/sessions/founder-reset`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/the-work/sessions/dating-reset`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/the-work/sessions/nervous-system-reset`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/the-work/quiz`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/the-work/client-stories`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/free/nervous-system-decoder`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/shop`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/shop/new-in`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/shop/emotional-support-jewellery`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/shop/personalised`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/community`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/community/the-returning-circle`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/community/reset-room`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/community/events`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/community/resources`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/about/press`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/about/partnerships`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/cosmic-forecast`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/mantras`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Dynamic article pages
  const articleSections = ['reset-stories', 'life', 'love-and-relationships', 'work-and-money'];
  const articleEntries: MetadataRoute.Sitemap = [];
  for (const section of articleSections) {
    try {
      const articles = await getArticles(section);
      for (const article of articles) {
        articleEntries.push({
          url: `${siteUrl}/${section}/${article.slug}`,
          lastModified: article.publishedAt ? new Date(article.publishedAt) : now,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    } catch {}
  }

  // Dynamic product pages
  const productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    for (const product of products) {
      productEntries.push({
        url: `${siteUrl}/shop/${product.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  } catch {}

  return [...staticPages, ...articleEntries, ...productEntries];
}
