import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';
import { getArticles, getArticleCategories } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Work & Money',
  description: 'Founder reset, burnout and the nervous system, the Signal Method, career and direction, money and worth. Anna Lou Wellness.',
  openGraph: {
    title: 'Work & Money — Anna Lou Wellness',
    description: 'The work that matters.',
  },
};

export default async function WorkAndMoneyPage() {
  const [articles, categories] = await Promise.all([
    getArticles('work-and-money'),
    getArticleCategories('work-and-money'),
  ]);

  const feedArticles = articles.map(a => ({
    slug: a.slug,
    title: a.title,
    category: a.category?.name || 'Work & Money',
    categoryColour: a.category?.colour || '#FFD07A',
    date: a.readingTime || '',
    excerpt: a.excerpt || '',
    heroImage: a.heroImage || undefined,
  }));

  const subcategories = categories.map(c => ({
    label: c.name,
    href: `/work-and-money/${c.slug}`,
  }));

  return (
    <EditorialFeed
      kicker="Work & Money"
      kickerColour="#FFD07A"
      title="The work that matters."
      intro="Founder reset, burnout and the nervous system, the Signal Method, career and direction, and the relationship between money and worth."
      articles={feedArticles}
      sectionHref="/work-and-money"
      subcategories={subcategories}
      stockCategory="work-and-money"
    />
  );
}
