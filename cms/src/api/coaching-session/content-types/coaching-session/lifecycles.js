'use strict';

const { notifyRevalidate } = require('../../../../utils/revalidate');

function pathsFor(session) {
  const paths = ['/', '/the-work', '/the-work/sessions'];
  if (session?.slug) paths.push(`/the-work/sessions/${session.slug}`);
  return paths;
}

module.exports = {
  async afterCreate(event) { await notifyRevalidate(strapi, pathsFor(event.result)); },
  async afterUpdate(event) { await notifyRevalidate(strapi, pathsFor(event.result)); },
  async afterDelete(event) { await notifyRevalidate(strapi, pathsFor(event.result)); },
};
