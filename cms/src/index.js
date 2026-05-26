'use strict';

/**
 * Strapi Bootstrap — runs on first start
 *
 * Sets up:
 * - Public API permissions for frontend
 * - Authenticated user permissions for commerce
 */

module.exports = {
  register(/* { strapi } */) {},

  async bootstrap({ strapi }) {
    // ═══ Set up Public API permissions ═══
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });

    if (publicRole) {
      // ── Public read-only APIs ──
      const publicReadAPIs = [
        // Page singleTypes
        'api::homepage.homepage',
        'api::about-page.about-page',
        'api::community-page.community-page',
        'api::contact-page.contact-page',
        'api::reset-room-page.reset-room-page',
        'api::membership-page.membership-page',
        'api::reset-letters-page.reset-letters-page',
        'api::decoder-page.decoder-page',
        'api::site-settings.site-settings',
        // Site chrome singletons — the frontend reads these on every page;
        // without public read access the frontend silently falls back to
        // hardcoded data in web/src/data/site.ts (which was the root cause
        // of "live site shows 6 sub-menu items but CMS has 3" — fallback
        // was being used because the public role couldn't read /navigation).
        'api::navigation.navigation',
        'api::footer.footer',
        // Section landing pages — one per main menu item. Without these
        // the section pages render hardcoded copy from the *Page.tsx files
        // and Anna's CMS edits don't appear on the live site.
        'api::reset-stories-page.reset-stories-page',
        'api::life-page.life-page',
        'api::love-and-relationships-page.love-and-relationships-page',
        'api::work-and-money-page.work-and-money-page',
        'api::work-with-anna-page.work-with-anna-page',
        'api::shop-page.shop-page',
        // Shop sub-pages (new-in, personalised, ESJ)
        'api::shop-new-in-page.shop-new-in-page',
        'api::shop-personalised-page.shop-personalised-page',
        'api::shop-esj-page.shop-esj-page',
        // Experiences landing (top-level /experiences page)
        'api::experiences-landing-page.experiences-landing-page',
        // /the-work/sessions hero copy (cards come from Coaching Session collection)
        'api::sessions-hub-page.sessions-hub-page',
        // /the-work/quiz hero copy + 6 result blurbs (questions stay in code)
        'api::quiz-page.quiz-page',
        // Editorial / collection
        'api::article.article',
        'api::article-category.article-category',
        'api::programme.programme',
        'api::experience-page.experience-page',
        'api::community-event-page.community-event-page',
        'api::generic-page.generic-page',
        'api::team-member.team-member',
        'api::page.page',
        'api::mantra.mantra',
        'api::cosmic-forecast.cosmic-forecast',
        'api::experience.experience',
        'api::testimonial.testimonial',
        'api::event.event',
        'api::faq.faq',
        // Commerce (legacy from templates)
        'api::product.product',
        'api::product-category.product-category',
        'api::product-variant.product-variant',
        'api::product-option.product-option',
        'api::product-review.product-review',
        'api::shipping-zone.shipping-zone',
        'api::shipping-method.shipping-method',
        'api::tax-rule.tax-rule',
        'api::currency-rate.currency-rate',
      ];

      for (const api of publicReadAPIs) {
        for (const action of ['find', 'findOne']) {
          try {
            await strapi.query('plugin::users-permissions.permission').create({
              data: { action: `${api}.${action}`, role: publicRole.id },
            });
          } catch (err) { /* Permission may already exist */ }
        }
      }

      // ── Public create/update APIs (guest checkout, cart, coupon validation) ──
      const publicWriteAPIs = [
        { api: 'api::order.order', actions: ['create'] },
        { api: 'api::cart.cart', actions: ['find', 'findOne', 'create', 'update'] },
        { api: 'api::coupon.coupon', actions: ['findOne'] },
      ];

      for (const { api, actions } of publicWriteAPIs) {
        for (const action of actions) {
          try {
            await strapi.query('plugin::users-permissions.permission').create({
              data: { action: `${api}.${action}`, role: publicRole.id },
            });
          } catch (err) { /* Permission may already exist */ }
        }
      }

      strapi.log.info('Public API permissions configured');
    }

    // ═══ Authenticated user permissions ═══
    if (authenticatedRole) {
      const authAPIs = [
        { api: 'api::customer.customer', actions: ['find', 'findOne', 'create', 'update'] },
        { api: 'api::wishlist-item.wishlist-item', actions: ['find', 'create', 'delete'] },
        { api: 'api::product-review.product-review', actions: ['create'] },
        { api: 'api::return-request.return-request', actions: ['find', 'create'] },
        { api: 'api::order.order', actions: ['find', 'findOne'] },
      ];

      for (const { api, actions } of authAPIs) {
        for (const action of actions) {
          try {
            await strapi.query('plugin::users-permissions.permission').create({
              data: { action: `${api}.${action}`, role: authenticatedRole.id },
            });
          } catch (err) { /* Permission may already exist */ }
        }
      }

      strapi.log.info('Authenticated API permissions configured');
    }

    // ═══ Reset Room member role ═══
    let resetRoomRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'reset-room-member' },
    });

    if (!resetRoomRole) {
      resetRoomRole = await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: 'Reset Room Member',
          description: 'Paid £25/mo Reset Room subscriber. Access to dashboard, vault, replays, account.',
          type: 'reset-room-member',
        },
      });
      strapi.log.info('Created reset-room-member role');
    }

    if (resetRoomRole) {
      // Members can read their own customer record + read vault journeys
      const memberAPIs = [
        { api: 'api::customer.customer', actions: ['find', 'findOne', 'update'] },
        { api: 'api::vault-journey.vault-journey', actions: ['find', 'findOne'] },
        { api: 'api::workshop-replay.workshop-replay', actions: ['find', 'findOne'] },
      ];
      for (const { api, actions } of memberAPIs) {
        for (const action of actions) {
          try {
            await strapi.query('plugin::users-permissions.permission').create({
              data: { action: `${api}.${action}`, role: resetRoomRole.id },
            });
          } catch (err) { /* exists */ }
        }
      }
      strapi.log.info('Reset Room member permissions configured');
    }

    strapi.log.info('CMS ready');

    // ═══ Seed placeholder content on first boot ═══
    const seedDatabase = require('./seed');
    await seedDatabase(strapi);

    // ═══ Seed page-content collections (idempotent — runs every boot, only fills gaps) ═══
    try {
      const seedPages = require('./seed-pages');
      await seedPages(strapi);
    } catch (err) {
      strapi.log.warn('[seed-pages] failed:', err.message);
    }

    // ═══ Set media upload descriptions ═══
    try {
      const setMediaDescriptions = require('./media-guide');
      await setMediaDescriptions(strapi);
    } catch (err) {
      // media-guide is optional
    }

    // ═══ Seed friendly field labels in admin Content Manager ═══
    // Without this, fields show as raw camelCase (heroKicker instead of
    // "Hero kicker"). Anna flagged this on the Homepage edit screen.
    // Auto-discovers every api::* content type so menu / sub-menu / footer /
    // landing pages / articles / orders all get friendly labels in one pass.
    try {
      const seedFieldLabels = require('./seed-field-labels');
      await seedFieldLabels(strapi);
    } catch (err) {
      strapi.log.warn('[seed-field-labels] failed:', err.message);
    }
  },

  destroy(/* { strapi } */) {},
};
