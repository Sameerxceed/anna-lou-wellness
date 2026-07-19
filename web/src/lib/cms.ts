/**
 * CMS Data Layer — Anna Lou Wellness
 *
 * Tries to fetch from Strapi first.
 * Falls back to local placeholder data if Strapi is empty or unreachable.
 * Caching is handled by Next.js ISR via the fetch `next: { revalidate }` option in strapi.ts.
 */

import { fetchAPI, mediaUrl, mediaUrls } from './strapi';

// ═══ Local fallback data ═══
import {
  products as fallbackProducts,
  categories as fallbackCategories,
  events as fallbackEvents,
  type Product,
  type Category,
  type Event,
} from '@/data/content';
import {
  siteSettings as fallbackSiteSettings,
  navigation as fallbackNavigation,
  footerLinks as fallbackFooterLinks,
  type SiteSettings,
  type NavItem,
  type FooterLinks,
} from '@/data/site';

export type { Product, Category, Event, SiteSettings, NavItem, FooterLinks };

// ═══ HOMEPAGE ═══
// Returns the raw Strapi singleType for homepage. The page reads each field
// with `?? hardcoded-default` fallback so a missing/blank CMS field renders the
// V8 baseline copy. If Strapi is unreachable, returns null and the page uses
// every default.
export type HomepageData = Record<string, unknown> & {
  heroImage?: { url?: string } | null;
  workImage?: { url?: string } | null;
  communityImage?: { url?: string } | null;
  portraitImage?: { url?: string } | null;
};

export async function getHomepage(): Promise<HomepageData | null> {
  try {
    const { data: d } = await fetchAPI('/homepage', { populate: '*' });
    if (!d) return null;
    // Second fetch with deep populate just for upsells (Strapi v5 won't
    // deep-populate the nested image when combined with `populate=*`).
    const upsells = await getUpsellsForSingleton('/homepage');
    return { ...(d as HomepageData), upsells };
  } catch {
    return null;
  }
}

// ═══ UPSELLS HELPER ═══
// Strapi v5 silent-failure: combining `populate=*` with a hierarchical
// sub-populate (`populate[upsells][populate]=*`) returns ZERO data. So
// for any singleton that uses `populate=*` for its main fetch, we do a
// SECOND lightweight fetch that only asks for the upsells with their
// images, and merge it back.
//
// Use this from any singleton loader where you want UpsellBlock to work.
// Returns [] on any error so the page doesn't crash if there are no upsells.
export async function getUpsellsForSingleton(path: string): Promise<UpsellRef[]> {
  try {
    const { data } = await fetchAPI(path, { 'populate[upsells][populate]': '*' });
    const arr = (data as { upsells?: unknown })?.upsells;
    if (!Array.isArray(arr)) return [];
    return arr.map((u: any) => ({
      label: u.label || '',
      link: u.link || '',
      eyebrow: u.eyebrow || '',
      blurb: u.blurb || '',
      image: u.image && u.image.url ? { url: mediaUrl(u.image) } : null,
    }));
  } catch {
    return [];
  }
}

export interface UpsellRef {
  label: string;
  link: string;
  eyebrow: string;
  blurb: string;
  image: { url: string } | null;
}

// ═══ PRODUCTS ═══
export async function getProducts(): Promise<Product[]> {
  try {
    const { data } = await fetchAPI('/products', {
      populate: '*',
      'pagination[limit]': '100',
    });
    if (!data?.length) return fallbackProducts;
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      shortDescription: d.short_description || '',
      description: d.description || '',
      price: d.price,
      category: d.category?.slug || '',
      images: mediaUrls(d.images),
      stock: d.stock ?? 0,
      isFeatured: d.is_featured || false,
      isActive: d.is_active !== false,
    }));
  } catch {
    return fallbackProducts;
  }
}

/**
 * Products flagged for the homepage 'Jewellery with meaning' preview.
 * Anna ticks `is_homepage_featured` in Strapi to surface a product here.
 * Returns the top `limit` by sort_order (falls back to creation order).
 */
export interface HomepageProduct {
  id: number;
  slug: string;
  name: string;
  hook: string;
  image: string;
  price: number;
}

export async function getHomepageFeaturedProducts(limit: number = 3): Promise<HomepageProduct[]> {
  try {
    const { data } = await fetchAPI('/products', {
      'populate': '*',
      'filters[is_homepage_featured][$eq]': 'true',
      'filters[is_active][$eq]': 'true',
      'sort': 'createdAt:desc',
      'pagination[limit]': String(limit),
    });
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      slug: d.slug,
      name: d.name || '',
      hook: d.homepage_hook || '',
      image: mediaUrl(Array.isArray(d.images) ? d.images[0] : d.images),
      price: typeof d.price === 'number' ? d.price : Number(d.price ?? 0),
    }));
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await fetchAPI('/product-categories', {
      'sort': 'sort_order:asc',
    });
    if (!data?.length) return fallbackCategories;
    return [
      { name: 'All', slug: 'all' },
      ...data.map((d: any) => ({ name: d.name, slug: d.slug })),
    ];
  } catch {
    return fallbackCategories;
  }
}

/**
 * Shop categories as a nested tree: each top-level category may have
 * `children` (sub-categories). Filters out is_visible_in_nav=false.
 *
 * Used by:
 *   - the shop page UI (parent pills + sub-pills on selection)
 *   - the navigation builder so the Shop dropdown reflects Anna's
 *     category hierarchy without a code change
 */
export interface ShopCategoryNode {
  id: number;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  children: ShopCategoryNode[];
}

