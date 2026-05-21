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
 *  ✅ 4. Quick-edit dashboard — grid of clickable cards (one per menu page)
 *  ⏳ 5. Sidebar tree — Windows-Explorer-style expandable groups
 *  ⏳ 6. Inline preview-edit affordances
 *
 * Pattern note: every customization here belongs to the Xceed CMS template,
 * not Anna specifically. Anna-specific branding (the actual hex codes, image
 * paths) lives in this file but should be parameterised via env vars or a
 * client-config import in the future template.
 */

import type { StrapiApp } from '@strapi/strapi/admin';
import SectionFilterPills from './extensions/SectionFilterPills';
import QuickEditDashboard from './extensions/QuickEditDashboard';

const config = {
  locales: ['en'],
  translations: {
    en: {
      // Friendlier landing — "Hello Anna" stays useful but loses corporate tone
      'app.components.HomePage.welcome': 'Welcome back',
      'app.components.HomePage.welcome.again': 'Welcome back',
      'app.components.LeftMenu.navbrand.title': 'Anna Lou Wellness',
      'app.components.LeftMenu.navbrand.workplace': 'Content Studio',
      'Settings.application.title': 'Anna Lou Wellness — CMS',
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
  console.info('[ALW admin] Customizations loaded · v0.3 (pills + dashboard)');

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

  // Quick-edit dashboard — register as a widget on the admin homepage if
  // Strapi v5's widget API exposes the method. Falls back silently if not.
  // The component is also exported separately so we can render it via a
  // custom menu link in a follow-up if widget registration isn't available
  // on this Strapi version.
  try {
    const anyApp = app as unknown as { widgets?: { register?: (w: unknown) => void } };
    anyApp.widgets?.register?.({
      uid: 'alw.quick-edit-dashboard',
      name: { id: 'alw.quick-edit', defaultMessage: 'Quick Edit' },
      icon: undefined,
      component: () => Promise.resolve({ default: QuickEditDashboard }),
      permissions: [],
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ALW admin] QuickEditDashboard widget registration failed:', err);
  }
};

export default { config, bootstrap };
