import Link from 'next/link';

interface SubPageProps {
  kicker: string;
  kickerColour: string;
  title: string;
  parentLabel: string;
  parentHref: string;
  description?: string;
}

export default function SubPage({ kicker, kickerColour, title, parentLabel, parentHref, description }: SubPageProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: subStyles }} />
      <article className="sub-page">
        <div className="sub-inner">
          <p className="sub-kicker" style={{ color: kickerColour }}>{kicker}</p>
          <h1 className="sub-title">{title}</h1>
          <div className="sub-hero" />
          <div className="sub-content">
            <p>{description || 'This page will be populated from the CMS (Strapi) when connected. Content from the manuscripts and editorial briefs will appear here.'}</p>
          </div>
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
.sub-inner { max-width:750px; margin:0 auto; }
.sub-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:0.5rem; text-align:center; }
.sub-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(1.8rem,4vw,2.6rem); color:#231F20; line-height:1.3; margin-bottom:2rem; text-align:center; }
.sub-hero { aspect-ratio:16/9; border-radius:6px; background:linear-gradient(160deg,#e8ddd0,#d4c5b3); margin-bottom:2rem; position:relative; }
.sub-hero::after { content:'Page image. CMS managed.'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:Mulish,sans-serif; font-size:0.5rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(0,0,0,0.12); }
.sub-content { font-family:'EB Garamond',Georgia,serif; font-size:1.1rem; color:#3D3D3A; line-height:1.9; margin-bottom:2.5rem; }
.sub-content p { margin-bottom:1.5rem; }
.sub-back { font-family:Mulish,sans-serif; font-weight:400; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; border-bottom:1px solid; padding-bottom:2px; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem; transition:gap 0.3s; }
.sub-back:hover { gap:0.7rem; }
@media (max-width:900px) { .sub-page { padding:1.5rem 1.2rem 2rem; } }
`;