export async function getShopCategoryTree(): Promise<ShopCategoryNode[]> {
  try {
    const { data } = await fetchAPI('/product-categories', {
      'populate': '*',
      'sort': 'sort_order:asc',
      'filters[is_visible_in_nav][$ne]': 'false',
      'pagination[limit]': '100',
    });
    if (!data?.length) return [];

    const all: Array<{
      id: number;
      name: string;
      slug: string;
      description: string;
      sortOrder: number;
      parentId: number | null;
    }> = data.map((d: any) => ({
      id: d.id,
      name: d.name || '',
      slug: d.slug || '',
      description: d.description || '',
      sortOrder: d.sort_order ?? 0,
      parentId: d.parent?.id ?? null,
    }));

    const byId = new Map<number, ShopCategoryNode>();
    all.forEach((c) => byId.set(c.id, { ...c, children: [] }));

    const roots: ShopCategoryNode[] = [];
    all.forEach((c) => {
      const node = byId.get(c.id)!;
      if (c.parentId && byId.has(c.parentId)) {
        byId.get(c.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Ensure each level is sorted (Strapi sort works on flat result; nested
    // re-sort is cheap and guarantees consistent ordering).
    const sortRecursive = (nodes: ShopCategoryNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      nodes.forEach((n) => sortRecursive(n.children));
    };
    sortRecursive(roots);
    return roots;
  } catch {
    return [];
  }
}

// ═══ EVENTS ═══
export async function getEvents(): Promise<Event[]> {
  try {
    const { data } = await fetchAPI('/events', {
      populate: '*',
      'sort': 'date:asc',
    });
    if (!data?.length) return fallbackEvents;
    return data
      .filter((d: any) => d.is_published !== false)
      .map((d: any) => ({
        title: d.title,
        date: d.date,
        time: d.time || '',
        description: d.description || '',
        eventType: d.event_type || '',
      }));
  } catch {
    return fallbackEvents;
  }
}

// ═══ CONTACT PAGE ═══
export interface DiscoveryCallBlock {
  headline: string;
  intro: string;
  buttonLabel: string;
  priceGbp: number;
  calendlyUrl: string;
  whyPriceLabel: string;
  whyPriceBody: string;
}

export async function getContactInfo(): Promise<SiteSettings & { discoveryCall: DiscoveryCallBlock | null }> {
  try {
    const { data: d } = await fetchAPI('/contact-page', { populate: '*' });
    if (!d) return { ...fallbackSiteSettings, discoveryCall: null };

    // Discovery Call block is opt-in: only rendered if the CMS has a
    // Calendly URL + headline. If either is missing, the whole block
    // stays hidden.
    const calendly = String(d.discovery_calendly_url || '').trim();
    const headline = String(d.discovery_headline || '').trim();
    const discoveryCall: DiscoveryCallBlock | null =
      calendly && headline
        ? {
            headline,
            intro: String(d.discovery_intro || '').trim(),
            buttonLabel: String(d.discovery_button_label || 'Book my call'),
            priceGbp: Number(d.discovery_price_gbp || 10),
            calendlyUrl: calendly,
            whyPriceLabel: String(d.discovery_why_price_label || '').trim(),
            whyPriceBody: String(d.discovery_why_price_body || '').trim(),
          }
        : null;

    return {
      ...fallbackSiteSettings,
      email: d.email || fallbackSiteSettings.email,
      phone: d.phone || fallbackSiteSettings.phone,
      address: d.address || fallbackSiteSettings.address,
      mapLatitude: d.map_latitude ?? fallbackSiteSettings.mapLatitude,
      mapLongitude: d.map_longitude ?? fallbackSiteSettings.mapLongitude,
      discoveryCall,
    };
  } catch {
    return { ...fallbackSiteSettings, discoveryCall: null };
  }
}

// ═══ SITE SETTINGS ═══
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data: d } = await fetchAPI('/site-settings', { populate: '*' });
    if (!d) return fallbackSiteSettings;
    return {
      ...fallbackSiteSettings,
      siteName: d.site_name || fallbackSiteSettings.siteName,
      siteTagline: d.site_tagline || fallbackSiteSettings.siteTagline,
      logo: mediaUrl(d.logo) || null,
      logoDark: mediaUrl(d.logo_dark) || null,
      seoDescription: d.seo_description || fallbackSiteSettings.seoDescription,
      instagramUrl: d.instagram_url || fallbackSiteSettings.instagramUrl,
      facebookUrl: d.facebook_url || fallbackSiteSettings.facebookUrl,
      youtubeUrl: d.youtube_url || fallbackSiteSettings.youtubeUrl,
      substackUrl: d.substack_url || fallbackSiteSettings.substackUrl,
      linkedinUrl: d.linkedin_url || fallbackSiteSettings.linkedinUrl,
      podcastUrl: d.podcast_url || fallbackSiteSettings.podcastUrl,
      maxSubcategoriesPerMenu: (d.max_subcategories_per_menu as number) || fallbackSiteSettings.maxSubcategoriesPerMenu,
      email: d.notification_email || fallbackSiteSettings.email,
      cookieBannerText: d.cookie_banner_text || fallbackSiteSettings.cookieBannerText,
      footerCopyright: d.footer_copyright || fallbackSiteSettings.footerCopyright,
      maintenanceMode: d.maintenance_mode ?? false,
      freeShippingThreshold: typeof d.free_shipping_threshold === 'number' ? d.free_shipping_threshold : Number(d.free_shipping_threshold) || fallbackSiteSettings.freeShippingThreshold,
      freeShippingLabel: d.free_shipping_label || fallbackSiteSettings.freeShippingLabel,
      shippingFlatRate: typeof d.shipping_flat_rate === 'number' ? d.shipping_flat_rate : Number(d.shipping_flat_rate) || fallbackSiteSettings.shippingFlatRate,
      giftWrapEnabled: d.gift_wrap_enabled ?? fallbackSiteSettings.giftWrapEnabled,
      giftWrapPrice: typeof d.gift_wrap_price === 'number' ? d.gift_wrap_price : Number(d.gift_wrap_price) || fallbackSiteSettings.giftWrapPrice,
      giftWrapLabel: d.gift_wrap_label || fallbackSiteSettings.giftWrapLabel,
      giftWrapDescription: d.gift_wrap_description || fallbackSiteSettings.giftWrapDescription,
      googleAnalyticsId: d.google_analytics_id || '',
      facebookPixelId: d.facebook_pixel_id || '',
      googleSiteVerification: d.google_site_verification || '',
      bingSiteVerification: d.bing_site_verification || '',
      pinterestSiteVerification: d.pinterest_site_verification || '',
    };
  } catch {
    return fallbackSiteSettings;
  }
}

/**
 * Subset of site-settings safe to expose publicly to the shop UI.
 * Used by the cart/checkout client components to display the
 * free-shipping tracker and gift-wrap toggle.
 */
export interface ShopSettings {
  freeShippingThreshold: number;
  freeShippingLabel: string;
  shippingFlatRate: number;
  giftWrapEnabled: boolean;
  giftWrapPrice: number;
  giftWrapLabel: string;
  giftWrapDescription: string;
  defaultCurrency: string;
}

export async function getShopSettings(): Promise<ShopSettings> {
  const s = await getSiteSettings();
  return {
    freeShippingThreshold: s.freeShippingThreshold,
    freeShippingLabel: s.freeShippingLabel,
    shippingFlatRate: s.shippingFlatRate,
    giftWrapEnabled: s.giftWrapEnabled,
    giftWrapPrice: s.giftWrapPrice,
    giftWrapLabel: s.giftWrapLabel,
    giftWrapDescription: s.giftWrapDescription,
    defaultCurrency: 'GBP',
  };
}

// Navigation — fetched from Strapi `navigation` singleType (Anna edits in CMS),
// falls back to the hardcoded list in `src/data/site.ts` if Strapi is unreachable
// or hasn't been seeded yet.
// Map of editorial top-level menu href -> the corresponding `section` value
// used in the Article Category collection. When the top-level item matches
// one of these, the dropdown children are AUTO-DERIVED from Article Categories
// filtered by that section (Anna edits categories in one place; both the
// menu dropdown and the on-page subcategory tabs stay in sync).
//
// Other top-level items (Experiences, Work with Anna, Shop, Community, About)
// keep using the children defined on the Navigation singletype because their
// sub-items aren't 1:1 with Article Categories — they point to programmes,
// products, sub-pages etc.
const EDITORIAL_SECTION_BY_HREF: Record<string, string> = {
  '/reset-stories': 'reset-stories',
  '/life': 'life',
  '/love-and-relationships': 'love-and-relationships',
  '/work-and-money': 'work-and-money',
};

async function fetchCategoriesBySection(): Promise<Record<string, { label: string; href: string }[]>> {
  try {
    const { data } = await fetchAPI('/article-categories', { 'pagination[limit]': '200', sort: 'sort_order:asc,name:asc' });
    if (!Array.isArray(data)) return {};
    const grouped: Record<string, { label: string; href: string }[]> = {};
    for (const raw of data) {
      const cat = raw as { name?: string; slug?: string; section?: string };
      if (!cat?.section || !cat?.slug || !cat?.name) continue;
      const sectionHref = Object.entries(EDITORIAL_SECTION_BY_HREF).find(([, s]) => s === cat.section)?.[0];
      if (!sectionHref) continue;
      grouped[sectionHref] ??= [];
      grouped[sectionHref].push({ label: cat.name, href: `${sectionHref}/${cat.slug}` });
    }
    return grouped;
  } catch {
    return {};
  }
}

export async function getNavigation(): Promise<NavItem[]> {
  try {
    // Fetch siteSettings in parallel so we get the single CMS-controlled
    // max-subcategories cap that BOTH the dropdown AND the section page tabs
    // respect. Anna edits one field in Site Settings → both places update.
    const [navRes, categoriesBySection, siteSettings, shopCategories] = await Promise.all([
      fetchAPI('/navigation', { 'populate[items][populate]': '*' }),
      fetchCategoriesBySection(),
      getSiteSettings(),
      getShopCategoryTree(),
    ]);
    const items = (navRes?.data as { items?: unknown[] } | null)?.items;
    if (!Array.isArray(items) || items.length === 0) return fallbackNavigation;
    const MAX_DROPDOWN_CHILDREN = siteSettings.maxSubcategoriesPerMenu || 4;

    return items.map((raw) => {
      const item = raw as { label?: string; href?: string; colour?: string; children?: unknown[] };
      const href = String(item.href || '#');

      // Editorial sections: auto-derive children from Article Categories so
      // Anna has a single source of truth.
      let children: { label: string; href: string }[] | undefined;
      if (EDITORIAL_SECTION_BY_HREF[href]) {
        const fromCategories = categoriesBySection[href];
        if (fromCategories && fromCategories.length > 0) {
          children = [{ label: 'All', href }, ...fromCategories.slice(0, MAX_DROPDOWN_CHILDREN)];
        }
      }

      // Shop: auto-derive children from product-category top-level entries
      // (Jewellery / Crystals / Sage & Palo Santo / Gifts). Anna edits one
      // collection (Shop · Category) and the menu reflects it automatically.
      // Bypasses anything stored in the Navigation singleton's shop children
      // so the menu can't drift from the actual categories.
      if (href === '/shop' && shopCategories.length > 0) {
        children = shopCategories
          .slice(0, MAX_DROPDOWN_CHILDREN)
          .map((c) => ({ label: c.name, href: `/shop?category=${c.slug}` }));
      }

      // Fall back to the Navigation singletype's stored children if not
      // editorial / shop (or if no categories yet for this section). Same 4-cap.
      if (!children) {
        children = Array.isArray(item.children)
          ? item.children.slice(0, MAX_DROPDOWN_CHILDREN).map((c) => {
              const child = c as { label?: string; href?: string };
              return { label: String(child.label || ''), href: String(child.href || '#') };
            })
          : undefined;
      }

      return {
        label: String(item.label || ''),
        href,
        colour: item.colour || undefined,
        children,
      };
    });
  } catch {
    return fallbackNavigation;
  }
}

// ═══ MENU-SECTION LANDING PAGES ═══
// One singletype per main-menu section landing — Reset Stories / Life /
// Love & Relationships / Work & Money / Work with Anna / Shop. Each lets
// Anna edit the kicker + title + intro + optional hero image without me.
// Frontend pages fall back to the hardcoded copy if Strapi is unreachable
// or hasn't been seeded yet, so the site never breaks during a deploy gap.
export interface SectionLandingPage {
  kicker: string;
  title: string;
  intro: string;
  heroImage: string;
  kickerColour: string;
  upsells: UpsellRef[];
}

export async function getSectionLandingPage(
  endpoint: string,
  fallback: Omit<SectionLandingPage, 'upsells'>,
): Promise<SectionLandingPage> {
  try {
    const { data: d } = await fetchAPI(endpoint, { populate: '*' });
    if (!d) return { ...fallback, upsells: [] };
    const upsells = await getUpsellsForSingleton(endpoint);
    return {
      kicker: (d as any).kicker || fallback.kicker,
      title: (d as any).title || fallback.title,
      intro: (d as any).intro || fallback.intro,
      heroImage: mediaUrl((d as any).hero_image, 'large') || fallback.heroImage,
      kickerColour: (d as any).kicker_colour || fallback.kickerColour,
      upsells,
    };
  } catch {
    return { ...fallback, upsells: [] };
  }
}

// Sub-page shape used by /shop/new-in, /shop/personalised, /shop/emotional-support-jewellery
// (and reusable for any future SubPage-rendered sub-page).
//
// Fields are filtered down to non-empty paragraphs so the page can render
// `paragraphs.map(...)` without showing blank gaps when Anna leaves a slot empty.
export type SubPageData = {
  kicker: string;
  kickerColour: string;
  title: string;
  parentLabel: string;
  parentHref: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
  inspirationLabel?: string;
  inspirationUrl?: string;
};

// /experiences landing page — header + the 4 category cards (Retreats /
// Workshops / Corporate / Speaking) + the "Upcoming" section kicker/title.
// The events themselves come from the separate Experience collection.
export type ExperienceCategoryCard = {
  title: string;
  description: string;
  href: string;
  colour: string;
  linkLabel: string;
};

export type ExperiencesLandingData = {
  kicker: string;
  kickerColour: string;
  title: string;
  intro: string;
  categories: ExperienceCategoryCard[];
  upcomingKicker: string;
  upcomingTitle: string;
};

export async function getExperiencesLandingPage(
  fallback: ExperiencesLandingData,
): Promise<ExperiencesLandingData> {
  try {
    const { data: d } = await fetchAPI('/experiences-landing-page', { populate: '*' });
    if (!d) return fallback;
    const r = d as Record<string, unknown>;
    const cats = Array.isArray(r.categories) ? (r.categories as Array<Record<string, unknown>>) : [];
    const categories: ExperienceCategoryCard[] = cats.length > 0
      ? cats.map((c) => ({
          title: (c.title as string) || '',
          description: (c.description as string) || '',
          href: (c.href as string) || '#',
          colour: (c.colour as string) || '#7BAFDD',
          linkLabel: (c.link_label as string) || 'View',
        }))
      : fallback.categories;
    return {
      kicker: (r.kicker as string) || fallback.kicker,
      kickerColour: (r.kicker_colour as string) || fallback.kickerColour,
      title: (r.title as string) || fallback.title,
      intro: (r.intro as string) || fallback.intro,
      categories,
      upcomingKicker: (r.upcoming_kicker as string) || fallback.upcomingKicker,
      upcomingTitle: (r.upcoming_title as string) || fallback.upcomingTitle,
    };
  } catch {
    return fallback;
  }
}

// /the-work page (Work with Anna). Extends the basic section-landing shape
// with the extra blocks specific to that page: "Ways to Work With Me" intro
// + CTA, and the "Programmes" section header. Programme cards themselves
// come from the Coaching Session collection.
export type WorkWithAnnaData = {
  kicker: string;
  kickerColour: string;
  title: string;
  intro: string;
  waysSectionTitle: string;
  waysSectionBody: string;
  waysSectionCtaLabel: string;
  waysSectionCtaUrl: string;
  programmesKicker: string;
  programmesTitle: string;
};

export async function getWorkWithAnnaPage(fallback: WorkWithAnnaData): Promise<WorkWithAnnaData> {
  // NEW policy (Anna 14 Jul): return raw CMS values. Page handles
  // all-or-nothing per section. Fallback is only used if the CMS singleton
  // is completely untouched or unreachable — the page component decides
  // per section which fields to substitute.
  const empty: WorkWithAnnaData = {
    kicker: '',
    kickerColour: '',
    title: '',
    intro: '',
    waysSectionTitle: '',
    waysSectionBody: '',
    waysSectionCtaLabel: '',
    waysSectionCtaUrl: '',
    programmesKicker: '',
    programmesTitle: '',
  };
  try {
    const { data: d } = await fetchAPI('/work-with-anna-page', { populate: '*' });
    if (!d) return fallback;
    const r = d as Record<string, unknown>;
    return {
      kicker: (r.kicker as string) || '',
      kickerColour: (r.kicker_colour as string) || '',
      title: (r.title as string) || '',
      intro: (r.intro as string) || '',
      waysSectionTitle: (r.ways_section_title as string) || '',
      waysSectionBody: (r.ways_section_body as string) || '',
      waysSectionCtaLabel: (r.ways_section_cta_label as string) || '',
      waysSectionCtaUrl: (r.ways_section_cta_url as string) || '',
      programmesKicker: (r.programmes_kicker as string) || '',
      programmesTitle: (r.programmes_title as string) || '',
    };
  } catch {
    return empty;
  }
}

export async function getSubPage(
  endpoint: string,
  fallback: SubPageData,
): Promise<SubPageData> {
  try {
    const { data: d } = await fetchAPI(endpoint, { populate: '*' });
    if (!d) return fallback;
    const r = d as Record<string, unknown>;
    const paragraphs = [r.paragraph_1, r.paragraph_2, r.paragraph_3, r.paragraph_4]
      .filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
    return {
      kicker: (r.kicker as string) || fallback.kicker,
      kickerColour: (r.kicker_colour as string) || fallback.kickerColour,
      title: (r.title as string) || fallback.title,
      parentLabel: (r.parent_label as string) || fallback.parentLabel,
      parentHref: (r.parent_href as string) || fallback.parentHref,
      paragraphs: paragraphs.length > 0 ? paragraphs : fallback.paragraphs,
      ctaLabel: (r.cta_label as string) || fallback.ctaLabel,
      ctaUrl: (r.cta_url as string) || fallback.ctaUrl,
      inspirationLabel: typeof r.inspiration_label === 'string' && r.inspiration_label.trim() ? r.inspiration_label : fallback.inspirationLabel,
      inspirationUrl: typeof r.inspiration_url === 'string' && r.inspiration_url.trim() ? r.inspiration_url : fallback.inspirationUrl,
    };
  } catch {
    return fallback;
  }
}

// Top-strip text fetched from same `navigation` singleType (cheap, no extra request)
export async function getTopStripText(): Promise<string> {
  try {
    const { data: d } = await fetchAPI('/navigation');
    const text = (d as { top_strip_text?: string } | null)?.top_strip_text;
    return text && text.trim() ? text : 'Stories · Work with Anna · Experiences · Shop · Community';
  } catch {
    return 'Stories · Work with Anna · Experiences · Shop · Community';
  }
}

export const getFooterLinks = (): FooterLinks => fallbackFooterLinks;

// ═══ FOOTER singletype — Anna edits closing message, link columns, legal, Substack CTA ═══
export interface FooterData {
  closingMessage: string;
  exploreLinks: { label: string; href: string }[];
  connectLinks: { label: string; href: string }[];
  legalLinks: { label: string; href: string }[];
  substackCtaLabel: string;
  substackCtaUrl: string;
}

export async function getFooter(): Promise<FooterData> {
  // NEW policy (Anna 14 Jul): show CMS content or nothing — no hardcoded
  // fallback links mixing in with whatever Anna typed. Only the strictly
  // required scalar fields (closingMessage, substackCta*) keep a fallback
  // so the page doesn't render with a bare footer when Anna hasn't touched
  // the singleton yet. Link lists render empty if the CMS field is blank
  // — the Footer component then hides that tier entirely.
  const emptyFallback: FooterData = {
    closingMessage: "You don't have to hold everything.",
    exploreLinks: [],
    connectLinks: [],
    legalLinks: [],
    substackCtaLabel: 'Join Reset Letters →',
    substackCtaUrl: '/reset-letters',
  };
  try {
    const { data: d } = await fetchAPI('/footer', { 'populate[explore_links]': '*', 'populate[connect_links]': '*', 'populate[legal_links]': '*' } as any);
    if (!d) return emptyFallback;
    const mapLinks = (arr: any): { label: string; href: string }[] =>
      Array.isArray(arr) && arr.length > 0
        ? arr.map((l: any) => ({ label: String(l?.label || ''), href: String(l?.href || '#') }))
        : [];
    return {
      closingMessage: (d as any).closing_message || emptyFallback.closingMessage,
      exploreLinks: mapLinks((d as any).explore_links),
      connectLinks: mapLinks((d as any).connect_links),
      legalLinks: mapLinks((d as any).legal_links),
      substackCtaLabel: (d as any).substack_cta_label || emptyFallback.substackCtaLabel,
      substackCtaUrl: (d as any).substack_cta_url || emptyFallback.substackCtaUrl,
    };
  } catch {
    return emptyFallback;
  }
}

// ═══ ARTICLES ═══

// "Shop the story" tag — one tagged photo on an article (Anna's PDF 5.2).
// Magazine pattern: hover the photo, see a small tag "Anna is wearing the [piece]",
// click → product page. Used sparingly only on key photos.
export interface ArticleShopTag {
  image: string;
  productSlug: string | null;
  productName: string | null;
  captionPrefix: string;
  altText: string;
  /** How the photo fills the gallery frame: 'cover' crops to fill, 'contain'
   * shows whole image with subtle padding. Anna picks per photo in CMS. */
  fitMode: 'cover' | 'contain';
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  // Strapi v5 blocks JSON (array). Legacy plain-text string may still show
  // up if an entry slipped past the migration seed — the renderer handles
  // both. Use BlocksRenderer + previewBody rather than treating as string.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any[] | string;
  heroImage: string;
  category: { name: string; slug: string; section: string; colour: string } | null;
  author: string;
  readingTime: string;
  isFeatured: boolean;
  isHomepagePinned: boolean;
  homepagePinOrder: number;
  isFree: boolean;
  substackUrl: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  shopTags: ArticleShopTag[];
  upsells: UpsellRef[];
}

export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
  section: string;
  colour: string;
  description: string;
  sortOrder: number;
}

const fallbackArticles: Article[] = [];

function mapArticle(d: any): Article {
  return {
    id: d.id,
    title: d.title || '',
    slug: d.slug || '',
    excerpt: d.excerpt || '',
    // Blocks is stored as an array. Fall back to empty array if missing.
    body: Array.isArray(d.body) ? d.body : (typeof d.body === 'string' ? d.body : []),
    heroImage: mediaUrl(d.hero_image),
    category: d.category ? {
      name: d.category.name,
      slug: d.category.slug,
      section: d.category.section,
      colour: d.category.colour || '#6E3A5A',
    } : null,
    author: d.author || 'Anna Lou',
    readingTime: d.reading_time || '',
    isFeatured: d.is_featured || false,
    isHomepagePinned: d.is_homepage_pinned || false,
    homepagePinOrder: d.homepage_pin_order ?? 0,
    isFree: d.is_free !== false,
    substackUrl: d.substack_canonical_url || '',
    seoTitle: d.seo_title || '',
    seoDescription: d.seo_description || '',
    publishedAt: d.publishedAt || '',
    shopTags: Array.isArray(d.shop_tags)
      ? d.shop_tags
          // Keep tags that have EITHER an uploaded image OR a linked product
          // (we can fall back to the product's first image). Drop only the
          // ones that have neither — nothing to render.
          .filter((t: any) => t && (t.image || (t.product && Array.isArray(t.product.images) && t.product.images.length > 0)))
          .map((t: any): ArticleShopTag => {
            const productFirstImage = t.product && Array.isArray(t.product.images) && t.product.images.length > 0
              ? t.product.images[0]
              : null;
            return {
              image: t.image ? mediaUrl(t.image) : mediaUrl(productFirstImage),
              productSlug: t.product?.slug || null,
              productName: t.product?.name || null,
              captionPrefix: t.caption_prefix || 'Anna is wearing the',
              altText: t.alt_text || t.product?.name || '',
              fitMode: t.fit_mode === 'contain' ? 'contain' : 'cover',
            };
          })
      : [],
    upsells: Array.isArray(d.upsells)
      ? d.upsells.map((u: any) => ({
          label: u.label || '',
          link: u.link || '',
          eyebrow: u.eyebrow || '',
          blurb: u.blurb || '',
          image: u.image && u.image.url ? { url: mediaUrl(u.image) } : null,
        }))
      : [],
  };
}

/** Get articles, optionally filtered by section (reset-stories, life, etc.) */
export async function getArticles(section?: string): Promise<Article[]> {
  try {
    const params: Record<string, string> = {
      'populate': '*',
      'sort': 'publishedAt:desc',
      'pagination[limit]': '100',
    };
    if (section) {
      // $or: include articles whose PRIMARY category sits in this section,
      // OR whose ADDITIONAL_CATEGORIES include any category in this section.
      // Lets Anna cross-list one article on multiple section pages.
      params['filters[$or][0][category][section][$eq]'] = section;
      params['filters[$or][1][additional_categories][section][$eq]'] = section;
    }
    const { data } = await fetchAPI('/articles', params);
    if (!data?.length) return fallbackArticles;
    return data.map(mapArticle);
  } catch {
    return fallbackArticles;
  }
}

/** Get featured articles across all sections */
export async function getFeaturedArticles(limit = 6): Promise<Article[]> {
  try {
    const { data } = await fetchAPI('/articles', {
      'populate': '*',
      'filters[is_featured][$eq]': 'true',
      'sort': 'publishedAt:desc',
      'pagination[limit]': String(limit),
    });
    if (!data?.length) return fallbackArticles;
    return data.map(mapArticle);
  } catch {
    return fallbackArticles;
  }
}

/** Get a single article by slug. Deep-populates shop_tags.image + shop_tags.product
 *  so the "Shop the story" gallery has everything it needs in one fetch. */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data } = await fetchAPI('/articles', {
      'populate[hero_image]': 'true',
      'populate[category]': 'true',
      'populate[shop_tags][populate][image]': 'true',
      'populate[shop_tags][populate][product][populate][images]': 'true',
      'populate[upsells][populate]': '*',
      'filters[slug][$eq]': slug,
    });
    if (!data?.length) return null;
    return mapArticle(data[0]);
  } catch {
    return null;
  }
}

