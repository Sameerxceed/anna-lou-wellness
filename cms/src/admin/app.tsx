/**
 * Strapi admin customizations.
 *
 * This file is bundled into the admin panel build. Anything we put here
 * is invisible to the public site and only affects the CMS editor UI.
 *
 * Roadmap (incremental, each one stand-alone safe):
 *  ✅ 1. Translations — replace generic Strapi labels with Anna-friendly copy
 *  ✅ 2. Theme — light tweaks to match Anna's brand (plum accent)
 *  ✅ 3. Branding — auth logo + menu logo + favicon from /brand assets
 *  ⏳ 4. List-view injection — Section filter pills on Story · Category
 *  ⏳ 5. Custom homepage dashboard — section quick-links instead of generic widgets
 *  ⏳ 6. Sidebar tree — Windows-Explorer-style expandable groups
 *  ⏳ 7. Inline preview-edit affordances
 *
 * Pattern note: every customization here belongs to the Xceed CMS template,
 * not Anna specifically. Anna-specific branding (the actual hex codes, image
 * paths) lives in this file but should be parameterised via env vars or a
 * client-config import in the future template.
 */

import type { StrapiApp } from '@strapi/strapi/admin';

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
  console.info('[ALW admin] Customizations loaded · v0.1');

  // Future Content Manager injections will go here. Example:
  //
  // app.getPlugin('content-manager')?.injectComponent('listView', 'actions', {
  //   name: 'SectionFilterPills',
  //   Component: SectionFilterPills,
  // });
  //
  // Keeping the bootstrap minimal for now until we confirm the build pipeline
  // is healthy. Add injections one at a time, each verified before next.
  void app;
};

export default { config, bootstrap };
