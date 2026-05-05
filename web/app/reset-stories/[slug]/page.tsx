import { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${title} — Reset Stories`,
    description: `${title}. A Reset Story by Anna Lou. Honest writing about coming back to yourself.`,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
      <article className="article-page">
        <div className="article-inner">
          <p className="article-kicker">Reset Stories</p>
          <h1 className="article-title">{title}</h1>
          <p className="article-meta">By Anna Lou &middot; 2026 &middot; CMS placeholder</p>
          <div className="article-hero-img" />
          <div className="article-content">
            <p>This article will be loaded from the CMS (Strapi) when connected. The full content from Volume 1/2/3 manuscripts will populate here.</p>
            <p>Article pages follow the editorial format: long form, story first. Inline product, retreat, or 1:1 mentions where natural. Related articles at the foot. Substack sign-up at the foot.</p>
          </div>

          {/* Related articles */}
          <div className="article-related">
            <h3 className="article-related-title">More Reset Stories</h3>
            <div className="article-related-grid">
              <Link href="/reset-stories" className="article-related-card">
                <div className="article-related-img" />
                <p className="article-related-name">View all Reset Stories</p>
              </Link>
            </div>
          </div>

          {/* Substack sign-up */}
          <div className="article-newsletter">
            <p className="article-newsletter-kicker">Reset Letters</p>
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
.article-inner { max-width:750px; margin:0 auto; }
.article-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.5rem; text-align:center; }
.article-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.8rem,4vw,2.6rem); color:#231F20; line-height:1.3; margin-bottom:0.8rem; text-align:center; }
.article-meta { font-family:Mulish,sans-serif; font-size:0.72rem; color:#8C8880; letter-spacing:0.05em; margin-bottom:2rem; text-align:center; }
.article-hero-img { aspect-ratio:16/9; border-radius:6px; background:linear-gradient(160deg,#e8ddd0,#d4c5b3); margin-bottom:2rem; position:relative; }
.article-hero-img::after { content:'Article hero image. CMS managed.'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.12); }
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
