'use strict';

/**
 * Experience lifecycle — refresh experience pages on every change.
 *
 * CRITICAL: stale retreat/workshop data can mean bookings made for
 * cancelled dates, wrong prices, sold-out events still bookable.
 * Refresh aggressively.
 *
 * Paths refreshed:
 *   /experiences            — main listing (upcoming-events grid)
 *   /experiences/retreats   — if type=retreat
 *   /experiences/workshops  — if type=workshop
 *   /experiences/corporate-wellbeing  — if type=corporate
 *   /experiences/speaking   — if type=speaking
 *   /                       — homepage (may show featured experiences)
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');
const autoSeo = require('../../../../utils/auto-seo');

const SEO_FIELDS = { nameFields: ['name', 'title'], bodyFields: ['description', 'tagline', 'priceLabel', 'location'] };

const TYPE_PATHS = {
  retreat: '/experiences/retreats',
  workshop: '/experiences/workshops',
  corporate: '/experiences/corporate-wellbeing',
  speaking: '/experiences/speaking',
};

function pathsForExperience(experience) {
  const paths = ['/', '/experiences'];
  if (!experience) return paths;
  const subPath = TYPE_PATHS[experience.type];
  if (subPath) paths.push(subPath);
  // Each Experience now has its own /experiences/[slug] sales/booking page
  // (added 11 Jun in response to Anna's 10 Jun feedback). Refresh it on
  // every save so price / date / sales copy changes go live in 1-2 seconds.
  if (experience.slug) paths.push(`/experiences/${experience.slug}`);
  return paths;
}

module.exports = {
  async afterCreate(event) {
    autoSeo.runAfter(event, 'api::experience.experience', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsForExperience(event.result));
  },
  async afterUpdate(event) {
    autoSeo.runAfter(event, 'api::experience.experience', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsForExperience(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsForExperience(event.result));
  },
};
