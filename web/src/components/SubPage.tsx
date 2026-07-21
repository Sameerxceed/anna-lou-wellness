import Link from 'next/link';
import BlocksRenderer from '@/components/BlocksRenderer';

interface SubPageProps {
  kicker: string;
  kickerColour: string;
  title: string;
  parentLabel: string;
  parentHref: string;
  description?: string;
  paragraphs?: string[];
  // Blocks JSON companion — when populated, prefer this over paragraphs.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paragraphsBlocks?: any[] | null;
  cta?: { label: string; href: string };
  inspirationLink?: { label: string; href: string };
  details?: { label: string; value: string }[];
  heroImage?: string; // optional CMS or stock image URL — kills the beige placeholder when set
}

export default function SubPage({ kicker, kickerColour, title, parentLabel, parentHref, description, paragraphs, paragraphsBlocks, cta, inspirationLink, details, heroImage }: SubPageProps) {
  // Anna 14 Jul (STRONGER): if CMS section is empty, hide it. No hardcoded
  // "This page will be populated from CMS..." fallback text.
  const content = paragraphs && paragraphs.length > 0
    ? paragraphs
    : (description ? [description] : []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: subStyles }} />
      <article className="sub-page">
        <div className="sub-inner">
          {kicker && <p className="sub-kicker" style={{ color: kickerColour }}>{kicker}</p>}
          {title && <h1 className="sub-title">{title}</h1>}
          <div
            className={heroImage ? 'sub-hero has-image' : 'sub-hero'}
            style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          />
          {(paragraphsBlocks || content.length > 0) && (
            <div className="sub-content sub-content-blocks">
              {paragraphsBlocks ? (
                <BlocksRenderer content={paragraphsBlocks} />
              ) : (
                content.map((p, i) => <p key={i}>{p}</p>)
              )}
            </div>
          )}
          {details && details.length > 0 && (
            <div className="sub-details">
              {details.map((d, i) => (
                <div key={i} className="sub-detail-row">
                  <span className="sub-detail-label">{d.label}</span>
                  <span className="sub-detail-value">{d.value}</span>
                </div>
              ))}
            </div>
          )}
          {cta && (
            <div className="sub-cta">
              <Link href={cta.href} className="sub-cta-btn" style={{ background: kickerColour, borderColor: kickerColour }}>
                {cta.label} <span>&rarr;</span>
              </Link>
              {inspirationLink && inspirationLink.href && inspirationLink.label && (
                <p className="sub-inspiration">
                  <Link href={inspirationLink.href} style={{ color: kickerColour }}>
                    {inspirationLink.label} <span>&rarr;</span>
                  </Link>
                </p>
              )}
            </div>
          )}
          <Link href={parentHref} className="sub-back" style={{ color: kickerColour, borderColor: kickerColour }}>
            &larr; Back to {parentLabel}
          </Link>
        </div>
      </article>
    </>
  );
}

const subStyles = `
.sub-page { background:#fff; padding:2rem 3rem 3rem; }
.sub-inner { max-width:900px; margin:0 auto; }
.sub-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:0.5rem; text-align:center; }
.sub-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.8rem,4vw,2.6rem); color:#231F20; line-height:1.3; margin-bottom:2rem; text-align:center; }
.sub-hero { aspect-ratio:16/9; border-radius:6px; background:linear-gradient(160deg,#e8ddd0,#d4c5b3); margin-bottom:2rem; position:relative; }
.sub-hero::after { content:'Page image. CMS managed.'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.12); }
.sub-hero.has-image::after { display:none; }
.sub-content { font-family:'EB Garamond',Georgia,serif; font-size:1.1rem; color:#3D3D3A; line-height:1.9; margin-bottom:2.5rem; }
.sub-content p { margin-bottom:1.2rem; }
.sub-content-blocks a { color:#6E3A5A; text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:3px; }
.sub-content-blocks a:hover { color:#5A2E4A; text-decoration-thickness:2px; }
.sub-content-blocks strong { font-weight:600; color:#231F20; }
.sub-content-blocks em { font-style:italic; }
.sub-content-blocks h2, .sub-content-blocks h3 { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; color:#231F20; margin:1.2rem 0 0.6rem; line-height:1.3; }
.sub-content-blocks ul, .sub-content-blocks ol { padding-left:1.5rem; margin-bottom:1.2rem; }
.sub-content-blocks li { margin-bottom:0.3rem; }
.sub-content-blocks blockquote { border-left:3px solid #6E3A5A; padding-left:1rem; margin:1rem 0; font-style:italic; color:#5A5A54; }
.sub-details { margin-bottom:2rem; border-top:1px solid rgba(0,0,0,0.06); padding-top:1rem; }
.sub-detail-row { display:flex; justify-content:space-between; align-items:baseline; padding:0.5rem 0; border-bottom:1px solid rgba(0,0,0,0.04); }
.sub-detail-label { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#8C8880; }
.sub-detail-value { font-family:'EB Garamond',Georgia,serif; font-size:1rem; color:#231F20; }
.sub-cta { text-align:center; margin-bottom:2rem; }
.sub-cta-btn { color:#fff; font-family:Mulish,sans-serif; font-weight:500; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.7rem 1.8rem; border-radius:3px; border:1px solid; transition:all 0.3s; display:inline-flex; align-items:center; gap:0.4rem; text-decoration:none; }
.sub-cta-btn:hover { opacity:0.85; }
.sub-inspiration { margin-top:0.9rem; font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.95rem; }
.sub-inspiration a { text-decoration:none; border-bottom:1px solid currentColor; padding-bottom:1px; transition:opacity 0.3s; }
.sub-inspiration a:hover { opacity:0.7; }
.sub-inspiration span { margin-left:0.25rem; }
.sub-back { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; border-bottom:1px solid; padding-bottom:2px; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem; transition:gap 0.3s; }
.sub-back:hover { gap:0.7rem; }
@media (max-width:900px) { .sub-page { padding:1.5rem 1.2rem 2rem; } }
`;
