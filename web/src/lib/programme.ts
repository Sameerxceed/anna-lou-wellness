import { fetchAPI, mediaUrl } from '@/lib/strapi';

export interface ProgrammeUpsell {
  label?: string;
  link?: string;
  eyebrow?: string;
  blurb?: string;
  image?: { url?: string } | null;
}

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
  stagesList?: string;
  pricePence?: number;
  isRecurring?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  upsells?: ProgrammeUpsell[];
}

/**
 * Parse a pipe-separated stages list. Each line: "Label|Title|Body".
 * Returns array of {label, title, body} or null if input is blank.
 */
export function parseStages(raw: string | undefined): { label: string; title: string; body: string }[] | null {
  if (!raw || !raw.trim()) return null;
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const stages = lines
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length < 3) return null;
      return { label: parts[0], title: parts[1], body: parts[2] };
    })
    .filter((s): s is { label: string; title: string; body: string } => s !== null);
  return stages.length > 0 ? stages : null;
}

export async function getProgrammeBySlug(slug: string): Promise<ProgrammeCMS | null> {
  try {
    // Strapi v5 quirk: `populate=*` at top level PLUS a hierarchical
    // `populate[upsells][populate]=*` in the same query throws 500
    // InternalServerError. Fix: use explicit per-field populates only.
    // See memory feedback_strapi_v5_populate_collision.md.
    const { data } = await fetchAPI('/programmes', {
      'filters[slug][$eq]': slug,
      // Programme schema uses camelCase heroImage, not snake_case.
      'populate[heroImage]': 'true',
      'populate[upsells][populate][image]': 'true',
    });
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
