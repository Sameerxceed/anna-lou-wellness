import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import { getArticles, getArticleCategories, getSectionLandingPage, getFAQs } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Life',
  description: 'Rituals and energy, home and space, style and beauty, food and nourishment, weekend finds. Anna Lou Wellness.',
  openGraph: {
    title: 'Life — Anna Lou Wellness',
    description: 'A life beautifully lived.',
  },
};

export default async function LifePage() {
  const [articles, categories, page, faqs] = await Promise.all([
    getArticles('life'),
    getArticleCategories('life'),
    getSectionLandingPage('/life-page', {
      kicker: 'Life',
      title: 'A life beautifully lived.',
      intro: 'Rituals and energy, home and space, style and beauty, food and nourishment, and the things that catch my eye each week.',
      heroImage: '',
      kickerColour: '#FAA21B',
    }),
    getFAQs({ page: 'life' }).catch(() => []),
  ]);

  const feedArticles = articles.map(a => ({
    slug: a.slug,
    title: a.title,
    category: a.category?.name || 'Life',
    categoryColour: a.category?.colour || '#FAA21B',
    date: a.readingTime || '',
    excerpt: a.excerpt || '',
    heroImage: a.heroImage || undefined,
    isFree: a.isFree,
  }));

  const subcategories = categories.map(c => ({
    label: c.name,
    href: `/life/${c.slug}`,
  }));

  return (
    <>
      <EditorialFeed
        kicker={page.kicker}
        kickerColour={page.kickerColour}
        title={page.title}
        intro={page.intro}
        articles={feedArticles}
        sectionHref="/life"
        subcategories={subcategories}
        stockCategory="life"
        breadcrumb={{ parentLabel: 'Stories', parentHref: '/', currentLabel: 'Life' }}
      />
      <FAQAccordion faqs={faqs} accentColour="#FAA21B" background="#F5F3EF" />
      <UpsellBlock items={page.upsells as unknown as UpsellItem[]} title="Where next." kicker="Continue exploring" />
    </>
  );
}
