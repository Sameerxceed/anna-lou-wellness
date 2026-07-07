/**
 * Fetch helper for pages built by Anna using the Page collection ("Page
 * (build your own)"). Returns the entry with its Dynamic Zone populated
 * 2 levels deep so every component's media + nested style component
 * arrives in one round-trip.
 */

import { fetchAPI } from '@/lib/strapi';

export type CustomPageUpsell = {
  label?: string;
  link?: string;
  eyebrow?: string;
  blurb?: string;
  image?: { url?: string } | null;
};

export type CustomPageCMS = {
  id: number | string;
  documentId?: string;
  slug: string;
  title: string;
  hero_image?: { url?: string } | null;
  summary?: string;
  seo_title?: string;
  seo_description?: string;
  og_image?: { url?: string } | null;
  sections?: Array<{ __component: string; id: number | string; [key: string]: unknown }>;
  upsells?: CustomPageUpsell[];
};

export async function getCustomPageBySlug(slug: string): Promise<CustomPageCMS | null> {
  try {
    // populate=sections.image, sections.image_left, etc. — too many to enumerate.
    // populate[sections][populate]=* fetches every media + nested component on
    // every section, which is what we want for the Dynamic Zone renderer.
    const { data } = await fetchAPI('/pages', {
      'filters[slug][$eq]': slug,
      // Strapi v5: populate=* on a media field throws 400 ValidationError
      // ("Invalid key related at hero_image.related"). Use =true instead.
      // Dynamic-zone sections keeps its deep populate.
      'populate[sections][populate]': '*',
      'populate[hero_image]': 'true',
      'populate[og_image]': 'true',
      'populate[upsells][populate][image]': 'true',
      'pagination[pageSize]': '1',
    });
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as CustomPageCMS;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAllCustomPageSlugs(): Promise<string[]> {
  try {
    const { data } = await fetchAPI('/pages', {
      fields: 'slug',
      'pagination[pageSize]': '100',
    });
    if (!Array.isArray(data)) return [];
    return (data as Array<{ slug?: string }>).map((d) => d.slug).filter(Boolean) as string[];
  } catch {
    return [];
  }
}
