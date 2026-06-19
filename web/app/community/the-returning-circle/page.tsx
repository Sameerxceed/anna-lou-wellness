import { Metadata } from 'next';
import EnquiryForm from '@/components/EnquiryForm';
import FAQAccordion from '@/components/FAQAccordion';
import { getStockImage } from '@/data/stock-images';
import { getCommunityEventBySlug } from '@/lib/generic-page';
import { getFAQs } from '@/lib/cms';
import { mediaUrl } from '@/lib/strapi';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';

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
          <p className="rc-body-text">Anna holds the Returning Circle weekly, sometimes more than once a week at different locations. The current times and places are listed below. Hybrid by default — in person where you can, on Zoom when you can't.</p>
          <p className="rc-body-text"><strong>What it is:</strong> a room. People who are honest. No advice. No fixing. No cross-talk. Just being in the presence of other humans who are willing to say what is actually going on.</p>
          <p className="rc-body-text"><strong>What it is not:</strong> therapy, a support group, a workshop, or anything with a curriculum. There is no programme. There is no progression. You come when you need to. You stop when you are done.</p>
          <p className="rc-body-text">Most people who come for the first time look nervous. By the end of the evening something in them has settled. Not because anything dramatic happened. Because they were in a room where they did not have to perform. That sounds like nothing. It is actually everything.</p>
          <p className="rc-body-text">Connection is biological. Your nervous system needs co-regulation. It needs other regulated humans. That is not self-help language. That is neuroscience.</p>
        </div>
      </section>

      <section className="rc-details">
        <div className="rc-details-inner">
          <p className="rc-section-label">Where + when</p>
          {(() => {
            const cmsAny = cms as Record<string, unknown> | null;
            const rawSessions = cmsAny?.sessions;
            const sessions = Array.isArray(rawSessions) ? (rawSessions as Array<Record<string, unknown>>) : [];
            // Card grid for >=1 session — Anna runs multiple per week at
            // different locations (Taggs Island + Battersea etc.). Each
            // session is its own card. Notes appear below the card.
            if (sessions.length > 0) {
              return (
                <>
                  <div className="rc-session-grid">
                    {sessions.map((s, i) => {
                      const day = (s.day_of_week as string) || '';
                      const time = (s.time as string) || '';
                      const loc = (s.location_label as string) || '';
                      const locUrl = (s.location_url as string) || '';
                      const notes = (s.notes as string) || '';
                      return (
                        <article key={i} className="rc-session-card">
                          <p className="rc-session-card-day">{day || 'Weekly'}</p>
                          {time && <p className="rc-session-card-time">{time}</p>}
                          {loc && (
                            locUrl
                              ? <a href={locUrl} target="_blank" rel="noopener" className="rc-session-card-loc">{loc} &nearr;</a>
                              : <p className="rc-session-card-loc">{loc}</p>
                          )}
                          {notes && <p className="rc-session-card-notes">{notes}</p>}
                        </article>
                      );
                    })}
                  </div>
                  <p className="rc-session-extra">Donation-based. Pay what feels right when you book. Replays kept inside the Reset Room library.</p>
                </>
              );
            }
            // Fallback when CMS has no sessions filled — show generic notice
            // pointing Anna (and visitors) at the booking form below.
            return (
              <ul>
                <li>Hybrid — in person at Taggs Island, or live on Zoom</li>
                <li>Donation-based. Pay what feels right when you book</li>
                <li>Replays kept inside the Reset Room library</li>
                <li><em>Anna sets the next weekly dates in Strapi → Community Event → The Returning Circle → Sessions.</em></li>
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
    <UpsellBlockForSingleton endpoint="/community-event-page" />
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
/* Side-by-side session cards. Each session = one location/time. */
.rc-session-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin: 0.4rem 0 1rem; }
.rc-session-card { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 6px; padding: 1.2rem 1.3rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: transform 0.2s, box-shadow 0.2s; }
.rc-session-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
.rc-session-card-day { font-family: 'Work Sans', sans-serif; font-weight: 500; font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: #5DCAA5; margin: 0 0 0.4rem; }
.rc-session-card-time { font-family: 'Work Sans', sans-serif; font-weight: 500; font-size: 1.2rem; color: #231F20; margin: 0 0 0.5rem; line-height: 1.2; }
.rc-session-card-loc { font-family: 'EB Garamond', Georgia, serif; font-size: 1rem; color: #3D3D3A; display: block; margin: 0 0 0.4rem; }
a.rc-session-card-loc { color: #6E3A5A; text-decoration: underline; text-underline-offset: 2px; }
a.rc-session-card-loc:hover { color: #5A2E4A; }
.rc-session-card-notes { font-family: 'EB Garamond', Georgia, serif; font-size: 0.92rem; color: #5D5A52; font-style: italic; margin: 0.4rem 0 0; line-height: 1.55; }
.rc-session-extra { font-family: 'EB Garamond', Georgia, serif; font-size: 0.95rem; color: #5D5A52; font-style: italic; margin: 1.2rem 0 0; text-align: center; }
@media (max-width: 600px) { .rc-session-grid { grid-template-columns: 1fr; } }

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
