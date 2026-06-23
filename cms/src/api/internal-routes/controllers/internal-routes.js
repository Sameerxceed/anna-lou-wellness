'use strict';

/**
 * Site URLs aggregator.
 *
 * Returns a grouped list of every URL on the public site:
 *   - Static routes (about, contact, shop, reset-letters, etc.)
 *   - Programme entries -> /the-work/{slug}
 *   - Experience entries -> /experiences/{slug}
 *   - Coaching Session entries -> /the-work/sessions
 *   - Page Builder entries -> /p/{slug}
 *   - Practitioner entries -> /practitioners (plus their external URLs)
 *   - Article entries grouped by category section
 *
 * Each URL has: { url, label, kind }.
 * Each group has: { title, blurb, items }.
 */

// Static routes the site exposes that don't come from a content type.
// Update this list when adding new static pages.
const STATIC_GROUPS = [
  {
    title: 'Top-level pages',
    blurb: 'Always-on routes that the nav points to.',
    items: [
      { url: '/', label: 'Homepage', kind: 'static' },
      { url: '/about', label: 'About Anna', kind: 'static' },
      { url: '/practitioners', label: 'Practitioners', kind: 'static' },
      { url: '/contact', label: 'Contact', kind: 'static' },
      { url: '/testimonials', label: 'Testimonials', kind: 'static' },
      { url: '/press', label: 'Press', kind: 'static' },
      { url: '/anna-story', label: "Anna's story", kind: 'static' },
    ],
  },
  {
    title: 'Work with Anna',
    blurb: 'The Work suite + free Decoder funnel.',
    items: [
      { url: '/the-work', label: 'Work with Anna landing', kind: 'static' },
      { url: '/the-work/sessions', label: 'Reset Sessions (90-min)', kind: 'static' },
      { url: '/the-work/recovery', label: 'Recovery Coaching', kind: 'static' },
      { url: '/the-work/regulated', label: 'REGULATED course', kind: 'static' },
      { url: '/the-work/regulated/access', label: 'REGULATED course access (gated)', kind: 'static' },
      { url: '/the-work/one-day', label: 'One Day Intensive enquiry', kind: 'static' },
      { url: '/the-work/signal-collective', label: 'Signal Collective enquiry', kind: 'static' },
      { url: '/the-work/signal', label: 'Signal programme', kind: 'static' },
      { url: '/the-work/signal-and-build', label: 'Signal & Build (Founders)', kind: 'static' },
      { url: '/the-work/the-reset', label: 'The Reset programme', kind: 'static' },
      { url: '/free/nervous-system-decoder', label: 'Decoder (landing)', kind: 'static' },
      { url: '/free/nervous-system-decoder/quiz', label: 'Decoder quiz', kind: 'static' },
    ],
  },
  {
    title: 'Experiences',
    blurb: 'Editorial sub-pages under Experiences.',
    items: [
      { url: '/experiences', label: 'Experiences landing', kind: 'static' },
      { url: '/experiences/retreats', label: 'Retreats', kind: 'static' },
      { url: '/experiences/workshops', label: 'Workshops', kind: 'static' },
      { url: '/experiences/corporate-wellbeing', label: 'Corporate Wellbeing', kind: 'static' },
      { url: '/experiences/speaking', label: 'Speaking', kind: 'static' },
    ],
  },
  {
    title: 'Community',
    blurb: 'Reset Letters, Reset Room, Returning Circle.',
    items: [
      { url: '/reset-letters', label: 'Reset Letters signup', kind: 'static' },
      { url: '/community/reset-room', label: 'Reset Room (membership)', kind: 'static' },
      { url: '/community/reset-room/dashboard', label: 'Reset Room member dashboard (gated)', kind: 'static' },
      { url: '/community/the-returning-circle', label: 'The Returning Circle', kind: 'static' },
      { url: '/ask-anna', label: 'Ask Anna AI', kind: 'static' },
      { url: '/mantras', label: 'Mantras', kind: 'static' },
      { url: '/cosmic-forecast', label: 'Cosmic Forecast', kind: 'static' },
    ],
  },
  {
    title: 'Editorial sections',
    blurb: 'Top-level category landing pages. Individual article URLs are listed in the Articles group below.',
    items: [
      { url: '/reset-stories', label: 'Reset Stories', kind: 'static' },
      { url: '/life', label: 'Life', kind: 'static' },
      { url: '/love-and-relationships', label: 'Love & Relationships', kind: 'static' },
      { url: '/work-and-money', label: 'Work & Money', kind: 'static' },
    ],
  },
  {
    title: 'Shop + account',
    blurb: 'Storefront, cart, checkout, customer account.',
    items: [
      { url: '/shop', label: 'Shop landing', kind: 'static' },
      { url: '/cart', label: 'Cart', kind: 'static' },
      { url: '/checkout', label: 'Checkout', kind: 'static' },
      { url: '/wishlist', label: 'Wishlist', kind: 'static' },
      { url: '/login', label: 'Login', kind: 'static' },
      { url: '/account', label: 'Account (orders + access)', kind: 'static' },
    ],
  },
];

async function findAll(uid, fields, filters) {
  try {
    return await strapi.documents(uid).findMany({
      filters: filters || {},
      fields: fields || ['id'],
      pagination: { pageSize: 500 },
      status: 'published',
    });
  } catch {
    return [];
  }
}

