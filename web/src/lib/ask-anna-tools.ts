/**
 * AskAnna tools — Claude calls these to fetch live data from Strapi.
 *
 * Without tools, AskAnna can only answer from its system prompt (programmes
 * + voice). With tools, it can answer questions like:
 *   - "Do you have a retreat in June?"
 *   - "Tell me about your latest article on burnout"
 *   - "What jewellery do you have under £100?"
 *
 * Each tool has:
 *   1. A definition (name, description, input_schema) sent to Claude with
 *      the request. Claude decides when to call based on the description.
 *   2. A handler that runs server-side, hits Strapi, returns JSON. The
 *      result goes back to Claude which composes the final reply.
 *
 * Add a new tool:
 *   1. Append the definition to TOOL_DEFINITIONS
 *   2. Add a case in executeTool() that returns the JSON shape
 *   3. Mention the tool's purpose in ask-anna-prompt.ts so Claude knows
 *      when to reach for it
 */

import { getExperiences, getArticles, getProducts, type Experience, type Product, type Article } from '@/lib/cms';

const SITE_URL = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.annalouwellness.com';

// ── Public tool definitions (sent to Claude in `tools` param) ────────

export const TOOL_DEFINITIONS = [
  {
    name: 'search_experiences',
    description:
      "Search Anna's upcoming retreats, workshops, corporate-wellbeing events, and speaking engagements. Use whenever the visitor asks about specific dates, upcoming events, retreats, workshops, what's coming up, or availability in a particular month. Returns each experience with its date, location, price, and absolute URL — quote the URL in your reply so the visitor can click through.",
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['retreat', 'workshop', 'corporate', 'speaking'],
          description: 'Optional filter by experience type. Leave blank to search all types.',
        },
        month: {
          type: 'string',
          description: 'Optional month filter. Lower-case month name like "june" or "july". Filters to experiences scheduled in that month (any year).',
        },
      },
    },
  },
  {
    name: 'search_articles',
    description:
      "Search Anna's published essays / blog posts (the Reset Stories magazine + Life / Love & Relationships / Work & Money sections). Use when the visitor asks about content on a specific topic like burnout, narcissistic abuse, dating, founder energy, etc. Returns each article with its title, section, reading time, and absolute URL.",
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keyword(s) to match against article titles. Lower-case, short — e.g. "burnout", "narcissist", "founder".',
        },
        section: {
          type: 'string',
          enum: ['reset-stories', 'life', 'love-and-relationships', 'work-and-money'],
          description: 'Optional section filter.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_products',
    description:
      "Search Anna's shop (jewellery, crystals, decoder products, books). Use when the visitor asks for product suggestions, gifts, jewellery, crystals, or anything physical to buy. Returns each product with its name, short description, price (£), stock state, and absolute URL.",
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keyword to match against product name / description. Lower-case, short — e.g. "moonstone", "necklace", "gift".',
        },
      },
    },
  },
] as const;

// ── Internal executor ────────────────────────────────────────────────

const MONTH_NAMES = ['january','february','march','april','may','june','july','august','september','october','november','december'];

function monthFromString(s: string | undefined): number | null {
  if (!s) return null;
  const idx = MONTH_NAMES.indexOf(s.trim().toLowerCase());
  return idx === -1 ? null : idx; // 0-indexed
}

function url(path: string): string {
  return `${SITE_URL}${path}`;
}

function experienceUrl(e: Experience): string {
  // Type pages don't have per-slug detail pages yet — link to the type page.
  switch (e.type) {
    case 'retreat':   return url('/experiences/retreats');
    case 'workshop':  return url('/experiences/workshops');
    case 'corporate': return url('/experiences/corporate-wellbeing');
    case 'speaking':  return url('/experiences/speaking');
    default:          return url('/experiences');
  }
}

