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
export async function getNavigation(): Promise<NavItem[]> {
  try {
    const { data: d } = await fetchAPI('/navigation', { populate: { items: { populate: 'children' } } });
    const items = (d as { items?: unknown[] } | null)?.items;
    if (!Array.isArray(items) || items.length === 0) return fallbackNavigation;
    return items.map((raw) => {
      const item = raw as { label?: string; href?: string; colour?: string; children?: unknown[] };
      const children = Array.isArray(item.children)
        ? item.children.map((c) => {
            const child = c as { label?: string; href?: string };
            return { label: String(child.label || ''), href: String(child.href || '#') };
          })
        : undefined;
      return {
        label: String(item.label || ''),
        href: String(item.href || '#'),
        colour: item.colour || undefined,
        children,
      };
    });
  } catch {
    return fallbackNavigation;
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
      heroImage: mediaUrl(d.hero_image),
      isActive: d.is_active !== false,
      sortOrder: d.sort_order || 0,
    }));
  } catch {
    return [];
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
      features: Array.isArray(d.features) ? d.features : [],
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
  pressLogos: { name: string; style?: string }[];
  certifications: { name: string; colour: string }[];
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
      pressLogos: Array.isArray(d.press_logos) ? d.press_logos : fallback.pressLogos,
      certifications: Array.isArray(d.certifications) ? d.certifications : fallback.certifications,
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
      resetRoomFeatures: Array.isArray(d.reset_room_features) ? d.reset_room_features : fallback.resetRoomFeatures,
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

