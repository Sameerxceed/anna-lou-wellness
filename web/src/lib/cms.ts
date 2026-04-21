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
export async function getHomepage() {
  const fallback = {
    hero: {
      title: 'Beautifully Whole',
      subtitle: 'Anna Lou Wellness',
      tagline: 'Coaching, healing, and transformation for women ready\nto step into a more aligned version of themselves.',
      posterImage: '',
      ctaPrimary: { text: 'Work With Me', href: '/coaching' },
      ctaSecondary: { text: 'Shop', href: '/shop' },
    },
    intro: {
      label: 'Reset Stories',
      heading: 'Come back\nto yourself',
      body: 'Anna Lou Wellness is a platform for women ready to step into a more aligned, elevated version of themselves.',
      quote: 'Your reset starts here.\nBeautifully Whole.',
      image: '',
    },
  };

  try {
    const { data: d } = await fetchAPI('/homepage', { populate: '*' });
    if (!d) return fallback;
    return {
      hero: {
        title: d.hero_title || fallback.hero.title,
        subtitle: d.hero_subtitle || fallback.hero.subtitle,
        tagline: d.hero_tagline || fallback.hero.tagline,
        posterImage: mediaUrl(d.hero_poster) || fallback.hero.posterImage,
        videoSrc: d.hero_video ? mediaUrl(d.hero_video) : undefined,
        ctaPrimary: {
          text: d.cta_primary_text || fallback.hero.ctaPrimary.text,
          href: d.cta_primary_link || fallback.hero.ctaPrimary.href,
        },
        ctaSecondary: {
          text: d.cta_secondary_text || fallback.hero.ctaSecondary.text,
          href: d.cta_secondary_link || fallback.hero.ctaSecondary.href,
        },
      },
      intro: {
        label: d.intro_label || fallback.intro.label,
        heading: d.intro_heading || fallback.intro.heading,
        body: d.intro_body || fallback.intro.body,
        quote: d.intro_quote || fallback.intro.quote,
        image: mediaUrl(d.intro_image) || fallback.intro.image,
      },
    };
  } catch {
    return fallback;
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

// Navigation & footer links (static — rarely CMS-driven)
export const getNavigation = (): NavItem[] => fallbackNavigation;
export const getFooterLinks = (): FooterLinks => fallbackFooterLinks;

// ═══ Helpers ═══

function parseList(text: string): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}
