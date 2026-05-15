import { fetchAPI, mediaUrl } from '@/lib/strapi';

export interface ProgrammeCMS {
  slug: string;
  title: string;
  tagline?: string;
  accentColour?: string;
  heroImage?: { url?: string } | null;
  intro?: string;
  whatsIncludedLabel?: string;
  whatsIncludedItems?: string;
  approachLabel?: string;
  approachBody?: string;
  outcomesLabel?: string;
  outcomesBody?: string;
  pricingLabel?: string;
  pricingBody?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export async function getProgrammeBySlug(slug: string): Promise<ProgrammeCMS | null> {
  try {
    const { data } = await fetchAPI('/programmes', { 'filters[slug][$eq]': slug, populate: '*' });
    if (Array.isArray(data) && data.length > 0) return data[0] as ProgrammeCMS;
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert a CMS programme record into the props the existing ProgrammePage
 * component expects, layered on top of hardcoded fallbacks per route.
 */
export function programmeProps(
  cms: ProgrammeCMS | null,
  fallback: {
    title: string;
    tagline: string;
    accentColour: string;
    image?: string;
    intro: string[];
    whatsIncludedItems: string[];
    pricingLabel?: string;
    pricingBody: string;
    ctaLabel?: string;
    ctaUrl?: string;
  },
) {
  const splitParas = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const splitLines = (s: string) => s.split('\n').map((p) => p.trim()).filter(Boolean);

  const intro = cms?.intro ? splitParas(cms.intro) : fallback.intro;
  const items = cms?.whatsIncludedItems ? splitLines(cms.whatsIncludedItems) : fallback.whatsIncludedItems;

  const sections: { label: string; body: string | string[] }[] = [
    { label: cms?.whatsIncludedLabel || 'What\'s included', body: items },
  ];
  if (cms?.approachBody) sections.push({ label: cms.approachLabel || 'The approach', body: cms.approachBody });
  if (cms?.outcomesBody) sections.push({ label: cms.outcomesLabel || 'What changes', body: cms.outcomesBody });

  return {
    accentColour: cms?.accentColour || fallback.accentColour,
    hero: {
      title: cms?.title || fallback.title,
      tagline: cms?.tagline || fallback.tagline,
      image: mediaUrl(cms?.heroImage as { url?: string } | undefined) || fallback.image,
    },
    intro,
    sections,
    pricing: {
      label: cms?.pricingLabel || fallback.pricingLabel || 'Investment',
      body: cms?.pricingBody || fallback.pricingBody,
    },
    cta: {
      label: cms?.ctaLabel || fallback.ctaLabel || 'Book a discovery call',
      href: cms?.ctaUrl || fallback.ctaUrl || '/contact',
    },
  };
}
