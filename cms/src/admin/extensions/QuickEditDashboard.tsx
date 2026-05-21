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

// Factory: returns a loadChildren function that fetches articles in the
// given section slug, mapped to ChildItem shape for the dashboard tree.
//
// Filter shape uses relation hop: category > section enum (slug). Same key
// shape that SectionFilterPills writes to the URL, so behaviour matches.
const articlesInSection = (sectionSlug: string): LoadChildren => async () => {
  const url =
    `/content-manager/collection-types/api::article.article` +
    `?page=1&pageSize=50&sort=title:ASC` +
    `&filters[category][section][$eq]=${encodeURIComponent(sectionSlug)}`;
  const data = await adminFetch(url);
  const results: Array<Record<string, unknown>> = data?.results || [];
  return results.map((a): ChildItem => {
    const documentId = (a.documentId as string) || String(a.id);
    const title = (a.title as string) || '(untitled article)';
    const publishedAt = a.publishedAt as string | null | undefined;
    return {
      id: documentId,
      label: title,
      to: `/content-manager/collection-types/api::article.article/${documentId}`,
      badge: publishedAt ? undefined : 'draft',
    };
  });
};

// URL to create a new article. Pre-selecting the category isn't reliably
// supported via querystring across Strapi v5 versions, so we just open the
// blank create form and Anna picks the category from the form's dropdown.
const NEW_ARTICLE_URL = '/content-manager/collection-types/api::article.article/create';

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
        description: 'Section landing + sub-pages',
        colour: '#6E3A5A',
        sublinks: editorialSublinks('reset-stories'),
        loadChildren: articlesInSection('reset-stories'),
        newItemTo: NEW_ARTICLE_URL,
        newItemLabel: 'New article (then tag it Reset Stories)',
      },
      {
        uid: 'api::life-page.life-page',
        kind: 'single-types',
        label: 'Life',
        description: 'Section landing + sub-pages',
        colour: '#FAA21B',
        sublinks: editorialSublinks('life'),
        loadChildren: articlesInSection('life'),
        newItemTo: NEW_ARTICLE_URL,
        newItemLabel: 'New article (then tag it Life)',
      },
      {
        uid: 'api::love-and-relationships-page.love-and-relationships-page',
        kind: 'single-types',
        label: 'Love & Relationships',
        description: 'Section landing + sub-pages',
        colour: '#F280AA',
        sublinks: editorialSublinks('love-and-relationships'),
        loadChildren: articlesInSection('love-and-relationships'),
        newItemTo: NEW_ARTICLE_URL,
        newItemLabel: 'New article (then tag it Love & Relationships)',
      },
      {
        uid: 'api::work-and-money-page.work-and-money-page',
        kind: 'single-types',
        label: 'Work & Money',
        description: 'Section landing + sub-pages',
        colour: '#FFD07A',
        sublinks: editorialSublinks('work-and-money'),
        loadChildren: articlesInSection('work-and-money'),
        newItemTo: NEW_ARTICLE_URL,
        newItemLabel: 'New article (then tag it Work & Money)',
      },
    ],
  },
  {
    title: 'Other landing pages',
    description: 'Section landings for non-editorial parts of the site.',
    pages: [
      { uid: 'api::experience-page.experience-page', kind: 'single-types', label: 'Experiences', description: 'Retreats, workshops, corporate', colour: '#7BAFDD' },
      { uid: 'api::work-with-anna-page.work-with-anna-page', kind: 'single-types', label: 'Work with Anna', description: 'Coaching landing page', colour: '#F280AA' },
      { uid: 'api::community-page.community-page', kind: 'single-types', label: 'Community', description: 'Circles, Reset Room, events', colour: '#231F20' },
      { uid: 'api::about-page.about-page', kind: 'single-types', label: 'About', description: "Anna's story, press, certifications", colour: '#231F20' },
    ],
  },
  {
    title: 'Commerce',
    description: 'Shop catalogue and customer orders.',
    pages: [
      { uid: 'api::shop-page.shop-page', kind: 'single-types', label: '🛒 Shop landing', description: 'Jewellery shop landing page copy', colour: '#5DCAA5' },
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
          Click any card to edit. Click "Show contents" on editorial cards to
          see the same sub-pages your visitors see in the dropdown menu.
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