// Verify the request carries a valid Strapi admin JWT. Checks the
// Authorization: Bearer header and several known cookie names. Same
// helper as cms/src/api/manual-help/controllers/manual-help.js — kept
// inline (not shared) because there are only two callers and a shared
// utils module would add indirection for negligible gain.
async function verifyAdminJwt(ctx) {
  const auth = ctx.request.header.authorization || '';
  const headerToken = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';

  const COOKIE_NAMES = ['jwtToken', 'strapi_jwt', 'strapi-jwt'];
  let cookieToken = '';
  for (const name of COOKIE_NAMES) {
    const val = ctx.cookies?.get(name);
    if (val) { cookieToken = val; break; }
  }

  const token = headerToken || cookieToken;
  if (!token) return null;

  // Direct jsonwebtoken verify — strapi.service('admin::token') returns
  // null in this v5 build. Uses admin.auth.secret (the same secret Strapi
  // itself signs admin sessions with).
  try {
    const jwt = require('jsonwebtoken');
    const secret = strapi.config.get('admin.auth.secret');
    if (!secret) {
      strapi.log.warn('[internal-routes] admin.auth.secret not configured');
      return null;
    }
    const payload = jwt.verify(token, secret);
    if (payload && (payload.id || payload.userId)) return payload;
    return null;
  } catch (err) {
    strapi.log.warn(`[internal-routes] JWT verify failed: ${err.message}`);
    return null;
  }
}

module.exports = {
  async list(ctx) {
    const admin = await verifyAdminJwt(ctx);
    if (!admin) {
      ctx.status = 401;
      ctx.body = { error: 'Admin login required. Please log out and back in.' };
      return;
    }
    const groups = STATIC_GROUPS.map((g) => ({ ...g }));

    // Programmes -> /the-work/{slug}
    const programmes = await findAll('api::programme.programme', ['slug', 'title']);
    if (programmes.length) {
      groups.push({
        title: 'Programme entries (CMS)',
        blurb: 'One per published Programme in the CMS. URL is /the-work/{slug}.',
        items: programmes
          .filter((p) => p.slug)
          .map((p) => ({ url: `/the-work/${p.slug}`, label: p.title || p.slug, kind: 'programme' })),
      });
    }

    // Experiences -> /experiences/{slug}
    const experiences = await findAll('api::experience.experience', ['slug', 'name', 'title']);
    if (experiences.length) {
      groups.push({
        title: 'Experience entries (CMS)',
        blurb: 'One per published Experience in the CMS. URL is /experiences/{slug}.',
        items: experiences
          .filter((e) => e.slug)
          .map((e) => ({ url: `/experiences/${e.slug}`, label: e.name || e.title || e.slug, kind: 'experience' })),
      });
    }

    // Page Builder -> /p/{slug}
    const pages = await findAll('api::page.page', ['slug', 'title']);
    if (pages.length) {
      groups.push({
        title: 'Page Builder entries (CMS)',
        blurb: 'Custom pages you built with the Page Builder. URL is /p/{slug}.',
        items: pages
          .filter((p) => p.slug)
          .map((p) => ({ url: `/p/${p.slug}`, label: p.title || p.slug, kind: 'page' })),
      });
    }

    // Practitioners — single page lists all, but include website URLs as a courtesy
    const practitioners = await findAll('api::practitioner.practitioner', ['name', 'website_url']);
    if (practitioners.length) {
      const items = practitioners
        .filter((p) => p.website_url)
        .map((p) => ({ url: p.website_url, label: `${p.name} (external)`, kind: 'practitioner-external' }));
      if (items.length) {
        groups.push({
          title: 'Practitioner external sites',
          blurb: 'Each practitioner card on /practitioners links out to their own site.',
          items,
        });
      }
    }

    // Articles, grouped by category
    const articles = await findAll('api::article.article', ['slug', 'title', 'category']);
    const categoryItems = {};
    for (const a of articles) {
      if (!a.slug) continue;
      let categorySlug = 'uncategorised';
      let categoryName = 'Uncategorised';
      if (a.category && typeof a.category === 'object') {
        categorySlug = a.category.slug || categorySlug;
        categoryName = a.category.name || categorySlug;
      }
      // Map category slug -> URL prefix
      const prefix = categorySlugToPrefix(categorySlug);
      const url = `${prefix}/${a.slug}`;
      if (!categoryItems[categoryName]) categoryItems[categoryName] = [];
      categoryItems[categoryName].push({ url, label: a.title || a.slug, kind: 'article' });
    }
    for (const catName of Object.keys(categoryItems).sort()) {
      groups.push({
        title: `Articles - ${catName}`,
        blurb: `Published articles in the ${catName} category.`,
        items: categoryItems[catName].sort((x, y) => x.label.localeCompare(y.label)),
      });
    }

    ctx.body = { ok: true, generatedAt: new Date().toISOString(), groups };
  },
};

// Map article category slug to the URL prefix used on the public site.
// Aligned with web/app/<section>/[slug]/page.tsx routes.
function categorySlugToPrefix(slug) {
  const map = {
    'reset-stories': '/reset-stories',
    'holding-everything': '/reset-stories',
    'life': '/life',
    'love-and-relationships': '/love-and-relationships',
    'work-and-money': '/work-and-money',
    'cosmic-forecast': '/cosmic-forecast',
    'signal-vs-noise': '/work-and-money',
    'contributors': '/reset-stories',
  };
  return map[slug] || '/reset-stories';
}
