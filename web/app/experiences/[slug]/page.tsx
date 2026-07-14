import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getExperiences, getTestimonials, getFAQs } from '@/lib/cms';
import { getStockImage } from '@/data/stock-images';
import BookingButton from '@/components/BookingButton';
import ReviewsSection from '@/components/ReviewsSection';
import FAQAccordion from '@/components/FAQAccordion';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import { ServiceSchema, EventSchema, BreadcrumbSchema, type ReviewInput } from '@/components/StructuredData';

/**
 * Individual Experience detail page — one sales page per Experience entry.
 *
 * Anna's 10 Jun complaint: workshop entries (e.g. Align & Amplify) ended on
 * the listing card with no proper sales page. Customers had to bounce to a
 * separate Product entry that didn't have full marketing content. This page
 * is now the SINGLE source for "I want to know about + book this".
 *
 * Renders:
 *   - Hero (image + title + tagline + date + location + price)
 *   - Description (richtext / paragraphs)
 *   - Book button (Calendly popup if URL is Calendly, otherwise plain link)
 *   - Reviews (filtered to this experience's slug)
 *   - FAQ (per-page from CMS)
 *   - Upsells ("Where next" — other services Anna chose)
 */

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

const TYPE_ACCENT: Record<string, string> = {
  retreat: '#7BAFDD',
  workshop: '#6E3A5A',
  corporate: '#7BAFDD',
  speaking: '#FAA21B',
};

const TYPE_LABEL: Record<string, string> = {
  retreat: 'Retreat',
  workshop: 'Workshop',
  corporate: 'Corporate',
  speaking: 'Speaking',
};

const TYPE_BREADCRUMB: Record<string, { name: string; href: string }> = {
  retreat: { name: 'Retreats', href: '/experiences/retreats' },
  workshop: { name: 'Workshops', href: '/experiences/workshops' },
  corporate: { name: 'Corporate Wellbeing', href: '/experiences/corporate-wellbeing' },
  speaking: { name: 'Speaking', href: '/experiences/speaking' },
};

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function splitParagraphs(s?: string | null): string[] {
  if (!s) return [];
  return s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const items = await getExperiences();
  const item = items.find((e) => e.slug === slug);
  if (!item) return { title: 'Experience Not Found' };
  const title = item.seoTitle || `${item.name} — Anna Lou Wellness`;
  const desc = item.seoDescription
    || (item.description || '').slice(0, 160)
    || `${item.name}. Book direct with Anna Lou.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/experiences/${slug}` },
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [items, reviews, faqs] = await Promise.all([
    getExperiences(),
    getTestimonials({ tag: slug }),
    getFAQs({ page: slug }),
  ]);
  const item = items.find((e) => e.slug === slug);
  if (!item) notFound();

  const type = item.type || 'workshop';
  const accent = TYPE_ACCENT[type] || '#6E3A5A';
  const breadcrumb = TYPE_BREADCRUMB[type] || { name: 'Experiences', href: '/experiences' };
  // item.heroImage is already a resolved URL string (the cms.ts mapper runs
  // mediaUrl on it). Stock fallback ensures the page never looks broken if
  // Anna hasn't uploaded a hero image yet.
  const heroImage = item.heroImage || getStockImage('experiences', slug);
  const paragraphs = splitParagraphs(item.description);
  const dateLabel = formatDate(item.date);
  const priceLabel = item.priceLabel || (item.price ? `£${item.price}` : '');
  const bookingUrl = item.bookingUrl || '/contact?subject=' + encodeURIComponent('Booking enquiry — ' + item.name);
  const bookingLabel = item.bookingUrl ? 'Book your place' : 'Enquire';
  const upsells = (item.upsells as UpsellItem[] | undefined) || [];
  const reviewInputs: ReviewInput[] = reviews.map((r) => ({
    reviewerName: r.reviewerName || 'Anonymous',
    quote: r.quote,
    rating: 5,
  }));

  return (
    <>
      <ServiceSchema
        name={item.name}
        description={item.description?.slice(0, 200) || ''}
        url={`/experiences/${slug}`}
        reviews={reviewInputs}
      />
      {/*
        EventSchema is additive to ServiceSchema — Google/AI use whichever
        fits the query. Only renders when the entry has a real date (returns
        null otherwise, so evergreen items stay Service-only).
      */}
      <EventSchema
        name={item.name}
        description={item.description?.slice(0, 300) || ''}
        url={`/experiences/${slug}`}
        startDate={item.date || undefined}
        location={item.location || undefined}
        price={item.price ? Number(item.price) : undefined}
        image={heroImage}
        reviews={reviewInputs}
        eventAttendanceMode={(item.location || '').toLowerCase().includes('zoom') ? 'online' : 'offline'}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', href: '/' },
          { name: 'Experiences', href: '/experiences' },
          breadcrumb,
          { name: item.name, href: `/experiences/${slug}` },
        ]}
      />

      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="exp-hero" style={{ background: `linear-gradient(160deg, #F1EAE0 0%, ${accent}22 100%)` }}>
        <div className="exp-hero-grid">
          <div className="exp-hero-text">
            <nav className="exp-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span> › </span>
              <Link href="/experiences">Experiences</Link>
              <span> › </span>
              <Link href={breadcrumb.href}>{breadcrumb.name}</Link>
            </nav>
            <p className="exp-eyebrow" style={{ color: accent }}>{TYPE_LABEL[type] || 'Experience'}</p>
            <h1 className="exp-title">{item.name}</h1>
            {(dateLabel || item.location) && (
              <p className="exp-meta">
                {dateLabel && <span>{dateLabel}</span>}
                {dateLabel && item.location && <span className="exp-meta-sep"> · </span>}
                {item.location && <span>{item.location}</span>}
              </p>
            )}
            {priceLabel && <p className="exp-price">{priceLabel}</p>}
            <div className="exp-cta-row">
              <BookingButton
                url={bookingUrl}
                label={bookingLabel}
                className="exp-book-btn"
                style={{ background: accent, color: '#fff' }}
              />
            </div>
          </div>
          <div className="exp-hero-img" style={{ backgroundImage: `url('${heroImage}')` }} />
        </div>
      </section>

      {paragraphs.length > 0 && (
        <section className="exp-body">
          <div className="exp-body-inner">
            {paragraphs.map((p, i) => (
              <p key={i} className="exp-body-text">{p}</p>
            ))}
          </div>
        </section>
      )}

      <section className="exp-cta-band" style={{ background: accent }}>
        <div className="exp-cta-inner">
          <h2 className="exp-cta-title">Ready to come?</h2>
          {priceLabel && <p className="exp-cta-price">{priceLabel}</p>}
          <BookingButton
            url={bookingUrl}
            label={bookingLabel}
            className="exp-cta-btn"
            style={{ color: accent }}
          />
        </div>
      </section>

      {reviews.length > 0 && (
        <ReviewsSection
          reviews={reviews}
          title={`From people who have done ${item.name}`}
          kicker="Reviews"
          kickerColour={accent}
        />
      )}

      {faqs.length > 0 && (
        <FAQAccordion faqs={faqs} accentColour={accent} background="#F5F3EF" />
      )}

      {upsells.length > 0 && (
        <UpsellBlock items={upsells} title="Where next." kicker="Other services with Anna" />
      )}
    </>
  );
}

