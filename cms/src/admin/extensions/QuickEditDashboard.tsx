/**
 * QuickEditDashboard — grid of clickable cards, one per main menu page.
 *
 * Designed to be injected onto the Strapi admin Homepage as a widget
 * (or used standalone via a custom menu link).
 *
 * Anna lands on /admin → sees this grid right under the welcome message →
 * one click per page she wants to edit. Replaces the mental hop of "open
 * Content Manager, scroll the sidebar, find the right item".
 *
 * --- Xceed pattern ---
 * Reusable dashboard pattern for client CMSes. Mirror the live site's
 * main navigation as a grid of quick-edit cards.
 */

import QuickEditCard from './QuickEditCard';

const PAGES = [
  // Pinned essentials
  { uid: 'api::homepage.homepage', kind: 'single-types' as const, label: '🏠 Homepage', description: 'The front page of the site', colour: '#231F20' },
  { uid: 'api::navigation.navigation', kind: 'single-types' as const, label: '📍 Navigation Menu', description: 'Top menu items + dropdowns + top strip', colour: '#231F20' },
  { uid: 'api::site-settings.site-settings', kind: 'single-types' as const, label: '⚙️ Site Settings', description: 'Logo, social URLs, footer details', colour: '#231F20' },
  { uid: 'api::footer.footer', kind: 'single-types' as const, label: '📄 Footer', description: 'Closing line, link columns, Substack CTA', colour: '#231F20' },

  // Main menu pages — one per top-nav item
  { uid: 'api::reset-stories-page.reset-stories-page', kind: 'single-types' as const, label: 'Reset Stories', description: 'Section landing page copy', colour: '#6E3A5A' },
  { uid: 'api::life-page.life-page', kind: 'single-types' as const, label: 'Life', description: 'Section landing page copy', colour: '#FAA21B' },
  { uid: 'api::love-and-relationships-page.love-and-relationships-page', kind: 'single-types' as const, label: 'Love & Relationships', description: 'Section landing page copy', colour: '#F280AA' },
  { uid: 'api::work-and-money-page.work-and-money-page', kind: 'single-types' as const, label: 'Work & Money', description: 'Section landing page copy', colour: '#FFD07A' },
  { uid: 'api::experience-page.experience-page', kind: 'single-types' as const, label: 'Experiences', description: 'Retreats, workshops, corporate', colour: '#7BAFDD' },
  { uid: 'api::work-with-anna-page.work-with-anna-page', kind: 'single-types' as const, label: 'Work with Anna', description: 'Coaching landing page', colour: '#F280AA' },
  { uid: 'api::shop-page.shop-page', kind: 'single-types' as const, label: 'Shop', description: 'Jewellery shop landing page', colour: '#5DCAA5' },
  { uid: 'api::community-page.community-page', kind: 'single-types' as const, label: 'Community', description: 'Circles, Reset Room, events', colour: '#231F20' },
  { uid: 'api::about-page.about-page', kind: 'single-types' as const, label: 'About', description: "Anna's story, press, certifications", colour: '#231F20' },

  // Frequent collections
  { uid: 'api::article.article', kind: 'collection-types' as const, label: '✍️ Articles', description: 'All Reset Stories / Life / Love / Work articles', colour: '#6E3A5A' },
  { uid: 'api::product.product', kind: 'collection-types' as const, label: '🛍 Products', description: 'Shop catalogue', colour: '#5DCAA5' },
  { uid: 'api::order.order', kind: 'collection-types' as const, label: '📦 Orders', description: "Customer orders + statuses", colour: '#5DCAA5' },
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
      <header style={{ marginBottom: 16 }}>
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
        <p style={{ fontSize: 13, color: '#666687', margin: 0 }}>
          Click any card to jump straight into editing. Same as the main
          menu on your live site — what visitors click on the site is what
          you click on here.
        </p>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {PAGES.map((p) => (
          <QuickEditCard
            key={p.uid}
            uid={p.uid}
            kind={p.kind}
            label={p.label}
            description={p.description}
            colour={p.colour}
          />
        ))}
      </div>
    </section>
  );
};

export default QuickEditDashboard;
