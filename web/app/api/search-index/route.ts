import { NextResponse } from 'next/server';
import {
  getArticles,
  getExperiences,
  getProducts,
  getPractitioners,
  getMantras,
  getEvents,
  getWorkshopReplays,
  fetchAPI,
} from '@/lib/cms';
import { getAllCustomPageSlugs, getCustomPageBySlug } from '@/lib/custom-page';

/**
 * /api/search-index — flattens every visitor-facing content item across
 * Strapi into a lightweight JSON array the client-side search overlay
 * filters against. Small enough (~30-100 KB gzipped even at full site
 * size) to fetch once and hold in memory; big enough to answer "australia
 * retreat" or "trauma" or "founder reset" from every angle.
 *
 * Output shape (one entry per item):
 *   { id, type, title, description, url, section?, tags? }
 *
 * Types indexed:
 *   article, experience, product, practitioner, mantra, event,
 *   custom-page, generic-page, custom-html-landing, workshop-replay,
 *   static-page (a manual list of important non-CMS routes)
 *
 * Types NOT indexed (by design):
 *   Vault Journeys (members-only), draft/unpublished entries,
 *   session-gated pages (cart, checkout, account, wishlist).
 *
 * ISR: 1 hr revalidation. Content-type lifecycle hooks call
 * notifyRevalidate(['/api/search-index']) when new entries publish
 * (still TODO — for now the 1 hr TTL is fine for a site that publishes
 * ~1x/week).
 */

export const revalidate = 3600;

interface SearchItem {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  section?: string;
  tags?: string;
}

