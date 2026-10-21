import { Metadata } from 'next';
import EditorialFeed from '@/components/EditorialFeed';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import Pagination from '@/components/Pagination';
import { getArticlesPage, getArticleCategories, getSectionLandingPage, getFAQs } from '@/lib/cms';
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Reset Stories',
  description: 'Honest stories about coming back to yourself. Somatic coaching, healing, and the return to self. Anna Lou Wellness.',
  openGraph: {
    title: 'Reset Stories — Anna Lou Wellness',
    description: 'Honest stories about coming back to yourself.',
  },
};

interface Props { searchParams: Promise<{ page?: string }> }

export default async function ResetStoriesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const [articlesPage, categories, page, faqs] = await Promise.all([
    getArticlesPage('reset-stories', { page: currentPage, pageSize: 12 }),
    getArticleCategories('reset-stories'),
    getSectionLandingPage('/reset-stories-page', {
      kicker: 'Reset Stories',
      title: 'Come back to yourself.',
      intro: 'Honest stories about what it actually feels like to live in full alignment with who you are. Not the managed version. Not the performing one. The whole one.',
      heroImage: '',
      kickerColour: '#6E3A5A',
    }),
    getFAQs({ page: 'reset-stories' }).catch(() => []),
  ]);
  const articles = articlesPage.items;

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
    <>
      <EditorialFeed
        kicker={page.kicker}
        kickerColour={page.kickerColour}
        title={page.title}
        intro={page.intro}
        introBlocks={page.introBlocks}
        articles={feedArticles}
        sectionHref="/reset-stories"
        subcategories={subcategories}
        stockCategory="reset-stories"
        breadcrumb={{ parentLabel: 'Stories', parentHref: '/', currentLabel: 'Reset Stories' }}
      />
      <Pagination
        basePath="/reset-stories"
        page={articlesPage.page}
        pageCount={articlesPage.pageCount}
        total={articlesPage.total}
        accentColour="#6E3A5A"
      />
      <FAQAccordion faqs={faqs} accentColour="#6E3A5A" background="#F5F3EF" />
      <UpsellBlock items={page.upsells as unknown as UpsellItem[]} title="Where next." kicker="Continue exploring" />
    </>
  );
}
