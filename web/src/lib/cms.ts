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
    return (d as HomepageData) || null;
  } catch {
    return null;
  }
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
export async function getContactInfo(): Promise<SiteSettings> {
  try {
    const { data: d } = await fetchAPI('/contact-page', { populate: '*' });
    if (!d) return fallbackSiteSettings;
    return {
      ...fallbackSiteSettings,
      email: d.email || fallbackSiteSettings.email,
      phone: d.phone || fallbackSiteSettings.phone,
      address: d.address || fallbackSiteSettings.address,
      mapLatitude: d.map_latitude ?? fallbackSiteSettings.mapLatitude,
      mapLongitude: d.map_longitude ?? fallbackSiteSettings.mapLongitude,
    };
  } catch {
    return fallbackSiteSettings;
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
      email: d.notification_email || fallbackSiteSettings.email,
      cookieBannerText: d.cookie_banner_text || fallbackSiteSettings.cookieBannerText,
      footerCopyright: d.footer_copyright || fallbackSiteSettings.footerCopyright,
      maintenanceMode: d.maintenance_mode ?? false,
    };
  } catch {
    return fallbackSiteSettings;
  }
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
    const [navRes, categoriesBySection] = await Promise.all([
      fetchAPI('/navigation', { 'populate[items][populate]': '*' }),
      fetchCategoriesBySection(),
    ]);
    const items = (navRes?.data as { items?: unknown[] } | null)?.items;
    if (!Array.isArray(items) || items.length === 0) return fallbackNavigation;

    return items.map((raw) => {
      const item = raw as { label?: string; href?: string; colour?: string; children?: unknown[] };
      const href = String(item.href || '#');

      // Editorial sections: auto-derive children from Article Categories so
      // Anna has a single source of truth.
      let children: { label: string; href: string }[] | undefined;
      if (EDITORIAL_SECTION_BY_HREF[href]) {
        const fromCategories = categoriesBySection[href];
        if (fromCategories && fromCategories.length > 0) {
          children = [{ label: 'All', href }, ...fromCategories];
        }
      }

      // Fall back to the Navigation singletype's stored children if not
      // editorial (or if no categories yet for this section).
      if (!children) {
        children = Array.isArray(item.children)
          ? item.children.map((c) => {
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
}

export async function getSectionLandingPage(
  endpoint: string,
  fallback: SectionLandingPage,
): Promise<SectionLandingPage> {
  try {
    const { data: d } = await fetchAPI(endpoint, { populate: '*' });
    if (!d) return fallback;
    return {
      kicker: (d as any).kicker || fallback.kicker,
      title: (d as any).title || fallback.title,
      intro: (d as any).intro || fallback.intro,
      heroImage: mediaUrl((d as any).hero_image, 'large') || fallback.heroImage,
      kickerColour: (d as any).kicker_colour || fallback.kickerColour,
    };
  } catch {
    return fallback;
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
  const fallback: FooterData = {
    closingMessage: "You don't have to hold everything.",
    exploreLinks: fallbackFooterLinks.explore,
    connectLinks: fallbackFooterLinks.connect,
    legalLinks: [
      { label: 'Press', href: '/about/press' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
    substackCtaLabel: 'Join Reset Letters on Substack →',
    substackCtaUrl: 'https://annalouwellness.substack.com',
  };
  try {
    const { data: d } = await fetchAPI('/footer', { 'populate[explore_links]': '*', 'populate[connect_links]': '*', 'populate[legal_links]': '*' } as any);
    if (!d) return fallback;
    const mapLinks = (arr: any): { label: string; href: string }[] =>
      Array.isArray(arr) && arr.length > 0
        ? arr.map((l: any) => ({ label: String(l?.label || ''), href: String(l?.href || '#') }))
        : [];
    const explore = mapLinks((d as any).explore_links);
    const connect = mapLinks((d as any).connect_links);
    const legal = mapLinks((d as any).legal_links);
    return {
      closingMessage: (d as any).closing_message || fallback.closingMessage,
      exploreLinks: explore.length ? explore : fallback.exploreLinks,
      connectLinks: connect.length ? connect : fallback.connectLinks,
      legalLinks: legal.length ? legal : fallback.legalLinks,
      substackCtaLabel: (d as any).substack_cta_label || fallback.substackCtaLabel,
      substackCtaUrl: (d as any).substack_cta_url || fallback.substackCtaUrl,
    };
  } catch {
    return fallback;
  }
}

// ═══ ARTICLES ═══

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  heroImage: string;
  category: { name: string; slug: string; section: string; colour: string } | null;
  author: string;
  readingTime: string;
  isFeatured: boolean;
  isFree: boolean;
  substackUrl: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
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
    body: d.body || '',
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
    isFree: d.is_free !== false,
    substackUrl: d.substack_canonical_url || '',
    seoTitle: d.seo_title || '',
    seoDescription: d.seo_description || '',
    publishedAt: d.publishedAt || '',
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
      params['filters[category][section][$eq]'] = section;
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

/** Get a single article by slug */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data } = await fetchAPI('/articles', {
      'populate': '*',
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
      'filters[category][slug][$eq]': categorySlug,
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
    }));
  } catch {
    return [];
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
}

export async function getAboutPage(): Promise<AboutPage> {
  const fallback: AboutPage = {
    kicker: 'About',
    title: 'Twenty-five years leaves a trail.',
    rolesTagline: 'Coach. Trainer. Podcaster. Author. Entrepreneur. Designer.',
    storyParagraph1: '',
    storyParagraph2: '',
    additionalBio: '',
    portrait: '',
    pressLogos: [],
    certifications: [],
  };

  try {
    const { data: d } = await fetchAPI('/about-page', { populate: '*' });
    if (!d) return fallback;
    return {
      kicker: d.kicker || fallback.kicker,
      title: d.title || fallback.title,
      rolesTagline: d.roles_tagline || fallback.rolesTagline,
      storyParagraph1: d.story_paragraph_1 || fallback.storyParagraph1,
      storyParagraph2: d.story_paragraph_2 || fallback.storyParagraph2,
      additionalBio: d.additional_bio || fallback.additionalBio,
      portrait: mediaUrl(d.portrait) || fallback.portrait,
      pressLogos: Array.isArray(d.press_logos)
        ? d.press_logos.map((p: any) => ({ name: String(p?.name || ''), logo: mediaUrl(p?.logo) || undefined }))
        : fallback.pressLogos,
      certifications: Array.isArray(d.certifications)
        ? d.certifications.map((c: any) => ({
            name: String(c?.name || ''),
            colour: String(c?.colour || '#6E3A5A'),
            badge: mediaUrl(c?.badge) || undefined,
          }))
        : fallback.certifications,
    };
  } catch {
    return fallback;
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
}

export async function getCommunityPage(): Promise<CommunityPage> {
  const fallback: CommunityPage = {
    kicker: 'Community',
    title: 'Come and sit with us.',
    intro: '',
    circleTitle: 'The Returning Circle',
    circleDescription: '',
    circleImage: '',
    resetRoomTitle: 'The Reset Room',
    resetRoomDescription: '',
    resetRoomPrice: '£25 per month',
    resetRoomFeatures: [],
    resetRoomImage: '',
    eventsTitle: 'Events Calendar',
    eventsDescription: '',
    resourcesTitle: 'Resource Library',
    resourcesDescription: '',
  };

  try {
    const { data: d } = await fetchAPI('/community-page', { populate: '*' });
    if (!d) return fallback;
    return {
      kicker: d.kicker || fallback.kicker,
      title: d.title || fallback.title,
      intro: d.intro || fallback.intro,
      circleTitle: d.circle_title || fallback.circleTitle,
      circleDescription: d.circle_description || fallback.circleDescription,
      circleImage: mediaUrl(d.circle_image) || fallback.circleImage,
      resetRoomTitle: d.reset_room_title || fallback.resetRoomTitle,
      resetRoomDescription: d.reset_room_description || fallback.resetRoomDescription,
      resetRoomPrice: d.reset_room_price || fallback.resetRoomPrice,
      resetRoomFeatures: Array.isArray(d.reset_room_features)
        ? d.reset_room_features
            .map((f: any) => (typeof f === 'string' ? f : String(f?.text || '')))
            .filter(Boolean)
        : fallback.resetRoomFeatures,
      resetRoomImage: mediaUrl(d.reset_room_image) || fallback.resetRoomImage,
      eventsTitle: d.events_title || fallback.eventsTitle,
      eventsDescription: d.events_description || fallback.eventsDescription,
      resourcesTitle: d.resources_title || fallback.resourcesTitle,
      resourcesDescription: d.resources_description || fallback.resourcesDescription,
    };
  } catch {
    return fallback;
  }
}

// ═══ FAQs ═══

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export async function getFAQs(category?: string): Promise<FAQ[]> {
  try {
    const params: Record<string, string> = {
      'sort': 'sort_order:asc',
      'filters[is_active][$eq]': 'true',
    };
    if (category) {
      params['filters[category][$eq]'] = category;
    }
    const { data } = await fetchAPI('/faqs', params);
    if (!data?.length) return [];
    return data.map((d: any) => ({
      id: d.id,
      question: d.question,
      answer: d.answer,
      category: d.category || 'general',
    }));
  } catch {
    return [];
  }
}

