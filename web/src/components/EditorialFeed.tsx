import Link from 'next/link';
import { getStockImage, type StockCategory } from '@/data/stock-images';

interface Article {
  slug: string;
  title: string;
  category: string;
  categoryColour: string;
  date: string;
  excerpt: string;
  imageGradient?: string;
  heroImage?: string;
  isFree?: boolean;
}

interface EditorialFeedProps {
  kicker: string;
  kickerColour: string;
  title: string;
  intro: string;
  articles: Article[];
  sectionHref: string;
  subcategories?: Array<{ label: string; href: string }>;
  activeSubcategoryHref?: string; // when on a subcategory view, mark the matching tab active
  stockCategory?: StockCategory; // controls fallback image pool when articles have no heroImage
}

export default function EditorialFeed({
  kicker,
  kickerColour,
  title,
  intro,
  articles,
  sectionHref,
  subcategories,
  activeSubcategoryHref,
  stockCategory = 'reset-stories',
}: EditorialFeedProps) {
  const imageFor = (article: Article) =>
    article.heroImage || getStockImage(stockCategory, article.slug);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: feedStyles }} />

      {/* Section header */}
      <section className="feed-header">
        <div className="feed-header-inner reveal">
          <p className="feed-kicker" style={{ color: kickerColour }}>{kicker}</p>
          <h1 className="feed-title">{title}</h1>
          <p className="feed-intro">{intro}</p>
        </div>

        {/* Subcategory filter */}
        {subcategories && subcategories.length > 0 && (
          <nav className="feed-filters reveal">
            <Link
              href={sectionHref}
              className={`feed-filter${!activeSubcategoryHref ? ' active' : ''}`}
            >
              All
            </Link>
            {subcategories.map(sub => (
              <Link
                key={sub.href}
                href={sub.href}
                className={`feed-filter${activeSubcategoryHref === sub.href ? ' active' : ''}`}
              >
                {sub.label}
              </Link>
            ))}
          </nav>
        )}
      </section>

      {/* Featured article (first one) */}
      {articles.length > 0 && (
        <section className="feed-featured">
          <div className="feed-featured-inner">
            <div
              className="feed-featured-img reveal"
              style={{
                backgroundImage: `url('${imageFor(articles[0])}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="reveal rd1">
              <p className="feed-article-cat" style={{ color: articles[0].categoryColour }}>{articles[0].category}</p>
              <h2 className="feed-featured-title">{articles[0].title}</h2>
              <p className="feed-featured-date">{articles[0].date}</p>
              <p className="feed-featured-excerpt">{articles[0].excerpt}</p>
              <Link href={`${sectionHref}/${articles[0].slug}`} className="feed-read-link" style={{ color: kickerColour }}>
                Continue reading <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Article grid */}
      {articles.length > 1 && (
        <section className="feed-grid-section">
          <div className="feed-grid">
            {articles.slice(1).map((article, i) => (
              <Link key={article.slug} href={`${sectionHref}/${article.slug}`} className={`feed-card reveal${i > 0 ? ` rd${i}` : ''}`}>
                <div
                  className="feed-card-img"
                  style={{
                    backgroundImage: `url('${imageFor(article)}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {article.isFree === false && <span className="feed-card-paid">Paid</span>}
                </div>
                <div className="feed-card-body">
                  <p className="feed-article-cat" style={{ color: article.categoryColour }}>{article.category}</p>
                  <h3 className="feed-card-title">{article.title}</h3>
                  <p className="feed-card-date">{article.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {articles.length === 0 && (
        <section className="feed-empty">
          <p className="feed-empty-text">New stories are landing in this section soon. <br />Join Reset Letters to be the first to read them.</p>
          <Link href="/reset-letters" className="feed-empty-cta" style={{ color: kickerColour, borderColor: kickerColour }}>
            Join Reset Letters &rarr;
          </Link>
        </section>
      )}

      {/* Inline Substack sign-up */}
      <section className="feed-newsletter reveal">
        <p className="feed-newsletter-kicker" style={{ color: kickerColour }}>Reset Letters</p>
        <h3 className="feed-newsletter-title">Stories like this, delivered weekly.</h3>
        <p className="feed-newsletter-body">Honest writing about your inner world, jewellery with meaning, and what it actually feels like to return to yourself.</p>
        <a href="#" className="feed-newsletter-btn">Join on Substack &rarr;</a>
      </section>
    </>
  );
}

const feedStyles = `
/* ═══ FEED HEADER ═══ */
.feed-header { background:#fff; padding:2rem 3rem 1rem; }
.feed-header-inner { max-width:800px; margin:0 auto; text-align:center; }
.feed-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.5rem; }
.feed-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(2rem,5vw,3.2rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:1rem; }
.feed-intro { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.85; max-width:800px; margin:0 auto; }

/* ═══ SUBCATEGORY FILTERS ═══ */
.feed-filters { display:flex; justify-content:center; align-items:center; gap:1.25rem; flex-wrap:nowrap; padding:1rem 2rem 0.5rem; max-width:1400px; margin:0 auto; overflow-x:auto; -webkit-overflow-scrolling:touch; }
.feed-filters::-webkit-scrollbar { display:none; }
.feed-filter { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.08em; text-transform:uppercase; color:#8C8880; text-decoration:none; padding-bottom:3px; border-bottom:2px solid transparent; transition:all 0.3s; white-space:nowrap; flex-shrink:0; }
.feed-filter:hover, .feed-filter.active { color:#231F20; border-bottom-color:#231F20; }
@media (max-width:640px) {
  .feed-filters { flex-wrap:wrap; justify-content:center; gap:0.7rem 1.1rem; padding:1rem 1rem 0.5rem; overflow-x:visible; }
  .feed-filter { font-size:0.75rem; letter-spacing:0.06em; padding-bottom:2px; }
}

/* ═══ FEATURED ARTICLE ═══ */
.feed-featured { background:#fff; padding:1.5rem 3rem; }
.feed-featured-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1.1fr 0.9fr; gap:2.5rem; align-items:center; }
.feed-featured-img { aspect-ratio:4/3; border-radius:6px; overflow:hidden; max-height:380px; }
.feed-featured-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.4rem,2.5vw,1.9rem); color:#231F20; line-height:1.35; margin-bottom:0.6rem; }
.feed-featured-date { font-family:Mulish,sans-serif; font-size:0.72rem; color:#8C8880; letter-spacing:0.05em; margin-bottom:0.8rem; }
.feed-featured-excerpt { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; line-height:1.8; margin-bottom:1rem; }
.feed-read-link { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; border-bottom:1px solid currentColor; padding-bottom:2px; transition:all 0.3s; display:inline-flex; align-items:center; gap:0.4rem; text-decoration:none; }
.feed-read-link:hover { gap:0.7rem; }

/* ═══ ARTICLE GRID ═══ */
.feed-grid-section { background:#fff; padding:0 3rem 2rem; }
.feed-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; }
.feed-card { border-radius:6px; overflow:hidden; cursor:pointer; transition:all 0.3s; border:1px solid rgba(0,0,0,0.04); text-decoration:none; display:block; }
.feed-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.06); }
.feed-card-img { aspect-ratio:16/10; position:relative; }
.feed-card-paid {
  position:absolute; top:0.6rem; right:0.6rem;
  font-family:Mulish,sans-serif; font-weight:600;
  font-size:0.55rem; letter-spacing:0.18em; text-transform:uppercase;
  padding:0.25rem 0.6rem; border-radius:20px;
  background:#FFE9C4; color:#A05A00;
}
.feed-card-body { padding:0.8rem 1rem; }
.feed-article-cat { font-family:Mulish,sans-serif; font-weight:500; font-size:0.55rem; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:0.3rem; }
.feed-card-title { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:0.95rem; color:#231F20; line-height:1.3; margin-bottom:0.3rem; }
.feed-card-date { font-family:Mulish,sans-serif; font-size:0.6rem; color:#8C8880; }

/* ═══ EMPTY STATE ═══ */
.feed-empty { background:#fff; padding:3rem 3rem 4rem; text-align:center; }
.feed-empty-text { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.1rem; color:#3D3D3A; line-height:1.7; margin-bottom:1.5rem; max-width:520px; margin-left:auto; margin-right:auto; }
.feed-empty-cta { display:inline-block; font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; text-decoration:none; padding:0.7rem 1.6rem; border:1px solid currentColor; border-radius:4px; transition:all 0.3s; }
.feed-empty-cta:hover { opacity:0.7; }

/* ═══ INLINE NEWSLETTER ═══ */
.feed-newsletter { background:#E9EBF6; padding:2rem; text-align:center; margin:1rem 3rem; border-radius:8px; }
.feed-newsletter-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.5rem; }
.feed-newsletter-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1.3rem; color:#231F20; margin-bottom:0.5rem; }
.feed-newsletter-body { font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; color:#3D3D3A; line-height:1.7; max-width:450px; margin:0 auto 1rem; }
.feed-newsletter-btn { background:#6E3A5A; color:#fff; border:1px solid #6E3A5A; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.7rem 1.8rem; border-radius:3px; cursor:pointer; transition:all 0.3s; display:inline-block; text-decoration:none; }
.feed-newsletter-btn:hover { background:#5A2E4A; }

/* ═══ RESPONSIVE ═══ */
@media (max-width:900px) {
  .feed-featured-inner { grid-template-columns:1fr; gap:1.5rem; }
  .feed-grid { grid-template-columns:1fr; }
  .feed-header, .feed-featured, .feed-grid-section { padding-left:1.2rem; padding-right:1.2rem; }
  .feed-newsletter { margin:1rem 1.2rem; }
}
`;
