import { fetchAPI, mediaUrl } from '@/lib/strapi';
import { getStockImage, StockCategory } from '@/data/stock-images';

export interface GenericPageCMS {
  slug: string;
  title: string;
  kicker?: string;
  kickerColour?: string;
  tagline?: string;
  heroImage?: { url?: string } | null;
  intro?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  // Returning Circle recording block (only used on the-returning-circle).
  recording_headline?: string;
  recording_intro?: string;
  recording_button_label?: string;
  recording_price_gbp?: number;
  recording_week_label?: string;
  recording_youtube_url?: string;
  recording_stripe_product_name?: string;
  recording_stripe_description?: string;
  recording_help_note?: string;
}

export async function getGenericPageBySlug(slug: string): Promise<GenericPageCMS | null> {
  try {
    const { data } = await fetchAPI('/generic-pages', { 'filters[slug][$eq]': slug, populate: '*' });
    if (Array.isArray(data) && data.length > 0) return data[0] as GenericPageCMS;
    return null;
  } catch {
    return null;
  }
}

/**
 * Map CMS GenericPage to SubPage component props (for pages that use the SubPage layout).
 */
export function genericPageProps(
  cms: GenericPageCMS | null,
  fallback: {
    title: string;
    kicker: string;
    kickerColour: string;
    parentLabel: string;
    parentHref: string;
    paragraphs: string[];
    cta?: { label: string; href: string };
    stockCategory: StockCategory;
    stockSeed: string;
  },
) {
  const splitParas = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const heroImage = mediaUrl(cms?.heroImage as { url?: string } | undefined) || getStockImage(fallback.stockCategory, fallback.stockSeed, 'hero');

  return {
    kicker: cms?.kicker || fallback.kicker,
    kickerColour: cms?.kickerColour || fallback.kickerColour,
    title: cms?.title || fallback.title,
    parentLabel: fallback.parentLabel,
    parentHref: fallback.parentHref,
    heroImage,
    paragraphs: cms?.intro ? splitParas(cms.intro) : fallback.paragraphs,
    cta: cms?.ctaLabel && cms?.ctaUrl ? { label: cms.ctaLabel, href: cms.ctaUrl } : fallback.cta,
  };
}

// Community event helpers share the same shape — alias for clarity at call site.
export async function getCommunityEventBySlug(slug: string): Promise<GenericPageCMS | null> {
  try {
    // Explicit per-field populate. CANNOT mix populate=* with
    // populate[sessions][populate]=* (v5 silent-failure bug, returns
    // empty array). Listing each field keeps nested session-slot
    // entries (day_of_week / time / location_label etc.) populated.
    const { data } = await fetchAPI('/community-event-pages', {
      'filters[slug][$eq]': slug,
      'populate[heroImage]': 'true',
      'populate[sessions]': 'true',
      'populate[upsells][populate]': '*',
    });
    if (Array.isArray(data) && data.length > 0) return data[0] as GenericPageCMS;
    return null;
  } catch {
    return null;
  }
}
