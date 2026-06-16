'use strict';
const { notifyRevalidate } = require('../../../../utils/revalidate');

const pageToPath = {
  'the-reset': '/the-work/the-reset',
  'signal': '/the-work/signal',
  'signal-and-build': '/the-work/signal-and-build',
  'one-day': '/the-work/one-day',
  'signal-collective': '/the-work/signal-collective',
  'sessions': '/the-work/sessions',
  'recovery': '/the-work/recovery',
  'quiz': '/the-work/quiz',
  'the-work': '/the-work',
  'retreats': '/experiences/retreats',
  'workshops': '/experiences/workshops',
  'corporate-wellbeing': '/experiences/corporate-wellbeing',
  'speaking': '/experiences/speaking',
  'reset-room': '/community/reset-room',
  'the-returning-circle': '/community/the-returning-circle',
  'membership': '/community/membership',
  'events': '/community/events',
  'resources': '/community/resources',
  'shop': '/shop',
  'about': '/about',
  'contact': '/contact',
  'testimonials': '/testimonials',
  'ask-anna': '/ask-anna',
  'decoder': '/free/nervous-system-decoder',
  'practitioners': '/practitioners',
  'regulated': '/the-work/regulated',
  'reset-stories': '/reset-stories',
  'life': '/life',
  'love-and-relationships': '/love-and-relationships',
  'work-and-money': '/work-and-money',
};

function pathFor(entry) {
  const data = entry?.params?.data || entry?.result || {};
  const page = data.page || entry?.result?.page;
  return pageToPath[page] || '/the-work';
}

module.exports = {
  afterCreate: async (event) => notifyRevalidate(global.strapi, [pathFor(event)]),
  afterUpdate: async (event) => notifyRevalidate(global.strapi, [pathFor(event)]),
  afterDelete: async (event) => notifyRevalidate(global.strapi, [pathFor(event)]),
};
