'use strict';

/**
 * One-time seed for the 1 to 1 chat fields on the Contact singleton.
 * Populates Anna's default copy (from her 10 Jul Onenote) so the flow
 * shows up on /contact immediately after this ships.
 *
 * Idempotent: only writes fields that are currently blank. Anna's edits
 * survive future deploys.
 */

const DEFAULTS = {
  discovery_headline: 'Book a 15-minute 1 to 1 chat',
  discovery_intro: 'Booking costs £10, refunded straight after we speak.',
  discovery_button_label: 'Book my call',
  discovery_price_gbp: 10,
  discovery_stripe_product_name: '1 to 1 chat booking',
  discovery_stripe_description:
    'This £10 is refunded straight after your 1 to 1 chat. No forms, no chasing.',
  discovery_calendly_url: '',
  discovery_why_price_label: 'Why £10?',
  discovery_why_price_body:
    'You get it back. Straight after we speak. No forms, no chasing.\n\n' +
    'Here is why it is there. Free calls have a strange effect on the human mind. ' +
    'Something that costs nothing gets treated as though it is worth nothing, and ' +
    'diaries quietly fill with people who were absolutely going to come, and then ' +
    'Wednesday happened.\n\n' +
    'Ten pounds is not a barrier. It is a piece of string tied to your ankle. The ' +
    'smallest possible amount of skin in the game, and it does the job beautifully.\n\n' +
    'Show up, and it goes back to you. Do not, and I will have a coffee and think ' +
    'fondly of you.',
};

async function seedDiscoveryCall(strapi) {
  const uid = 'api::contact-page.contact-page';
  let entry;
  try {
    entry = await strapi.entityService.findMany(uid);
  } catch (err) {
    strapi.log.warn('[seed-discovery-call] load failed:', err.message);
    return;
  }

  // Singleton — findMany on a singleType returns the record (or null).
  // Some Strapi builds return an array; normalise.
  if (Array.isArray(entry)) entry = entry[0];
  if (!entry) {
    // Create the singleton with the defaults if it doesn't exist yet.
    try {
      await strapi.entityService.create(uid, {
        data: { ...DEFAULTS, publishedAt: new Date() },
      });
      strapi.log.info('[seed-discovery-call] created Contact singleton with 1 to 1 chat defaults');
    } catch (err) {
      strapi.log.warn('[seed-discovery-call] create failed:', err.message);
    }
    return;
  }

  // Only fill BLANK fields. Anna's edits survive.
  const patch = {};
  for (const [k, v] of Object.entries(DEFAULTS)) {
    const cur = entry[k];
    const blank =
      cur == null ||
      (typeof cur === 'string' && cur.trim() === '') ||
      (typeof cur === 'number' && cur === 0 && k !== 'discovery_price_gbp');
    if (blank && v !== '') patch[k] = v;
  }

  if (Object.keys(patch).length === 0) {
    strapi.log.info('[seed-discovery-call] Contact singleton already has 1 to 1 chat copy - skipping');
    return;
  }

  try {
    // Documents API for singletons in Strapi v5. Write to both draft
    // and published so the copy is live on the site right after deploy.
    const documentId = entry.documentId;
    if (documentId) {
      await strapi.documents(uid).update({ documentId, data: patch, status: 'draft' });
      try {
        await strapi.documents(uid).update({ documentId, data: patch, status: 'published' });
      } catch { /* published may not exist yet */ }
    } else {
      await strapi.entityService.update(uid, entry.id, { data: patch });
    }
    strapi.log.info(
      `[seed-discovery-call] filled blank fields: ${Object.keys(patch).join(', ')}`,
    );
  } catch (err) {
    strapi.log.warn('[seed-discovery-call] update failed:', err.message);
  }
}

module.exports = seedDiscoveryCall;
