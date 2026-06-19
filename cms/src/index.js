'use strict';

/**
 * Strapi Bootstrap — runs on first start
 *
 * Sets up:
 * - Public API permissions for frontend
 * - Authenticated user permissions for commerce
 */

module.exports = {
  register({ strapi }) {
    // Register the BetterDateInput app-level custom field on the SERVER.
    // Per Strapi v5 docs (https://docs.strapi.io/cms/features/custom-fields):
    //   - APP-LEVEL custom fields (those registered in src/index.js)
    //     DO NOT specify a `plugin` — leaving it out marks the field as
    //     belonging to the 'global' namespace.
    //   - Schemas then reference it as `global::alw-date` (NOT
    //     `plugin::global.alw-date` which was my first-attempt bug).
    // The `type` field determines the underlying column type. 'date' means
    // existing date columns are reused unchanged — only the admin React
    // input swaps to BetterDateInput.
    try {
      strapi.customFields.register({
        name: 'alw-date',
        type: 'date',
      });
    } catch (err) {
      strapi.log.warn(`[ALW] custom field alw-date register failed: ${err.message}`);
    }

    // App-level custom field: alw-link-picker. Stores a URL string but
    // renders as a searchable dropdown of every page on the site (driven
    // by /api/internal-routes/list). Anna picks instead of typing.
    // Underlying column is a regular string — same as a normal text field.
    try {
      strapi.customFields.register({
        name: 'alw-link-picker',
        type: 'string',
      });
    } catch (err) {
      strapi.log.warn(`[ALW] custom field alw-link-picker register failed: ${err.message}`);
    }
  },

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
        'api::testimonials-page.testimonials-page',
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
        // /free/nervous-system-decoder/quiz hero + 3 nervous-system state results
        'api::decoder-quiz-page.decoder-quiz-page',
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
        'api::practitioner.practitioner',
        'api::practitioners-page.practitioners-page',
        'api::press-mention.press-mention',
        'api::certification.certification',
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

      // ── Public create/update APIs ──
      // Order creation is owned by the Next.js /api/checkout route using the
      // admin API token, NOT public. Anyone POSTing /api/orders directly would
      // bypass payment validation. Coupon findOne is public so /api/coupon/validate
      // (Next.js) can read it via its admin token's read fall-through.
      const publicWriteAPIs = [
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

      // Actively REVOKE any previously-granted public-write permissions that
      // the legacy template granted. Without this, removing entries above
      // does nothing on existing installs — the rows persist in the DB.
      const revokedPublicActions = [
        'api::order.order.create',
        'api::cart.cart.find',
        'api::cart.cart.findOne',
        'api::cart.cart.create',
        'api::cart.cart.update',
      ];
      for (const action of revokedPublicActions) {
        try {
          await strapi.query('plugin::users-permissions.permission').deleteMany({
            where: { action, role: publicRole.id },
          });
        } catch (err) {
          strapi.log.warn(`Could not revoke ${action}: ${err.message}`);
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

    // ═══ Seed per-page FAQs (idempotent — skips any page Anna has already populated) ═══
    try {
      const seedFAQs = require('./seed-faqs');
      await seedFAQs(strapi);
    } catch (err) {
      strapi.log.warn('[seed-faqs] failed:', err.message);
    }

    // ═══ Seed transactional email templates (idempotent — never overwrites edits) ═══
    try {
      const { seedEmailTemplates } = require('./seed-email-templates');
      await seedEmailTemplates(strapi);
    } catch (err) {
      strapi.log.warn('[seed-email-templates] failed:', err.message);
    }

    // ═══ Seed editorial sub-category entries (idempotent — skips existing slugs) ═══
    // Without these, the sub-category URLs in the main nav (e.g.
    // /love-and-relationships/motherhood) fall through to a 404 placeholder
    // because no article-category record exists with the slug from the nav.
    try {
      const seedArticleCategories = require('./seed-article-categories');
      await seedArticleCategories(strapi);
    } catch (err) {
      strapi.log.warn('[seed-article-categories] failed:', err.message);
    }

    // ═══ One-shot cleanup of orphan article categories ═══
    // Categories that existed from earlier seeds but are no longer in the
    // live nav (web/src/data/site.ts). Removing them so Anna's Category
    // dropdown only shows the 18 categories that actually correspond to
    // navigable URLs on the public site. Idempotent — delete-if-exists,
    // safe to leave in place across future redeploys.
    try {
      const ORPHAN_SLUGS = [
        'houseboat-life',
        'spiritual-hygiene',
        'decluttering',
        'educational',
      ];
      let removed = 0;
      for (const slug of ORPHAN_SLUGS) {
        const matches = await strapi.entityService.findMany(
          'api::article-category.article-category',
          { filters: { slug }, limit: 1 },
        );
        if (matches && matches.length > 0) {
          await strapi.entityService.delete(
            'api::article-category.article-category',
            matches[0].id,
          );
          removed++;
          strapi.log.info(`[cleanup-orphan-categories] removed "${slug}"`);
        }
      }
      if (removed > 0) {
        strapi.log.info(`[cleanup-orphan-categories] done — removed ${removed}`);
      }
    } catch (err) {
      strapi.log.warn('[cleanup-orphan-categories] failed:', err.message);
    }

    // ═══ Seed Decoder Quiz singleton (idempotent — skips if results exist) ═══
    // Populates the 3 nervous-system state result blurbs so the live quiz at
    // /free/nervous-system-decoder/quiz works end-to-end on first boot.
    // Anna replaces the placeholder copy in Strapi when she's ready.
    try {
      const seedDecoderQuiz = require('./seed-decoder-quiz');
      await seedDecoderQuiz(strapi);
    } catch (err) {
      strapi.log.warn('[seed-decoder-quiz] failed:', err.message);
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

    // ═══ Trim verbose homepage paragraphs (Anna's 5 Jun feedback) ═══
    // Conditional, idempotent — only rewrites a field if it still holds the
    // pre-trim verbose default. Becomes a no-op once Anna has edited it.
    try {
      const trimHomepageCopy = require('./trim-homepage-copy');
      await trimHomepageCopy(strapi);
    } catch (err) {
      strapi.log.warn('[trim-homepage-copy] failed:', err.message);
    }

    // ═══ Seed Anna's 8 Jun per-page upsell mapping ═══
    // Decoder/REGULATED/Reset Room/etc. each get their explicit "next step"
    // cards. Idempotent — never overwrites Anna's manual edits.
    try {
      const seedUpsells = require('./seed-upsells');
      await seedUpsells(strapi);
    } catch (err) {
      strapi.log.warn('[seed-upsells] failed:', err.message);
    }

    // ═══ Seed REGULATED sales page (Page entry slug='regulated') ═══
    // Builds the full editorial sales page from Anna's 8 Jun HTML mockup
    // (Docs/REGULATED-sales-page-preview.html). Idempotent: skips if a
    // Page with slug 'regulated' already exists.
    try {
      const seedRegulatedSalesPage = require('./seed-regulated-sales-page');
      await seedRegulatedSalesPage(strapi);
    } catch (err) {
      strapi.log.warn('[seed-regulated-sales-page] failed:', err.message);
    }
  },

  destroy(/* { strapi } */) {},
};