/** Get a single article category by slug + section */
export async function getArticleCategoryBySlug(slug: string, section: string): Promise<ArticleCategory | null> {
  try {
    const { data } = await fetchAPI('/article-categories', {
      'filters[slug][$eq]': slug,
      'filters[section][$eq]': section,
    });
    if (!data?.length) return null;
    const d = data[0];
    return {
      id: d.id,
      name: d.name,
      slug: d.slug,
      section: d.section,
      colour: d.colour || '#6E3A5A',
      description: d.description || '',
      sortOrder: d.sort_order || 0,
    };
  } catch {
    return null;
  }
}

/** Get articles filtered by category slug */
export async function getArticlesByCategorySlug(categorySlug: string): Promise<Article[]> {
  try {
    const { data } = await fetchAPI('/articles', {
      'populate': '*',
      'sort': 'publishedAt:desc',
      // $or: primary category slug match OR any additional_categories slug match.
      'filters[$or][0][category][slug][$eq]': categorySlug,
      'filters[$or][1][additional_categories][slug][$eq]': categorySlug,
      'pagination[limit]': '100',
    });
    if (!data?.length) return [];
    return data.map(mapArticle);
  } catch {
    return [];
  }
}

/** Get article categories for a section */
export async function getArticleCategories(section?: string): Promise<ArticleCategory[]> {
  try {
    const params: Record<string, string> = {
      'sort': 'sort_order:asc',
    };
    if (section) {
      params['filters[section][$eq]'] = section;
    }
    const { data } = await fetchAPI('/article-categories', params);
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      section: d.section,
      colour: d.colour || '#6E3A5A',
      description: d.description || '',
      sortOrder: d.sort_order || 0,
    }));
  } catch {
    return [];
  }
}

