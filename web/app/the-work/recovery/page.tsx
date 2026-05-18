import { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';
import { getStockImage } from '@/data/stock-images';
import { getProgrammeBySlug, parseStages } from '@/lib/programme';
import { mediaUrl } from '@/lib/strapi';

const STAGE_COLOURS = ['#EE312F', '#FAA21B', '#5DCAA5', '#7BAFDD', '#F280AA'];

export const metadata: Metadata = {
  title: 'Narcissistic Abuse Recovery Coaching | Untangle, Unbind, Unbound',
  description: 'Three-stage recovery coaching for women rebuilding after narcissistic and domestic abuse. Untangle, Unbind, Unbound. Trauma-informed, somatic. £60/week phone support add-on available.',
  alternates: { canonical: '/the-work/recovery' },
};

const ACCENT = '#6E3A5A';

export default async function RecoveryPage() {
  const cms = await getProgrammeBySlug('recovery');
  const heroImage = mediaUrl(cms?.heroImage as { url?: string } | undefined) || getStockImage('reset-stories', 'recovery-hero');
  const splitParas = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const introParas = cms?.intro ? splitParas(cms.intro) : [
    'Gaslighting does not just confuse your thinking. It dismantles your ability to trust your own body. The signals that used to tell you something is wrong — the tightening in your chest, the instinct to leave the room, the quiet voice that says this is not right — those signals get systematically overridden until you cannot hear them at all.',
    'What remains is hypervigilance. Freeze. Fawn. A nervous system permanently scanning for threat, even years after the relationship has ended. The body-level residue of narcissistic abuse is not a mindset problem. It is a nervous system injury.',
    'This is why talk therapy alone often is not enough. You can understand what happened intellectually and still feel the activation in your body every time you hear a particular tone of voice or walk into a room with a certain energy.',
    'Somatic coaching works at the level where the damage actually lives. In the body. In the automatic responses. In the nervous system patterns that were rewired by someone who needed you to doubt yourself.',
  ];
  const stages = parseStages(cms?.stagesList) || [
    { label: 'Month One', title: 'Untangle.', body: 'Somatic mapping, breathwork, Flash EMDR for specific traumatic memories. We identify where the patterns live in the body and begin to separate your responses from the ones that were installed by someone else.' },
    { label: 'Month Two', title: 'Unbind.', body: 'TRE for trauma release, Internal Family Systems parts work, boundary recalibration. The parts of you that learned to fawn, freeze, or fight begin to find new options. Your boundaries stop being theoretical and become felt.' },
    { label: 'Month Three', title: 'Unbound.', body: 'Integration, intuition strengthening, personal recovery map. The signal comes back. You start hearing your own body again. By month three something genuine has shifted, not at the level of insight but at the level of automatic response.' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="rec-hero">
        <div className="rec-hero-grid">
          <div className="rec-hero-text">
            <p className="rec-eyebrow">The Work · Recovery coaching</p>
            <h1 className="rec-title">{cms?.title || 'Untangle. Unbind. Unbound.'}</h1>
            <p className="rec-tagline"><em>{cms?.tagline || 'Three months to reclaim yourself, permanently.'}</em></p>
          </div>
          <div className="rec-hero-img" style={{ backgroundImage: `url('${heroImage}')` }} />
        </div>
      </section>

      <section className="rec-body">
        <div className="rec-body-inner">
          {introParas.map((p, i) => <p key={i} className="rec-body-text">{p}</p>)}
        </div>
      </section>

      <section className="rec-stages">
        <div className="rec-stages-inner">
          <p className="rec-section-label">The three months</p>
          <div className="rec-stages-grid">
            {stages.map((stage, i) => (
              <article key={i} className="rec-stage" style={{ borderTopColor: STAGE_COLOURS[i % STAGE_COLOURS.length] }}>
                <p className="rec-stage-num">{stage.label}</p>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rec-includes">
        <div className="rec-includes-inner">
          <p className="rec-section-label">What&apos;s included</p>
          <ul>
            <li>Twelve weekly sessions, 1:1 with Anna, 60 minutes each</li>
            <li>Voice note support between sessions, Tuesday to Thursday</li>
            <li>The full somatic toolkit: Flash EMDR, TRE, IFS parts work, Brainspotting, breathwork, pendulum where it fits</li>
            <li>Personalised recovery map at the close</li>
            <li>Optional: phone support add-on at £60/week (up to four 60-minute calls a month)</li>
          </ul>
          <p className="rec-pricing">Investment is by enquiry — Anna shapes the price to your situation. Payment plans available. Some places held at reduced rate for women genuinely unable to pay full price.</p>
        </div>
      </section>

      <section className="rec-credentials">
        <div className="rec-credentials-inner">
          <p className="rec-section-label">Credentials</p>
          <ul>
            <li>Trauma-informed coach (clinical training in somatic enquiry, IFS, Flash EMDR, TRE, Brainspotting)</li>
            <li>Personal lived experience of recovering from narcissistic abuse and rebuilding from it</li>
            <li>Building <strong>Narc Abuse Aid</strong>, a UK charity providing recovery resources and community for survivors</li>
          </ul>
        </div>
      </section>

      <section className="rec-form-section" id="enquire">
        <div className="rec-form-grid">
          <div className="rec-form-text">
            <p className="rec-section-label">Reach out</p>
            <h2 className="rec-form-title">A first private conversation.</h2>
            <p className="rec-form-body">Anna replies to every recovery enquiry herself, privately, within 48 hours. Discovery call free. No pressure. If 1:1 is not the right fit right now, she will say so and point you to what is.</p>
            <p className="rec-form-body" style={{ fontSize: '0.85rem', color: '#8C8880' }}>If you are in immediate danger, please contact <Link href="https://www.nationaldahelpline.org.uk/" style={{ color: ACCENT }}>National Domestic Abuse Helpline 0808 2000 247</Link> (UK) before reading any further on this site.</p>
          </div>
          <EnquiryForm
            endpoint="/api/lead/recovery"
            accentColour={ACCENT}
            submitLabel="Send a private enquiry"
            successTitle="Thank you for reaching out."
            successMessage="Anna will reply privately within 48 hours, from her personal email. No automated responses to recovery enquiries."
            fields={[
              { name: 'name', label: 'Your first name', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'A safe email address Anna can reply to' },
              { name: 'situation', label: 'Where are you in this?', type: 'textarea', rows: 5, required: true, placeholder: 'A few sentences. As much or as little as feels right. Anna reads every word.' },
              { name: 'phone_support', label: 'Are you interested in phone support?', type: 'select', options: ['Yes — interested in £60/week phone support add-on', 'No — sessions only', 'Not sure yet'] },
            ]}
          />
        </div>
      </section>
    </>
  );
}

const pageStyles = `
.rec-hero { background: linear-gradient(160deg, #F1EAE0 0%, #F0E4EA 100%); padding: 3rem 2rem 2rem; }
.rec-hero-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
.rec-hero-img { aspect-ratio: 4/5; max-height: 460px; background-size: cover; background-position: center; border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
.rec-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.6rem; }
.rec-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(2.4rem, 5.5vw, 3.4rem); color: #231F20; letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem; }
.rec-tagline { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: clamp(1.1rem, 2.4vw, 1.4rem); color: #3D3D3A; }

.rec-body { background: #fff; padding: 3rem 2rem; }
.rec-body-inner { max-width: 760px; margin: 0 auto; }
.rec-body-text { font-family: 'EB Garamond', Georgia, serif; font-size: 1.05rem; line-height: 1.85; color: #3D3D3A; margin-bottom: 1.2rem; }

.rec-stages { background: #F5F3EF; padding: 3rem 2rem; }
.rec-stages-inner { max-width: 1100px; margin: 0 auto; }
.rec-stages-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; margin-top: 1rem; }
.rec-stage { background: #fff; padding: 1.6rem; border-radius: 8px; border-top: 3px solid; }
.rec-stage-num { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.55rem; letter-spacing: 0.22em; text-transform: uppercase; color: #8C8880; margin-bottom: 0.5rem; }
.rec-stage h3 { font-family: 'Work Sans', sans-serif; font-weight: 400; font-size: 1.4rem; color: #231F20; margin-bottom: 0.5rem; }
.rec-stage p { font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; line-height: 1.7; color: #3D3D3A; }

.rec-includes { background: #fff; padding: 2.5rem 2rem; }
.rec-includes-inner { max-width: 760px; margin: 0 auto; }
.rec-section-label { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.8rem; }
.rec-includes ul { list-style: none; padding: 0; margin: 0 0 1.5rem; }
.rec-includes li { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.7; color: #3D3D3A; padding: 0.5rem 0 0.5rem 1.5rem; position: relative; border-bottom: 1px solid rgba(0,0,0,0.06); }
.rec-includes li:last-child { border-bottom: none; }
.rec-includes li::before { content: '+'; position: absolute; left: 0; color: #6E3A5A; font-weight: 700; }
.rec-pricing { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.7; color: #3D3D3A; padding-top: 0.8rem; border-top: 1px solid rgba(0,0,0,0.08); }

.rec-credentials { background: #F5F3EF; padding: 2rem; }
.rec-credentials-inner { max-width: 760px; margin: 0 auto; }
.rec-credentials ul { list-style: none; padding: 0; margin: 0; }
.rec-credentials li { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.7; color: #3D3D3A; padding: 0.4rem 0 0.4rem 1.5rem; position: relative; }
.rec-credentials li::before { content: '·'; position: absolute; left: 0; color: #6E3A5A; font-weight: 700; font-size: 1.3rem; line-height: 1; }

.rec-form-section { background: #fff; padding: 3rem 2rem 4rem; }
.rec-form-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 3rem; align-items: start; }
.rec-form-text { padding-top: 1rem; }
.rec-form-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(1.8rem, 4vw, 2.4rem); color: #231F20; letter-spacing: 0.03em; line-height: 1.15; margin-bottom: 0.8rem; }
.rec-form-body { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.8; color: #3D3D3A; margin-bottom: 0.8rem; }

@media (max-width: 900px) {
  .rec-hero-grid, .rec-form-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .rec-hero-img { max-height: 320px; aspect-ratio: 16/10; }
  .rec-stages-grid { grid-template-columns: 1fr; }
}
`;