// Static non-CMS routes worth surfacing in search. Kept manually so
// section landing pages, About, Contact, community hubs remain findable
// even before Anna has filled their SEO fields.
const STATIC_ROUTES: SearchItem[] = [
  { id: 'static-home', type: 'static-page', title: 'Home', description: 'Anna Lou Wellness — a holistic wellness community.', url: '/' },
  { id: 'static-about', type: 'static-page', title: 'About Anna', description: 'Anna Lou Scaife — coach, trainer, podcaster, jewellery designer. 25 years in wellness and emotional healing.', url: '/about' },
  { id: 'static-about-press', type: 'static-page', title: 'Press & Media', description: 'Press mentions, interviews, and media appearances.', url: '/about/press' },
  { id: 'static-about-partnerships', type: 'static-page', title: 'Partnerships', description: 'Brand collaborations and partnership enquiries.', url: '/about/partnerships' },
  { id: 'static-contact', type: 'static-page', title: 'Contact Anna', description: 'Get in touch with Anna Lou.', url: '/contact' },

  { id: 'static-experiences', type: 'static-page', title: 'Experiences', description: 'All retreats, workshops, corporate wellbeing, and speaking with Anna.', url: '/experiences' },
  { id: 'static-experiences-retreats', type: 'static-page', title: 'Retreats', description: 'Immersive healing retreats with Anna Lou. Waterfront, transformational.', url: '/experiences/retreats' },
  { id: 'static-experiences-workshops', type: 'static-page', title: 'Workshops', description: 'Group workshops on nervous system, trauma, and the Signal Method.', url: '/experiences/workshops' },
  { id: 'static-experiences-speaking', type: 'static-page', title: 'Speaking', description: 'Book Anna Lou to speak at your event or podcast.', url: '/experiences/speaking' },
  { id: 'static-experiences-corporate', type: 'static-page', title: 'Corporate Wellbeing', description: 'Bespoke workplace wellbeing programmes. Half-days, full-days, ongoing programmes.', url: '/experiences/corporate-wellbeing' },

  { id: 'static-work', type: 'static-page', title: 'Work with Anna', description: '1:1 coaching, programmes, and immersive resets with Anna Lou.', url: '/the-work' },
  { id: 'static-work-founder-reset', type: 'static-page', title: 'Founder Reset', description: 'For founders running on empty. A signature reset programme.', url: '/the-work/sessions/founder-reset' },
  { id: 'static-work-dating-reset', type: 'static-page', title: 'Dating Reset', description: 'For women stuck in dating patterns. Somatic + strategic.', url: '/the-work/sessions/dating-reset' },
  { id: 'static-work-nervous-system-reset', type: 'static-page', title: 'Nervous System Reset', description: 'Trauma-informed nervous system regulation session.', url: '/the-work/sessions/nervous-system-reset' },
  { id: 'static-work-signal', type: 'static-page', title: 'Signal — 12 weeks', description: 'Twelve-week signature programme. The Signal Method.', url: '/the-work/signal' },
  { id: 'static-work-signal-and-build', type: 'static-page', title: 'Signal & Build — Founders', description: 'For founders. Twelve weeks. The inner work and the business, held together.', url: '/the-work/signal-and-build' },
  { id: 'static-work-signal-collective', type: 'static-page', title: 'Signal Collective', description: 'Group programme.', url: '/the-work/signal-collective' },
  { id: 'static-work-the-reset', type: 'static-page', title: 'The Reset — 6 weeks', description: 'Six-week reset programme.', url: '/the-work/the-reset' },
  { id: 'static-work-one-day', type: 'static-page', title: 'One-Day Intensive', description: 'One-day intensive with Anna Lou.', url: '/the-work/one-day' },
  { id: 'static-work-recovery', type: 'static-page', title: 'Recovery', description: 'For women recovering from narcissistic and domestic abuse.', url: '/the-work/recovery' },
  { id: 'static-work-sessions', type: 'static-page', title: 'All Sessions', description: 'Every 1:1 session Anna offers.', url: '/the-work/sessions' },
  { id: 'static-work-client-stories', type: 'static-page', title: 'Client Stories', description: 'What clients say about working with Anna.', url: '/the-work/client-stories' },
  { id: 'static-work-ways', type: 'static-page', title: 'Ways to Work With Me', description: 'Every path to working with Anna.', url: '/the-work/ways-to-work-with-me' },
  { id: 'static-work-quiz', type: 'static-page', title: 'Nervous System Quiz', description: 'Find the right work for where you are.', url: '/the-work/quiz' },

  { id: 'static-shop', type: 'static-page', title: 'Shop', description: 'Jewellery, crystals, and tools from Anna Lou of London.', url: '/shop' },
  { id: 'static-shop-new-in', type: 'static-page', title: 'New In — Shop', description: 'Latest arrivals in the shop.', url: '/shop/new-in' },
  { id: 'static-shop-personalised', type: 'static-page', title: 'Personalised Jewellery', description: 'Personalised jewellery with names and words.', url: '/shop/personalised' },
  { id: 'static-shop-esj', type: 'static-page', title: 'Emotional Support Jewellery', description: 'Jewellery designed as emotional support pieces.', url: '/shop/emotional-support-jewellery' },

  { id: 'static-community', type: 'static-page', title: 'Community', description: 'The Reset Room, Returning Circle, events, resources.', url: '/community' },
  { id: 'static-community-reset-room', type: 'static-page', title: 'The Reset Room', description: 'Monthly membership. Ongoing access to the work.', url: '/community/reset-room' },
  { id: 'static-community-membership', type: 'static-page', title: 'Reset Room Membership', description: 'Join the Reset Room membership.', url: '/community/membership' },
  { id: 'static-community-returning-circle', type: 'static-page', title: 'The Returning Circle', description: 'Twice-monthly live circle for members.', url: '/community/the-returning-circle' },
  { id: 'static-community-events', type: 'static-page', title: 'Events', description: 'Upcoming community events and workshops.', url: '/community/events' },
  { id: 'static-community-resources', type: 'static-page', title: 'Resource Library', description: 'Guides, replays, and member content.', url: '/community/resources' },

  { id: 'static-stories', type: 'static-page', title: 'Reset Stories', description: 'Honest stories about coming back to yourself.', url: '/reset-stories' },
  { id: 'static-life', type: 'static-page', title: 'Life', description: 'Motherhood, friendship, life stories.', url: '/life' },
  { id: 'static-love', type: 'static-page', title: 'Love & Relationships', description: 'Dating, breakups, motherhood, love.', url: '/love-and-relationships' },
  { id: 'static-work-money', type: 'static-page', title: 'Work & Money', description: 'Founder reset, burnout, career, money.', url: '/work-and-money' },

  { id: 'static-reset-letters', type: 'static-page', title: 'Reset Letters', description: 'Weekly magazine. For women who have been holding everything.', url: '/reset-letters' },
  { id: 'static-testimonials', type: 'static-page', title: 'Testimonials', description: 'What clients and readers say.', url: '/testimonials' },
  { id: 'static-cosmic-forecast', type: 'static-page', title: 'Cosmic Forecast', description: 'Monthly cosmic forecast from Anna.', url: '/cosmic-forecast' },
  { id: 'static-practitioners', type: 'static-page', title: 'Practitioners', description: 'Recommended practitioners and healers.', url: '/practitioners' },
  { id: 'static-ask-anna', type: 'static-page', title: 'Ask Anna', description: 'Ask Anna anything — AI assistant trained on her voice.', url: '/ask-anna' },
  { id: 'static-decoder', type: 'static-page', title: 'Nervous System Decoder', description: 'Free quiz to find your nervous system pattern.', url: '/free/nervous-system-decoder' },
];

function truncate(s: string | null | undefined, len = 200): string {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > len ? t.slice(0, len - 1) + '…' : t;
}

