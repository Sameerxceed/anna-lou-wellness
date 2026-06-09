/**
 * Strapi admin customizations.
 *
 * This file is bundled into the admin panel build. Anything we put here
 * is invisible to the public site and only affects the CMS editor UI.
 *
 * Roadmap (incremental, each one stand-alone safe):
 *  ✅ 1. Translations — replace generic Strapi labels with Anna-friendly copy
 *  ✅ 2. Theme — light tweaks to match Anna's brand (plum accent)
 *  ✅ 3. Section filter pills on Story · Category + Story · Article list views
 *  ✅ 4. Quick-edit dashboard — grouped grid of cards, one per menu page
 *  ✅ 5. Dashboard sub-menus — editorial cards expose Categories + Articles chips
 *  ⏳ 6. Inline preview-edit affordances
 *
 * Conscious choice: we do NOT mutate Strapi's left sidebar (no addMenuLink,
 * no plugin route registration). Strapi v5's sidebar APIs are version-fragile
 * and a broken sidebar registration crashes the whole admin. Instead, all
 * navigation enhancements live on pages we already render (the homepage
 * widget) as in-page groups + sub-menu chips.
 *
 * Pattern note: every customization here belongs to the Xceed CMS template,
 * not Anna specifically. Anna-specific branding (the actual hex codes, image
 * paths) lives in this file but should be parameterised via env vars or a
 * client-config import in the future template.
 */

import type { StrapiApp } from '@strapi/strapi/admin';
import SectionFilterPills from './extensions/SectionFilterPills';
import QuickEditDashboard from './extensions/QuickEditDashboard';
import QuickEditDashboardPage from './extensions/QuickEditDashboardPage';
import RelatedItemsPanel from './extensions/RelatedItemsPanel';
import GenerateSeoPanel from './extensions/GenerateSeoPanel';
import ViewLivePanel from './extensions/ViewLivePanel';
import QuickPhotoEditor from './extensions/QuickPhotoEditor';

// Sidebar icon for the Quick Edit menu link. Strapi expects a React
// component for the `icon` field — inline emoji wrapped in a span works
// without needing to import @strapi/icons.
const QuickEditMenuIcon = () => (
  <span
    style={{
      fontSize: 18,
      lineHeight: 1,
      display: 'inline-block',
      width: 20,
      textAlign: 'center',
    }}
    aria-hidden="true"
  >
    📋
  </span>
);

const QuickPhotoMenuIcon = () => (
  <span
    style={{
      fontSize: 18,
      lineHeight: 1,
      display: 'inline-block',
      width: 20,
      textAlign: 'center',
    }}
    aria-hidden="true"
  >
    📷
  </span>
);

const config = {
  locales: ['en'],
  translations: {
    en: {
      // Friendlier landing — "Hello Anna" stays useful but loses corporate tone
      'app.components.HomePage.welcome': 'Welcome back',
      'app.components.HomePage.welcome.again': 'Welcome back',
      'app.components.HomePage.welcomeBlock.content':
        'Manage your website content — pages, products, coaching, workshops, blog, and more.',
      'app.components.HomePage.welcomeBlock.content.again':
        'Manage your website content — pages, products, coaching, workshops, blog, and more.',
      'app.components.LeftMenu.navbrand.title': 'Anna Lou Wellness',
      'app.components.LeftMenu.navbrand.workplace': 'Content Studio',
      'Settings.application.title': 'Anna Lou Wellness — CMS',
      // Login page
      'Auth.form.welcome.title': 'Anna Lou Wellness',
      'Auth.form.welcome.subtitle': 'Log in to manage your website',
    },
  },
  // Brand-aligned admin theme. Plum #6E3A5A as primary accent so the CMS
  // visually matches the live site.
  theme: {
    light: {
      colors: {
        primary100: '#F6EAF0',
        primary200: '#E5C9D6',
        primary500: '#6E3A5A',
        primary600: '#5A2E4A',
        primary700: '#48253A',
      },
    },
  },
  // Hide top-right notifications icon clutter if needed (default kept for now)
  notifications: { releases: false },
  // Tutorial videos that auto-play for new admins — disable for clean experience
  tutorials: false,
};

