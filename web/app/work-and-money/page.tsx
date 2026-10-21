import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import Pagination from '@/components/Pagination';
import { getArticlesPage, getArticleCategories, getSectionLandingPage, getFAQs } from '@/lib/cms';
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Work & Money',
  description: 'Founder reset, burnout and the nervous system, the Signal Method, career and direction, money and worth. Anna Lou Wellness.',
  openGraph: {
    title: 'Work & Money — Anna Lou Wellness',
    description: 'The work that matters.',
  },
};

interface Props { searchParams: Promise<{ page?: string }> }

export default async function WorkAndMoneyPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const [articlesPage, categories, page, faqs] = await Promise.all([
    getArticlesPage('work-and-money', { page: currentPage, pageSize: 12 }),
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
  const articles = articlesPage.items;

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
        introBlocks={page.introBlocks}
        articles={feedArticles}
        sectionHref="/work-and-money"
        subcategories={subcategories}
        stockCategory="work-and-money"
        breadcrumb={{ parentLabel: 'Stories', parentHref: '/', currentLabel: 'Work & Money' }}
      />
      <Pagination
        basePath="/work-and-money"
        page={articlesPage.page}
        pageCount={articlesPage.pageCount}
        total={articlesPage.total}
        accentColour="#FFD07A"
      />
      <FAQAccordion faqs={faqs} accentColour="#FFD07A" background="#F5F3EF" />
      <UpsellBlock items={page.upsells as unknown as UpsellItem[]} title="Where next." kicker="Continue exploring" />
    </>
  );
}
