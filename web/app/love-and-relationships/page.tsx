import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import Pagination from '@/components/Pagination';
import { getArticlesPage, getArticleCategories, getSectionLandingPage, getFAQs } from '@/lib/cms';
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Love & Relationships',
  description: 'Dating and patterns, breakups and reset, friendship, motherhood, self worth and identity. Anna Lou Wellness.',
  openGraph: {
    title: 'Love & Relationships — Anna Lou Wellness',
    description: 'The people who shape us.',
  },
};

interface Props { searchParams: Promise<{ page?: string }> }

export default async function LoveAndRelationshipsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const [articlesPage, categories, page, faqs] = await Promise.all([
    getArticlesPage('love-and-relationships', { page: currentPage, pageSize: 12 }),
    getArticleCategories('love-and-relationships'),
    getSectionLandingPage('/love-and-relationships-page', {
      kicker: 'Love & Relationships',
      title: 'The people who shape us.',
      intro: 'Dating and patterns, breakups and reset, friendship, motherhood, and the quiet work of understanding your own worth.',
      heroImage: '',
      kickerColour: '#F280AA',
    }),
    getFAQs({ page: 'love-and-relationships' }).catch(() => []),
  ]);
  const articles = articlesPage.items;

  const feedArticles = articles.map(a => ({
    slug: a.slug,
    title: a.title,
    category: a.category?.name || 'Love & Relationships',
    categoryColour: a.category?.colour || '#F280AA',
    date: a.readingTime || '',
    excerpt: a.excerpt || '',
    heroImage: a.heroImage || undefined,
    isFree: a.isFree,
  }));

  const subcategories = categories.map(c => ({
    label: c.name,
    href: `/love-and-relationships/${c.slug}`,
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
        sectionHref="/love-and-relationships"
        subcategories={subcategories}
        stockCategory="love-and-relationships"
        breadcrumb={{ parentLabel: 'Stories', parentHref: '/', currentLabel: 'Love & Relationships' }}
      />
      <Pagination
        basePath="/love-and-relationships"
        page={articlesPage.page}
        pageCount={articlesPage.pageCount}
        total={articlesPage.total}
        accentColour="#F280AA"
      />
      <FAQAccordion faqs={faqs} accentColour="#F280AA" background="#F5F3EF" />
      <UpsellBlock items={page.upsells as unknown as UpsellItem[]} title="Where next." kicker="Continue exploring" />
    </>
  );
}
