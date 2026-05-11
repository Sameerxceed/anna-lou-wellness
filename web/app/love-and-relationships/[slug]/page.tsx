import { Metadata } from 'next';
import Link from 'next/link';
import { getArticleBySlug, getArticles, getArticleCategoryBySlug, getArticlesByCategorySlug } from '@/lib/cms';
import { ArticleSchema, BreadcrumbSchema } from '@/components/StructuredData';
import EditorialFeed from '@/components/EditorialFeed';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (article) {
    const title = article.seoTitle || `${article.title} — Love & Relationships`;
    const description = article.seoDescription || article.excerpt || `${article.title}. Anna Lou Wellness.`;
    return {
      title,
      description,
      alternates: { canonical: `/love-and-relationships/${slug}` },
      openGraph: { title, description, type: 'article', url: `/love-and-relationships/${slug}`, images: article.heroImage ? [{ url: article.heroImage }] : undefined },
      twitter: { card: 'summary_large_image', title, description },
    };
  }
  const category = await getArticleCategoryBySlug(slug, 'love-and-relationships');
  if (category) {
    const title = `${category.name} — Love & Relationships`;
    return {
      title,
      description: category.description || `Stories about ${category.name}.`,
      alternates: { canonical: `/love-and-relationships/${slug}` },
    };
  }
  return { title: 'Not Found' };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    const category = await getArticleCategoryBySlug(slug, 'love-and-relationships');
    if (category) {
      const categoryArticles = await getArticlesByCategorySlug(slug);
      const feedArticles = categoryArticles.map(a => ({
        slug: a.slug,
        title: a.title,
        category: a.category?.name || category.name,
        categoryColour: a.category?.colour || category.colour,
        date: a.readingTime || '',
        excerpt: a.excerpt || '',
        imageGradient: 'linear-gradient(160deg,#fce8ef,#f5d0de)',
      }));
      return (
        <EditorialFeed
          kicker={`Love & Relationships · ${category.name}`}
          kickerColour={category.colour}
          title={category.name}
          intro={category.description || `Stories filed under ${category.name}.`}
          articles={feedArticles}
          sectionHref="/love-and-relationships"
        />
      );
    }
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
        <article className="article-page">
          <div className="article-inner">
            <p className="article-kicker" style={{ color: '#F280AA' }}>Love & Relationships</p>
            <h1 className="article-title">{title}</h1>
            <p className="article-meta">By Anna Lou</p>
            <div className="article-hero-img" style={{ background: 'linear-gradient(160deg,#fce8ef,#f5d0de)' }} />
            <div className="article-content"><p>This article is coming soon.</p></div>
          </div>
        </article>
      </>
    );
  }

  const relatedArticles = await getArticles('love-and-relationships');
  const related = relatedArticles.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <>
      <ArticleSchema title={article.title} description={article.seoDescription || article.excerpt} slug={slug} section="love-and-relationships" author={article.author} publishedAt={article.publishedAt} heroImage={article.heroImage} />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Love & Relationships', href: '/love-and-relationships' }, { name: article.title, href: `/love-and-relationships/${slug}` }]} />
      <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
      <article className="article-page">
        <div className="article-inner">
          <p className="article-kicker" style={{ color: article.category?.colour || '#F280AA' }}>
            {article.category?.name || 'Love & Relationships'}
          </p>
          <h1 className="article-title">{article.title}</h1>
          <p className="article-meta">By {article.author} &middot; {article.readingTime}</p>
          {article.heroImage ? (
            <img src={article.heroImage} alt={article.title} className="article-hero-img" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="article-hero-img" style={{ background: 'linear-gradient(160deg,#fce8ef,#f5d0de)' }} />
          )}
          <div className="article-content">
            {article.body.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {related.length > 0 && (
            <div className="article-related">
              <h3 className="article-related-title">More from Love & Relationships</h3>
              <div className="article-related-grid">
                {related.map(r => (
                  <Link key={r.slug} href={`/love-and-relationships/${r.slug}`} className="article-related-card">
                    <div className="article-related-img" style={{ background: 'linear-gradient(160deg,#fce8ef,#f5d0de)' }} />
                    <p className="article-related-name">{r.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="article-newsletter">
            <p className="article-newsletter-kicker" style={{ color: '#F280AA' }}>Reset Letters</p>
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
.article-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:0.5rem; text-align:center; }
.article-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.8rem,4vw,2.6rem); color:#231F20; line-height:1.3; margin-bottom:0.8rem; text-align:center; }
.article-meta { font-family:Mulish,sans-serif; font-size:0.72rem; color:#8C8880; letter-spacing:0.05em; margin-bottom:2rem; text-align:center; }
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