// ═══ COACHING SESSIONS ═══

export interface CoachingSession {
  id: number;
  name: string;
  slug: string;
  description: string;
  duration: string;
  price: number | null;
  priceLabel: string;
  tagline: string;
  accentColour: string;
  heroImage: string;
  isActive: boolean;
  sortOrder: number;
}

export async function getCoachingSessions(): Promise<CoachingSession[]> {
  try {
    const { data } = await fetchAPI('/coaching-sessions', {
      'populate': '*',
      'sort': 'sort_order:asc',
      'filters[is_active][$eq]': 'true',
    });
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      description: d.description || '',
      duration: d.duration || '',
      price: d.price ?? null,
      priceLabel: d.price_label || '',
      tagline: d.tagline || '',
      accentColour: d.accent_colour || '#FAA21B',
      heroImage: mediaUrl(d.hero_image),
      isActive: d.is_active !== false,
      sortOrder: d.sort_order || 0,
    }));
  } catch {
    return [];
  }
}

// /the-work/sessions hero copy (cards below come from getCoachingSessions).
export type SessionsHubData = {
  eyebrow: string;
  title: string;
  tagline: string;
  intro: string;
};

export async function getSessionsHubPage(fallback: SessionsHubData): Promise<SessionsHubData> {
  try {
    const { data: d } = await fetchAPI('/sessions-hub-page', { populate: '*' });
    if (!d) return fallback;
    const r = d as Record<string, unknown>;
    return {
      eyebrow: (r.eyebrow as string) || fallback.eyebrow,
      title: (r.title as string) || fallback.title,
      tagline: (r.tagline as string) || fallback.tagline,
      intro: (r.intro as string) || fallback.intro,
    };
  } catch {
    return fallback;
  }
}

