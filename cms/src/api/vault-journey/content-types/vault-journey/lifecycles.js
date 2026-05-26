'use strict';

/**
 * Vault journey lifecycle — refresh the vault list AND the specific
 * journey detail page on every change.
 *
 * Members are paying £25/month for this content; stale cache means
 * "new journey released, members can't see it" — refresh aggressively.
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');

function pathsForJourney(journey) {
  const paths = ['/community/reset-room/vault'];
  if (journey?.slug) paths.push(`/community/reset-room/vault/${journey.slug}`);
  return paths;
}

module.exports = {
  async afterCreate(event) {
    await notifyRevalidate(strapi, pathsForJourney(event.result));
  },
  async afterUpdate(event) {
    await notifyRevalidate(strapi, pathsForJourney(event.result));
  },
  async afterDelete(event) {
    await notifyRevalidate(strapi, pathsForJourney(event.result));
  },
};
