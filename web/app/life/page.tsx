import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import Pagination from '@/components/Pagination';
import { getArticlesPage, getArticleCategories, getSectionLandingPage, getFAQs } from '@/lib/cms';
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Life',
  description: 'Rituals and energy, home and space, style and beauty, food and nourishment, weekend finds. Anna Lou Wellness.',
  openGraph: {
    title: 'Life — Anna Lou Wellness',
    description: 'A life beautifully lived.',
  },
};

interface Props { searchParams: Promise<{ page?: string }> }

export default async function LifePage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const [articlesPage, categories, page, faqs] = await Promise.all([
    getArticlesPage('life', { page: currentPage, pageSize: 12 }),
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
  const articles = articlesPage.items;

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
        introBlocks={page.introBlocks}
        articles={feedArticles}
        sectionHref="/life"
        subcategories={subcategories}
        stockCategory="life"
        breadcrumb={{ parentLabel: 'Stories', parentHref: '/', currentLabel: 'Life' }}
      />
      <Pagination
        basePath="/life"
        page={articlesPage.page}
        pageCount={articlesPage.pageCount}
        total={articlesPage.total}
        accentColour="#FAA21B"
      />
      <FAQAccordion faqs={faqs} accentColour="#FAA21B" background="#F5F3EF" />
      <UpsellBlock items={page.upsells as unknown as UpsellItem[]} title="Where next." kicker="Continue exploring" />
    </>
  );
}