// ═══ COSMIC FORECAST ═══

export interface CosmicForecast {
  id: number;
  weekOf: string;
  title: string;
  moonPhase: string;
  energyTheme: string;
  stoneOfWeek: string;
  summary: string;
}

/** Get the latest cosmic forecast */
export async function getLatestForecast(): Promise<CosmicForecast | null> {
  try {
    const { data } = await fetchAPI('/cosmic-forecasts', {
      'sort': 'week_of:desc',
      'pagination[limit]': '1',
    });
    if (!data?.length) return null;
    const d = data[0];
    return {
      id: d.id,
      weekOf: d.week_of,
      title: d.title,
      moonPhase: d.moon_phase || '',
      energyTheme: d.energy_theme || '',
      stoneOfWeek: d.stone_of_week || '',
      summary: d.summary || '',
    };
  } catch {
    return null;
  }
}

// ═══ EXPERIENCES ═══

export interface Experience {
  id: number;
  name: string;
  slug: string;
  type: 'retreat' | 'workshop' | 'corporate' | 'speaking';
  description: string;
  date: string;
  location: string;
  price: number | null;
  priceLabel: string;
  heroImage: string;
  isUpcoming: boolean;
  bookingUrl: string;
  seoTitle?: string;
  seoDescription?: string;
  upsells?: Array<{
    label?: string;
    link?: string;
    eyebrow?: string;
    blurb?: string;
    image?: { url?: string } | null;
  }>;
}

