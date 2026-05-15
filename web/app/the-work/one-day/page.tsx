import { Metadata } from 'next';
import ProgrammePage from '@/components/ProgrammePage';
import EnquiryForm from '@/components/EnquiryForm';
import { getStockImage } from '@/data/stock-images';
import { getProgrammeBySlug, programmeProps } from '@/lib/programme';

export const metadata: Metadata = {
  title: 'One Day | Private Somatic Coaching Intensive',
  description: 'A full day of private 1:1 somatic coaching with Anna Lou. Houseboat at Hampton or virtual. By enquiry.',
  alternates: { canonical: '/the-work/one-day' },
};

const ACCENT = '#5DCAA5';

export default async function OneDayPage() {
  const cms = await getProgrammeBySlug('one-day');
  const props = programmeProps(cms, {
    title: 'One Day.',
    tagline: 'A full day. Held, focused, finished.',
    accentColour: ACCENT,
    image: getStockImage('houseboat', 'one-day'),
    intro: [
      'One Day is exactly that. A full day, 1:1, on the houseboat at Taggs Island or online. No multi-week commitment. One concentrated, unhurried, immersive day.',
      'We begin with a full inner guidance system audit. We move through whatever the day calls for: somatic work, belief repatterning, breathwork, Signal Method, pendulum alignment, business strategy if you are building something.',
    ],
    whatsIncludedItems: [
      'A full day, 10am to 5pm UK, with breaks',
      'In person at the Hampton studio, or virtual via Zoom',
      'Pre-day intake form and a 30-minute scoping call the week before',
      'The day itself: nervous-system work, somatic enquiry, decision mapping, integration',
      'Lunch and refreshments included if in person',
      'A 60-minute integration call two weeks later',
    ],
    pricingBody: 'By enquiry. Each One Day is shaped around the person it is for.',
    ctaLabel: 'Send an enquiry below',
    ctaUrl: '#enquire',
  });
  return (
    <>
      <ProgrammePage {...props} />

      <style dangerouslySetInnerHTML={{ __html: `
        .od-form-section { background: #fff; padding: 3rem 2rem 4rem; }
        .od-form-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 3rem; align-items: start; }
        .od-form-text { padding-top: 1rem; }
        .od-section-label { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #5DCAA5; margin-bottom: 0.6rem; }
        .od-form-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(1.8rem, 4vw, 2.4rem); color: #231F20; letter-spacing: 0.03em; line-height: 1.15; margin-bottom: 0.8rem; }
        .od-form-body { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.8; color: #3D3D3A; }
        @media (max-width: 900px) { .od-form-grid { grid-template-columns: 1fr; gap: 1.5rem; } }
      `}} />

      <section className="od-form-section" id="enquire">
        <div className="od-form-grid">
          <div className="od-form-text">
            <p className="od-section-label">Enquire</p>
            <h2 className="od-form-title">Tell Anna what is bringing you to a One Day.</h2>
            <p className="od-form-body">Each One Day is shaped around the person it is for. Anna will reply within 48 hours with available dates and a quote.</p>
          </div>
          <EnquiryForm
            endpoint="/api/lead/one-day"
            accentColour={ACCENT}
            submitLabel="Send enquiry"
            successTitle="Got it."
            successMessage="Anna will reply within 48 hours with available dates and a quote."
            fields={[
              { name: 'name', label: 'Your name', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'bringing_you', label: 'What is bringing you to this?', type: 'textarea', rows: 5, required: true, placeholder: 'A few sentences. As honest as feels right.' },
              { name: 'preferred_dates', label: 'Preferred dates (or month / window)', placeholder: 'e.g. mid-July, weekday in August' },
              { name: 'format', label: 'Preferred format', type: 'select', options: ['In person on the houseboat', 'Online via Zoom', 'Either is fine'] },
            ]}
          />
        </div>
      </section>
    </>
  );
}
