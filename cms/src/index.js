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
        'api::homepage.homepage',
        'api::garden.garden',
        'api::bloom-month.bloom-month',
        'api::visit-option.visit-option',
        'api::cottage.cottage',
        'api::product.product',
        'api::product-category.product-category',
        'api::event.event',
        'api::wedding-venue.wedding-venue',
        'api::team-member.team-member',
        'api::contact-page.contact-page',
        'api::site-settings.site-settings',
        'api::page.page',
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

    strapi.log.info('CMS ready');

    // ═══ Seed placeholder content on first boot ═══
    const seedDatabase = require('./seed');
    await seedDatabase(strapi);

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