export async function getExperiences(type?: string): Promise<Experience[]> {
  try {
    const params: Record<string, string> = {
      'populate': '*',
      'sort': 'date:asc',
      'filters[is_active][$eq]': 'true',
    };
    if (type) {
      params['filters[type][$eq]'] = type;
    }
    const { data } = await fetchAPI('/experiences', params);
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      type: d.type,
      description: d.description || '',
      date: d.date || '',
      location: d.location || '',
      price: d.price ?? null,
      priceLabel: d.price_label || '',
      heroImage: mediaUrl(d.hero_image),
      isUpcoming: d.is_upcoming !== false,
      bookingUrl: d.booking_url || '',
      seoTitle: d.seo_title || '',
      seoDescription: d.seo_description || '',
      // Upsells — Anna's per-experience "where next" cards. Used by the
      // experience detail page (/experiences/[slug]) to render service
      // upsells instead of automatic product upsells (her 10 Jun ask).
      upsells: Array.isArray(d.upsells) ? d.upsells.map((u: any) => ({
        label: u.label || '',
        link: u.link || '',
        eyebrow: u.eyebrow || '',
        blurb: u.blurb || '',
        image: u.image ? { url: mediaUrl(u.image) } : null,
      })) : [],
    }));
  } catch {
    return [];
  }
}

// ═══ TESTIMONIALS / REVIEWS ═══

export interface Testimonial {
  id: number;
  reviewerName: string;
  reviewerLocation: string;
  quote: string;
  rating: number | null;
  photoUrl: string;
  videoUrl: string;
  videoThumbnail: string;
  youtubeUrl: string;
  displayStyle: 'card' | 'banner';
  date: string;
  tag: string;
  experienceSlugs: string[];
  isFeatured: boolean;
  sortOrder: number;
}

/**
 * Fetch testimonials. Filter by:
 *   - tag: section/programme tag (e.g. "retreats", "the-reset")
 *   - experienceSlug: a specific experience slug (uses the many-to-many)
 *   - featured: only is_featured = true (for homepage strip)
 *
 * Without filters, returns every active testimonial (rare — use a filter).
 */
export async function getTestimonials(opts: {
  tag?: string;
  experienceSlug?: string;
  featured?: boolean;
  limit?: number;
} = {}): Promise<Testimonial[]> {
  try {
    const params: Record<string, string> = {
      'populate': '*',
      'sort': 'sort_order:asc,date:desc',
      'filters[is_active][$eq]': 'true',
      'pagination[limit]': String(opts.limit ?? 50),
    };
    if (opts.tag) params['filters[tags][$eq]'] = opts.tag;
    if (opts.experienceSlug) params['filters[experiences][slug][$eq]'] = opts.experienceSlug;
    if (opts.featured) params['filters[is_featured][$eq]'] = 'true';

    const { data } = await fetchAPI('/testimonials', params);
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      reviewerName: d.reviewer_name || '',
      reviewerLocation: d.reviewer_location || '',
      quote: d.quote || '',
      rating: typeof d.rating === 'number' ? d.rating : null,
      photoUrl: mediaUrl(d.photo),
      videoUrl: mediaUrl(d.video),
      videoThumbnail: mediaUrl(d.video_thumbnail),
      youtubeUrl: d.youtube_url || '',
      displayStyle: d.display_style === 'banner' ? 'banner' : 'card',
      date: d.date || '',
      tag: d.tags || '',
      experienceSlugs: Array.isArray(d.experiences)
        ? d.experiences.map((e: any) => e.slug).filter(Boolean)
        : [],
      isFeatured: d.is_featured === true,
      sortOrder: d.sort_order ?? 0,
    }));
  } catch {
    return [];
  }
}

// ═══ TESTIMONIALS PAGE (singleton — hero copy for /testimonials) ═══

export interface TestimonialsPage {
  kicker: string;
  title: string;
  tagline: string;
  kickerColour: string;
}

const TESTIMONIALS_PAGE_FALLBACK: TestimonialsPage = {
  kicker: 'Client Stories',
  title: 'Hear it from our clients',
  tagline: 'Honest stories from women who have done the work. Read, watch, and see what shifts when you come home to yourself.',
  kickerColour: '#6E3A5A',
};

export async function getTestimonialsPage(): Promise<TestimonialsPage> {
  try {
    const { data: d } = await fetchAPI('/testimonials-page');
    if (!d) return TESTIMONIALS_PAGE_FALLBACK;
    return {
      kicker: d.kicker || TESTIMONIALS_PAGE_FALLBACK.kicker,
      title: d.title || TESTIMONIALS_PAGE_FALLBACK.title,
      tagline: d.tagline || TESTIMONIALS_PAGE_FALLBACK.tagline,
      kickerColour: d.kicker_colour || TESTIMONIALS_PAGE_FALLBACK.kickerColour,
    };
  } catch {
    return TESTIMONIALS_PAGE_FALLBACK;
  }
}

// ═══ PRACTITIONERS ═══

export interface Practitioner {
  id: number;
  name: string;
  role: string;
  bio: string;
  portraitUrl: string;
  websiteUrl: string;
  instagramHandle: string;
  email: string;
  location: string;
  displayStyle: 'card' | 'banner';
  sortOrder: number;
}

export async function getPractitioners(): Promise<Practitioner[]> {
  try {
    const { data } = await fetchAPI('/practitioners', {
      populate: '*',
      sort: 'sort_order:asc,name:asc',
      'filters[is_active][$eq]': 'true',
      'pagination[limit]': '100',
    });
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name || '',
      role: d.role || '',
      bio: d.bio || '',
      portraitUrl: mediaUrl(d.portrait),
      websiteUrl: d.website_url || '',
      instagramHandle: (d.instagram_handle || '').replace(/^@/, ''),
      email: d.email || '',
      location: d.location || '',
      displayStyle: d.display_style === 'banner' ? 'banner' : 'card',
      sortOrder: d.sort_order ?? 100,
    }));
  } catch {
    return [];
  }
}

export interface PractitionersPage {
  kicker: string;
  title: string;
  tagline: string;
  kickerColour: string;
  upsells: UpsellRef[];
}

