import { Metadata } from 'next';
import Link from 'next/link';
import { getTestimonials, getTestimonialsPage, getFAQs, type Testimonial } from '@/lib/cms';
import FAQAccordion from '@/components/FAQAccordion';
import { ServiceSchema, BreadcrumbSchema, type ReviewInput } from '@/components/StructuredData';
import UpsellBlockForSingleton from '@/components/UpsellBlockForSingleton';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getTestimonialsPage();
  return {
    title: page.title,
    description: page.tagline,
    alternates: { canonical: '/testimonials' },
    openGraph: {
      title: page.title,
      description: page.tagline,
      url: '/testimonials',
    },
  };
}

/**
 * /testimonials — the dedicated client-stories page.
 *
 * Layout: 3-column grid of card testimonials, with "banner" testimonials
 * (display_style='banner') interspersed as full-width dark/plum sections
 * between every group of cards. Reference: shoshannaraven.com/testimonials.
 *
 * Each card adapts to what's available on the Strapi entry:
 *  - Photo uploaded → portrait card with photo + quote
 *  - YouTube URL set → embedded YouTube card
 *  - Uploaded video → HTML5 video player card
 *  - Text only (most common) → pure quote card
 *
 * Banner testimonials get a dramatic full-bleed treatment with a large
 * photo (or large pull-quote) — use sparingly for the strongest stories.
 */
