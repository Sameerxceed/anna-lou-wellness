import { Metadata } from 'next';
import Link from 'next/link';
import { getStockImage } from '@/data/stock-images';

export const metadata: Metadata = {
  title: '1:1 Reset Sessions | Single Somatic Coaching Sessions',
  description: 'Single 1:1 sessions with Anna Lou. Founder Reset, Dating Reset, Nervous System Reset. Ninety minutes, £200.',
  alternates: { canonical: '/the-work/sessions' },
};

const SESSIONS = [
  {
    slug: 'founder-reset',
    name: 'Founder Reset',
    tagline: 'For the founder at a sticking point in the business or in herself.',
    accent: '#FAA21B',
    image: getStockImage('work-and-money', 'founder-reset-card'),
  },
  {
    slug: 'dating-reset',
    name: 'Dating Reset',
    tagline: 'For the woman noticing the same pattern showing up again.',
    accent: '#F280AA',
    image: getStockImage('love-and-relationships', 'dating-reset-card'),
  },
  {
    slug: 'nervous-system-reset',
    name: 'Nervous System Reset',
    tagline: 'For the woman whose signal system is scrambled and needs bringing back online.',
    accent: '#7BAFDD',
    image: getStockImage('programmes', 'ns-reset-card'),
  },
];

export default function SessionsHubPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hubStyles }} />

      <section className="rs-hero">
        <div className="rs-hero-inner">
          <p className="rs-eyebrow">The Work · 1:1 Reset Sessions</p>
          <h1 className="rs-title">1:1 Reset Sessions.</h1>
          <p className="rs-tagline"><em>Ninety minutes. One theme. A clear next step.</em></p>
          <p className="rs-intro">Not every piece of work needs a twelve-week container. Sometimes you need a focused conversation with someone who can hold the shape of what you are navigating, and help you put it down. A Reset Session is that conversation.</p>
        </div>
      </section>

      <section className="rs-grid-section">
        <div className="rs-grid">
          {SESSIONS.map(s => (
            <Link key={s.slug} href={`/the-work/sessions/${s.slug}`} className="rs-card">
              <div className="rs-card-img" style={{ backgroundImage: `url('${s.image}')` }} />
              <div className="rs-card-body">
                <p className="rs-card-kicker" style={{ color: s.accent }}>1:1 Reset Session</p>
                <h2 className="rs-card-name">{s.name}</h2>
                <p className="rs-card-tagline">{s.tagline}</p>
                <span className="rs-card-cta" style={{ color: s.accent }}>Book a session &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rs-includes">
        <div className="rs-includes-inner">
          <p className="rs-section-label">Every session includes</p>
          <ul className="rs-includes-list">
            <li>90 minutes, virtual, with Anna</li>
            <li>A short intake form sent on booking</li>
            <li>A written summary after the session with the next steps you agreed</li>
            <li>Option to roll into a 6-week or 12-week container</li>
          </ul>
          <p className="rs-pricing"><strong>£200 per session.</strong> Paid at booking.</p>
        </div>
      </section>
    </>
  );
}

const hubStyles = `
.rs-hero { background: linear-gradient(160deg, #F1EAE0 0%, #F5F0E8 100%); padding: 3.5rem 2rem 2.5rem; text-align: center; }
.rs-hero-inner { max-width: 800px; margin: 0 auto; }
.rs-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.6rem;
}
.rs-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2.4rem, 5.5vw, 3.4rem); color: #231F20;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem;
}
.rs-tagline {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: clamp(1.1rem, 2.4vw, 1.4rem); color: #3D3D3A; margin-bottom: 1rem;
}
.rs-intro {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.8; color: #3D3D3A;
}

.rs-grid-section { background: #fff; padding: 2.5rem 2rem; }
.rs-grid {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem;
}
.rs-card {
  background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px;
  overflow: hidden; text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex; flex-direction: column;
}
.rs-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
.rs-card-img {
  aspect-ratio: 16/10;
  background-size: cover; background-position: center;
}
.rs-card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.rs-card-kicker {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase;
}
.rs-card-name {
  font-family: 'Work Sans', sans-serif; font-weight: 400;
  font-size: 1.4rem; color: #231F20;
}
.rs-card-tagline {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: 0.95rem; line-height: 1.6; color: #3D3D3A;
  margin-bottom: 0.5rem; flex: 1;
}
.rs-card-cta {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
  border-top: 1px solid rgba(0,0,0,0.06); padding-top: 0.8rem;
}

.rs-includes { background: #F5F3EF; padding: 3rem 2rem; }
.rs-includes-inner { max-width: 700px; margin: 0 auto; text-align: center; }
.rs-section-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 1rem;
}
.rs-includes-list { list-style: none; padding: 0; margin: 0 0 1.5rem; text-align: left; }
.rs-includes-list li {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.7; color: #3D3D3A;
  padding: 0.5rem 0 0.5rem 1.5rem; position: relative;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.rs-includes-list li::before {
  content: '+'; position: absolute; left: 0; color: #6E3A5A; font-weight: 700;
}
.rs-pricing {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.2rem; color: #231F20;
}

@media (max-width: 900px) {
  .rs-grid { grid-template-columns: 1fr; }
}
`;
