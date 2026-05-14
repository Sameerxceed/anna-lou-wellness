import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';
import { getArticles, getArticleCategories } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Life',
  description: 'Rituals and energy, home and space, style and beauty, food and nourishment, weekend finds. Anna Lou Wellness.',
  openGraph: {
    title: 'Life — Anna Lou Wellness',
    description: 'A life beautifully lived.',
  },
};

export default async function LifePage() {
  const [articles, categories] = await Promise.all([
    getArticles('life'),
    getArticleCategories('life'),
  ]);

  const feedArticles = articles.map(a => ({
    slug: a.slug,
    title: a.title,
    category: a.category?.name || 'Life',
    categoryColour: a.category?.colour || '#FAA21B',
    date: a.readingTime || '',
    excerpt: a.excerpt || '',
    heroImage: a.heroImage || undefined,
  }));

  const subcategories = categories.map(c => ({
    label: c.name,
    href: `/life/${c.slug}`,
  }));

  return (
    <EditorialFeed
      kicker="Life"
      kickerColour="#FAA21B"
      title="A life beautifully lived."
      intro="Rituals and energy, home and space, style and beauty, food and nourishment, and the things that catch my eye each week."
      articles={feedArticles}
      sectionHref="/life"
      subcategories={subcategories}
      stockCategory="life"
    />
  );
}
