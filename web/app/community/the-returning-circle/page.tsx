import { Metadata } from 'next';
import EnquiryForm from '@/components/EnquiryForm';
import FAQAccordion from '@/components/FAQAccordion';
import { getStockImage } from '@/data/stock-images';
import { getCommunityEventBySlug } from '@/lib/generic-page';
import { getFAQs } from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'The Returning Circle | Weekly Donation-Based Circle',
  description: 'Weekly somatic circle on the houseboat at Taggs Island, in person or live on Zoom. Donation-based. RSVP to hold a place.',
  alternates: { canonical: '/community/the-returning-circle' },
};

const ACCENT = '#5DCAA5';

export default async function CirclePage() {
  const [cms, faqs] = await Promise.all([
    getCommunityEventBySlug('the-returning-circle'),
    getFAQs({ page: 'the-returning-circle' }),
  ]);
  const heroImage = mediaUrl(cms?.heroImage as { url?: string } | undefined) || getStockImage('community', 'returning-circle');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="rc-hero">
        <div className="rc-hero-grid">
          <div className="rc-hero-text">
            <p className="rc-eyebrow">Community · Weekly · Donation-based</p>
            <h1 className="rc-title">{cms?.title || 'The Returning Circle.'}</h1>
            <p className="rc-tagline"><em>A room. People who are honest. Connection that regulates the nervous system.</em></p>
          </div>
          <div className="rc-hero-img" style={{ backgroundImage: `url('${heroImage}')` }} />
        </div>
      </section>

      <section className="rc-body">
        <div className="rc-body-inner">
          <p className="rc-body-text">Every Wednesday evening Anna holds a circle. Hybrid. In person on the houseboat at Taggs Island for those who can travel. Live on Zoom for everyone else.</p>
          <p className="rc-body-text"><strong>What it is:</strong> a room. People who are honest. No advice. No fixing. No cross-talk. Just being in the presence of other humans who are willing to say what is actually going on.</p>
          <p className="rc-body-text"><strong>What it is not:</strong> therapy, a support group, a workshop, or anything with a curriculum. There is no programme. There is no progression. You come when you need to. You stop when you are done.</p>
          <p className="rc-body-text">Most people who come for the first time look nervous. By the end of the evening something in them has settled. Not because anything dramatic happened. Because they were in a room where they did not have to perform. That sounds like nothing. It is actually everything.</p>
          <p className="rc-body-text">Connection is biological. Your nervous system needs co-regulation. It needs other regulated humans. That is not self-help language. That is neuroscience.</p>
        </div>
      </section>

      <section className="rc-details">
        <div className="rc-details-inner">
          <p className="rc-section-label">How it runs</p>
          {(() => {
            const cmsAny = cms as Record<string, unknown> | null;
            const rawSessions = cmsAny?.sessions;
            const sessions = Array.isArray(rawSessions) ? (rawSessions as Array<Record<string, unknown>>) : [];
            if (sessions.length > 0) {
              return (
                <ul className="rc-sessions">
                  {sessions.map((s, i) => {
                    const day = (s.day_of_week as string) || '';
                    const time = (s.time as string) || '';
                    const loc = (s.location_label as string) || '';
                    const locUrl = (s.location_url as string) || '';
                    const notes = (s.notes as string) || '';
                    return (
                      <li key={i} className="rc-session">
                        <p className="rc-session-when">{[day, time].filter(Boolean).join(', ')}</p>
                        {loc && (
                          locUrl
                            ? <a href={locUrl} target="_blank" rel="noopener" className="rc-session-loc">{loc}</a>
                            : <p className="rc-session-loc">{loc}</p>
                        )}
                        {notes && <p className="rc-session-notes">{notes}</p>}
                      </li>
                    );
                  })}
                  <li>Donation-based. Pay what feels right when you book</li>
                  <li>Replays kept inside the Reset Room library</li>
                </ul>
              );
            }
            return (
              <ul>
                <li>Weekly, Wednesdays, 7.30pm to 8.45pm UK</li>
                <li>Hybrid. In person on the houseboat at Taggs Island, or on Zoom</li>
                <li>Donation-based. Pay what feels right when you book</li>
                <li>Replays kept inside the Reset Room library</li>
              </ul>
            );
          })()}
        </div>
      </section>

      <section className="rc-rsvp" id="rsvp">
        <div className="rc-rsvp-grid">
          <div className="rc-rsvp-text">
            <p className="rc-section-label">RSVP</p>
            <h2 className="rc-rsvp-title">Hold a place.</h2>
            <p className="rc-rsvp-body">RSVP for the next circle. You will get a Zoom link, the houseboat address if you are coming in person, and a small note from Anna a day before.</p>
          </div>
          <EnquiryForm
            endpoint="/api/lead/returning-circle"
            accentColour={ACCENT}
            successTitle="You're in for the next circle."
            successMessage="Anna will send you the link or address by Tuesday evening. Bring nothing except yourself."
            submitLabel="Hold my place"
            fields={[
              { name: 'firstName', label: 'First name', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'attending', label: 'Attending live in person OR live on Zoom', type: 'select', required: true, options: ['In person on the houseboat (Taggs Island)', 'On Zoom'] },
            ]}
          />
        </div>
      </section>

      <FAQAccordion faqs={faqs} accentColour={ACCENT} background="#F5F3EF" />
    </>
  );
}

