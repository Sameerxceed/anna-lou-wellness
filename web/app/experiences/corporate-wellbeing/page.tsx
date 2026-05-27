import { Metadata } from 'next';
import EnquiryForm from '@/components/EnquiryForm';
import ReviewsSection from '@/components/ReviewsSection';
import FAQAccordion from '@/components/FAQAccordion';
import { getStockImage } from '@/data/stock-images';
import { getExperienceBySlug, parseSecondaryList } from '@/lib/experience-page';
import { getTestimonials, getFAQs } from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'Corporate Wellbeing | Bespoke Workplace Programmes',
  description: 'Bespoke wellbeing formats for teams and organisations. The Signal Method adapted for the workplace. Half-days, full-days, ongoing programmes.',
  alternates: { canonical: '/experiences/corporate-wellbeing' },
};

const ACCENT = '#7BAFDD';

export default async function CorporatePage() {
  const [cms, reviews, faqs] = await Promise.all([
    getExperienceBySlug('corporate-wellbeing'),
    getTestimonials({ tag: 'corporate' }),
    getFAQs({ page: 'corporate-wellbeing' }),
  ]);
  const heroImage = mediaUrl(cms?.heroImage as { url?: string } | undefined) || getStockImage('work-and-money', 'corporate-hero');
  const splitParas = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const introParas = cms?.intro ? splitParas(cms.intro) : [
    'Bespoke formats for teams and organisations. Workshops, keynotes, and ongoing wellbeing programmes tailored to your workplace. The Signal Method adapted for corporate environments.',
    'Formats range from a single 90-minute session to a full-day immersive experience. Available in person at your workplace, on the houseboat at Taggs Island, or online.',
    'Anna brings fifteen years of entrepreneurial experience and clinical somatic training to every corporate engagement. This is not generic mindfulness. This is nervous system work that actually changes how people show up.',
  ];
  const formats = parseSecondaryList(cms?.secondaryList) || [
    { title: '90-minute session', body: 'A single workshop. Online or in person. Topic shaped to your team.' },
    { title: 'Half-day or full-day', body: 'Immersive teambuilding plus nervous system regulation. On houseboat or at your space.' },
    { title: 'Keynote / panel', body: 'For conferences and offsites. Up to 200 attendees.' },
    { title: 'Ongoing programme', body: 'Quarterly or monthly cadence. Depth over time. Bespoke design.' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="cw-hero">
        <div className="cw-hero-grid">
          <div className="cw-hero-text">
            <p className="cw-eyebrow">{(cms as any)?.eyebrow || 'Experiences · For teams'}</p>
            <h1 className="cw-title">{cms?.title || 'Corporate Wellbeing.'}</h1>
            <p className="cw-tagline"><em>{(cms as any)?.tagline || 'Nervous system work that actually changes how people show up.'}</em></p>
          </div>
          <div className="cw-hero-img" style={{ backgroundImage: `url('${heroImage}')` }} />
        </div>
      </section>

      <section className="cw-body">
        <div className="cw-body-inner">
          {introParas.map((p, i) => <p key={i} className="cw-body-text">{p}</p>)}
        </div>
      </section>

      <section className="cw-formats">
        <div className="cw-formats-inner">
          <p className="cw-section-label">Formats</p>
          <div className="cw-formats-grid">
            {formats.map((f, i) => (
              <div key={i} className="cw-format">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection reviews={reviews} title="From client teams" kicker="Reviews" kickerColour={ACCENT} />

      <section className="cw-form-section" id="enquire">
        <div className="cw-form-grid">
          <div className="cw-form-text">
            <p className="cw-section-label">Request a proposal</p>
            <h2 className="cw-form-title">Tell Anna about your team.</h2>
            <p className="cw-form-body">Anna writes every proposal personally. She will respond within 48 hours with format options, pricing, and the next steps.</p>
          </div>
          <EnquiryForm
            endpoint="/api/lead/corporate"
            accentColour={ACCENT}
            successTitle="Got it."
            successMessage="Anna will reply within 48 hours with format options and pricing."
            submitLabel="Send enquiry"
            fields={[
              { name: 'name', label: 'Your name', required: true },
              { name: 'company', label: 'Company', required: true },
              { name: 'role', label: 'Your role', required: true },
              { name: 'format', label: 'Format you are interested in', type: 'select', required: true, options: ['90-minute session', 'Half-day', 'Full day', 'Keynote / panel', 'Ongoing programme', 'Not sure yet'] },
              { name: 'message', label: 'Tell us about the team and what you need', type: 'textarea', rows: 5, required: true, placeholder: 'Team size, location, what is happening that brought you here, anything else helpful.' },
              { name: 'email', label: 'Email', type: 'email', required: true },
            ]}
          />
        </div>
      </section>

      <FAQAccordion faqs={faqs} accentColour={ACCENT} background="#F5F3EF" />
    </>
  );
}

const pageStyles = `
.cw-hero { background: linear-gradient(160deg, #F1EAE0 0%, #E5EFF8 100%); padding: 3rem 2rem 2rem; }
.cw-hero-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
.cw-hero-img { aspect-ratio: 4/5; max-height: 460px; background-size: cover; background-position: center; border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
.cw-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #7BAFDD; margin-bottom: 0.6rem; }
.cw-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(2.4rem, 5.5vw, 3.4rem); color: #231F20; letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem; }
.cw-tagline { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: clamp(1.1rem, 2.4vw, 1.4rem); color: #3D3D3A; }

.cw-body { background: #fff; padding: 3rem 2rem; }
.cw-body-inner { max-width: 900px; margin: 0 auto; }
.cw-body-text { font-family: 'EB Garamond', Georgia, serif; font-size: 1.05rem; line-height: 1.85; color: #3D3D3A; margin-bottom: 1.2rem; }

.cw-formats { background: #F5F3EF; padding: 2.5rem 2rem; }
.cw-formats-inner { max-width: 1100px; margin: 0 auto; }
.cw-section-label { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.8rem; }
.cw-formats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.cw-format { background: #fff; padding: 1.4rem; border-radius: 8px; border-top: 3px solid #7BAFDD; }
.cw-format h3 { font-family: 'Work Sans', sans-serif; font-weight: 400; font-size: 1.05rem; color: #231F20; margin-bottom: 0.4rem; }
.cw-format p { font-family: 'EB Garamond', Georgia, serif; font-size: 0.9rem; line-height: 1.6; color: #3D3D3A; }

.cw-form-section { background: #fff; padding: 3rem 2rem 4rem; }
.cw-form-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 3rem; align-items: start; }
.cw-form-text { padding-top: 1rem; }
.cw-form-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(1.8rem, 4vw, 2.4rem); color: #231F20; letter-spacing: 0.03em; line-height: 1.15; margin-bottom: 0.8rem; }
.cw-form-body { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.8; color: #3D3D3A; }

@media (max-width: 900px) {
  .cw-hero-grid, .cw-form-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .cw-hero-img { max-height: 320px; aspect-ratio: 16/10; }
  .cw-formats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .cw-formats-grid { grid-template-columns: 1fr; }
}
`;
