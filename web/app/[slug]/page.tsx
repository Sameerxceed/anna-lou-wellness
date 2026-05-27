import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI, mediaUrl } from '@/lib/strapi';

/**
 * Catch-all standalone-page route.
 *
 * Resolves any URL like /mission, /cookies, /about-anywhere by looking
 * up the slug in the `generic-page` (Strapi: "Pages · Standalone")
 * collection. Anna creates an entry with slug `mission` → page lives
 * at /mission with no code change. Footer links + nav can point to
 * the same slug.
 *
 * Next.js route precedence: explicit folder/page.tsx wins over this
 * dynamic [slug]/page.tsx. So /about, /shop, /contact etc. still hit
 * their dedicated pages — this only catches the leftovers.
 *
 * If no generic-page exists for the slug, falls back to the 404 page
 * (so a typoed footer href is loud, not silent).
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface GenericPageData {
  title: string;
  slug: string;
  kicker: string;
  kickerColour: string;
  tagline: string;
  heroImage: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  seoTitle: string;
  seoDescription: string;
}

async function getGenericPage(slug: string): Promise<GenericPageData | null> {
  try {
    const { data } = await fetchAPI('/generic-pages', {
      'populate': '*',
      'filters[slug][$eq]': slug,
      'pagination[limit]': '1',
    });
    if (!Array.isArray(data) || data.length === 0) return null;
    const d = data[0];
    return {
      title: d.title || '',
      slug: d.slug || slug,
      kicker: d.kicker || '',
      kickerColour: d.kickerColour || '#6E3A5A',
      tagline: d.tagline || '',
      heroImage: mediaUrl(d.heroImage),
      intro: d.intro || '',
      ctaLabel: d.ctaLabel || '',
      ctaUrl: d.ctaUrl || '',
      seoTitle: d.seoTitle || '',
      seoDescription: d.seoDescription || '',
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getGenericPage(slug);
  if (!page) return { title: 'Page not found' };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.tagline || '',
    alternates: { canonical: `/${slug}` },
  };
}

export default async function StandalonePage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getGenericPage(slug);
  if (!page) notFound();

  const paragraphs = page.intro
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <section className="gp-hero" style={page.heroImage ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url('${page.heroImage}')` } : undefined}>
        <div className="gp-hero-inner">
          {page.kicker && (
            <p className="gp-kicker" style={{ color: page.kickerColour }}>{page.kicker}</p>
          )}
          <h1 className="gp-title">{page.title}</h1>
          {page.tagline && <p className="gp-tagline"><em>{page.tagline}</em></p>}
        </div>
      </section>

      <section className="gp-body">
        <div className="gp-body-inner">
          {paragraphs.map((p, i) => (
            <p key={i} className="gp-paragraph">{p}</p>
          ))}
          {page.ctaLabel && page.ctaUrl && (
            <div className="gp-cta">
              <Link href={page.ctaUrl} className="gp-cta-btn" style={{ background: page.kickerColour, borderColor: page.kickerColour }}>
                {page.ctaLabel} <span>&rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const pageStyles = `
.gp-hero { background:#F5F3EF; padding:3.5rem 2rem 2.5rem; text-align:center; background-size:cover; background-position:center; color:#231F20; }
.gp-hero[style*="url("] { color:#fff; }
.gp-hero[style*="url("] .gp-title, .gp-hero[style*="url("] .gp-tagline { color:#fff; }
.gp-hero-inner { max-width:880px; margin:0 auto; }
.gp-kicker { font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.5rem; }
.gp-title { font-family:'EB Garamond',Georgia,serif; font-weight:400; font-size:clamp(2.2rem,5vw,3.4rem); line-height:1.2; margin-bottom:0.8rem; text-wrap:balance; }
.gp-tagline { font-family:'EB Garamond',Georgia,serif; font-style:italic; font-size:1.1rem; color:#5D5A52; line-height:1.7; }
.gp-body { background:#fff; padding:2.5rem 2rem 3.5rem; }
.gp-body-inner { max-width:760px; margin:0 auto; }
.gp-paragraph { font-family:'EB Garamond',Georgia,serif; font-size:1.05rem; color:#3D3D3A; line-height:1.9; margin-bottom:1.2rem; }
.gp-cta { text-align:center; margin-top:2rem; }
.gp-cta-btn { color:#fff; font-family:Mulish,sans-serif; font-weight:500; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; padding:0.85rem 2rem; border-radius:3px; border:1px solid; transition:opacity 0.25s; display:inline-flex; align-items:center; gap:0.4rem; text-decoration:none; }
.gp-cta-btn:hover { opacity:0.88; }
@media (max-width:700px) { .gp-hero { padding:2.5rem 1.2rem 1.8rem; } .gp-body { padding:2rem 1.2rem 2.5rem; } }
`;
