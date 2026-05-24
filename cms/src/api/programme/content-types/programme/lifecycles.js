'use strict';

const { notifyRevalidate } = require('../../../../utils/revalidate');

function pathsFor(programme) {
  const paths = ['/', '/the-work'];
  if (programme?.slug) paths.push(`/the-work/${programme.slug}`);
  return paths;
}

module.exports = {
  async afterCreate(event) { await notifyRevalidate(strapi, pathsFor(event.result)); },
  async afterUpdate(event) { await notifyRevalidate(strapi, pathsFor(event.result)); },
  async afterDelete(event) { await notifyRevalidate(strapi, pathsFor(event.result)); },
};
