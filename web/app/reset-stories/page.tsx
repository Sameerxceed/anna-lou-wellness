import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';
import { getArticles, getArticleCategories, getSectionLandingPage } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Reset Stories',
  description: 'Honest stories about coming back to yourself. Somatic coaching, healing, and the return to self. Anna Lou Wellness.',
  openGraph: {
    title: 'Reset Stories — Anna Lou Wellness',
    description: 'Honest stories about coming back to yourself.',
  },
};

export default async function ResetStoriesPage() {
  const [articles, categories, page] = await Promise.all([
    getArticles('reset-stories'),
    getArticleCategories('reset-stories'),
    getSectionLandingPage('/reset-stories-page', {
      kicker: 'Reset Stories',
      title: 'Come back to yourself.',
      intro: 'Honest stories about what it actually feels like to live in full alignment with who you are. Not the managed version. Not the performing one. The whole one.',
      heroImage: '',
      kickerColour: '#6E3A5A',
    }),
  ]);

  const feedArticles = articles.map(a => ({
    slug: a.slug,
    title: a.title,
    category: a.category?.name || 'Reset Stories',
    categoryColour: a.category?.colour || '#6E3A5A',
    date: a.readingTime || '',
    excerpt: a.excerpt || '',
    heroImage: a.heroImage || undefined,
    isFree: a.isFree,
  }));

  const subcategories = categories.map(c => ({
    label: c.name,
    href: `/reset-stories/${c.slug}`,
  }));

  return (
    <EditorialFeed
      kicker={page.kicker}
      kickerColour={page.kickerColour}
      title={page.title}
      intro={page.intro}
      articles={feedArticles}
      sectionHref="/reset-stories"
      subcategories={subcategories}
      stockCategory="reset-stories"
    />
  );
}