const pageStyles = `
.exp-hero { padding: 6rem 2rem 3rem; }
.exp-hero-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
.exp-hero-img { aspect-ratio: 4/5; max-height: 540px; background-size: cover; background-position: center; border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
.exp-breadcrumb { font-family: Mulish, sans-serif; font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; color: #8C8880; margin-bottom: 1rem; }
.exp-breadcrumb a { color: #6e6a62; text-decoration: none; }
.exp-breadcrumb a:hover { color: #6E3A5A; }
.exp-eyebrow { font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.62rem; letter-spacing: 0.26em; text-transform: uppercase; margin-bottom: 0.7rem; }
.exp-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(2rem, 5vw, 3.2rem); color: #231F20; letter-spacing: 0.02em; line-height: 1.15; margin-bottom: 1rem; }
.exp-meta { font-family: 'EB Garamond', Georgia, serif; font-size: 1.05rem; color: #3D3D3A; margin-bottom: 0.4rem; }
.exp-meta-sep { color: #c8c4bc; margin: 0 0.2rem; }
.exp-price { font-family: 'EB Garamond', Georgia, serif; font-size: 1.2rem; color: #6E3A5A; font-style: italic; margin-bottom: 1.5rem; }
.exp-cta-row { display: flex; gap: 0.8rem; }
.exp-book-btn { display: inline-block; padding: 0.95rem 1.8rem; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; border-radius: 4px; text-decoration: none; transition: opacity 0.2s; }
.exp-book-btn:hover { opacity: 0.9; }

.exp-body { background: #fff; padding: 3rem 2rem; }
.exp-body-inner { max-width: 800px; margin: 0 auto; }
.exp-body-text { font-family: 'EB Garamond', Georgia, serif; font-size: 1.08rem; line-height: 1.85; color: #3D3D3A; margin-bottom: 1.2rem; }

.exp-cta-band { padding: 3rem 2rem; color: #fff; text-align: center; }
.exp-cta-inner { max-width: 600px; margin: 0 auto; }
.exp-cta-title { font-family: 'Work Sans', sans-serif; font-weight: 300; font-size: clamp(1.6rem, 3.5vw, 2.2rem); margin-bottom: 0.6rem; letter-spacing: 0.02em; color: #fff; }
.exp-cta-price { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: 1.15rem; margin-bottom: 1.4rem; color: rgba(255,255,255,0.92); }
.exp-cta-btn { display: inline-block; padding: 1rem 2rem; background: #fff; font-family: Mulish, sans-serif; font-weight: 500; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; border-radius: 4px; text-decoration: none; }

@media (max-width: 900px) {
  .exp-hero { padding: 4rem 1.5rem 2rem; }
  .exp-hero-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .exp-hero-img { max-height: 360px; aspect-ratio: 16/10; order: -1; }
}
`;
