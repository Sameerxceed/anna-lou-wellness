'use strict';

const { notifyRevalidate } = require('../../../../utils/revalidate');
const autoSeo = require('../../../../utils/auto-seo');

const SEO_FIELDS = { nameFields: ['title'], bodyFields: ['tagline', 'intro', 'whatsIncludedItems', 'approachBody', 'outcomesBody'] };

function pathsFor(programme) {
  const paths = ['/', '/the-work'];
  if (programme?.slug) paths.push(`/the-work/${programme.slug}`);
  return paths;
}

module.exports = {
  async afterCreate(event) {
    autoSeo.runAfter(event, 'api::programme.programme', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterUpdate(event) {
    autoSeo.runAfter(event, 'api::programme.programme', SEO_FIELDS);
    await notifyRevalidate(strapi, pathsFor(event.result));
  },
  async afterDelete(event) { await notifyRevalidate(strapi, pathsFor(event.result)); },
};