async function safe<T>(fn: () => Promise<T[]>, label: string): Promise<T[]> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[search-index] ${label} failed:`, (err as Error)?.message);
    return [];
  }
}

export async function GET() {
  const items: SearchItem[] = [...STATIC_ROUTES];

  // === Articles (across every section) ===
  const articles = await safe(() => getArticles(), 'articles');
  for (const a of articles) {
    if (!a?.slug) continue;
    const sectionSlug = a.category?.section || 'reset-stories';
    const sectionLabel = a.category?.name || 'Article';
    items.push({
      id: `article-${a.slug}`,
      type: 'article',
      title: a.title,
      description: truncate(a.excerpt || a.seoDescription),
      url: `/${sectionSlug}/${a.slug}`,
      section: sectionLabel,
    });
  }

  // === Experiences (retreats, workshops, corporate, speaking) ===
  const experiences = await safe(() => getExperiences(), 'experiences');
  for (const e of experiences) {
    if (!e?.slug) continue;
    items.push({
      id: `experience-${e.slug}`,
      type: 'experience',
      title: e.name,
      description: truncate(e.description || e.seoDescription),
      url: `/experiences/${e.slug}`,
      section: e.type || 'Experience',
    });
  }

  // === Products (shop) ===
  const products = await safe(() => getProducts(), 'products');
  for (const p of products) {
    if (!p?.slug || p.isActive === false) continue;
    items.push({
      id: `product-${p.slug}`,
      type: 'product',
      title: p.name,
      description: truncate(p.shortDescription || p.description || p.seoDescription),
      url: `/shop/${p.slug}`,
      section: p.category || 'Shop',
    });
  }

  // === Practitioners ===
  const practitioners = await safe(() => getPractitioners(), 'practitioners');
  for (const pr of practitioners) {
    if (!pr?.name) continue;
    items.push({
      id: `practitioner-${pr.id}`,
      type: 'practitioner',
      title: pr.name,
      description: truncate([pr.role, pr.bio, pr.location].filter(Boolean).join(' — ')),
      url: `/practitioners#p-${pr.id}`,
      section: 'Practitioners',
    });
  }

  // === Mantras ===
  const mantras = await safe(() => getMantras(), 'mantras');
  for (const m of mantras) {
    if (!m?.title) continue;
    items.push({
      id: `mantra-${m.id}`,
      type: 'mantra',
      title: m.title,
      description: truncate(m.description),
      url: `/mantras`,
      section: 'Mantras',
    });
  }

  // === Community Events ===
  const events = await safe(() => getEvents(), 'events');
  events.forEach((ev, idx) => {
    if (!ev?.title) return;
    items.push({
      id: `event-${idx}-${ev.title.slice(0, 20).replace(/\s+/g, '-')}`,
      type: 'event',
      title: ev.title,
      description: truncate([ev.date, ev.description].filter(Boolean).join(' — ')),
      url: `/community/events`,
      section: 'Events',
    });
  });

  // === Workshop replays (public listing, not gated content) ===
  const replays = await safe(() => getWorkshopReplays(), 'workshop-replays');
  for (const r of replays) {
    if (!r?.slug) continue;
    items.push({
      id: `replay-${r.slug}`,
      type: 'workshop-replay',
      title: r.title,
      description: truncate(r.description),
      url: `/community/resources#${r.slug}`,
      section: 'Workshops',
    });
  }

  // === Custom pages (Anna's page-builder collection) ===
  const customPageSlugs = await safe(() => getAllCustomPageSlugs(), 'custom-page-slugs');
  const customPages = await Promise.all(
    customPageSlugs.map((s) => getCustomPageBySlug(s).catch(() => null))
  );
  for (const p of customPages) {
    if (!p?.slug) continue;
    items.push({
      id: `custom-page-${p.slug}`,
      type: 'custom-page',
      title: p.title,
      description: truncate(p.summary || p.seo_description),
      url: `/p/${p.slug}`,
      section: 'Pages',
    });
  }

  // === Custom HTML Landings (campaigns) ===
  const landings = await safe(async () => {
    const { data } = await fetchAPI('/custom-html-landings', {
      'fields[0]': 'title',
      'fields[1]': 'slug',
      'fields[2]': 'seo_description',
      'pagination[pageSize]': 100,
    });
    return Array.isArray(data) ? data : [];
  }, 'custom-html-landings');
  for (const l of landings) {
    const slug = (l as { slug?: string }).slug;
    if (!slug) continue;
    // Reserved slugs render on their own routes, not /campaigns/*
    const isReserved = slug === 'reset-letters' || experiences.some((e) => e.slug === slug);
    const url = isReserved
      ? slug === 'reset-letters'
        ? '/reset-letters'
        : `/experiences/${slug}`
      : `/campaigns/${slug}`;
    items.push({
      id: `landing-${slug}`,
      type: 'custom-html-landing',
      title: (l as { title?: string }).title || slug,
      description: truncate((l as { seo_description?: string }).seo_description),
      url,
      section: 'Campaign',
    });
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    count: items.length,
    items,
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