export default async function TestimonialsPage() {
  const [page, all, faqs] = await Promise.all([
    getTestimonialsPage(),
    getTestimonials({ limit: 60 }),
    getFAQs({ page: 'testimonials' }),
  ]);

  // Split into cards vs banners; preserve sort_order across both.
  const cards = all.filter((t) => t.displayStyle !== 'banner');
  const banners = all.filter((t) => t.displayStyle === 'banner');

  // Interleave: every 6 cards, drop a banner. Trim banners if we have too few.
  const rows: Array<{ type: 'cards'; items: Testimonial[] } | { type: 'banner'; item: Testimonial }> = [];
  let bannerIdx = 0;
  for (let i = 0; i < cards.length; i += 6) {
    rows.push({ type: 'cards', items: cards.slice(i, i + 6) });
    if (bannerIdx < banners.length && i + 6 < cards.length) {
      rows.push({ type: 'banner', item: banners[bannerIdx++] });
    }
  }
  // Any remaining banners append at the end.
  while (bannerIdx < banners.length) {
    rows.push({ type: 'banner', item: banners[bannerIdx++] });
  }

  // Aggregate the full wall as reviews on the coaching service — this is what
  // gives Google rich-snippet stars on /testimonials and feeds AI engines
  // (ChatGPT, Perplexity, Gemini) a clean Review + AggregateRating block.
  const reviewInputs: ReviewInput[] = all
    .filter((t) => t.quote)
    .map((t) => ({
      reviewerName: t.reviewerName || 'Anonymous',
      quote: t.quote,
      rating: 5,
    }));

  return (
    <>
      <ServiceSchema
        name="Anna Lou Wellness Coaching"
        description="Trauma-informed somatic coaching, retreats, workshops, and the Signal Method. Reviews from real clients."
        url="/testimonials"
        reviews={reviewInputs}
      />
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Client Stories', href: '/testimonials' }]} />
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="ts-hero">
        <div className="ts-hero-inner">
          <p className="ts-kicker" style={{ color: page.kickerColour }}>{page.kicker}</p>
          <h1 className="ts-title">{page.title}</h1>
          {page.tagline && <p className="ts-tagline">{page.tagline}</p>}
        </div>
      </section>

      {all.length === 0 ? (
        <section className="ts-empty">
          <p>Client stories coming soon.</p>
        </section>
      ) : (
        <section className="ts-body">
          {rows.map((row, ri) => row.type === 'cards' ? (
            <div key={`r-${ri}`} className="ts-grid">
              {row.items.map((t) => <TestimonialCard key={t.id} t={t} />)}
            </div>
          ) : (
            <BannerTestimonial key={`b-${ri}`} t={row.item} />
          ))}
        </section>
      )}

      <FAQAccordion faqs={faqs} accentColour="#F280AA" background="#fff" />
    <UpsellBlockForSingleton endpoint="/testimonials-page" />
    </>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const meta = [t.reviewerName, t.reviewerLocation].filter(Boolean).join(' — ');
  const ytId = parseYouTubeId(t.youtubeUrl);

  return (
    <article className="ts-card">
      {ytId ? (
        <div className="ts-card-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}`}
            title={`Video testimonial from ${t.reviewerName}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : t.videoUrl ? (
        <div className="ts-card-video">
          <video controls preload="metadata" src={t.videoUrl} poster={t.videoThumbnail || undefined} />
        </div>
      ) : t.photoUrl ? (
        <div className="ts-card-photo" style={{ backgroundImage: `url('${t.photoUrl}')` }} />
      ) : null}
      {t.quote && <p className="ts-card-quote">&ldquo;{t.quote}&rdquo;</p>}
      {meta && <p className="ts-card-meta">{meta}</p>}
    </article>
  );
}

function BannerTestimonial({ t }: { t: Testimonial }) {
  const meta = [t.reviewerName, t.reviewerLocation].filter(Boolean).join(' — ');
  const ytId = parseYouTubeId(t.youtubeUrl);

  return (
    <aside className="ts-banner">
      <div className="ts-banner-inner">
        <div className="ts-banner-media">
          {ytId ? (
            <div className="ts-banner-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                title={`Video testimonial from ${t.reviewerName}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : t.videoUrl ? (
            <div className="ts-banner-video">
              <video controls preload="metadata" src={t.videoUrl} poster={t.videoThumbnail || undefined} />
            </div>
          ) : t.photoUrl ? (
            <div className="ts-banner-photo" style={{ backgroundImage: `url('${t.photoUrl}')` }} />
          ) : (
            <div className="ts-banner-quotemark">&ldquo;</div>
          )}
        </div>
        <div className="ts-banner-text">
          {t.quote && <p className="ts-banner-quote">&ldquo;{t.quote}&rdquo;</p>}
          {meta && <p className="ts-banner-meta">{meta}</p>}
        </div>
      </div>
    </aside>
  );
}

function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  // Match youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

const pageStyles = `
.ts-hero { background:#FCE8EF; padding:3rem 2rem 2rem; text-align:center; }
.ts-hero-inner { max-width:880px; margin:0 auto; }
.ts-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.5rem; }
.ts-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(2.2rem,5vw,3.4rem); color:#231F20; line-height:1.2; margin-bottom:0.8rem; font-style:italic; text-wrap:balance; }
.ts-tagline { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.7; max-width:680px; margin:0 auto; }

.ts-empty { background:#fff; padding:3rem 2rem; text-align:center; }
.ts-empty p { font-family:'EB Garamond',Georgia,serif; font-style:italic; color:#8C8880; }

.ts-body { background:#F9F6F1; padding:2rem 2rem 3rem; }
.ts-grid { max-width:1200px; margin:0 auto 1rem; display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; }
@media (max-width:900px) { .ts-grid { grid-template-columns:repeat(2,1fr); } }
@media (max-width:640px) { .ts-grid { grid-template-columns:1fr; } }

.ts-card { background:#fff; border-radius:8px; overflow:hidden; padding:1.4rem; display:flex; flex-direction:column; gap:0.8rem; box-shadow:0 1px 3px rgba(0,0,0,0.04); }
.ts-card-photo { aspect-ratio:1; background-size:cover; background-position:center; border-radius:6px; margin:-1.4rem -1.4rem 0; }
.ts-card-video { aspect-ratio:16/9; background:#231F20; margin:-1.4rem -1.4rem 0; overflow:hidden; }
.ts-card-video iframe, .ts-card-video video { width:100%; height:100%; border:none; display:block; }
.ts-card-quote { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1rem; color:#3D3D3A; line-height:1.7; margin:0; }
.ts-card-meta { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; color:#8C8880; margin:0; }

.ts-banner { background:#231F20; color:#F5F3EF; padding:3rem 2rem; margin:1.5rem 0; border-radius:8px; max-width:1200px; margin-left:auto; margin-right:auto; }
.ts-banner-inner { display:grid; grid-template-columns:1fr 1.4fr; gap:2.5rem; align-items:center; max-width:1100px; margin:0 auto; }
.ts-banner-media { display:flex; justify-content:center; }
.ts-banner-photo { aspect-ratio:1; width:100%; max-width:340px; background-size:cover; background-position:center; border-radius:50%; box-shadow:0 12px 40px rgba(0,0,0,0.4); }
.ts-banner-video { aspect-ratio:16/9; width:100%; background:#000; border-radius:8px; overflow:hidden; }
.ts-banner-video iframe, .ts-banner-video video { width:100%; height:100%; border:none; display:block; }
.ts-banner-quotemark { font-family:'EB Garamond',Georgia,serif; font-size:14rem; line-height:0.8; color:#F280AA; opacity:0.4; text-align:center; }
.ts-banner-quote { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.25rem; line-height:1.7; color:#F5F3EF; margin:0 0 1rem; }
.ts-banner-meta { font-family:Mulish,sans-serif; font-weight:600; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; color:#F280AA; margin:0; }
@media (max-width:700px) { .ts-banner-inner { grid-template-columns:1fr; gap:1.5rem; text-align:center; } .ts-banner-media { max-width:240px; margin:0 auto; } }
`;
