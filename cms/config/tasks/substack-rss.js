'use strict';

/**
 * Substack RSS auto-pull
 *
 * Fetches Anna's Reset Letters Substack RSS feed and creates/updates articles in Strapi.
 *
 * Map Substack section/category → Strapi article-category by slug. Anna controls
 * categorisation by her Substack section names — see SECTION_MAP below.
 *
 * Free vs paid: Substack truncates paid post bodies in the public RSS to a preview.
 * We detect this by length + presence of "subscribe to" markers, and set is_free=false.
 *
 * Set SUBSTACK_FEED_URL env var to override the default. Disable with SUBSTACK_RSS_ENABLED=false.
 */

const FEED_URL = process.env.SUBSTACK_FEED_URL || 'https://annalouwellness.substack.com/feed';

// Substack section/category title -> Strapi article category slug
// Adjust as Anna names her Substack sections.
const SECTION_MAP = {
  'sunday cosmic forecast': 'cosmic-forecast',
  'cosmic forecast': 'cosmic-forecast',
  'wednesday signal check': 'signal-vs-noise',
  'signal check': 'signal-vs-noise',
  'reset story': 'holding-everything',
  'reset stories': 'holding-everything',
  'contributor feature': 'contributors',
  'contributor features': 'contributors',
};

const DEFAULT_CATEGORY_SLUG = 'holding-everything'; // fallback

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function decodeEntities(s) {
  if (!s) return '';
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<\/(p|div|h[1-6]|li|br)>/gi, '\n\n')
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

function parseRss(xml) {
  // Naive RSS 2.0 parser — Substack's feed is well-formed.
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const fieldRegex = (tag) => new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const cdataExtract = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const body = m[1];
    const get = (tag) => {
      const r = body.match(fieldRegex(tag));
      return r ? cdataExtract(r[1]).trim() : '';
    };
    const titleRaw = get('title');
    const link = get('link');
    const pubDate = get('pubDate');
    const description = get('description');
    const contentEncoded = get('content:encoded') || description;
    const categoryMatches = [...body.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)].map(c => cdataExtract(c[1]).trim());

    if (!titleRaw || !link) continue;
    items.push({
      title: decodeEntities(titleRaw),
      link,
      pubDate,
      description,
      contentEncoded,
      categories: categoryMatches,
    });
  }
  return items;
}

function detectIsFree(item) {
  const body = item.contentEncoded || '';
  const text = stripHtml(body);
  // Substack typically truncates paid post body and includes a subscribe CTA in the preview.
  if (/subscribe to read|paid subscribers only|this post is for paid subscribers/i.test(body)) return false;
  // Very short body (< 400 chars) on a substantial title usually = paywalled preview
  if (text.length < 400 && item.title.length > 20) return false;
  return true;
}

function pickCategorySlug(item) {
  for (const cat of item.categories) {
    const norm = cat.toLowerCase().trim();
    if (SECTION_MAP[norm]) return SECTION_MAP[norm];
  }
  return DEFAULT_CATEGORY_SLUG;
}

function extractHeroImage(html) {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

async function pullSubstackFeed(strapi) {
  if (process.env.SUBSTACK_RSS_ENABLED === 'false') {
    return { created: 0, updated: 0, skipped: 0, disabled: true };
  }
  const stats = { created: 0, updated: 0, skipped: 0 };

  let res;
  try {
    res = await fetch(FEED_URL);
  } catch (err) {
    throw new Error(`Substack fetch failed: ${err.message}`);
  }
  if (!res.ok) throw new Error(`Substack RSS HTTP ${res.status}`);

  const xml = await res.text();
  const items = parseRss(xml);

  // Pre-cache categories
  const categoryEntries = await strapi.entityService.findMany('api::article-category.article-category', {
    filters: {},
    fields: ['id', 'slug', 'colour', 'name', 'section'],
    limit: 200,
  });
  const categoryBySlug = Object.fromEntries(categoryEntries.map(c => [c.slug, c]));

  for (const item of items) {
    const slug = slugify(item.title);
    const isFree = detectIsFree(item);
    const categorySlug = pickCategorySlug(item);
    const category = categoryBySlug[categorySlug];
    if (!category) {
      strapi.log.warn(`Substack pull: missing category ${categorySlug} for "${item.title}"`);
      stats.skipped++;
      continue;
    }

    const body = stripHtml(item.contentEncoded || item.description);
    const excerpt = body.split('\n\n')[0].slice(0, 280);
    const heroImage = extractHeroImage(item.contentEncoded || '');
    const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

    const existing = await strapi.entityService.findMany('api::article.article', {
      filters: { slug },
      limit: 1,
    });

    const data = {
      title: item.title,
      slug,
      excerpt,
      body,
      author: 'Anna Lou',
      reading_time: `${Math.max(1, Math.ceil(body.split(/\s+/).length / 200))} min read`,
      is_featured: false,
      is_free: isFree,
      substack_canonical_url: item.link,
      category: category.id,
      publishedAt,
    };

    try {
      if (existing.length === 0) {
        await strapi.entityService.create('api::article.article', { data });
        stats.created++;
      } else {
        // Only update if body changed (avoid unnecessary writes)
        const cur = existing[0];
        if (cur.body !== data.body || cur.is_free !== data.is_free) {
          await strapi.entityService.update('api::article.article', cur.id, { data });
          stats.updated++;
        } else {
          stats.skipped++;
        }
      }
    } catch (err) {
      strapi.log.error(`Substack pull: error on "${slug}": ${err.message}`);
      stats.skipped++;
    }
  }

  return stats;
}

module.exports = { pullSubstackFeed };
