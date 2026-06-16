import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';
import FAQAccordion from '@/components/FAQAccordion';
import { getArticles, getArticleCategories, getSectionLandingPage, getFAQs } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Work & Money',
  description: 'Founder reset, burnout and the nervous system, the Signal Method, career and direction, money and worth. Anna Lou Wellness.',
  openGraph: {
    title: 'Work & Money — Anna Lou Wellness',
    description: 'The work that matters.',
  },
};

export default async function WorkAndMoneyPage() {
  const [articles, categories, page, faqs] = await Promise.all([
    getArticles('work-and-money'),
    getArticleCategories('work-and-money'),
    getSectionLandingPage('/work-and-money-page', {
      kicker: 'Work & Money',
      title: 'The work that matters.',
      intro: 'Founder reset, burnout and the nervous system, the Signal Method, career and direction, and the relationship between money and worth.',
      heroImage: '',
      kickerColour: '#FFD07A',
    }),
    getFAQs({ page: 'work-and-money' }).catch(() => []),
  ]);

  const feedArticles = articles.map(a => ({
    slug: a.slug,
    title: a.title,
    category: a.category?.name || 'Work & Money',
    categoryColour: a.category?.colour || '#FFD07A',
    date: a.readingTime || '',
    excerpt: a.excerpt || '',
    heroImage: a.heroImage || undefined,
    isFree: a.isFree,
  }));

  const subcategories = categories.map(c => ({
    label: c.name,
    href: `/work-and-money/${c.slug}`,
  }));

  return (
    <>
      <EditorialFeed
        kicker={page.kicker}
        kickerColour={page.kickerColour}
        title={page.title}
        intro={page.intro}
        articles={feedArticles}
        sectionHref="/work-and-money"
        subcategories={subcategories}
        stockCategory="work-and-money"
        breadcrumb={{ parentLabel: 'Stories', parentHref: '/', currentLabel: 'Work & Money' }}
      />
      <FAQAccordion faqs={faqs} accentColour="#FFD07A" background="#F5F3EF" />
    </>
  );
}
