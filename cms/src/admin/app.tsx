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
import AutoSeoStatusPanel from './extensions/AutoSeoStatusPanel';
import ViewLivePanel from './extensions/ViewLivePanel';
import QuickPhotoEditor from './extensions/QuickPhotoEditor';
import SeoFilesPage from './extensions/SeoFilesPage';
import SiteUrlsPage from './extensions/SiteUrlsPage';
import BetterDateInput from './extensions/BetterDateInput';
import LinkPickerInput from './extensions/LinkPickerInput';
import ManualHelpPage from './extensions/ManualHelpPage';
import HelpFab from './extensions/HelpFab';
import MobilePreviewClose from './extensions/MobilePreviewClose';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

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

const SeoFilesMenuIcon = () => (
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
    🤖
  </span>
);

const SiteUrlsMenuIcon = () => (
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
    🔗
  </span>
);

const HelpMenuIcon = () => (
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
    💬
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
  console.info('[ALW admin] Customizations loaded · v0.9 (Help FAB static-mount)');

  // ═══ Floating Help FAB ═══
  // Mount HelpFab into a portal div on document.body so it floats above
  // every admin page (Quick Edit, Content Manager, Settings, edit views).
  // The FAB hides itself on /auth/ login pages. Survives Strapi SPA route
  // changes because it lives outside Strapi's React tree.
  //
  // STATIC imports (not dynamic) because Strapi v5's Vite build was not
  // resolving `import('react-dom/client')` reliably — the chunk loaded
  // but `createRoot` was sometimes undefined. Static imports are bundled
  // up front and always available.
  try {
    if (typeof document !== 'undefined' && !document.getElementById('alw-help-fab-root')) {
      const mount = document.createElement('div');
      mount.id = 'alw-help-fab-root';
      document.body.appendChild(mount);
      const root = createRoot(mount);
      // Render both the Help FAB and the mobile preview close button
      // into the same portal — they're both fixed-position overlays
      // and neither overlaps the other (Help FAB bottom-right, mobile
      // close top-right).
      root.render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(HelpFab),
          React.createElement(MobilePreviewClose),
        ),
      );
      // eslint-disable-next-line no-console
      console.info('[ALW admin] HelpFab + MobilePreviewClose mounted');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] HelpFab/MobilePreviewClose setup failed:', err);
  }

  // Browser tab title — replaces the default "Strapi Admin" wherever it shows.
  if (typeof document !== 'undefined') {
    document.title = 'Anna Lou Wellness CMS';
  }

  // ═══ Block editor link visibility ═══
  // Anna 21 Jul 2026: "backend also it is very difficult to know where I
  // have put in link — can it be underline or bold or something?"
  //
  // Strapi's block editor renders <a> tags for links but the default styling
  // doesn't visually differentiate them from surrounding text. Inject CSS
  // scoped to the block editor's contenteditable area to give links a plum
  // colour, thick underline, and subtle highlight background — obvious at
  // a glance even without hovering.
  //
  // Scoped to [contenteditable="true"] so it only affects the editor
  // itself, never the surrounding admin UI (Strapi uses <a> tags for
  // sidebar links, breadcrumbs, etc — those must stay untouched).
  try {
    if (typeof document !== 'undefined' && !document.getElementById('alw-block-editor-link-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'alw-block-editor-link-styles';
      styleEl.textContent = `
        [contenteditable="true"] a {
          color: #6E3A5A !important;
          text-decoration: underline !important;
          text-decoration-thickness: 2px !important;
          text-underline-offset: 2px !important;
          background: rgba(110, 58, 90, 0.10) !important;
          padding: 0 3px !important;
          border-radius: 2px !important;
          font-weight: 500 !important;
        }
        [contenteditable="true"] a:hover {
          background: rgba(110, 58, 90, 0.18) !important;
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] block-editor link style injection failed:', err);
  }

  // BetterDateInput app-level custom field. Per Strapi v5 docs, app-level
  // fields (registered here, not in a plugin) DO NOT specify pluginId —
  // omitting it puts the field in the 'global' namespace which schemas
  // reference as `global::alw-date`. The matching server-side
  // strapi.customFields.register({ name: 'alw-date', type: 'date' }) call
  // in src/index.js register() is what actually surfaces the field to
  // Strapi's schema validator — without it the CMS won't boot.
  try {
    (app as any).customFields?.register({
      name: 'alw-date',
      type: 'date',
      intlLabel: {
        id: 'alw.customField.date.label',
        defaultMessage: 'Date',
      },
      intlDescription: {
        id: 'alw.customField.date.description',
        defaultMessage: 'Native date picker — works reliably on every browser including Safari iOS.',
      },
      components: {
        Input: async () => ({ default: BetterDateInput }),
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] BetterDateInput custom field registration failed:', err);
  }

  // LinkPickerInput app-level custom field. Searchable dropdown of every
  // public URL (driven by /api/internal-routes/list). Use anywhere Anna
  // needs to pick a destination instead of typing one. Underlying column
  // is a regular string.
  try {
    (app as any).customFields?.register({
      name: 'alw-link-picker',
      type: 'string',
      intlLabel: {
        id: 'alw.customField.link.label',
        defaultMessage: 'Link',
      },
      intlDescription: {
        id: 'alw.customField.link.description',
        defaultMessage: 'Type to search every page on your site, or paste a custom URL (e.g. Calendly).',
      },
      components: {
        Input: async () => ({ default: LinkPickerInput }),
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] LinkPickerInput custom field registration failed:', err);
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

  // Auto SEO status panel — replaces the old "Generate SEO" button which
  // was broken on Strapi v5 (httpOnly cookie admin auth). Auto-SEO now fires
  // on every Save via cms/src/utils/auto-seo.js. This panel tells Anna the
  // workflow + auto-refreshes 10s after she saves so she sees the SEO copy
  // populate without having to manually F5.
  try {
    app.getPlugin('content-manager')?.injectComponent('editView', 'right-links', {
      name: 'AutoSeoStatusPanel',
      Component: AutoSeoStatusPanel,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] AutoSeoStatusPanel injection failed:', err);
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
    appAny.addMenuLink?.({
      to: '/alw-seo-files',
      icon: SeoFilesMenuIcon,
      intlLabel: { id: 'alw.menu.seo-files', defaultMessage: 'SEO & AI Files' },
      Component: async () => ({ default: SeoFilesPage }),
      permissions: [],
    });
    appAny.addMenuLink?.({
      to: '/alw-site-urls',
      icon: SiteUrlsMenuIcon,
      intlLabel: { id: 'alw.menu.site-urls', defaultMessage: 'Site URLs' },
      Component: async () => ({ default: SiteUrlsPage }),
      permissions: [],
    });
    appAny.addMenuLink?.({
      to: '/alw-help',
      icon: HelpMenuIcon,
      intlLabel: { id: 'alw.menu.help', defaultMessage: 'Help · Ask' },
      Component: async () => ({ default: ManualHelpPage }),
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
