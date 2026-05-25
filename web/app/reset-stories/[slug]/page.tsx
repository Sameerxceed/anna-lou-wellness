import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticles, getArticleCategoryBySlug, getArticlesByCategorySlug, getArticleCategories } from '@/lib/cms';
import { ArticleSchema, BreadcrumbSchema } from '@/components/StructuredData';
import EditorialFeed from '@/components/EditorialFeed';
import { getStockImage } from '@/data/stock-images';
import Paywall from '@/components/Paywall';
import { previewBody } from '@/lib/article-utils';
import ShopTheStory from '@/components/ShopTheStory';
import { accentForText } from '@/lib/colours';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (article) {
    const title = article.seoTitle || `${article.title} — Reset Stories`;
    const description = article.seoDescription || article.excerpt || `${article.title}. A Reset Story by Anna Lou.`;
    return {
      title,
      description,
      alternates: { canonical: `/reset-stories/${slug}` },
      openGraph: { title, description, type: 'article', url: `/reset-stories/${slug}`, images: article.heroImage ? [{ url: article.heroImage }] : undefined },
      twitter: { card: 'summary_large_image', title, description },
    };
  }
  // Maybe it's a category
  const category = await getArticleCategoryBySlug(slug, 'reset-stories');
  if (category) {
    const title = `${category.name} — Reset Stories`;
    const description = category.description || `Reset Stories: ${category.name}. Honest stories about coming back to yourself.`;
    return {
      title,
      description,
      alternates: { canonical: `/reset-stories/${slug}` },
      openGraph: { title, description, type: 'website', url: `/reset-stories/${slug}` },
    };
  }
  return { title: 'Not Found' };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    // Try to render as a category filter view
    const category = await getArticleCategoryBySlug(slug, 'reset-stories');
    if (category) {
      const [categoryArticles, allCategories] = await Promise.all([
        getArticlesByCategorySlug(slug),
        getArticleCategories('reset-stories'),
      ]);
      const feedArticles = categoryArticles.map(a => ({
        slug: a.slug,
        title: a.title,
        category: a.category?.name || category.name,
        categoryColour: a.category?.colour || category.colour,
        date: a.readingTime || '',
        excerpt: a.excerpt || '',
        heroImage: a.heroImage || undefined,
        isFree: a.isFree,
      }));
      const subcategories = allCategories.map(c => ({
        label: c.name,
        href: `/reset-stories/${c.slug}`,
      }));
      return (
        <EditorialFeed
          kicker={`Reset Stories · ${category.name}`}
          kickerColour={category.colour}
          title={category.name}
          intro={category.description || ''}
          articles={feedArticles}
          sectionHref="/reset-stories"
          subcategories={subcategories}
          activeSubcategoryHref={`/reset-stories/${slug}`}
          stockCategory="reset-stories"
          breadcrumb={{ parentLabel: 'Reset Stories', parentHref: '/reset-stories', currentLabel: category.name }}
          hideKicker
        />
      );
    }
    // Coming-soon fallback
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
        <article className="article-page">
          <div className="article-inner">
            <nav className="article-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="article-breadcrumb-sep">›</span>
              <Link href="/reset-stories">Reset Stories</Link>
            </nav>
            <p className="article-kicker" style={{ color: '#6E3A5A' }}>Reset Stories</p>
            <h1 className="article-title">{title}</h1>
            <p className="article-meta">By Anna Lou</p>
            <img src={getStockImage('reset-stories', slug)} alt={title} className="article-hero-img" style={{ objectFit: 'cover' }} />
            <div className="article-content">
              <p>This article is coming soon. Check back shortly.</p>
            </div>
          </div>
        </article>
      </>
    );
  }

  const relatedArticles = await getArticles('reset-stories');
  const related = relatedArticles.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <>
      <ArticleSchema title={article.title} description={article.seoDescription || article.excerpt} slug={slug} section="reset-stories" author={article.author} publishedAt={article.publishedAt} heroImage={article.heroImage} />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Reset Stories', href: '/reset-stories' }, { name: article.title, href: `/reset-stories/${slug}` }]} />
      <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
      <article className="article-page">
        <div className="article-inner">
          <nav className="article-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="article-breadcrumb-sep">›</span>
            <Link href="/reset-stories">Reset Stories</Link>
          </nav>
          <p className="article-kicker" style={{ color: accentForText(article.category?.colour) }}>
            {article.category?.name || 'Reset Stories'}
          </p>
          <h1 className="article-title">{article.title}</h1>
          <p className="article-meta">
            By {article.author} &middot; {article.readingTime}
            {!article.isFree && <span className="article-paid-badge">Paid · Subscribers only</span>}
            {article.substackUrl && (
              <>
                {' '}&middot;{' '}
                <a href={article.substackUrl} target="_blank" rel="noopener noreferrer" className="article-substack-link">
                  Read on Substack &rarr;
                </a>
              </>
            )}
          </p>
          <img
            src={article.heroImage || getStockImage('reset-stories', slug)}
            alt={article.title}
            className="article-hero-img"
            style={{ objectFit: 'cover' }}
          />
          <div className="article-content">
            {(article.isFree ? article.body : previewBody(article.body)).split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {!article.isFree && <Paywall substackUrl={article.substackUrl} accentColour={article.category?.colour || '#6E3A5A'} />}

          <ShopTheStory tags={article.shopTags} accentColour={article.category?.colour || '#6E3A5A'} />

          {related.length > 0 && (
            <div className="article-related">
              <h3 className="article-related-title">More Reset Stories</h3>
              <div className="article-related-grid">
                {related.map(r => (
                  <Link key={r.slug} href={`/reset-stories/${r.slug}`} className="article-related-card">
                    <div className="article-related-img" />
                    <p className="article-related-name">{r.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="article-newsletter">
            <p className="article-newsletter-kicker">Reset Letters</p>
            <p className="article-newsletter-text">Stories like this, delivered weekly.</p>
            <Link href="/reset-letters" className="article-newsletter-btn">Join Reset Letters &rarr;</Link>
          </div>
        </div>
      </article>
    </>
  );
}

const articleStyles = `
.article-page { background:#fff; padding:2rem 3rem 3rem; }
.article-inner { max-width:900px; margin:0 auto; }
.article-breadcrumb { font-family:Mulish,sans-serif; font-size:0.7rem; color:#5D5A52; letter-spacing:0.05em; margin-bottom:1.25rem; text-align:center; }
.article-breadcrumb a { color:#5D5A52; text-decoration:none; transition:color 0.2s; }
.article-breadcrumb a:hover { color:#6E3A5A; }
.article-breadcrumb-sep { margin:0 0.5rem; color:#c8c4bc; }
.article-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:0.5rem; text-align:center; }
.article-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.8rem,4vw,2.6rem); color:#231F20; line-height:1.3; margin-bottom:0.8rem; text-align:center; }
.article-meta { font-family:Mulish,sans-serif; font-size:0.72rem; color:#5D5A52; letter-spacing:0.05em; margin-bottom:2rem; text-align:center; }
.article-paid-badge { display:inline-block; margin-left:0.5rem; padding:0.15rem 0.6rem; border-radius:20px; background:#FFE9C4; color:#A05A00; font-weight:600; letter-spacing:0.08em; font-size:0.6rem; text-transform:uppercase; }
.article-substack-link { color:#6E3A5A; text-decoration:none; border-bottom:1px solid currentColor; padding-bottom:1px; }
.article-substack-link:hover { color:#5A2E4A; }
.article-hero-img { aspect-ratio:16/9; border-radius:6px; background:linear-gradient(160deg,#e8ddd0,#d4c5b3); margin-bottom:2rem; width:100%; }
.article-content { font-family:'EB Garamond',Georgia,serif; font-size:1.1rem; color:#3D3D3A; line-height:1.9; margin-bottom:2.5rem; }
.article-content p { margin-bottom:1.5rem; }
.article-related { border-top:1px solid rgba(0,0,0,0.06); padding-top:2rem; margin-bottom:2rem; }
.article-related-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1rem; color:#231F20; margin-bottom:1rem; }
.article-related-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.article-related-card { text-decoration:none; display:block; }
.article-related-img { aspect-ratio:16/10; border-radius:6px; background:linear-gradient(160deg,#e2d6ca,#d4c6b8); margin-bottom:0.5rem; }
.article-related-name { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#231F20; }
.article-newsletter { background:#E9EBF6; border-radius:8px; padding:2rem; text-align:center; }
.article-newsletter-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.3rem; }
.article-newsletter-text { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; margin-bottom:1rem; }
.article-newsletter-btn { background:#6E3A5A; color:#fff; border:1px solid #6E3A5A; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.7rem 1.8rem; border-radius:3px; transition:all 0.3s; display:inline-block; text-decoration:none; }
.article-newsletter-btn:hover { background:#5A2E4A; }
@media (max-width:900px) {
  .article-page { padding:1.5rem 1.2rem 2rem; }
  .article-related-grid { grid-template-columns:1fr; }
}
`;
