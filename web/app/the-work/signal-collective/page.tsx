import { Metadata } from 'next';
import EnquiryForm from '@/components/EnquiryForm';
import { getStockImage } from '@/data/stock-images';

export const metadata: Metadata = {
  title: 'The Signal Collective | Somatic Coaching Mastermind for Women',
  description: 'A small-group mastermind for women doing the inner work alongside building real lives and businesses. Six months, group plus 1:1. By application.',
  alternates: { canonical: '/the-work/signal-collective' },
};

const ACCENT = '#6E3A5A';

export default function SignalCollectivePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="sc-hero">
        <div className="sc-hero-grid">
          <div className="sc-hero-text">
            <p className="sc-eyebrow">The Work · By application</p>
            <h1 className="sc-title">The Signal Collective.</h1>
            <p className="sc-tagline"><em>The inner work, in community. Six months.</em></p>
          </div>
          <div className="sc-hero-img" style={{ backgroundImage: `url('${getStockImage('community', 'signal-collective')}')` }} />
        </div>
      </section>

      <section className="sc-body">
        <div className="sc-body-inner">
          <p className="sc-body-text">The Signal Collective is the mastermind. For coaches, founders, practitioners, and leaders who want depth plus community. Group and 1:1 coaching combined. Monthly intensive sessions. Peer co-regulation with people at the same level of seriousness. Direct access to the Signal Method applied to everything: business, relationships, creative work, leadership.</p>
          <p className="sc-body-text">A curated community committed to operating from their highest level. Not a course. A container for those already in motion who want to accelerate.</p>
        </div>
      </section>

      <section className="sc-includes">
        <div className="sc-includes-inner">
          <p className="sc-section-label">What&apos;s included</p>
          <ul>
            <li>Six months. Twelve women maximum, by application.</li>
            <li>Two group calls a month, 90 minutes each. One teaching, one open circle.</li>
            <li>A monthly 1:1 with Anna, 60 minutes.</li>
            <li>A private group space, off social media.</li>
            <li>Two in-person days at the Hampton studio, one at the start, one at the close.</li>
            <li>Guest sessions from practitioners Anna trusts.</li>
          </ul>
          <p className="sc-pricing"><strong>Investment: by enquiry.</strong> Application form first, then a discovery call.</p>
        </div>
      </section>

      <section className="sc-form-section" id="apply">
        <div className="sc-form-grid">
          <div className="sc-form-text">
            <p className="sc-section-label">Apply</p>
            <h2 className="sc-form-title">A few questions.</h2>
            <p className="sc-form-body">Tell Anna where you are and what you are building. She reads every application herself. If it feels like a fit, she will book a discovery call with you. If not, she will say so honestly and point you to the door that is right for you.</p>
          </div>
          <EnquiryForm
            endpoint="/api/lead/signal-collective"
            accentColour={ACCENT}
            successTitle="Application received."
            successMessage="Anna reads every one personally. If it's a fit, she'll be in touch within a week to book a discovery call."
            submitLabel="Send application"
            fields={[
              { name: 'name', label: 'Your name', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'work', label: 'What work do you do?', type: 'textarea', rows: 3, required: true, placeholder: 'A sentence or two — what you do, who you do it for.' },
              { name: 'why_now', label: 'Why now?', type: 'textarea', rows: 4, required: true, placeholder: 'What is happening in your life and work that has brought you here at this moment?' },
              { name: 'what_you_want', label: 'What do you want from six months of this?', type: 'textarea', rows: 4, required: true, placeholder: 'Specific or directional — both fine. Honest is what matters.' },
            ]}
          />
        </div>
      </section>
    </>
  );
}

const pageStyles = `
.sc-hero { background: linear-gradient(160deg, #F1EAE0 0%, #E5E1D8 100%); padding: 3rem 2rem 2rem; }
.sc-hero-grid {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
}
.sc-hero-img {
  aspect-ratio: 4/5; max-height: 460px;
  background-size: cover; background-position: center;
  border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.08);
}
.sc-eyebrow {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.6rem;
}
.sc-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(2.4rem, 5.5vw, 3.4rem); color: #231F20;
  letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem;
}
.sc-tagline {
  font-family: 'EB Garamond', Georgia, serif; font-style: italic;
  font-size: clamp(1.2rem, 2.6vw, 1.5rem); color: #3D3D3A;
}

.sc-body { background: #fff; padding: 3rem 2rem; }
.sc-body-inner { max-width: 760px; margin: 0 auto; }
.sc-body-text {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.05rem; line-height: 1.85; color: #3D3D3A;
  margin-bottom: 1.2rem;
}

.sc-includes { background: #F5F3EF; padding: 2.5rem 2rem; }
.sc-includes-inner { max-width: 760px; margin: 0 auto; }
.sc-section-label {
  font-family: Mulish, sans-serif; font-weight: 500;
  font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: #6E3A5A; margin-bottom: 0.8rem;
}
.sc-includes ul { list-style: none; padding: 0; margin: 0 0 1.5rem; }
.sc-includes li {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.7; color: #3D3D3A;
  padding: 0.5rem 0 0.5rem 1.5rem; position: relative;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.sc-includes li:last-child { border-bottom: none; }
.sc-includes li::before {
  content: '+'; position: absolute; left: 0; color: #6E3A5A; font-weight: 700;
}
.sc-pricing {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1.1rem; color: #231F20;
  border-top: 1px solid rgba(0,0,0,0.08); padding-top: 1rem;
}

.sc-form-section { background: #fff; padding: 3rem 2rem 4rem; }
.sc-form-grid {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 3rem; align-items: start;
}
.sc-form-text { padding-top: 1rem; }
.sc-form-title {
  font-family: 'Work Sans', sans-serif; font-weight: 300;
  font-size: clamp(1.8rem, 4vw, 2.4rem); color: #231F20;
  letter-spacing: 0.03em; line-height: 1.15; margin-bottom: 0.8rem;
}
.sc-form-body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem; line-height: 1.8; color: #3D3D3A;
}

@media (max-width: 900px) {
  .sc-hero-grid, .sc-form-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .sc-hero-img { max-height: 320px; aspect-ratio: 16/10; }
}
`;
