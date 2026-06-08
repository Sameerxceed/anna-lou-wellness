'use strict';

/**
 * Seed Anna's per-page upsell mapping (from Sameer's 8 Jun message).
 *
 * For each programme/experience slug, populates the `upsells` field with
 * 2-3 "next step" cards pointing to the relevant offerings. Idempotent:
 * if an entry already has any upsells filled in, we leave it alone so
 * Anna's manual edits are never overwritten.
 *
 * Slugs referenced here must match the slug Anna gave each entry. If
 * a slug doesn't exist yet in the CMS this seed just skips it.
 *
 * Run at bootstrap from src/index.js.
 */

// Each card = { label, link, eyebrow?, blurb?, image? }
const UPSELL_CARD = (label, link, blurb, eyebrow = 'Go deeper') => ({
  label, link, eyebrow, blurb,
});

// Reusable cards keyed by destination so the same card looks consistent
// wherever it shows up.
const CARD = {
  REGULATED: UPSELL_CARD(
    'REGULATED',
    '/the-work/regulated',
    'The somatic art of staying anchored, open, and yourself in a dysregulating world. Pay what you feel.',
  ),
  RESET_ROOM: UPSELL_CARD(
    'The Reset Room',
    '/community/reset-room',
    'Monthly membership. Live calls, somatic library, a quiet room of women doing the work.',
  ),
  THE_RESET: UPSELL_CARD(
    'The Reset',
    '/the-work/the-reset',
    'Six weeks of one-to-one somatic coaching. Where most clients begin.',
  ),
  WORKSHOPS: UPSELL_CARD(
    'Workshops',
    '/experiences/workshops',
    'Group sessions on the houseboat, online, and in corporate spaces.',
  ),
  PENDULUM: UPSELL_CARD(
    'Pendulum Subconscious Healing',
    '/the-work/sessions/pendulum-subconscious-healing',
    'A standalone session for releasing patterns that talk-therapy can\'t reach.',
  ),
  SIGNAL_BUILD: UPSELL_CARD(
    'Signal & Build',
    '/the-work/signal-and-build',
    'Twelve weeks for founders. Nervous system and business strategy held together.',
  ),
  ONE_FOUNDER_DAY: UPSELL_CARD(
    'One Founder Heart-Led Strategy Day',
    '/the-work/one-day',
    'A single deep day on the boat. Strategy, nervous system, and the thing you\'re circling.',
  ),
  HOUSEBOAT_RETREATS: UPSELL_CARD(
    'Houseboat Retreats',
    '/experiences/retreats',
    'A few times a year, a small group comes to Taggs Island for a full reset day.',
  ),
  SIGNAL_COLLECTIVE: UPSELL_CARD(
    'The Signal Collective',
    '/the-work/signal-collective',
    'A small mastermind for women building from the body up.',
  ),
};

// slug -> array of upsell cards
const PROGRAMME_MAPPING = {
  'regulated': [CARD.RESET_ROOM, CARD.WORKSHOPS],
  'the-reset': [CARD.SIGNAL_BUILD, CARD.ONE_FOUNDER_DAY, CARD.HOUSEBOAT_RETREATS],
  'signal-and-build': [CARD.SIGNAL_COLLECTIVE, CARD.ONE_FOUNDER_DAY],
  'one-day': [CARD.SIGNAL_BUILD, CARD.SIGNAL_COLLECTIVE],
  'signal-collective': [CARD.HOUSEBOAT_RETREATS, CARD.ONE_FOUNDER_DAY],
  'pendulum-subconscious-healing': [CARD.THE_RESET, CARD.RESET_ROOM],
};

// experience-page sub-pages
const EXPERIENCE_PAGE_MAPPING = {
  'workshops': [CARD.RESET_ROOM, CARD.THE_RESET],
  'retreats': [CARD.THE_RESET, CARD.SIGNAL_BUILD],
  // Corporate Workshops shows NOTHING per Anna's mapping — explicit empty.
  'corporate-wellbeing': [],
};

// Membership is a singleton — no slug, but we keep the same key shape for
// clarity. The seeder special-cases singletons (entries are found by uid
// alone, not by slug filter).
const MEMBERSHIP_UPSELLS = [CARD.THE_RESET, CARD.PENDULUM];

// Decoder quiz singleton — same upsell field name, applied to all 3 results.
// We don't write to the quiz singleton here (it has its own per-result CTA).
// Anna's mapping for the Decoder page (REGULATED + Reset Room) is implicit
// in the Scrambled + Faint result CTAs which already point to REGULATED.

async function entryHasUpsells(entry) {
  return Array.isArray(entry?.upsells) && entry.upsells.length > 0;
}

async function seedFor(strapi, uid, slug, items) {
  try {
    const entry = await strapi.db.query(uid).findOne({
      where: { slug },
      populate: { upsells: true },
    });
    if (!entry) {
      strapi.log.info(`[seed-upsells] skip ${uid}/${slug} — no entry yet`);
      return;
    }
    if (await entryHasUpsells(entry)) {
      strapi.log.info(`[seed-upsells] skip ${slug} — already has upsells (Anna edited)`);
      return;
    }
    // Empty array case = Anna explicitly wants nothing here (corporate).
    // Only populate if items has entries; for empty mapping we still mark
    // by writing an empty array so we don't keep trying to seed.
    if (items.length === 0) {
      // Leaving genuinely empty — that's the intent for corporate-wellbeing.
      return;
    }
    await strapi.entityService.update(uid, entry.id, { data: { upsells: items } });
    strapi.log.info(`[seed-upsells] populated ${slug} with ${items.length} cards`);
  } catch (err) {
    strapi.log.warn(`[seed-upsells] ${slug} failed: ${err.message}`);
  }
}

async function seedSingleton(strapi, uid, items) {
  try {
    const entry = await strapi.entityService.findMany(uid, { populate: { upsells: true } });
    if (!entry) {
      strapi.log.info(`[seed-upsells] skip ${uid} — singleton not initialised`);
      return;
    }
    if (await entryHasUpsells(entry)) {
      strapi.log.info(`[seed-upsells] skip ${uid} — singleton already has upsells (Anna edited)`);
      return;
    }
    if (items.length === 0) return;
    await strapi.entityService.update(uid, entry.id, { data: { upsells: items } });
    strapi.log.info(`[seed-upsells] populated ${uid} singleton with ${items.length} cards`);
  } catch (err) {
    strapi.log.warn(`[seed-upsells] ${uid} singleton failed: ${err.message}`);
  }
}

async function seedUpsells(strapi) {
  for (const [slug, items] of Object.entries(PROGRAMME_MAPPING)) {
    await seedFor(strapi, 'api::programme.programme', slug, items);
  }
  for (const [slug, items] of Object.entries(EXPERIENCE_PAGE_MAPPING)) {
    await seedFor(strapi, 'api::experience-page.experience-page', slug, items);
  }
  await seedSingleton(strapi, 'api::reset-room-page.reset-room-page', MEMBERSHIP_UPSELLS);
}

module.exports = seedUpsells;