const PRACTITIONERS_PAGE_FALLBACK: PractitionersPage = {
  kicker: 'Trusted Circle',
  title: 'Practitioners I trust.',
  tagline: "A small, hand-picked circle of therapists, coaches, bodyworkers, and healers I send my clients to when the work needs to go somewhere I don't.",
  kickerColour: '#6E3A5A',
  upsells: [],
};

export async function getPractitionersPage(): Promise<PractitionersPage> {
  try {
    const { data: d } = await fetchAPI('/practitioners-page');
    if (!d) return PRACTITIONERS_PAGE_FALLBACK;
    const upsells = await getUpsellsForSingleton('/practitioners-page');
    return {
      kicker: d.kicker || PRACTITIONERS_PAGE_FALLBACK.kicker,
      title: d.title || PRACTITIONERS_PAGE_FALLBACK.title,
      tagline: d.tagline || PRACTITIONERS_PAGE_FALLBACK.tagline,
      kickerColour: d.kickerColour || PRACTITIONERS_PAGE_FALLBACK.kickerColour,
      upsells,
    };
  } catch {
    return PRACTITIONERS_PAGE_FALLBACK;
  }
}

// ═══ MANTRAS ═══

export interface Mantra {
  id: number;
  title: string;
  youtubeUrl: string;
  description: string;
  duration: string;
}

export async function getMantras(): Promise<Mantra[]> {
  try {
    const { data } = await fetchAPI('/mantras', {
      'sort': 'sort_order:asc',
      'filters[is_active][$eq]': 'true',
    });
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      youtubeUrl: d.youtube_url,
      description: d.description || '',
      duration: d.duration || '',
    }));
  } catch {
    return [];
  }
}

// ═══ CUSTOM HTML LANDING (competitions, collabs, one-off campaigns) ═══

export interface CustomHtmlLanding {
  title: string;
  slug: string;
  rawHtml: string;
  iframeHeight: string;
  showSiteNav: boolean;
  heroImage: string | null;
  seoTitle: string;
  seoDescription: string;
}

export async function getCustomHtmlLanding(slug: string): Promise<CustomHtmlLanding | null> {
  try {
    const { data } = await fetchAPI('/custom-html-landings', {
      'populate[hero_image]': 'true',
      'filters[slug][$eq]': slug,
    });
    if (!data?.length) return null;
    const d = data[0];
    return {
      title: d.title || '',
      slug: d.slug || '',
      rawHtml: d.raw_html || '',
      iframeHeight: d.iframe_height || 'auto',
      showSiteNav: d.show_site_nav !== false,
      heroImage: d.hero_image ? mediaUrl(d.hero_image) : null,
      seoTitle: d.seo_title || '',
      seoDescription: d.seo_description || '',
    };
  } catch {
    return null;
  }
}

// ═══ VAULT JOURNEYS (Reset Room member content) ═══

export interface VaultJourney {
  id: number;
  slug: string;
  name: string;
  description: string;
  kind: string;
  toneColour: string;
  duration: string;
  audioUrl: string;
  videoUrl: string;
  videoThumbnail: string;
  companionPdfUrl: string;
  body: string;
  recordedDate: string;
  sortOrder: number;
}

function mapVaultJourney(d: any): VaultJourney {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name || '',
    description: d.description || '',
    kind: d.kind || 'Foundational journey',
    toneColour: d.tone_colour || '#F280AA',
    duration: d.duration || '',
    audioUrl: mediaUrl(d.audio_file),
    videoUrl: d.video_url || '',
    videoThumbnail: mediaUrl(d.video_thumbnail),
    companionPdfUrl: mediaUrl(d.companion_pdf),
    body: d.body || '',
    recordedDate: d.recorded_date || '',
    sortOrder: d.sort_order ?? 0,
  };
}

export async function getVaultJourneys(): Promise<VaultJourney[]> {
  try {
    const { data } = await fetchAPI('/vault-journeys', {
      'populate': '*',
      'sort': 'sort_order:asc,createdAt:asc',
      'filters[is_active][$eq]': 'true',
      'pagination[limit]': '100',
    });
    if (!data?.length) return [];
    return data.map(mapVaultJourney);
  } catch {
    return [];
  }
}

export async function getVaultJourneyBySlug(slug: string): Promise<VaultJourney | null> {
  try {
    const { data } = await fetchAPI('/vault-journeys', {
      'populate': '*',
      'filters[slug][$eq]': slug,
      'pagination[limit]': '1',
    });
    if (!data?.length) return null;
    return mapVaultJourney(data[0]);
  } catch {
    return null;
  }
}

// ═══ PRESS MENTIONS ('As seen in' strip) ═══

export interface PressMention {
  id: number;
  name: string;
  logo: string;
  url: string;
  sortOrder: number;
}

export async function getPressMentions(): Promise<PressMention[]> {
  try {
    const { data } = await fetchAPI('/press-mentions', {
      'populate': '*',
      'sort': 'sort_order:asc,createdAt:asc',
      'filters[is_active][$eq]': 'true',
      'filters[is_homepage_featured][$eq]': 'true',
      'pagination[limit]': '20',
    });
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name || '',
      logo: mediaUrl(d.logo),
      url: d.url || '',
      sortOrder: d.sort_order ?? 0,
    }));
  } catch {
    return [];
  }
}

// ═══ CERTIFICATIONS (badges shown under press logos) ═══

export interface Certification {
  id: number;
  name: string;
  label: string;
  colour: string;
  url: string;
  logo: string;
  sortOrder: number;
}

export async function getCertifications(): Promise<Certification[]> {
  try {
    const { data } = await fetchAPI('/certifications', {
      'populate': '*',
      'sort': 'sort_order:asc,createdAt:asc',
      'filters[is_active][$eq]': 'true',
      'filters[is_homepage_featured][$eq]': 'true',
      'pagination[limit]': '10',
    });
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name || '',
      label: d.label || '',
      colour: d.colour || '#231F20',
      url: d.url || '',
      logo: mediaUrl(d.logo),
      sortOrder: d.sort_order ?? 0,
    }));
  } catch {
    return [];
  }
}

// ═══ WORKSHOP REPLAYS (Reset Room member content) ═══

export interface WorkshopReplay {
  id: number;
  slug: string;
  title: string;
  description: string;
  kind: string;
  recordedDate: string;
  duration: string;
  videoUrl: string;
  videoThumbnail: string;
  audioUrl: string;
  body: string;
}

function mapReplay(d: any): WorkshopReplay {
  return {
    id: d.id,
    slug: d.slug,
    title: d.title || '',
    description: d.description || '',
    kind: d.kind || 'Workshop',
    recordedDate: d.recorded_date || '',
    duration: d.duration || '',
    videoUrl: d.video_url || '',
    videoThumbnail: mediaUrl(d.video_thumbnail),
    audioUrl: mediaUrl(d.audio_file),
    body: d.body || '',
  };
}

export async function getWorkshopReplays(): Promise<WorkshopReplay[]> {
  try {
    const { data } = await fetchAPI('/workshop-replays', {
      'populate': '*',
      'sort': 'recorded_date:desc',
      'filters[is_active][$eq]': 'true',
      'pagination[limit]': '100',
    });
    if (!data?.length) return [];
    return data.map(mapReplay);
  } catch {
    return [];
  }
}

