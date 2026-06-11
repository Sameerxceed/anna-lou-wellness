import type { Experience } from '@/lib/cms';
import BookingButton from './BookingButton';

// Renders a grid of upcoming experiences (retreats or workshops) below the
// static category copy on /experiences/retreats and /experiences/workshops.
// Each card links to /contact for now (Stripe live-mode not yet active);
// once Anna activates live Stripe, swap the href for /experiences/book/[slug]
// or a Checkout-Session redirect.

interface Props {
  items: Experience[];
  accentColour: string;
  emptyLabel?: string;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  // Strapi returns YYYY-MM-DD. Render as "13 June 2026" for editorial feel.
  try {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  } catch {
    return iso;
  }
}

export default function UpcomingExperiences({ items, accentColour, emptyLabel }: Props) {
  const upcoming = items
    .filter(e => e.isUpcoming)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: upcomingStyles }} />
      <section className="upcoming-wrap">
        <div className="upcoming-inner">
          <p className="upcoming-kicker reveal" style={{ color: accentColour }}>Upcoming dates</p>
          <h2 className="upcoming-title reveal rd1">Book your place</h2>

          {upcoming.length === 0 && (
            <p className="upcoming-empty reveal rd2">{emptyLabel || 'New dates announced soon.'}</p>
          )}

          {upcoming.length > 0 && (
            <div className="upcoming-grid">
              {upcoming.map((e, i) => (
                <article key={e.slug} className={`upcoming-card reveal${i > 0 ? ` rd${Math.min(i, 4)}` : ''}`}>
                  <p className="upcoming-date" style={{ color: accentColour }}>{formatDate(e.date)}</p>
                  <h3 className="upcoming-name">
                    <a href={`/experiences/${e.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {e.name}
                    </a>
                  </h3>
                  {e.location && <p className="upcoming-loc">{e.location}</p>}
                  {e.priceLabel && <p className="upcoming-price">{e.priceLabel}</p>}
                  {e.description && (
                    <p className="upcoming-desc">{e.description.split('\n\n')[0]}</p>
                  )}
                  {/*
                    Two-button row: primary opens the dedicated sales/booking
                    page (/experiences/[slug]) which has full sales content +
                    booking button. Secondary opens the direct booking URL if
                    Anna set one (Calendly etc.) for power users who want to
                    skip the sales page.
                  */}
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                    <a
                      href={`/experiences/${e.slug}`}
                      className="upcoming-cta"
                      style={{ color: accentColour, borderColor: accentColour }}
                    >
                      Read more →
                    </a>
                    {e.bookingUrl ? (
                      <BookingButton
                        url={e.bookingUrl}
                        label="Book directly →"
                        className="upcoming-cta"
                        style={{ color: accentColour, borderColor: accentColour, opacity: 0.85 }}
                      />
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="upcoming-note reveal">
            Bookings open by email while we finalise the new payment system. Reply within 24 hours.
          </p>
        </div>
      </section>
    </>
  );
}

const upcomingStyles = `
.upcoming-wrap { background:#F5F3EF; padding:2rem 3rem 2.5rem; }
.upcoming-inner { max-width:1200px; margin:0 auto; }
.upcoming-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.5rem; }
.upcoming-title { font-family:'Work Sans','Helvetica Neue',sans-serif; font-weight:400; font-size:clamp(1.4rem,2.5vw,1.8rem); color:#231F20; line-height:1.2; margin-bottom:1.2rem; letter-spacing:0.02em; }
.upcoming-empty { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1rem; color:#3D3D3A; }
.upcoming-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1rem; }
.upcoming-card { background:#fff; border-radius:8px; padding:1.5rem; transition:all 0.3s; display:flex; flex-direction:column; }
.upcoming-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.06); }
.upcoming-date { font-family:Mulish,sans-serif; font-weight:600; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:0.4rem; }
.upcoming-name { font-family:'EB Garamond',Georgia,serif; font-weight:500; font-size:1.05rem; color:#231F20; line-height:1.3; margin-bottom:0.4rem; }
.upcoming-loc { font-family:Mulish,sans-serif; font-size:0.7rem; color:#5D5A52; letter-spacing:0.04em; margin-bottom:0.3rem; }
.upcoming-price { font-family:Mulish,sans-serif; font-weight:600; font-size:0.72rem; color:#231F20; letter-spacing:0.04em; margin-bottom:0.6rem; }
.upcoming-desc { font-family:'EB Garamond',Georgia,serif; font-size:0.88rem; color:#3D3D3A; line-height:1.6; margin-bottom:1rem; flex:1; }
.upcoming-cta { font-family:Mulish,sans-serif; font-weight:600; font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.7rem 1.1rem; border:1px solid; border-radius:3px; align-self:flex-start; text-decoration:none; transition:all 0.3s; }
.upcoming-cta:hover { background:#231F20; color:#fff; border-color:#231F20; }
.upcoming-note { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:0.85rem; color:#5D5A52; text-align:center; margin-top:0.8rem; }

@media (max-width:900px) {
  .upcoming-wrap { padding:1.5rem 1.2rem 2rem; }
  .upcoming-grid { grid-template-columns:1fr; }
}
`;
