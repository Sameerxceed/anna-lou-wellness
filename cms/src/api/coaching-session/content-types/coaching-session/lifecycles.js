'use strict';

const { notifyRevalidate } = require('../../../../utils/revalidate');
const autoSeo = require('../../../../utils/auto-seo');

const SEO_FIELDS = { nameFields: ['name'], bodyFields: ['description', 'tagline', 'duration', 'price_label'] };

function pathsFor(session) {
  const paths = ['/', '/the-work', '/the-work/sessions'];
  if (session?.slug) paths.push(`/the-work/sessions/${session.slug}`);
  return paths;
}

module.exports = {
  async afterCreate(event) {
    autoSeo.runAfter(event, 'api::coaching-session.coaching-session', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterUpdate(event) {
    autoSeo.runAfter(event, 'api::coaching-session.coaching-session', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterDelete(event) { await notifyRevalidate(strapi, pathsFor(event.result)); },
};