// ═══ MEMBERSHIP PAGE (/community/membership singleton) ═══

export interface MembershipPageCopy {
  kicker: string;
  title: string;
  paragraphs: string[];
  priceLabel: string;
  includesLabel: string;
  commitmentLabel: string;
  trialLabel: string;
  ctaLabel: string;
}

export async function getMembershipPage(fallback: MembershipPageCopy): Promise<MembershipPageCopy> {
  try {
    const { data: d } = await fetchAPI('/membership-page');
    if (!d) return fallback;
    const rawParas = typeof d.paragraphs === 'string' ? d.paragraphs : '';
    const paragraphs = rawParas
      ? rawParas.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean)
      : fallback.paragraphs;
    return {
      kicker: d.kicker || fallback.kicker,
      title: d.title || fallback.title,
      paragraphs,
      priceLabel: d.price_label || fallback.priceLabel,
      includesLabel: d.includes_label || fallback.includesLabel,
      commitmentLabel: d.commitment_label || fallback.commitmentLabel,
      trialLabel: d.trial_label || fallback.trialLabel,
      ctaLabel: d.cta_label || fallback.ctaLabel,
    };
  } catch {
    return fallback;
  }
}

// ═══ MEMBERSHIP (Reset Room) ═══

export interface Membership {
  title: string;
  description: string;
  priceMonthly: number;
  stripePriceId: string;
  features: string[];
  heroImage: string;
}

export async function getMembership(): Promise<Membership | null> {
  try {
    const { data: d } = await fetchAPI('/membership', { populate: '*' });
    if (!d) return null;
    return {
      title: d.title || 'The Reset Room',
      description: d.description || '',
      priceMonthly: d.price_monthly ?? 25,
      stripePriceId: d.stripe_price_id || '',
      features: Array.isArray(d.features)
        ? d.features.map((f: any) => (typeof f === 'string' ? f : String(f?.text || ''))).filter(Boolean)
        : [],
      heroImage: mediaUrl(d.hero_image),
    };
  } catch {
    return null;
  }
}

// ═══ ABOUT PAGE ═══

export interface AboutPage {
  kicker: string;
  title: string;
  rolesTagline: string;
  storyParagraph1: string;
  storyParagraph2: string;
  additionalBio: string;
  portrait: string;
  pressLogos: { name: string; logo?: string }[];
  certifications: { name: string; colour: string; badge?: string }[];
  upsells: UpsellRef[];
}

export async function getAboutPage(): Promise<AboutPage> {
  // NEW policy (Anna 14 Jul): CMS layer returns RAW values from Strapi —
  // empty strings/arrays when Anna hasn't filled a field. The page
  // component decides whether to substitute a default or render empty,
  // using the all-or-nothing-per-section rule so Anna's copy never mixes
  // with hardcoded fallback content.
  const empty: AboutPage = {
    kicker: '',
    title: '',
    rolesTagline: '',
    storyParagraph1: '',
    storyParagraph2: '',
    additionalBio: '',
    portrait: '',
    pressLogos: [],
    certifications: [],
    upsells: [],
  };

  try {
    const { data: d } = await fetchAPI('/about-page', { populate: '*' });
    if (!d) return empty;
    const upsells = await getUpsellsForSingleton('/about-page');
    return {
      kicker: d.kicker || '',
      title: d.title || '',
      rolesTagline: d.roles_tagline || '',
      storyParagraph1: d.story_paragraph_1 || '',
      storyParagraph2: d.story_paragraph_2 || '',
      additionalBio: d.additional_bio || '',
      portrait: mediaUrl(d.portrait) || '',
      pressLogos: Array.isArray(d.press_logos)
        ? d.press_logos.map((p: any) => ({ name: String(p?.name || ''), logo: mediaUrl(p?.logo) || undefined }))
        : empty.pressLogos,
      certifications: Array.isArray(d.certifications)
        ? d.certifications.map((c: any) => ({
            name: String(c?.name || ''),
            colour: String(c?.colour || '#6E3A5A'),
            badge: mediaUrl(c?.badge) || undefined,
          }))
        : empty.certifications,
      upsells,
    };
  } catch {
    return empty;
  }
}

// ═══ COMMUNITY PAGE ═══

export interface CommunityPage {
  kicker: string;
  title: string;
  intro: string;
  circleTitle: string;
  circleDescription: string;
  circleImage: string;
  resetRoomTitle: string;
  resetRoomDescription: string;
  resetRoomPrice: string;
  resetRoomFeatures: string[];
  resetRoomImage: string;
  eventsTitle: string;
  eventsDescription: string;
  resourcesTitle: string;
  resourcesDescription: string;
  upsells: UpsellRef[];
}

export async function getCommunityPage(): Promise<CommunityPage> {
  // NEW policy (Anna 14 Jul): raw CMS values, page handles all-or-nothing
  // per section. Empty strings/arrays here when Anna hasn't filled a field.
  const empty: CommunityPage = {
    kicker: '',
    title: '',
    intro: '',
    circleTitle: '',
    circleDescription: '',
    circleImage: '',
    resetRoomTitle: '',
    resetRoomDescription: '',
    resetRoomPrice: '',
    resetRoomFeatures: [],
    resetRoomImage: '',
    eventsTitle: '',
    eventsDescription: '',
    resourcesTitle: '',
    resourcesDescription: '',
    upsells: [],
  };

  try {
    const { data: d } = await fetchAPI('/community-page', { populate: '*' });
    if (!d) return empty;
    const upsells = await getUpsellsForSingleton('/community-page');
    return {
      kicker: d.kicker || '',
      title: d.title || '',
      intro: d.intro || '',
      circleTitle: d.circle_title || '',
      circleDescription: d.circle_description || '',
      circleImage: mediaUrl(d.circle_image) || '',
      resetRoomTitle: d.reset_room_title || '',
      resetRoomDescription: d.reset_room_description || '',
      resetRoomPrice: d.reset_room_price || '',
      resetRoomFeatures: Array.isArray(d.reset_room_features)
        ? d.reset_room_features
            .map((f: any) => (typeof f === 'string' ? f : String(f?.text || '')))
            .filter(Boolean)
        : [],
      resetRoomImage: mediaUrl(d.reset_room_image) || '',
      eventsTitle: d.events_title || '',
      eventsDescription: d.events_description || '',
      resourcesTitle: d.resources_title || '',
      resourcesDescription: d.resources_description || '',
      upsells,
    };
  } catch {
    return empty;
  }
}

// ═══ FAQs ═══

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  page: string;
}

export async function getFAQs(filter?: string | { page?: string; category?: string }): Promise<FAQ[]> {
  try {
    const params: Record<string, string> = {
      'sort': 'sort_order:asc',
      'filters[is_active][$eq]': 'true',
    };
    if (typeof filter === 'string' && filter) {
      params['filters[category][$eq]'] = filter;
    } else if (filter && typeof filter === 'object') {
      if (filter.page) params['filters[page][$eq]'] = filter.page;
      if (filter.category) params['filters[category][$eq]'] = filter.category;
    }
    const { data } = await fetchAPI('/faqs', params);
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      question: d.question,
      answer: d.answer,
      category: d.category || 'general',
      page: d.page || 'general',
    }));
  } catch {
    return [];
  }
}

