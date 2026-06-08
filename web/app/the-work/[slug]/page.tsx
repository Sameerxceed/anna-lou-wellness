import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProgrammePage from '@/components/ProgrammePage';
import ReviewsSection from '@/components/ReviewsSection';
import FAQAccordion from '@/components/FAQAccordion';
import BuyProgrammeButton from '@/components/BuyProgrammeButton';
import UpsellBlock, { type UpsellItem } from '@/components/UpsellBlock';
import PageSections from '@/components/PageSections';
import { ServiceSchema, BreadcrumbSchema, type ReviewInput } from '@/components/StructuredData';
import { getStockImage } from '@/data/stock-images';
import { getProgrammeBySlug, programmeProps } from '@/lib/programme';
import { getCustomPageBySlug } from '@/lib/custom-page';
import { mediaUrl } from '@/lib/strapi';
import { getTestimonials, getFAQs } from '@/lib/cms';

/**
 * Catch-all dynamic route for /the-work/{slug}.
 *
 * Each established programme (the-reset, signal, signal-and-build, one-day,
 * signal-collective, recovery, sessions, quiz, etc.) has its own static
 * page.tsx in this folder. Next routes those first — static beats dynamic.
 *
 * This dynamic route picks up any NEW programme Anna creates in Strapi
 * (Content Manager → Work · Programme → +Create with slug `xyz`). The
 * page lives at /the-work/xyz with no code change. If the slug doesn't
 * match a programme entry, 404.
 *
 * Renders using the same ProgrammePage + Reviews + FAQ pattern as the
 * established programme pages, so the new entry inherits the full layout
 * and the FAQ accordion + Reviews section auto-attach.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Page Builder entry wins for metadata if Anna created one with this slug.
  const page = await getCustomPageBySlug(slug);
  if (page) {
    const title = page.seo_title || page.title;
    const description = page.seo_description || page.summary || undefined;
    const ogImage = mediaUrl(page.og_image as { url?: string } | undefined) || mediaUrl(page.hero_image as { url?: string } | undefined);
    return {
      title: `${title} | Anna Lou Wellness`,
      description,
      alternates: { canonical: `/the-work/${slug}` },
      openGraph: { title, description, url: `/the-work/${slug}`, images: ogImage ? [{ url: ogImage }] : undefined },
    };
  }
  const cms = await getProgrammeBySlug(slug);
  if (!cms) return { title: 'Programme not found' };
  return {
    title: cms.seoTitle || `${cms.title} | Anna Lou Wellness`,
    description: cms.seoDescription || cms.tagline || '',
    alternates: { canonical: `/the-work/${slug}` },
    openGraph: {
      title: cms.title,
      description: cms.tagline || '',
      url: `/the-work/${slug}`,
    },
  };
}

export default async function DynamicProgrammePage({ params }: PageProps) {
  const { slug } = await params;

  // If Anna built a custom Page entry with this slug, render the Page Builder
  // version instead of the generic Programme template. This is how the
  // REGULATED sales page (and any other rich sales page Anna wants to design)
  // takes over the URL. The Programme entry stays for commerce/checkout
  // (Stripe pricing, grants flags) and is referenced from a buy-programme
  // section inside the Page.
  const pageEntry = await getCustomPageBySlug(slug);
  if (pageEntry) {
    const sections = Array.isArray(pageEntry.sections) ? pageEntry.sections : [];
    return (
      <article>
        <BreadcrumbSchema
          items={[
            { name: 'Home', href: '/' },
            { name: 'Work with Anna', href: '/the-work' },
            { name: pageEntry.title, href: `/the-work/${slug}` },
          ]}
        />
        {sections.length === 0 ? (
          <section style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'EB Garamond, Georgia, serif', color: '#8C8880', fontStyle: 'italic' }}>
            This page is empty. Open it in the CMS and add some sections.
          </section>
        ) : (
          <PageSections sections={sections} />
        )}
        <UpsellBlock
          items={(pageEntry.upsells as UpsellItem[] | undefined) || []}
          title="Where next."
          kicker="Continue your journey"
        />
      </article>
    );
  }

  const [cms, reviews, faqs] = await Promise.all([
    getProgrammeBySlug(slug),
    getTestimonials({ tag: slug }),
    getFAQs({ page: slug }),
  ]);

  if (!cms) notFound();

  // CMS-only fallback path — no hardcoded copy for new programmes. The
  // mapper below uses cms.* values directly with sensible defaults from the
  // schema, so as long as Anna fills the entry the page renders cleanly.
  const props = programmeProps(cms, {
    title: cms.title,
    tagline: cms.tagline || '',
    accentColour: cms.accentColour || '#F280AA',
    image: getStockImage('programmes', slug),
    intro: cms.intro ? cms.intro.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : [],
    whatsIncludedItems: cms.whatsIncludedItems ? cms.whatsIncludedItems.split('\n').map((p) => p.trim()).filter(Boolean) : [],
    pricingBody: cms.pricingBody || '',
    ctaLabel: cms.ctaLabel,
    ctaUrl: cms.ctaUrl,
  });

  const reviewInputs: ReviewInput[] = reviews.map((r) => ({
    reviewerName: r.reviewerName || 'Anonymous',
    quote: r.quote,
    rating: 5,
  }));
  const cleanTitle = cms.title.replace(/\.$/, '');

  return (
    <>
      <ServiceSchema
        name={cleanTitle}
        description={cms.tagline || cms.seoDescription || ''}
        url={`/the-work/${slug}`}
        reviews={reviewInputs}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', href: '/' },
          { name: 'Work with Anna', href: '/the-work' },
          { name: cleanTitle, href: `/the-work/${slug}` },
        ]}
      />
      <ProgrammePage {...props} />
      {/* For direct-buy programmes (pricePence > 0, not recurring), render
          a Stripe Checkout button right below the ProgrammePage CTA. The
          ProgrammePage's own bottom CTA stays as a fallback enquiry link. */}
      {cms.pricePence && cms.pricePence > 0 && !cms.isRecurring && (
        <section style={{ background: cms.accentColour || '#6E3A5A', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <BuyProgrammeButton
              slug={slug}
              label={cms.ctaLabel || `Buy ${cleanTitle}`}
              background="#FFFFFF"
              className="buy-programme-btn"
            />
            <p style={{ marginTop: '0.8rem', fontFamily: 'Mulish, sans-serif', fontSize: '0.7rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.75)' }}>
              Secured by Stripe. Instant access.
            </p>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            .buy-programme-btn {
              font-family: Mulish, sans-serif; font-weight: 600;
              font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase;
              color: ${cms.accentColour || '#6E3A5A'};
              padding: 1.1rem 2rem; border: 1px solid #FFFFFF; border-radius: 3px;
              cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;
              transition: transform 0.2s;
            }
            .buy-programme-btn:hover:not(:disabled) { transform: translateY(-1px); }
          ` }} />
        </section>
      )}
      <ReviewsSection
        reviews={reviews}
        title={`From ${cleanTitle} alumnae`}
        kicker="Reviews"
        kickerColour={cms.accentColour || '#F280AA'}
      />
      <FAQAccordion faqs={faqs} accentColour={cms.accentColour || '#F280AA'} background="#F5F3EF" />
      <UpsellBlock
        items={(cms.upsells as UpsellItem[] | undefined) || []}
        title="Where next."
        kicker="Continue your journey"
      />
    </>
  );
}