const bootstrap = (app: StrapiApp) => {
  // Stamp a console marker so we know our customizations loaded.
  // If admin breaks, the missing log narrows the diagnosis.
  // eslint-disable-next-line no-console
  console.info('[ALW admin] Customizations loaded · v0.5 (app.tsx is now the active entry)');

  // Browser tab title — replaces the default "Strapi Admin" wherever it shows.
  if (typeof document !== 'undefined') {
    document.title = 'Anna Lou Wellness CMS';
  }

  // Auto-redirect /admin (or /admin/ trailing slash) to /admin/alw-quick-edit
  // so Anna lands directly on her Quick Edit dashboard after login instead of
  // the generic "Hello Anna" homepage with the empty widget area.
  //
  // We do it client-side (history.replaceState) because Strapi's admin uses
  // React Router and is a SPA — server-side redirects aren't available here.
  // Only triggers when path is EXACTLY /admin or /admin/, never when the user
  // is somewhere else (editing a page, in settings, etc.) so it doesn't trap
  // navigation. Window guard for SSR safety even though admin is browser-only.
  try {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/admin' || p === '/admin/') {
        window.history.replaceState({}, '', '/admin/alw-quick-edit');
        // Strapi's React Router will pick up the new URL on next render.
        // Use a soft event to nudge it.
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] Login redirect to Quick Edit failed:', err);
  }

  // Inject section filter pills above the list view actions area.
  // The component itself checks the current URL and only renders when
  // the user is on a target list page — invisible everywhere else.
  // Wrap in try/catch so a Strapi API change can't break admin boot.
  try {
    app.getPlugin('content-manager')?.injectComponent('listView', 'actions', {
      name: 'SectionFilterPills',
      Component: SectionFilterPills,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] SectionFilterPills injection failed:', err);
  }

  // Inject "Everything on this page" panel into the right sidebar of edit
  // views. The panel reads the current URL, looks up the UID in its
  // PAGE_GROUPS map, and renders a clickable tree of every related item
  // editable on the same public page (sub-menu items, sub-pages, articles,
  // events, products). On edit pages with no related-items config, the
  // component returns null and nothing renders — invisible everywhere else.
  //
  // This replaces the "Show contents" expandable on Quick Edit dashboard
  // cards as the primary discovery mechanism: cards stay compact, the full
  // tree lives where you actually edit.
  try {
    app.getPlugin('content-manager')?.injectComponent('editView', 'right-links', {
      name: 'RelatedItemsPanel',
      Component: RelatedItemsPanel,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] RelatedItemsPanel injection failed:', err);
  }

  // Inject "View live page" button into the right sidebar of every edit view.
  // Shows a green "Open in new tab" link to the public URL the entry powers.
  // Lets Anna edit in CMS, switch to live tab, pull-to-refresh on phone to
  // see changes within seconds (on-demand revalidation already wired).
  try {
    app.getPlugin('content-manager')?.injectComponent('editView', 'right-links', {
      name: 'ViewLivePanel',
      Component: ViewLivePanel,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] ViewLivePanel injection failed:', err);
  }

  // Inject "Generate SEO" panel into the right sidebar of every edit view.
  // Reads the entry's title + body, calls /api/seo-generator/generate (Claude),
  // shows back an SEO title + description with copy-to-clipboard buttons that
  // Anna pastes into the seo_title / seo_description fields below.
  // Replaces the bad seeded "One-day immersion in Anna's CODES framework..."
  // style descriptions Anna flagged in her 5 Jun feedback.
  try {
    app.getPlugin('content-manager')?.injectComponent('editView', 'right-links', {
      name: 'GenerateSeoPanel',
      Component: GenerateSeoPanel,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] GenerateSeoPanel injection failed:', err);
  }

  // Quick Edit dashboard — register as a sidebar menu link so it's always
  // reachable from anywhere in admin. Tried homepage widget first (Strapi
  // v5.x widgets API) but it silently failed on this version — see Add
  // Widget picker showed "No widgets available" with our registration in
  // place. addMenuLink is the rock-solid documented API used by every
  // Strapi plugin to add admin pages; ONE entry is not a sidebar tree
  // mutation, it's the standard extension point.
  try {
    const appAny = app as unknown as {
      addMenuLink?: (link: {
        to: string;
        icon: React.ComponentType;
        intlLabel: { id: string; defaultMessage: string };
        Component: () => Promise<{ default: React.ComponentType }>;
        permissions: unknown[];
      }) => void;
    };
    appAny.addMenuLink?.({
      to: '/alw-quick-edit',
      icon: QuickEditMenuIcon,
      intlLabel: { id: 'alw.menu.quick-edit', defaultMessage: 'Quick Edit' },
      Component: async () => ({ default: QuickEditDashboardPage }),
      permissions: [],
    });
    appAny.addMenuLink?.({
      to: '/alw-quick-photos',
      icon: QuickPhotoMenuIcon,
      intlLabel: { id: 'alw.menu.quick-photos', defaultMessage: 'Quick Photos' },
      Component: async () => ({ default: QuickPhotoEditor }),
      permissions: [],
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] Quick Edit menu link registration failed:', err);
  }

  // Keep the widget-API call too — harmless if it still fails, but if Strapi
  // surfaces our widget on a future version, Anna gets it on her homepage
  // for free with no extra deploy. QuickEditDashboard is the same component
  // either way.
  try {
    const anyApp = app as unknown as { widgets?: { register?: (w: unknown) => void } };
    anyApp.widgets?.register?.({
      uid: 'alw.quick-edit-dashboard',
      icon: QuickEditMenuIcon,
      title: { id: 'alw.quick-edit', defaultMessage: 'Quick Edit' },
      component: async () => ({ default: QuickEditDashboard }),
      permissions: [],
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] QuickEditDashboard widget registration failed:', err);
  }
};

export default { config, bootstrap };
