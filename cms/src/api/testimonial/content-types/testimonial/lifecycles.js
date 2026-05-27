'use strict';

/**
 * Testimonial lifecycle — refresh every page that might surface this review.
 *
 * Reviews can appear on:
 *   - Experience detail pages (via experiences relation)
 *   - Section pages tagged with the matching enum value
 *   - Homepage (if is_featured)
 *
 * Easiest correct option: refresh the homepage + every section page that
 * might host a tagged review + the experiences hub. Cheaper than fetching
 * the entry's relations to compute exact paths.
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');

const TAG_PATHS = {
  retreats: '/experiences/retreats',
  workshops: '/experiences/workshops',
  corporate: '/experiences/corporate-wellbeing',
  speaking: '/experiences/speaking',
  coaching: '/the-work',
  'the-reset': '/the-work/the-reset',
  signal: '/the-work/signal',
  'signal-and-build': '/the-work/signal-and-build',
  'reset-room': '/reset-room',
  'one-day': '/the-work/one-day',
  collective: '/the-work/collective',
  'reset-session': '/the-work/reset-session',
};

function pathsForTestimonial(entry) {
  // Always refresh the dedicated testimonials wall + homepage + experiences hub
  const paths = new Set(['/', '/testimonials', '/experiences']);
  if (!entry) return Array.from(paths);
  const tagPath = TAG_PATHS[entry.tags];
  if (tagPath) paths.add(tagPath);
  // The experiences relation only contains IDs at lifecycle time without
  // an extra populate — safest to refresh all experience type pages.
  paths.add('/experiences/retreats');
  paths.add('/experiences/workshops');
  return Array.from(paths);
}

module.exports = {
  async afterCreate(event) {
    await notifyRevalidate(strapi, pathsForTestimonial(event.result));
  },
  async afterUpdate(event) {
    await notifyRevalidate(strapi, pathsForTestimonial(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsForTestimonial(event.result));
  },
};
