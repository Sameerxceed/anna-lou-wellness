import Link from 'next/link';

export interface ResetSessionPageProps {
  name: string;
  tagline: string;
  opening: string;
  accentColour: string;
  image: string;
}

export default function ResetSessionPage({ name, tagline, opening, accentColour, image }: ResetSessionPageProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="rsp-hero" style={{ background: `linear-gradient(160deg, #F1EAE0 0%, ${accentColour}22 100%)` }}>
        <div className="rsp-hero-grid">
          <div className="rsp-hero-text">
            <nav className="rsp-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="rsp-breadcrumb-sep">›</span>
              <Link href="/the-work">The Work</Link>
              <span className="rsp-breadcrumb-sep">›</span>
              <Link href="/the-work/sessions">Sessions</Link>
            </nav>
            <p className="rsp-eyebrow" style={{ color: accentColour }}>1:1 Reset Session · 90 minutes · £200</p>
            <h1 className="rsp-title">{name}.</h1>
            <p className="rsp-tagline"><em>{tagline}</em></p>
          </div>
          <div className="rsp-hero-img" style={{ backgroundImage: `url('${image}')` }} />
        </div>
      </section>

      <section className="rsp-body">
        <div className="rsp-body-inner">
          <p className="rsp-opening">{opening}</p>
        </div>
      </section>

      <section className="rsp-includes">
        <div className="rsp-includes-inner">
          <p className="rsp-section-label" style={{ color: accentColour }}>What you get</p>
          <ul>
            <li>90 minutes with Anna, virtual</li>
            <li>Short intake form sent on booking</li>
            <li>Written summary after the session with the next steps</li>
            <li>£200, paid at booking</li>
          </ul>
        </div>
      </section>

      <section className="rsp-cta" style={{ background: accentColour }}>
        <div className="rsp-cta-inner">
          <h2 className="rsp-cta-title">Ready to book?</h2>
          <p className="rsp-cta-body">Stripe checkout opens in a new tab. The intake form is sent on booking.</p>
          <Link href="/contact" className="rsp-cta-btn" style={{ color: accentColour }}>
            Book this session · £200 &rarr;
          </Link>
          <p className="rsp-cta-fineprint">Not sure if it&apos;s the right fit? <Link href="/the-work/quiz" style={{ color: '#fff', textDecoration: 'underline' }}>Take the 5-minute quiz</Link> instead.</p>
        </div>
      </section>
    </>
  );
}

const styles = `
.rsp-hero { padding: 3rem 2rem 2rem; }
.rsp-hero-grid {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
}
.rsp-hero-img {
  aspect-ratio: 4/5; max-height: 460px;
  background-size: cover; background-position: center;
  border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.08);
}
.rsp-breadcrumb {
  font-family: Mulish, sans-serif; font-size: 0.7rem; color: #8C8880;
  letter-spacing: 0.05em; margin-bottom: 1rem;
}
.rsp-breadcrumb a { color: #8C8880; text-decoration: none; transition: color 0.2s; }
.rsp-breadcrumb a:hover { color: #231F20; }
.rsp-breadcrumb-sep { margin: 0 0.5rem; color: #c8c4bc; }
.rsp-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.22em; text-transform: uppercase;
  margin-bottom: 0.6rem;
}
.rsp-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2.4rem, 5.5vw, 3.4rem); line-height: 1.1; letter-spacing: 0.04em;
  color: #231F20; margin-bottom: 0.5rem;
}
.rsp-tagline {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: clamp(1.2rem, 2.5vw, 1.5rem); color: #3D3D3A;
}

.rsp-body { background: #fff; padding: 3rem 2rem; }
.rsp-body-inner { max-width: 720px; margin: 0 auto; }
.rsp-opening {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.1rem; line-height: 1.85; color: #3D3D3A;
}

.rsp-includes { background: #F5F3EF; padding: 2.5rem 2rem; }
.rsp-includes-inner { max-width: 720px; margin: 0 auto; }
.rsp-section-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
  margin-bottom: 0.8rem;
}
.rsp-includes ul { list-style: none; padding: 0; margin: 0; }
.rsp-includes li {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.7; color: #3D3D3A;
  padding: 0.5rem 0 0.5rem 1.5rem; position: relative;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.rsp-includes li:last-child { border-bottom: none; }
.rsp-includes li::before {
  content: '+'; position: absolute; left: 0; color: #6E3A5A; font-weight: 700;
}

.rsp-cta { padding: 4rem 2rem; text-align: center; }
.rsp-cta-inner { max-width: 600px; margin: 0 auto; }
.rsp-cta-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(1.8rem, 4vw, 2.4rem); color: #fff;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.8rem;
}
.rsp-cta-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.7; color: rgba(255,255,255,0.85);
  margin-bottom: 1.5rem;
}
.rsp-cta-btn {
  display: inline-block;
  background: #fff; padding: 1.1rem 2rem; border-radius: 4px;
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
  text-decoration: none; transition: transform 0.3s;
}
.rsp-cta-btn:hover { transform: translateY(-1px); }
.rsp-cta-fineprint {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 0.9rem; color: rgba(255,255,255,0.7);
  margin-top: 1.2rem;
}

@media (max-width: 900px) {
  .rsp-hero-grid { grid-template-columns: 1fr; gap: 1.5rem; text-align: center; }
  .rsp-hero-img { max-height: 320px; aspect-ratio: 16/10; }
}
`;
