import { fetchAPI, mediaUrl } from '@/lib/strapi';
import { getStockImage, StockCategory } from '@/data/stock-images';

export interface ExperiencePageCMS {
  slug: string;
  title: string;
  kicker?: string;
  kickerColour?: string;
  heroImage?: { url?: string } | null;
  intro?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export async function getExperienceBySlug(slug: string): Promise<ExperiencePageCMS | null> {
  try {
    const { data } = await fetchAPI('/experience-pages', { 'filters[slug][$eq]': slug, populate: '*' });
    if (Array.isArray(data) && data.length > 0) return data[0] as ExperiencePageCMS;
    return null;
  } catch {
    return null;
  }
}

/**
 * Map CMS Experience record to the props the existing SubPage component expects.
 * Hardcoded fallbacks per route stay in the page.tsx files.
 */
export function experienceProps(
  cms: ExperiencePageCMS | null,
  fallback: {
    title: string;
    kicker: string;
    kickerColour: string;
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
    parentLabel: 'Experiences',
    parentHref: '/experiences',
    heroImage,
    paragraphs: cms?.intro ? splitParas(cms.intro) : fallback.paragraphs,
    cta: cms?.ctaLabel && cms?.ctaUrl ? { label: cms.ctaLabel, href: cms.ctaUrl } : fallback.cta,
  };
}
