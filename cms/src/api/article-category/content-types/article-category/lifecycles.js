'use strict';

/**
 * Article Category lifecycle — refresh section landing + category sub-pages
 * when a category's name / colour / slug / order changes.
 *
 * Sub-menu pills on each section page are derived from categories, so any
 * category change should refresh the parent section landing.
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');

const SECTION_PATHS = {
  'reset-stories': '/reset-stories',
  'life': '/life',
  'love-and-relationships': '/love-and-relationships',
  'work-and-money': '/work-and-money',
};

function pathsForCategory(category) {
  const paths = ['/'];
  if (!category) return paths;
  const sectionPath = SECTION_PATHS[category.section];
  if (sectionPath) {
    paths.push(sectionPath);
    if (category.slug) paths.push(`${sectionPath}/${category.slug}`);
  }
  return paths;
}

module.exports = {
  async afterCreate(event) {
    await notifyRevalidate(strapi, pathsForCategory(event.result));
  },
  async afterUpdate(event) {
    await notifyRevalidate(strapi, pathsForCategory(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsForCategory(event.result));
  },
};
