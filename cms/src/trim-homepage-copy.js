'use strict';

/**
 * One-time migration: trim the four longest homepage body paragraphs Anna
 * flagged on 5 Jun ("home page text to go elsewhere as it's too much text
 * and not like Cup of Jo").
 *
 * Strategy: only overwrite a field IF its current value exactly equals the
 * pre-trim verbose text. Never clobber a custom Anna edit. Once Anna has
 * touched a field, this migration becomes a no-op forever for that field.
 *
 * Safe to re-run on every boot. Logs which fields changed (or none) for
 * traceability.
 */

const OLD_TO_NEW = {
  heroBody: {
    old:
      'What does it actually feel like to live in full alignment with who you are? Not the managed version. Not the performing one. The whole one. We are exploring that here, through honest stories, real practices, and a life beautifully lived.',
    new:
      'Honest stories, real practices, and a life beautifully lived — for women coming back to themselves.',
  },
  workBody1: {
    old:
      'Most people arrive here after trying everything else. The therapy. The journalling. The courses. The spiritual work. Getting all the way to the insight, and then hitting the same wall. This work meets you in the body, where the patterns actually live.',
    new:
      'This work meets you in the body, where the patterns actually live. The Signal Method™ is the umbrella — programmes underneath for each stage of the journey.',
  },
  workBody2: {
    old:
      'The Signal Method™ is the umbrella for all the coaching work here. Underneath it sit the programmes, each designed for a different stage of the journey.',
    // workBody1 now carries the merged message; workBody2 collapses to empty.
    new: '',
  },
  shopBody: {
    old:
      'I have been designing jewellery for over twenty-five years. What I have learned, across all of that, is that the pieces that actually matter are not the most expensive ones. They are the ones you reach for in hard moments. The ones that remind you.',
    new:
      'Twenty-five years of jewellery design. The pieces that matter are the ones you reach for in hard moments — the ones that remind you.',
  },
};

async function trimHomepageCopy(strapi) {
  try {
    const existing = await strapi.entityService.findMany('api::homepage.homepage');
    if (!existing) {
      strapi.log.info('[trim-homepage-copy] no homepage row yet — seed will create the trimmed version');
      return;
    }

    const updates = {};
    const changed = [];
    const kept = [];
    for (const [field, { old: oldVal, new: newVal }] of Object.entries(OLD_TO_NEW)) {
      const current = existing[field];
      if (current === oldVal) {
        updates[field] = newVal;
        changed.push(field);
      } else if (current === newVal) {
        // already trimmed (re-run case)
      } else {
        kept.push(field);
      }
    }

    if (Object.keys(updates).length === 0) {
      strapi.log.info(
        `[trim-homepage-copy] no changes (Anna already edited: ${kept.join(', ') || 'none'})`,
      );
      return;
    }

    await strapi.entityService.update('api::homepage.homepage', existing.id, { data: updates });
    strapi.log.info(
      `[trim-homepage-copy] trimmed ${changed.join(', ')}; preserved Anna's edits on ${kept.join(', ') || 'none'}`,
    );
  } catch (err) {
    strapi.log.warn('[trim-homepage-copy] failed:', err.message);
  }
}

module.exports = trimHomepageCopy;
