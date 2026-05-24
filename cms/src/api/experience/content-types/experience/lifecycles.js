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
  return paths;
}

module.exports = {
  async afterCreate(event) {
    await notifyRevalidate(strapi, pathsForExperience(event.result));
  },
  async afterUpdate(event) {
    await notifyRevalidate(strapi, pathsForExperience(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsForExperience(event.result));
  },
};
