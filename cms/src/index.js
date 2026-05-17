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
        'api::reset-letters-page.reset-letters-page',
        'api::decoder-page.decoder-page',
        'api::site-settings.site-settings',
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
  },

  destroy(/* { strapi } */) {},
};
