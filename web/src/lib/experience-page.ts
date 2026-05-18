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
  secondaryList?: string;
}

/**
 * Parse a pipe-separated list of {title, body} items.
 * Each line: "Title|Body". Returns array or null if blank.
 */
export function parseSecondaryList(raw: string | undefined): { title: string; body: string }[] | null {
  if (!raw || !raw.trim()) return null;
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const items = lines
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length < 2) return null;
      return { title: parts[0], body: parts[1] };
    })
    .filter((i): i is { title: string; body: string } => i !== null);
  return items.length > 0 ? items : null;
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
