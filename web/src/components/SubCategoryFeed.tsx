import Link from 'next/link';

interface SubCategoryFeedProps {
  kicker: string;
  kickerColour: string;
  title: string;
  intro: string;
  parentLabel: string;
  parentHref: string;
}

export default function SubCategoryFeed({ kicker, kickerColour, title, intro, parentLabel, parentHref }: SubCategoryFeedProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: subFeedStyles }} />

      {/* Breadcrumb */}
      <div className="scf-breadcrumb">
        <Link href={parentHref}>{parentLabel}</Link>
        <span> / </span>
        <span>{title}</span>
      </div>

      {/* Header */}
      <section className="scf-header">
        <p className="scf-kicker" style={{ color: kickerColour }}>{kicker}</p>
        <h1 className="scf-title">{title}</h1>
        <p className="scf-intro">{intro}</p>
      </section>

      {/* Featured article placeholder */}
      <section className="scf-featured">
        <div className="scf-featured-inner">
          <div className="scf-featured-img" />
          <div className="scf-featured-content">
            <p className="scf-cat" style={{ color: kickerColour }}>{title}</p>
            <h2 className="scf-featured-title">Featured article title. CMS placeholder.</h2>
            <p className="scf-featured-meta">By Anna Lou &middot; 2026</p>
            <p className="scf-featured-excerpt">This content will be loaded from the CMS when connected. Articles tagged to this sub category will appear here as an editorial feed.</p>
            <span className="scf-read" style={{ color: kickerColour }}>Continue reading <span>&rarr;</span></span>
          </div>
        </div>
      </section>

      {/* Article grid placeholder */}
      <section className="scf-grid-section">
        <div className="scf-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="scf-card">
              <div className="scf-card-img" style={{ background: `linear-gradient(160deg, hsl(${30 + i * 5},25%,${80 - i * 2}%), hsl(${25 + i * 5},20%,${75 - i * 2}%))` }} />
              <div className="scf-card-body">
                <p className="scf-cat" style={{ color: kickerColour }}>{title}</p>
                <h3 className="scf-card-title">Article {i} title. CMS placeholder.</h3>
                <p className="scf-card-date">2026</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="scf-newsletter">
        <p className="scf-newsletter-kicker" style={{ color: kickerColour }}>Reset Letters</p>
        <h3 className="scf-newsletter-title">Stories like this, delivered weekly.</h3>
        <a href="#" className="scf-newsletter-btn">Join on Substack &rarr;</a>
      </section>
    </>
  );
}

const subFeedStyles = `
.scf-breadcrumb { padding:0.8rem 3rem; font-family:Mulish,sans-serif; font-size:0.6rem; letter-spacing:0.08em; color:#8C8880; }
.scf-breadcrumb a { color:#8C8880; text-decoration:none; transition:color 0.2s; }
.scf-breadcrumb a:hover { color:#231F20; }

.scf-header { background:#fff; padding:1.5rem 3rem 1rem; text-align:center; }
.scf-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.4rem; }
.scf-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:300; font-size:clamp(1.8rem,4vw,2.8rem); color:#231F20; letter-spacing:0.05em; line-height:1.1; margin-bottom:0.8rem; }
.scf-intro { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#3D3D3A; line-height:1.8; max-width:550px; margin:0 auto; }

.scf-featured { background:#fff; padding:1rem 3rem 1.5rem; }
.scf-featured-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1.2fr 0.8fr; gap:2rem; align-items:center; }
.scf-featured-img { aspect-ratio:4/3; border-radius:6px; background:linear-gradient(160deg,#e8ddd0,#d4c5b3); max-height:350px; position:relative; }
.scf-featured-img::after { content:'Featured image. CMS managed.'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.45rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.1); }
.scf-featured-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.3rem,2.2vw,1.7rem); color:#231F20; line-height:1.35; margin-bottom:0.5rem; }
.scf-featured-meta { font-family:Mulish,sans-serif; font-size:0.68rem; color:#8C8880; letter-spacing:0.05em; margin-bottom:0.6rem; }
.scf-featured-excerpt { font-family:'EB Garamond',Georgia,serif; font-size:0.95rem; color:#3D3D3A; line-height:1.75; margin-bottom:0.8rem; }
.scf-cat { font-family:Mulish,sans-serif; font-weight:500; font-size:0.55rem; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:0.3rem; }
.scf-read { font-family:Mulish,sans-serif; font-weight:400; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; border-bottom:1px solid currentColor; padding-bottom:2px; display:inline-flex; align-items:center; gap:0.3rem; }

.scf-grid-section { background:#fff; padding:0.5rem 3rem 2rem; }
.scf-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; }
.scf-card { border-radius:6px; overflow:hidden; border:1px solid rgba(0,0,0,0.04); transition:all 0.3s; }
.scf-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.06); }
.scf-card-img { aspect-ratio:16/10; }
.scf-card-body { padding:0.8rem 1rem; }
.scf-card-title { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:0.9rem; color:#231F20; line-height:1.3; margin-bottom:0.3rem; }
.scf-card-date { font-family:Mulish,sans-serif; font-size:0.58rem; color:#8C8880; }

.scf-newsletter { background:#E9EBF6; padding:1.5rem; text-align:center; margin:0 3rem 2rem; border-radius:8px; }
.scf-newsletter-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.3rem; }
.scf-newsletter-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:1.1rem; color:#231F20; margin-bottom:0.8rem; }
.scf-newsletter-btn { background:#6E3A5A; color:#fff; font-family:Mulish,sans-serif; font-weight:500; font-size:0.55rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.6rem 1.5rem; border-radius:3px; text-decoration:none; display:inline-block; transition:background 0.3s; }
.scf-newsletter-btn:hover { background:#5A2E4A; }

@media (max-width:900px) {
  .scf-featured-inner { grid-template-columns:1fr; gap:1.2rem; }
  .scf-grid { grid-template-columns:1fr; }
  .scf-breadcrumb, .scf-header, .scf-featured, .scf-grid-section { padding-left:1.2rem; padding-right:1.2rem; }
  .scf-newsletter { margin:0 1.2rem 1.5rem; }
}
`;