const pageStyles = `
.rc-hero { background: linear-gradient(160deg, #F1EAE0 0%, #DCEFE6 100%); padding: 3rem 2rem 2rem; }
.rc-hero-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
.rc-hero-img { aspect-ratio: 4/5; max-height: 460px; background-size: cover; background-position: center; border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
.rc-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: #5DCAA5; margin-bottom: 0.6rem; }
.rc-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(2.4rem, 5.5vw, 3.4rem); color: #231F20; letter-spacing: 0.04em; line-height: 1.15; margin-bottom: 0.5rem; }
.rc-tagline { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: clamp(1.1rem, 2.4vw, 1.4rem); color: #3D3D3A; }

.rc-body { background: #fff; padding: 3rem 2rem; }
.rc-body-inner { max-width: 900px; margin: 0 auto; }
.rc-body-text { font-family: 'EB Garamond', Georgia, serif; font-size: 1.05rem; line-height: 1.85; color: #3D3D3A; margin-bottom: 1.2rem; }

.rc-details { background: #F5F3EF; padding: 2.5rem 2rem; }
.rc-details-inner { max-width: 900px; margin: 0 auto; }
.rc-section-label { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #6E3A5A; margin-bottom: 0.8rem; }
.rc-details ul { list-style: none; padding: 0; margin: 0; }
.rc-details li { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.7; color: #3D3D3A; padding: 0.5rem 0 0.5rem 1.5rem; position: relative; border-bottom: 1px solid rgba(0,0,0,0.06); }
.rc-details li:last-child { border-bottom: none; }
.rc-details li::before { content: '+'; position: absolute; left: 0; color: #5DCAA5; font-weight: 700; }
.rc-sessions .rc-session { padding: 0.8rem 0 0.8rem 1.5rem; }
.rc-session-when { font-family: 'Work Sans', sans-serif; font-weight: 500; font-size: 0.95rem; color: #231F20; margin-bottom: 0.2rem; }
.rc-session-loc { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #3D3D3A; }
a.rc-session-loc { color: #6E3A5A; text-decoration: underline; text-underline-offset: 2px; }
a.rc-session-loc:hover { color: #5A2E4A; }
.rc-session-notes { font-family: 'EB Garamond', Georgia, serif; font-size: 0.92rem; color: #5D5A52; font-style: italic; margin-top: 0.25rem; }

.rc-rsvp { background: #fff; padding: 3rem 2rem 4rem; }
.rc-rsvp-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 3rem; align-items: start; }
.rc-rsvp-text { padding-top: 1rem; }
.rc-rsvp-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(1.8rem, 4vw, 2.4rem); color: #231F20; letter-spacing: 0.03em; line-height: 1.15; margin-bottom: 0.8rem; }
.rc-rsvp-body { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; line-height: 1.8; color: #3D3D3A; }

@media (max-width: 900px) {
  .rc-hero-grid, .rc-rsvp-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .rc-hero-img { max-height: 320px; aspect-ratio: 16/10; }
}
`;
