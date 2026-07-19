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
  pwycOptions?: string;
  pwycDefault?: number;
  pwycLabel?: string;
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
 * component expects, with all-or-nothing-per-section fallback (Anna 14 Jul
 * policy). If Anna has filled ANY field in a section, we use only her CMS
 * values for that section (blank fields render empty). If the ENTIRE
 * section is untouched, we use the route-specific hardcoded fallback so
 * the page renders coherently until she gets to it.
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

  // Anna 14 Jul (STRONGER): if a section has nothing in CMS, hide it entirely.
  // Only accentColour retains a fallback (visual brand colour that must always
  // be set — CSS depends on it). Every other field returns raw CMS value and
  // the ProgrammePage component skips empty sections cleanly.
  const sections: { label: string; body: string | string[] }[] = [];
  const includedItems = cms?.whatsIncludedItems ? splitLines(cms.whatsIncludedItems) : [];
  if (cms?.whatsIncludedLabel || includedItems.length > 0) {
    sections.push({ label: cms?.whatsIncludedLabel || '', body: includedItems });
  }
  if (cms?.approachBody || cms?.approachLabel) {
    sections.push({ label: cms?.approachLabel || '', body: cms?.approachBody || '' });
  }
  if (cms?.outcomesBody || cms?.outcomesLabel) {
    sections.push({ label: cms?.outcomesLabel || '', body: cms?.outcomesBody || '' });
  }

  void splitLines;

  return {
    accentColour: cms?.accentColour || fallback.accentColour,
    hero: {
      title: cms?.title || '',
      tagline: cms?.tagline || '',
      image: mediaUrl(cms?.heroImage as { url?: string } | undefined) || '',
    },
    intro: cms?.intro ? splitParas(cms.intro) : [],
    sections,
    pricing: {
      label: cms?.pricingLabel || '',
      body: cms?.pricingBody || '',
    },
    cta: {
      label: cms?.ctaLabel || '',
      href: cms?.ctaUrl || '',
    },
  };
}
