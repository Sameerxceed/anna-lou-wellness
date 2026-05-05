import { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${title} — Work & Money`,
    description: `${title}. Articles and stories about work, money, and the founder journey. Anna Lou Wellness.`,
  };
}

export default async function SubCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: subCatStyles }} />

      {/* Breadcrumb */}
      <nav className="sc-breadcrumb">
        <Link href="/work-and-money">Work &amp; Money</Link>
        <span className="sc-sep">/</span>
        <span>{title}</span>
      </nav>

      {/* Page title */}
      <header className="sc-header">
        <h1 className="sc-title">{title}</h1>
        <p className="sc-intro">CMS placeholder. A short intro paragraph in Anna&rsquo;s voice will appear here, setting the tone for this sub category.</p>
      </header>

      {/* Main content: 2-col articles + sidebar */}
      <div className="sc-layout">
        <main className="sc-main">
          {/* Article cards — Cup of Jo 2-column style */}
          <div className="sc-grid">
            {[
              { title: 'The founder who stopped. What burnout actually looks like from the inside.', excerpt: 'I did not collapse. I did not have a dramatic breakdown. I just stopped being able to feel excited about anything.' },
              { title: 'When your nervous system runs the business. A guide to noticing.', excerpt: 'The patterns are invisible until someone points them out. Then you see them everywhere.' },
              { title: 'What rest actually looks like when you have built your identity around working.', excerpt: 'Rest is not a reward for finishing. It is how you sustain the capacity to begin.' },
              { title: 'The body keeps the score. But what does it do with the invoice?', excerpt: 'How financial stress lives in the body and what happens when you start listening.' },
            ].map((article, i) => (
              <article key={i} className="sc-article">
                <div className="sc-article-img" style={{ background: `linear-gradient(160deg, hsl(${30 + i * 8},22%,${82 - i * 3}%), hsl(${25 + i * 8},18%,${76 - i * 3}%))` }} />
                <h2 className="sc-article-title">{article.title}</h2>
                <p className="sc-article-excerpt">{article.excerpt}</p>
                <p className="sc-article-meta">By Anna Lou &middot; 2026</p>
              </article>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="sc-sidebar">
          {/* Reset Letters promo */}
          <div className="sc-sidebar-box">
            <p className="sc-sidebar-label">Reset Letters</p>
            <p className="sc-sidebar-title">Stories like this, weekly.</p>
            <a href="#" className="sc-sidebar-btn">Join on Substack &rarr;</a>
          </div>

          {/* Most Popular */}
          <div className="sc-sidebar-popular">
            <p className="sc-sidebar-label" style={{ color: '#FFD07A' }}>Work &amp; Money</p>
            <h3 className="sc-sidebar-heading">Most Popular</h3>
            <ol className="sc-popular-list">
              <li><span className="sc-popular-num">01</span><a href="#">The founder who stopped</a></li>
              <li><span className="sc-popular-num">02</span><a href="#">Signal Method explained</a></li>
              <li><span className="sc-popular-num">03</span><a href="#">Money and worth</a></li>
              <li><span className="sc-popular-num">04</span><a href="#">The career pivot</a></li>
              <li><span className="sc-popular-num">05</span><a href="#">When rest is the hardest work</a></li>
            </ol>
          </div>
        </aside>
      </div>

      {/* Inline newsletter */}
      <section className="sc-newsletter">
        <p className="sc-newsletter-kicker">Reset Letters</p>
        <h3 className="sc-newsletter-title">Honest writing, delivered weekly.</h3>
        <p className="sc-newsletter-body">Your inner world, jewellery with meaning, houseboat life, and what it actually feels like to return to yourself.</p>
        <a href="#" className="sc-newsletter-btn">Join on Substack &rarr;</a>
      </section>
    </>
  );
}

const subCatStyles = `
/* Breadcrumb */
.sc-breadcrumb { padding:1rem 3rem 0; font-family:Mulish,sans-serif; font-size:0.6rem; letter-spacing:0.08em; color:#8C8880; }
.sc-breadcrumb a { color:#8C8880; text-decoration:none; }
.sc-breadcrumb a:hover { color:#231F20; }
.sc-sep { margin:0 0.4rem; }

/* Header */
.sc-header { padding:1.5rem 3rem 1rem; max-width:800px; }
.sc-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(1.8rem,4vw,2.8rem); color:#231F20; letter-spacing:0.03em; line-height:1.15; margin-bottom:0.8rem; }
.sc-intro { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; line-height:1.8; }

/* Layout: main + sidebar */
.sc-layout { display:grid; grid-template-columns:1fr 300px; gap:3rem; padding:1rem 3rem 2rem; max-width:1300px; margin:0 auto; }

/* Article grid — 2 columns like Cup of Jo */
.sc-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2rem; }
.sc-article { cursor:pointer; }
.sc-article-img { aspect-ratio:4/3; border-radius:4px; margin-bottom:1rem; transition:transform 0.3s; }
.sc-article:hover .sc-article-img { transform:scale(1.02); }
.sc-article-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:1.2rem; color:#231F20; line-height:1.35; margin-bottom:0.5rem; }
.sc-article-excerpt { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#3D3D3A; line-height:1.7; margin-bottom:0.5rem; }
.sc-article-meta { font-family:Mulish,sans-serif; font-size:0.6rem; color:#8C8880; letter-spacing:0.05em; }

/* Sidebar */
.sc-sidebar { padding-top:0.5rem; }
.sc-sidebar-box { background:#E9EBF6; border-radius:8px; padding:1.5rem; text-align:center; margin-bottom:2rem; }
.sc-sidebar-label { font-family:Mulish,sans-serif; font-weight:500; font-size:0.55rem; letter-spacing:0.18em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.3rem; }
.sc-sidebar-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:0.95rem; color:#231F20; margin-bottom:0.8rem; }
.sc-sidebar-btn { background:#6E3A5A; color:#fff; font-family:Mulish,sans-serif; font-weight:500; font-size:0.5rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.55rem 1.2rem; border-radius:3px; text-decoration:none; display:inline-block; transition:background 0.3s; }
.sc-sidebar-btn:hover { background:#5A2E4A; }

.sc-sidebar-popular { border-top:2px solid #231F20; padding-top:1rem; }
.sc-sidebar-heading { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:1.3rem; color:#6E3A5A; margin-bottom:1rem; }
.sc-popular-list { list-style:none; padding:0; margin:0; }
.sc-popular-list li { display:flex; gap:0.8rem; align-items:flex-start; padding:0.7rem 0; border-bottom:1px solid rgba(0,0,0,0.05); }
.sc-popular-num { font-family:Mulish,sans-serif; font-weight:600; font-size:0.7rem; color:#8C8880; flex-shrink:0; padding-top:0.15rem; }
.sc-popular-list a { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#231F20; text-decoration:none; line-height:1.4; transition:color 0.2s; }
.sc-popular-list a:hover { color:#6E3A5A; }

/* Newsletter */
.sc-newsletter { background:#F5F3EF; padding:2rem; text-align:center; margin:0 3rem 2rem; border-radius:8px; }
.sc-newsletter-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:#6E3A5A; margin-bottom:0.3rem; }
.sc-newsletter-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1.2rem; color:#231F20; margin-bottom:0.5rem; }
.sc-newsletter-body { font-family:'EB Garamond',Georgia,serif; font-size:0.9rem; color:#3D3D3A; line-height:1.6; max-width:450px; margin:0 auto 1rem; }
.sc-newsletter-btn { background:#6E3A5A; color:#fff; font-family:Mulish,sans-serif; font-weight:500; font-size:0.55rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.6rem 1.5rem; border-radius:3px; text-decoration:none; display:inline-block; transition:background 0.3s; }
.sc-newsletter-btn:hover { background:#5A2E4A; }

/* Responsive */
@media (max-width:900px) {
  .sc-layout { grid-template-columns:1fr; gap:2rem; }
  .sc-grid { grid-template-columns:1fr; }
  .sc-breadcrumb, .sc-header { padding-left:1.2rem; padding-right:1.2rem; }
  .sc-layout { padding-left:1.2rem; padding-right:1.2rem; }
  .sc-newsletter { margin:0 1.2rem 1.5rem; }
}
`;
