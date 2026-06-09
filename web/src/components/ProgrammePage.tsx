import Link from 'next/link';
import BookingButton from './BookingButton';

export interface ProgrammeSection {
  label: string;
  body: string | string[];
}

export interface ProgrammePageProps {
  hero: { title: string; tagline: string; image?: string };
  intro: string[];
  sections: ProgrammeSection[];
  pricing: { label: string; body: string };
  cta: { label: string; href: string };
  accentColour: string; // brand colour for this programme
}

export default function ProgrammePage({ hero, intro, sections, pricing, cta, accentColour }: ProgrammePageProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="prog-hero" style={{ background: `linear-gradient(160deg, #F1EAE0 0%, ${accentColour}22 100%)` }}>
        <div className="prog-hero-grid">
          <div className="prog-hero-text">
            <nav className="prog-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="prog-breadcrumb-sep">›</span>
              <Link href="/the-work">Work with Anna</Link>
            </nav>
            <p className="prog-eyebrow" style={{ color: accentColour }}>Work with Anna</p>
            <h1 className="prog-title">{hero.title}</h1>
            <p className="prog-tagline"><em>{hero.tagline}</em></p>
          </div>
          {hero.image && (
            <div className="prog-hero-img" style={{ backgroundImage: `url('${hero.image}')` }} />
          )}
        </div>
      </section>

      <section className="prog-intro">
        <div className="prog-intro-inner">
          {intro.map((p, i) => (
            <p key={i} className="prog-body-text">{p}</p>
          ))}
        </div>
      </section>

      {sections.map((sec, i) => (
        <section key={i} className="prog-section" style={i % 2 === 1 ? { background: '#F5F3EF' } : undefined}>
          <div className="prog-section-inner">
            <p className="prog-section-label" style={{ color: accentColour }}>{sec.label}</p>
            {Array.isArray(sec.body) ? (
              <ul className="prog-list">
                {sec.body.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            ) : (
              <p className="prog-body-text">{sec.body}</p>
            )}
          </div>
        </section>
      ))}

      <section className="prog-pricing">
        <div className="prog-pricing-inner">
          <p className="prog-section-label" style={{ color: accentColour }}>{pricing.label}</p>
          <p className="prog-pricing-text">{pricing.body}</p>
        </div>
      </section>

      <section className="prog-cta" style={{ background: accentColour }}>
        <div className="prog-cta-inner">
          <h2 className="prog-cta-title">Ready when you are.</h2>
          <BookingButton
            url={cta.href}
            label={`${cta.label} →`}
            className="prog-cta-btn"
            style={{ color: accentColour }}
          />
          <p className="prog-cta-fineprint">If unsure, book a free fifteen-minute discovery call. Anna will hear what you actually need.</p>
        </div>
      </section>
    </>
  );
}

const styles = `
.prog-hero { padding: 3rem 2rem 2rem; }
.prog-hero-grid {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
}
.prog-hero-text { }
.prog-hero-img {
  aspect-ratio: 4/5; max-height: 480px;
  background-size: cover; background-position: center;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.08);
}
@media (max-width: 900px) {
  .prog-hero-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .prog-hero-text { text-align: center; }
  .prog-hero-img { max-height: 360px; aspect-ratio: 16/10; }
}
.prog-breadcrumb {
  font-family: Mulish, sans-serif; font-size: 0.7rem; color: #8C8880;
  letter-spacing: 0.05em; margin-bottom: 1rem;
}
.prog-breadcrumb a { color: #8C8880; text-decoration: none; transition: color 0.2s; }
.prog-breadcrumb a:hover { color: #231F20; }
.prog-breadcrumb-sep { margin: 0 0.5rem; color: #c8c4bc; }
.prog-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.65rem; letter-spacing: 0.32em; text-transform: uppercase;
  margin-bottom: 0.8rem;
}
.prog-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2.6rem, 6vw, 4rem); line-height: 1.1; letter-spacing: 0.04em;
  color: #231F20; margin-bottom: 0.6rem;
}
.prog-tagline {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: clamp(1.2rem, 2.6vw, 1.6rem); color: #3D3D3A;
}

.prog-intro { background: #fff; padding: 3rem 2rem; }
.prog-intro-inner { max-width: 900px; margin: 0 auto; }
.prog-body-text {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.05rem; line-height: 1.85; color: #3D3D3A;
  margin-bottom: 1.2rem;
}

.prog-section { background: #fff; padding: 2.5rem 2rem; }
.prog-section-inner { max-width: 900px; margin: 0 auto; }
.prog-section-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
  margin-bottom: 0.8rem;
}
.prog-list { list-style: none; padding: 0; margin: 0; }
.prog-list li {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.7; color: #3D3D3A;
  padding: 0.5rem 0 0.5rem 1.5rem; position: relative;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.prog-list li:last-child { border-bottom: none; }
.prog-list li::before {
  content: '+'; position: absolute; left: 0; color: #6E3A5A; font-weight: 700; font-size: 1.1rem;
}

.prog-pricing { background: #F1EAE0; padding: 2.5rem 2rem; text-align: center; }
.prog-pricing-inner { max-width: 720px; margin: 0 auto; }
.prog-pricing-text {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.1rem; line-height: 1.7; color: #231F20;
}

.prog-cta { padding: 4rem 2rem; text-align: center; }
.prog-cta-inner { max-width: 700px; margin: 0 auto; }
.prog-cta-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(1.8rem, 4.5vw, 2.6rem); color: #fff;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 1.5rem;
}
.prog-cta-btn {
  display: inline-block;
  background: #fff; padding: 1.1rem 2rem; border-radius: 4px;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
  text-decoration: none; transition: transform 0.3s;
}
.prog-cta-btn:hover { transform: translateY(-1px); }
.prog-cta-fineprint {
  font-family: Mulish, sans-serif; font-weight: 300;
  font-size: 0.7rem; color: rgba(255,255,255,0.7);
  margin-top: 1.2rem; letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .prog-hero { padding: 3rem 1.2rem 2rem; }
  .prog-intro, .prog-section, .prog-pricing, .prog-cta { padding-left: 1.2rem; padding-right: 1.2rem; }
}
`;
