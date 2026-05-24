/**
 * QuickEditDashboard — grouped grid of clickable cards, one per main page.
 *
 * Layout:
 *
 *   ╔══════════════════════════════════════════════╗
 *   ║  Quick Edit                                  ║
 *   ║  ──────────                                  ║
 *   ║  PINNED ESSENTIALS                           ║
 *   ║  [Homepage] [Navigation] [Settings] [Footer] ║
 *   ║                                              ║
 *   ║  EDITORIAL SECTIONS                          ║
 *   ║  [Reset Stories ↓ Cats Articles] [Life ...]  ║
 *   ║      ▾ 6 articles                            ║
 *   ║        • Holding Everything                  ║
 *   ║        • The Strong One                      ║
 *   ║        + Add new article                     ║
 *   ║                                              ║
 *   ║  OTHER LANDING PAGES                         ║
 *   ║  [Experiences] [Work with Anna] [About] ...  ║
 *   ║                                              ║
 *   ║  COMMERCE                                    ║
 *   ║  [Shop landing] [Products] [Orders]          ║
 *   ╚══════════════════════════════════════════════╝
 *
 * Editorial section cards (Reset Stories, Life, Love & Rels, Work & Money)
 * expose two extras beyond the basic edit-the-landing click:
 *
 *   - Sublink chips → jump to filtered Categories / Articles list views
 *   - Expandable contents tree → click "Show contents" to fetch articles in
 *     that section and render them inline. Each article is clickable to edit.
 *     This mirrors the live site's nav dropdown: same vocabulary, same shape.
 *
 * No sidebar mutation — everything happens inside the dashboard page.
 *
 * --- Xceed pattern ---
 * Grouped quick-edit dashboard with optional per-card sub-links AND optional
 * async children loader. Future clients re-use by editing the GROUPS array.
 */

import QuickEditCard, { type Sublink, type LoadChildren, type ChildItem } from './QuickEditCard';

type PageCard = {
  uid: string;
  kind: 'single-types' | 'collection-types';
  label: string;
  description: string;
  colour: string;
  sublinks?: Sublink[];
  loadChildren?: LoadChildren;
  newItemTo?: string;
  newItemLabel?: string;
};

type Group = {
  title: string;
  description?: string;
  pages: PageCard[];
};

