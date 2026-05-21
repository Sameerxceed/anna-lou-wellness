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
 *   ║  [Love & Rels ...]              [Work...]    ║
 *   ║                                              ║
 *   ║  OTHER LANDING PAGES                         ║
 *   ║  [Experiences] [Work with Anna] [About] ...  ║
 *   ║                                              ║
 *   ║  COMMERCE                                    ║
 *   ║  [Shop landing] [Products] [Orders]          ║
 *   ╚══════════════════════════════════════════════╝
 *
 * Sub-link chips on each editorial card give Anna a "sub-menu" inside the
 * dashboard so she can drill into Categories or filtered Articles for that
 * section without leaving the dashboard. This is the "tree without
 * touching the sidebar" pattern — safer than mutating Strapi's left rail
 * and survives version updates.
 *
 * Renders as a homepage widget (registered in app.tsx) so Anna lands on
 * /admin and sees this immediately under the welcome banner.
 *
 * --- Xceed pattern ---
 * Grouped quick-edit dashboard with optional per-card sub-links. Future
 * clients re-use by editing the GROUPS array — everything else is generic.
 */

import QuickEditCard, { type Sublink } from './QuickEditCard';

type PageCard = {
  uid: string;
  kind: 'single-types' | 'collection-types';
  label: string;
  description: string;
  colour: string;
  sublinks?: Sublink[];
};

type Group = {
  title: string;
  description?: string;
  pages: PageCard[];
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
    label: 'Articles',
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
    description: 'Each section has a landing page, categories, and articles. Click the card to edit the landing page — use the chips to jump to that section\'s categories or articles.',
    pages: [
      { uid: 'api::reset-stories-page.reset-stories-page', kind: 'single-types', label: 'Reset Stories', description: 'Section landing page copy', colour: '#6E3A5A', sublinks: editorialSublinks('reset-stories') },
      { uid: 'api::life-page.life-page', kind: 'single-types', label: 'Life', description: 'Section landing page copy', colour: '#FAA21B', sublinks: editorialSublinks('life') },
      { uid: 'api::love-and-relationships-page.love-and-relationships-page', kind: 'single-types', label: 'Love & Relationships', description: 'Section landing page copy', colour: '#F280AA', sublinks: editorialSublinks('love-and-relationships') },
      { uid: 'api::work-and-money-page.work-and-money-page', kind: 'single-types', label: 'Work & Money', description: 'Section landing page copy', colour: '#FFD07A', sublinks: editorialSublinks('work-and-money') },
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
          Click any card to jump straight into editing. Same as the main
          menu on your live site — what visitors click on the site is what
          you click on here.
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 12,
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
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default QuickEditDashboard;
