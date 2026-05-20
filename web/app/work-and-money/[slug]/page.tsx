import { Metadata } from 'next';
import Link from 'next/link';
import { getArticleBySlug, getArticles, getArticleCategoryBySlug, getArticlesByCategorySlug, getArticleCategories } from '@/lib/cms';
import { ArticleSchema, BreadcrumbSchema } from '@/components/StructuredData';
import EditorialFeed from '@/components/EditorialFeed';
import { getStockImage } from '@/data/stock-images';
import Paywall from '@/components/Paywall';
import { previewBody } from '@/lib/article-utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (article) {
    const title = article.seoTitle || `${article.title} — Work & Money`;
    const description = article.seoDescription || article.excerpt || `${article.title}. Anna Lou Wellness.`;
    return {
      title,
      description,
      alternates: { canonical: `/work-and-money/${slug}` },
      openGraph: { title, description, type: 'article', url: `/work-and-money/${slug}`, images: article.heroImage ? [{ url: article.heroImage }] : undefined },
      twitter: { card: 'summary_large_image', title, description },
    };
  }
  const category = await getArticleCategoryBySlug(slug, 'work-and-money');
  if (category) {
    const title = `${category.name} — Work & Money`;
    return {
      title,
      description: category.description || `Stories about ${category.name}.`,
      alternates: { canonical: `/work-and-money/${slug}` },
    };
  }
  return { title: 'Not Found' };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    const category = await getArticleCategoryBySlug(slug, 'work-and-money');
    if (category) {
      const [categoryArticles, allCategories] = await Promise.all([
        getArticlesByCategorySlug(slug),
        getArticleCategories('work-and-money'),
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
        href: `/work-and-money/${c.slug}`,
      }));
      return (
        <EditorialFeed
          kicker={`Work & Money · ${category.name}`}
          kickerColour={category.colour}
          title={category.name}
          intro={category.description || `Stories filed under ${category.name}.`}
          articles={feedArticles}
          sectionHref="/work-and-money"
          subcategories={subcategories}
          activeSubcategoryHref={`/work-and-money/${slug}`}
          stockCategory="work-and-money"
        />
      );
    }
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
        <article className="article-page">
          <div className="article-inner">
            <nav className="article-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="article-breadcrumb-sep">›</span>
              <Link href="/work-and-money">Work & Money</Link>
            </nav>
            <p className="article-kicker" style={{ color: '#FFD07A' }}>Work & Money</p>
            <h1 className="article-title">{title}</h1>
            <p className="article-meta">By Anna Lou</p>
            <img src={getStockImage('work-and-money', slug)} alt={title} className="article-hero-img" style={{ objectFit: 'cover' }} />
            <div className="article-content"><p>This article is coming soon.</p></div>
          </div>
        </article>
      </>
    );
  }

  const relatedArticles = await getArticles('work-and-money');
  const related = relatedArticles.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <>
      <ArticleSchema title={article.title} description={article.seoDescription || article.excerpt} slug={slug} section="work-and-money" author={article.author} publishedAt={article.publishedAt} heroImage={article.heroImage} />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Work & Money', href: '/work-and-money' }, { name: article.title, href: `/work-and-money/${slug}` }]} />
      <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
      <article className="article-page">
        <div className="article-inner">
          <nav className="article-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="article-breadcrumb-sep">›</span>
            <Link href="/work-and-money">Work & Money</Link>
          </nav>
          <p className="article-kicker" style={{ color: article.category?.colour || '#FFD07A' }}>
            {article.category?.name || 'Work & Money'}
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
            src={article.heroImage || getStockImage('work-and-money', slug)}
            alt={article.title}
            className="article-hero-img"
            style={{ objectFit: 'cover' }}
          />
          <div className="article-content">
            {(article.isFree ? article.body : previewBody(article.body)).split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {!article.isFree && <Paywall substackUrl={article.substackUrl} accentColour={article.category?.colour || '#FFD07A'} />}

          {related.length > 0 && (
            <div className="article-related">
              <h3 className="article-related-title">More from Work & Money</h3>
              <div className="article-related-grid">
                {related.map(r => (
                  <Link key={r.slug} href={`/work-and-money/${r.slug}`} className="article-related-card">
                    <div className="article-related-img" style={{ background: 'linear-gradient(160deg,#fff0d2,#f5e0b8)' }} />
                    <p className="article-related-name">{r.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="article-newsletter">
            <p className="article-newsletter-kicker" style={{ color: '#FFD07A' }}>Reset Letters</p>
            <p className="article-newsletter-text">Stories like this, delivered weekly.</p>
            <a href="#" className="article-newsletter-btn">Join on Substack &rarr;</a>
          </div>
        </div>
      </article>
    </>
  );
}

const articleStyles = `
.article-page { background:#fff; padding:2rem 3rem 3rem; }
.article-inner { max-width:900px; margin:0 auto; }
.article-breadcrumb { font-family:Mulish,sans-serif; font-size:0.7rem; color:#8C8880; letter-spacing:0.05em; margin-bottom:1.25rem; text-align:center; }
.article-breadcrumb a { color:#8C8880; text-decoration:none; transition:color 0.2s; }
.article-breadcrumb a:hover { color:#D8A040; }
.article-breadcrumb-sep { margin:0 0.5rem; color:#c8c4bc; }
.article-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:0.5rem; text-align:center; }
.article-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.8rem,4vw,2.6rem); color:#231F20; line-height:1.3; margin-bottom:0.8rem; text-align:center; }
.article-meta { font-family:Mulish,sans-serif; font-size:0.72rem; color:#8C8880; letter-spacing:0.05em; margin-bottom:2rem; text-align:center; }
.article-paid-badge { display:inline-block; margin-left:0.5rem; padding:0.15rem 0.6rem; border-radius:20px; background:#FFE9C4; color:#A05A00; font-weight:600; letter-spacing:0.08em; font-size:0.6rem; text-transform:uppercase; }
.article-substack-link { color:#A87C00; text-decoration:none; border-bottom:1px solid currentColor; padding-bottom:1px; }
.article-substack-link:hover { color:#7C5A00; }
.article-hero-img { aspect-ratio:16/9; border-radius:6px; margin-bottom:2rem; width:100%; }
.article-content { font-family:'EB Garamond',Georgia,serif; font-size:1.1rem; color:#3D3D3A; line-height:1.9; margin-bottom:2.5rem; }
.article-content p { margin-bottom:1.5rem; }
.article-related { border-top:1px solid rgba(0,0,0,0.06); padding-top:2rem; margin-bottom:2rem; }
.article-related-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1rem; color:#231F20; margin-bottom:1rem; }
.article-related-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.article-related-card { text-decoration:none; display:block; }
.article-related-img { aspect-ratio:16/10; border-radius:6px; margin-bottom:0.5rem; }
.article-related-name { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#231F20; }
.article-newsletter { background:#E9EBF6; border-radius:8px; padding:2rem; text-align:center; }
.article-newsletter-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.3rem; }
.article-newsletter-text { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; margin-bottom:1rem; }
.article-newsletter-btn { background:#6E3A5A; color:#fff; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.7rem 1.8rem; border-radius:3px; transition:all 0.3s; display:inline-block; text-decoration:none; border:1px solid #6E3A5A; }
.article-newsletter-btn:hover { background:#5A2E4A; }
@media (max-width:900px) { .article-page { padding:1.5rem 1.2rem 2rem; } .article-related-grid { grid-template-columns:1fr; } }
`;