// Read the admin JWT from localStorage. Strapi v5 stores it as a JSON-encoded
// string under 'jwtToken'. Wrap in try/catch — if absent (e.g. dev preview),
// the loader will fail gracefully with a friendly error message.
const getAdminToken = (): string | null => {
  try {
    const raw = localStorage.getItem('jwtToken');
    if (!raw) return null;
    // Stored as JSON string of the token, so parse it.
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Fetch from the admin Content Manager API using the current admin JWT.
// Returns the JSON body. Throws on non-2xx.
const adminFetch = async (path: string) => {
  const token = getAdminToken();
  const res = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
};

// Factory: returns a loadChildren function that fetches the sub-menu items
// in a given section, mapped to ChildItem for the dashboard tree.
//
// IMPORTANT — these are Article Categories, NOT Articles. The live-site
// dropdown menu under each editorial section is auto-derived from Article
// Categories (see web/src/lib/cms.ts fetchCategoriesBySection). So the
// vocabulary Anna sees on the site (Holding Everything / The Strong One /
// Houseboat Life under Reset Stories) maps 1:1 to Article Category records.
//
// Clicking a sub-menu row here opens that Category for editing — same place
// Anna goes to rename a dropdown item or add a new one to the menu.
const categoriesInSection = (sectionSlug: string): LoadChildren => async () => {
  const url =
    `/content-manager/collection-types/api::article-category.article-category` +
    `?page=1&pageSize=50&sort=sort_order:ASC,name:ASC` +
    `&filters[section][$eq]=${encodeURIComponent(sectionSlug)}`;
  const data = await adminFetch(url);
  const results: Array<Record<string, unknown>> = data?.results || [];
  return results.map((c): ChildItem => {
    const documentId = (c.documentId as string) || String(c.id);
    const name = (c.name as string) || '(untitled sub-menu item)';
    return {
      id: documentId,
      label: name,
      to: `/content-manager/collection-types/api::article-category.article-category/${documentId}`,
    };
  });
};

// Loads Products whose comma-separated `tags` field contains the given tag.
// Lets a Shop sub-page card (New In / Personalised / ESJ) show the products
// that show up on that public page.
const productsWithTag = (tag: string): LoadChildren => async () => {
  const url =
    `/content-manager/collection-types/api::product.product` +
    `?page=1&pageSize=50&sort=sort_order:ASC,name:ASC` +
    `&filters[tags][$contains]=${encodeURIComponent(tag)}`;
  const data = await adminFetch(url);
  const results: Array<Record<string, unknown>> = data?.results || [];
  return results.map((p): ChildItem => {
    const documentId = (p.documentId as string) || String(p.id);
    const name = (p.name as string) || '(untitled)';
    return {
      id: documentId,
      label: name,
      to: `/content-manager/collection-types/api::product.product/${documentId}`,
    };
  });
};

// Loads generic-page entries whose slug starts with the given prefix.
// We use slugs like "about-press", "the-work-ways-to-work-with-me", etc.
// so passing prefix="about-" returns every About sub-page in one list.
const genericPagesWithPrefix = (prefix: string): LoadChildren => async () => {
  const url =
    `/content-manager/collection-types/api::generic-page.generic-page` +
    `?page=1&pageSize=50&sort=slug:ASC` +
    `&filters[slug][$startsWith]=${encodeURIComponent(prefix)}`;
  const data = await adminFetch(url);
  const results: Array<Record<string, unknown>> = data?.results || [];
  return results.map((p): ChildItem => {
    const documentId = (p.documentId as string) || String(p.id);
    const title = (p.title as string) || (p.slug as string) || '(untitled)';
    return {
      id: documentId,
      label: title,
      to: `/content-manager/collection-types/api::generic-page.generic-page/${documentId}`,
    };
  });
};

// Sibling to categoriesInSection — fetches recent Articles in the section,
// most recent first. Used inside combineChildren for editorial landing cards.
const articlesInSection = (sectionSlug: string, limit = 10): LoadChildren => async () => {
  const url =
    `/content-manager/collection-types/api::article.article` +
    `?page=1&pageSize=${limit}&sort=publishedAt:DESC` +
    `&filters[category][section][$eq]=${encodeURIComponent(sectionSlug)}`;
  const data = await adminFetch(url);
  const results: Array<Record<string, unknown>> = data?.results || [];
  return results.map((a): ChildItem => {
    const documentId = (a.documentId as string) || String(a.id);
    const title = (a.title as string) || '(untitled article)';
    return {
      id: documentId,
      label: title,
      to: `/content-manager/collection-types/api::article.article/${documentId}`,
    };
  });
};

// URL to create a new sub-menu item (Article Category). Anna will pick the
// section (Reset Stories / Life / etc.) in the form's dropdown after this.
const NEW_CATEGORY_URL =
  '/content-manager/collection-types/api::article-category.article-category/create';

// ─── Non-editorial sub-menus ──────────────────────────────────────────────
//
// For non-editorial menu items (Experiences, Work with Anna, Shop, Community,
// About), the sub-menu links are stored DIRECTLY in the Navigation
// singletype's `children` repeatable component — not derived from any
// collection. So loading "what's under Experiences in the live dropdown"
// means fetching Navigation and finding the item whose href matches.
//
// Strapi doesn't expose a deep-link to edit a single nested component child,
// so clicking a sub-menu row opens the full Navigation form. Anna finds the
// item by label (thanks to mainField fix) and edits its children there.

const NAVIGATION_EDIT_URL =
  '/content-manager/single-types/api::navigation.navigation';

// Cache the Navigation fetch so expanding 5 non-editorial cards in a row
// only hits the API once. Cleared on error so retries can succeed.
let navItemsCache:
  | Promise<Array<{ href?: string; children?: Array<{ label?: string; href?: string }> }>>
  | null = null;
const getNavItems = () => {
  if (!navItemsCache) {
    navItemsCache = (async () => {
      try {
        const data = await adminFetch(NAVIGATION_EDIT_URL);
        const items = (data?.items as Array<Record<string, unknown>>) || [];
        return items as Array<{ href?: string; children?: Array<{ label?: string; href?: string }> }>;
      } catch (err) {
        navItemsCache = null; // allow retry
        throw err;
      }
    })();
  }
  return navItemsCache;
};

const navChildrenByHref = (href: string): LoadChildren => async () => {
  const items = await getNavItems();
  const item = items.find((i) => i.href === href);
  const children = Array.isArray(item?.children) ? item!.children! : [];
  return children.map((c, idx): ChildItem => ({
    id: `${href}-${idx}-${c.label || idx}`,
    label: c.label || '(unlabelled link)',
    // No deep-link to a single nested child — opens the full Navigation form
    // where Anna finds the item by label and edits its children there.
    to: NAVIGATION_EDIT_URL,
  }));
};

// Factory: fetches every entry in a collection and returns each as a clickable
// child with a deep-link to its edit form. Lets a single Quick Edit card show
// "everything editable on this page" — the sub-menu items AND the collection
// items that render on that same public page. Use with combineChildren() to
// stitch multiple loaders together with section headers.
const collectionItems = (
  uid: string,
  options: {
    sort?: string;          // e.g. "date:ASC"
    nameField?: string;     // e.g. "name" | "title"
    prefixDate?: boolean;   // prepend "13 Jun · " to label if a `date` field exists
    pageSize?: number;
  } = {},
): LoadChildren => async () => {
  const { sort, nameField = 'name', prefixDate, pageSize = 50 } = options;
  const qs = new URLSearchParams();
  if (sort) qs.set('sort', sort);
  qs.set('page', '1');
  qs.set('pageSize', String(pageSize));
  const data = await adminFetch(`/content-manager/collection-types/${uid}?${qs.toString()}`);
  const results = (data?.results as Array<Record<string, unknown>>) || [];
  return results.map((r: Record<string, unknown>): ChildItem => {
    const documentId = (r.documentId as string) || (r.id as string | number);
    const baseLabel = (r[nameField] as string) || (r.title as string) || (r.name as string) || (r.slug as string) || '(untitled)';
    let label = baseLabel;
    if (prefixDate && typeof r.date === 'string' && r.date) {
      try {
        const [y, m, d] = r.date.split('-').map((n) => Number(n));
        const formatted = new Date(Date.UTC(y, (m || 1) - 1, d || 1)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        label = `${formatted} · ${baseLabel}`;
      } catch { /* fall through with raw label */ }
    }
    return {
      id: `${uid}-${documentId}`,
      label,
      to: `/content-manager/collection-types/${uid}/${documentId}`,
    };
  });
};

// Stitches multiple LoadChildren loaders into a single combined list, with
// optional section headers between groups. Used by Quick Edit cards that
// represent a public page made up of multiple content types (e.g. the
// Experiences landing page = sub-menu links + Experience collection items).
//
// Logs sub-loader failures to the console so we can see WHY a group came
// back empty (previously silent-catch masked the cause). One failed loader
// still degrades gracefully — its group becomes a header with no items.
const combineChildren = (
  groups: Array<{ header?: string; load: LoadChildren }>,
): LoadChildren => async () => {
  const out: ChildItem[] = [];
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    let items: ChildItem[] = [];
    try {
      items = await g.load();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[QuickEdit] sub-loader failed for "${g.header || 'group ' + i}":`, err);
      items = [];
    }
    if (items.length === 0 && !g.header) continue;
    if (g.header) {
      out.push({ id: `hdr-${i}-${g.header}`, label: g.header, to: '', groupHeader: true });
    }
    out.push(...items);
  }
  return out;
};

// Editorial sub-links — Categories list (filtered to this section) and
// Articles list (filtered through the category relation hop). The filter
// keys match what SectionFilterPills writes to the URL, so clicking a chip
// lands Anna in a list that's already pre-filtered and her section pills
// stay in sync.
const editorialSublinks = (slug: string): Sublink[] => [
  {
    label: 'Categories',
    to: `/content-manager/collection-types/api::article-category.article-category?page=1&pageSize=10&sort=name:ASC&filters[section][$eq]=${slug}`,
  },
  {
    label: 'All articles',
    to: `/content-manager/collection-types/api::article.article?page=1&pageSize=10&sort=publishedAt:DESC&filters[category][section][$eq]=${slug}`,
  },
];

const GROUPS: Group[] = [
  {
    title: 'Pinned essentials',
    description: 'The pages every visitor touches. Edit these and the whole site changes.',
    pages: [
      { uid: 'api::homepage.homepage', kind: 'single-types', label: '🏠 Homepage', description: 'The front page of the site', colour: '#231F20' },
      { uid: 'api::navigation.navigation', kind: 'single-types', label: '📍 Navigation Menu', description: 'Top menu items + dropdowns + top strip', colour: '#231F20' },
      { uid: 'api::site-settings.site-settings', kind: 'single-types', label: '⚙️ Site Settings', description: 'Logo, social URLs, footer details', colour: '#231F20' },
      { uid: 'api::footer.footer', kind: 'single-types', label: '📄 Footer', description: 'Closing line, link columns, Substack CTA', colour: '#231F20' },
    ],
  },
  {
    title: 'Editorial sections',
    description: 'Each section has a landing page, categories, and articles. Click "Show contents" to see articles in that section — just like the live site dropdown menu.',
    pages: [
      {
        uid: 'api::reset-stories-page.reset-stories-page',
        kind: 'single-types',
        label: 'Reset Stories',
        description: 'Section landing + sub-menu items (use chips above for articles)',
        colour: '#6E3A5A',
        sublinks: editorialSublinks('reset-stories'),
        loadChildren: categoriesInSection('reset-stories'),
        newItemTo: NEW_CATEGORY_URL,
        newItemLabel: 'New sub-menu item (set section = Reset Stories)',
      },
      {
        uid: 'api::life-page.life-page',
        kind: 'single-types',
        label: 'Life',
        description: 'Section landing + sub-menu items (use chips above for articles)',
        colour: '#FAA21B',
        sublinks: editorialSublinks('life'),
        loadChildren: categoriesInSection('life'),
        newItemTo: NEW_CATEGORY_URL,
        newItemLabel: 'New sub-menu item (set section = Life)',
      },
      {
        uid: 'api::love-and-relationships-page.love-and-relationships-page',
        kind: 'single-types',
        label: 'Love & Relationships',
        description: 'Section landing + sub-menu items (use chips above for articles)',
        colour: '#F280AA',
        sublinks: editorialSublinks('love-and-relationships'),
        loadChildren: categoriesInSection('love-and-relationships'),
        newItemTo: NEW_CATEGORY_URL,
        newItemLabel: 'New sub-menu item (set section = Love & Relationships)',
      },
      {
        uid: 'api::work-and-money-page.work-and-money-page',
        kind: 'single-types',
        label: 'Work & Money',
        description: 'Section landing + sub-menu items (use chips above for articles)',
        colour: '#FFD07A',
        sublinks: editorialSublinks('work-and-money'),
        loadChildren: categoriesInSection('work-and-money'),
        newItemTo: NEW_CATEGORY_URL,
        newItemLabel: 'New sub-menu item (set section = Work & Money)',
      },
    ],
  },
  {
    title: 'Other landing pages',
    description: 'Section landings for non-editorial parts of the site. "Show contents" reveals the same dropdown links your visitors see on the live menu — edit them in Navigation.',
    pages: [
      {
        uid: 'api::experiences-landing-page.experiences-landing-page',
        kind: 'single-types',
        label: 'Experiences · Landing',
        description: 'Click main card for header. Show contents → upcoming events. Sidebar → "Experiences · Sub-page" for the 4 sub-pages.',
        colour: '#7BAFDD',
        loadChildren: collectionItems('api::experience.experience', { sort: 'date:ASC', nameField: 'name', prefixDate: true }),
        newItemTo: '/content-manager/collection-types/api::experience.experience/create',
        newItemLabel: 'Add a retreat or workshop',
      },
      {
        uid: 'api::work-with-anna-page.work-with-anna-page',
        kind: 'single-types',
        label: 'Work with Anna · Landing',
        description: 'Edit /the-work header. Sidebar → "Work · Coaching Session" / "Work · Programme" / "Work · FAQ" for the cards.',
        colour: '#F280AA',
        loadChildren: navChildrenByHref('/the-work'),
        newItemTo: NAVIGATION_EDIT_URL,
        newItemLabel: 'Edit sub-menu in Navigation',
      },
      {
        uid: 'api::sessions-hub-page.sessions-hub-page',
        kind: 'single-types',
        label: 'Work · 1:1 Sessions hub',
        description: 'Hub hero copy. Show contents → every session card.',
        colour: '#F280AA',
        loadChildren: collectionItems('api::coaching-session.coaching-session', { sort: 'sort_order:ASC', nameField: 'title' }),
        newItemTo: '/content-manager/collection-types/api::coaching-session.coaching-session/create',
        newItemLabel: 'Add a session',
      },
      { uid: 'api::quiz-page.quiz-page', kind: 'single-types', label: 'Work · Quiz', description: '/the-work/quiz hero + 6 result blurbs (questions in code)', colour: '#F280AA' },
      {
        uid: 'api::community-page.community-page',
        kind: 'single-types',
        label: 'Community',
        description: 'Edit /community header. Sidebar → Reset Room / Membership for the sub-pages.',
        colour: '#231F20',
        loadChildren: navChildrenByHref('/community'),
        newItemTo: NAVIGATION_EDIT_URL,
        newItemLabel: 'Edit sub-menu in Navigation',
      },
      {
        uid: 'api::about-page.about-page',
        kind: 'single-types',
        label: 'About',
        description: "Edit /about header. Sidebar → Sub-pages for Press/Partnerships, Team · Member for the team.",
        colour: '#231F20',
        loadChildren: navChildrenByHref('/about'),
        newItemTo: NAVIGATION_EDIT_URL,
        newItemLabel: 'Edit sub-menu in Navigation',
      },
    ],
  },
  {
    title: 'Commerce',
    description: 'Shop catalogue and customer orders.',
    pages: [
      {
        uid: 'api::shop-page.shop-page',
        kind: 'single-types',
        label: '🛒 Shop landing',
        description: 'Edit /shop header. Sidebar → Shop · Product for products, Shop · Category for categories.',
        colour: '#5DCAA5',
        loadChildren: navChildrenByHref('/shop'),
        newItemTo: NAVIGATION_EDIT_URL,
        newItemLabel: 'Edit sub-menu in Navigation',
      },
      {
        uid: 'api::shop-new-in-page.shop-new-in-page',
        kind: 'single-types',
        label: 'Shop · New In',
        description: 'Sub-page copy. Show contents → products tagged "new-in".',
        colour: '#5DCAA5',
        loadChildren: productsWithTag('new-in'),
        newItemTo: '/content-manager/collection-types/api::product.product/create',
        newItemLabel: 'Add a product (remember to tag it "new-in")',
      },
      {
        uid: 'api::shop-personalised-page.shop-personalised-page',
        kind: 'single-types',
        label: 'Shop · Personalised',
        description: 'Sub-page copy. Show contents → products tagged "personalised".',
        colour: '#5DCAA5',
        loadChildren: productsWithTag('personalised'),
        newItemTo: '/content-manager/collection-types/api::product.product/create',
        newItemLabel: 'Add a product (remember to tag it "personalised")',
      },
      {
        uid: 'api::shop-esj-page.shop-esj-page',
        kind: 'single-types',
        label: 'Shop · ESJ',
        description: 'Sub-page copy. Show contents → products tagged "esj".',
        colour: '#5DCAA5',
        loadChildren: productsWithTag('esj'),
        newItemTo: '/content-manager/collection-types/api::product.product/create',
        newItemLabel: 'Add a product (remember to tag it "esj")',
      },
      { uid: 'api::product.product', kind: 'collection-types', label: '🛍 Products', description: 'Shop catalogue — add, edit, restock items', colour: '#5DCAA5' },
      { uid: 'api::order.order', kind: 'collection-types', label: '📦 Orders', description: 'Customer orders + statuses', colour: '#5DCAA5' },
    ],
  },
  {
    title: 'All articles',
    description: 'Browse or create articles regardless of section.',
    pages: [
      { uid: 'api::article.article', kind: 'collection-types', label: '✍️ All Articles', description: 'Every Reset Stories / Life / Love / Work article in one place', colour: '#6E3A5A' },
    ],
  },
];

const QuickEditDashboard = () => {
  return (
    <section
      style={{
        background: '#f6f6f9',
        padding: '20px 24px',
        margin: '0 0 24px 0',
        borderRadius: 8,
      }}
    >
      <header style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#32324d',
            margin: 0,
            marginBottom: 4,
            letterSpacing: '-0.01em',
          }}
        >
          Quick Edit
        </h2>
        <p style={{ fontSize: 13, color: '#666687', margin: 0, lineHeight: 1.45 }}>
          Click any card to edit its landing page. Click "Show contents" to
          see what lives under that page — sub-menu items, sub-pages, or
          collection items (events, products, articles). Click any row to
          edit that item directly. Use the chips like "Categories" or "All
          articles" to jump to the filtered list view.
        </p>
      </header>

      {GROUPS.map((group) => (
        <div key={group.title} style={{ marginBottom: 22 }}>
          <h3
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#666687',
              margin: '0 0 4px',
            }}
          >
            {group.title}
          </h3>
          {group.description && (
            <p
              style={{
                fontSize: 12,
                color: '#666687',
                margin: '0 0 10px',
                lineHeight: 1.4,
              }}
            >
              {group.description}
            </p>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 12,
              alignItems: 'start',
            }}
          >
            {group.pages.map((p) => (
              <QuickEditCard
                key={p.uid}
                uid={p.uid}
                kind={p.kind}
                label={p.label}
                description={p.description}
                colour={p.colour}
                sublinks={p.sublinks}
                loadChildren={p.loadChildren}
                newItemTo={p.newItemTo}
                newItemLabel={p.newItemLabel}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default QuickEditDashboard;