async function handleSearchExperiences(input: { type?: string; month?: string }): Promise<unknown> {
  const all = await getExperiences(input.type && ['retreat','workshop','corporate','speaking'].includes(input.type) ? input.type : undefined);
  const monthIdx = monthFromString(input.month);
  const filtered = monthIdx === null
    ? all
    : all.filter((e) => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return !isNaN(d.getTime()) && d.getMonth() === monthIdx;
      });
  if (filtered.length === 0) {
    return {
      found: 0,
      note: `No upcoming experiences match those filters. Suggest the visitor join Reset Letters (${url('/reset-letters')}) to be notified when new dates are announced.`,
    };
  }
  return {
    found: filtered.length,
    experiences: filtered.slice(0, 8).map((e) => ({
      name: e.name,
      type: e.type,
      date: e.date,
      location: e.location || null,
      price: e.priceLabel || (e.price ? `£${e.price}` : null),
      url: experienceUrl(e),
      description: e.description ? e.description.slice(0, 300) : '',
    })),
  };
}

const SECTION_PATHS: Record<string, string> = {
  'reset-stories': '/reset-stories',
  'life': '/life',
  'love-and-relationships': '/love-and-relationships',
  'work-and-money': '/work-and-money',
};

function articleUrl(a: Article): string {
  const section = a.category?.section || 'reset-stories';
  const sectionPath = SECTION_PATHS[section] || '/reset-stories';
  return url(`${sectionPath}/${a.slug}`);
}

async function handleSearchArticles(input: { query: string; section?: string }): Promise<unknown> {
  const q = (input.query || '').toLowerCase().trim();
  if (!q) return { found: 0, note: 'No query provided.' };
  const all = await getArticles(input.section);
  const matches = all.filter((a) => {
    const haystack = `${a.title} ${a.excerpt || ''}`.toLowerCase();
    return haystack.includes(q);
  });
  if (matches.length === 0) {
    return {
      found: 0,
      note: `No articles match "${input.query}". Suggest the visitor browse the section pages directly: ${url('/reset-stories')}`,
    };
  }
  return {
    found: matches.length,
    articles: matches.slice(0, 6).map((a) => ({
      title: a.title,
      section: a.category?.section || 'reset-stories',
      readingTime: a.readingTime || '',
      url: articleUrl(a),
      excerpt: a.excerpt ? a.excerpt.slice(0, 240) : '',
    })),
  };
}

async function handleSearchProducts(input: { query?: string }): Promise<unknown> {
  const q = (input.query || '').toLowerCase().trim();
  const all = await getProducts();
  const active = all.filter((p) => p.isActive);
  const matches = q
    ? active.filter((p) => {
        const haystack = `${p.name} ${p.shortDescription || ''} ${p.description || ''}`.toLowerCase();
        return haystack.includes(q);
      })
    : active;
  if (matches.length === 0) {
    return {
      found: 0,
      note: `No products match "${input.query || ''}". Suggest the visitor browse the shop directly: ${url('/shop')}`,
    };
  }
  return {
    found: matches.length,
    products: matches.slice(0, 6).map((p: Product) => ({
      name: p.name,
      price: typeof p.price === 'number' ? `£${p.price.toFixed(2)}` : null,
      inStock: (p.stock ?? 0) > 0,
      url: url(`/shop/${p.slug}`),
      shortDescription: p.shortDescription || '',
    })),
  };
}

export type ToolName = 'search_experiences' | 'search_articles' | 'search_products';

export async function executeTool(name: string, input: unknown): Promise<unknown> {
  const safeInput = (input && typeof input === 'object') ? (input as Record<string, unknown>) : {};
  switch (name) {
    case 'search_experiences':
      return handleSearchExperiences(safeInput as { type?: string; month?: string });
    case 'search_articles':
      return handleSearchArticles({ query: String(safeInput.query || ''), section: safeInput.section as string | undefined });
    case 'search_products':
      return handleSearchProducts({ query: safeInput.query as string | undefined });
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
