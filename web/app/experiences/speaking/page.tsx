import { Metadata } from 'next';
import EnquiryForm from '@/components/EnquiryForm';
import ReviewsSection from '@/components/ReviewsSection';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import { ServiceSchema, BreadcrumbSchema } from '@/components/StructuredData';
import { getStockImage } from '@/data/stock-images';
import { getExperienceBySlug, parseSecondaryList } from '@/lib/experience-page';
import { getTestimonials, getFAQs } from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'Speaking | Keynotes, Panels, Online Events',
  description: 'Anna Lou speaks on the nervous system, somatic coaching, women rebuilding from burnout, and the inner work of leadership. Online and in person.',
  alternates: { canonical: '/experiences/speaking' },
};

const ACCENT = '#FAA21B';

export default async function SpeakingPage() {
  const [cms, reviews, faqs] = await Promise.all([
    getExperienceBySlug('speaking'),
    getTestimonials({ tag: 'speaking' }),
    getFAQs({ page: 'speaking' }),
  ]);
  const heroImage = mediaUrl(cms?.heroImage as { url?: string } | undefined) || getStockImage('community', 'speaking-hero');
  const splitParas = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const introParas = cms?.intro ? splitParas(cms.intro) : [
    'Anna speaks on the inner guidance system, the nervous system, somatic coaching, the recovery work that follows narcissistic abuse, and what it actually takes for a woman to rebuild from burnout. She also speaks to founders on the link between the body and the business.',
    'Format depends on what your audience needs. Keynote, panel, fireside, intimate Q&A. Online or in the room.',
  ];
  const talks = parseSecondaryList(cms?.secondaryList) || [
    { title: 'The Inner Guidance System.', body: 'What it is, how it gets scrambled, how to bring it back online.' },
    { title: 'Burnout is a nervous system event.', body: 'The biology of what happens, and why willpower will not fix it.' },
    { title: 'Recovering from narcissistic abuse.', body: 'Honest, somatic, no jargon. For survivors and the people supporting them.' },
    { title: 'The body knows first.', body: 'Why founder decisions made from a dysregulated body are almost always wrong.' },
    { title: 'The Signal Method.', body: 'A framework for living and leading from your own signal, not someone else\'s noise.' },
  ];

  return (
    <>
      <ServiceSchema name="Speaking" description="Keynotes, panels, fireside chats on the nervous system, somatic coaching, women rebuilding from burnout, and the inner work of leadership." url="/experiences/speaking" />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Experiences', href: '/experiences' }, { name: 'Speaking', href: '/experiences/speaking' }]} />
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="sp-hero">
        <div className="sp-hero-grid">
          <div className="sp-hero-text">
            <p className="sp-eyebrow">Experiences · For events</p>
            <h1 className="sp-title">{cms?.title || 'Speaking.'}</h1>
            <p className="sp-tagline"><em>Keynotes, panels, Q&amp;As. Online and in person.</em></p>
          </div>
          <div className="sp-hero-img" style={{ backgroundImage: `url('${heroImage}')` }} />
        </div>
      </section>

      <section className="sp-body">
        <div className="sp-body-inner">
          {introParas.map((p, i) => <p key={i} className="sp-body-text">{p}</p>)}
        </div>
      </section>

      <section className="sp-talks">
        <div className="sp-talks-inner">
          <p className="sp-section-label">Talks she gives most</p>
          <ol className="sp-talks-list">
            {talks.map((t, i) => (
              <li key={i}><strong>{t.title}</strong> {t.body}</li>
            ))}
          </ol>
        </div>
      </section>

      <ReviewsSection reviews={reviews} title="From event organisers" kicker="Reviews" kickerColour={ACCENT} />

      <section className="sp-form-section" id="enquire">
        <div className="sp-form-grid">
          <div className="sp-form-text">
            <p className="sp-section-label">Book Anna</p>
            <h2 className="sp-form-title">Tell us about your event.</h2>
            <p className="sp-form-body">Anna replies to every speaking enquiry personally within 48 hours.</p>
          </div>
          <EnquiryForm
            endpoint="/api/lead/speaking"
            accentColour={ACCENT}
            submitLabel="Send enquiry"
            successTitle="Thank you."
            successMessage="Anna will reply within 48 hours with availability and a fee guide."
            fields={[
              { name: 'name', label: 'Your name', required: true },
              { name: 'organisation', label: 'Organisation', required: true },
              { name: 'event_type', label: 'Event type', type: 'select', required: true, options: ['Keynote', 'Panel', 'Fireside chat', 'Q&A', 'Workshop', 'Online webinar', 'Other'] },
              { name: 'date', label: 'Event date (if known)', type: 'date' },
              { name: 'format', label: 'Format', type: 'select', required: true, options: ['In person', 'Online', 'Hybrid', 'To be decided'] },
              { name: 'audience_size', label: 'Audience size (approx)', placeholder: 'e.g. 50, 200, 1,000' },
              { name: 'brief', label: 'Brief — what is the event and what do you want from Anna?', type: 'textarea', rows: 5, required: true, placeholder: 'Theme, audience, what success looks like, anything else helpful.' },
              { name: 'email', label: 'Email', type: 'email', required: true },
            ]}
          />
        </div>
      </section>

      <FAQAccordion faqs={faqs} accentColour={ACCENT} background="#F5F3EF" />
      <UpsellBlock items={(cms?.upsells as UpsellItem[] | undefined) || []} title="Where next." kicker="Continue your journey" />
    </>
  );
}

const pageStyles = `
.sp-hero { background: linear-gradient(160deg, #F1EAE0 0%, #FFE9C4 100%); padding: 3rem 2rem 2rem; }
.sp-hero-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
.sp-hero-img { aspect-ratio: 4/5; max-height: 460px; background-size: cover; background-position: center; border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
.sp-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #FAA21B; margin-bottom: 0.6rem; }
.sp-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(2.4rem, 5.5vw, 3.4rem); color: #231F20; letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem; }
.sp-tagline { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: clamp(1.1rem, 2.4vw, 1.4rem); color: #3D3D3A; }

.sp-body { background: #fff; padding: 3rem 2rem; }
.sp-body-inner { max-width: 900px; margin: 0 auto; }
.sp-body-text { font-family: 'EB Garamond', Georgia, serif; font-size: 1.05rem; line-height: 1.85; color: #3D3D3A; margin-bottom: 1.2rem; }

.sp-talks { background: #F5F3EF; padding: 2.5rem 2rem; }
.sp-talks-inner { max-width: 900px; margin: 0 auto; }
.sp-section-label { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.8rem; }
.sp-talks-list { padding-left: 1.5rem; margin: 0; }
.sp-talks-list li { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.8; color: #3D3D3A; padding: 0.5rem 0; }

.sp-form-section { background: #fff; padding: 3rem 2rem 4rem; }
.sp-form-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 3rem; align-items: start; }
.sp-form-text { padding-top: 1rem; }
.sp-form-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(1.8rem, 4vw, 2.4rem); color: #231F20; letter-spacing: 0.03em; line-height: 1.15; margin-bottom: 0.8rem; }
.sp-form-body { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.8; color: #3D3D3A; }

@media (max-width: 900px) {
  .sp-hero-grid, .sp-form-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .sp-hero-img { max-height: 320px; aspect-ratio: 16/10; }
}
`;
