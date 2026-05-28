'use strict';

/**
 * Idempotent seed for the Decoder Quiz singleton.
 *
 * On first boot, populates the 3 nervous-system state results so Anna sees
 * a fully-formed page in Strapi (and the live /free/nervous-system-decoder/quiz
 * page works end-to-end with real-looking copy).
 *
 * Skips if the singleton already has 3 results (so re-runs don't trample
 * Anna's edits).
 */

const PLACEHOLDER_RESULTS = [
  {
    state: 'ventral',
    title: 'Your signal: Ventral. You are mostly grounded right now.',
    blurb:
      "Your nervous system is in its ventral vagal state — the place from which you connect, rest, create, and engage. This does not mean nothing is hard; it means you have the inner resource to meet what is.\n\nProtect this state. It is the foundation everything else gets built on.",
    practice_intro: 'A short practice to deepen the regulation you already have:',
    meditation_url: '',
    cta_label: 'Step inside REGULATED',
    cta_url: '/the-work/regulated',
  },
  {
    state: 'sympathetic',
    title: 'Your signal: Sympathetic. You are activated — fight or flight.',
    blurb:
      'Your nervous system has moved into sympathetic activation. The body reads the current environment as something to push against, push through, or run from. Cortisol is high, breath is shallow, jaw and shoulders likely tight.\n\nThis is not a flaw — it is your system trying to keep you safe. The work is to let the activation discharge so you can come back down to ventral.',
    practice_intro: 'A 5-minute practice to discharge the activation:',
    meditation_url: '',
    cta_label: 'Step inside REGULATED',
    cta_url: '/the-work/regulated',
  },
  {
    state: 'dorsal',
    title: 'Your signal: Dorsal. You are in freeze or shutdown.',
    blurb:
      'Your nervous system has dropped into the dorsal vagal state — freeze, collapse, or shutdown. Energy is low, motivation is hard to access, and the body wants to be horizontal. This is what happens when the system has been asked to hold too much for too long.\n\nThe way back is not to push. It is to gently, slowly, signal safety to the body so it can come up to sympathetic and then to ventral.',
    practice_intro: 'A gentle practice to begin coming back online:',
    meditation_url: '',
    cta_label: 'Step inside REGULATED',
    cta_url: '/the-work/regulated',
  },
];

async function seedDecoderQuiz(strapi) {
  try {
    const existing = await strapi.entityService.findMany(
      'api::decoder-quiz-page.decoder-quiz-page',
      { populate: { results: true } },
    );
    const hasResults = Array.isArray(existing?.results) && existing.results.length >= 3;
    if (hasResults) {
      strapi.log.info('[seed-decoder-quiz] skipped — singleton already has results');
      return;
    }

    if (existing) {
      // Singleton exists but empty — fill in
      await strapi.entityService.update(
        'api::decoder-quiz-page.decoder-quiz-page',
        existing.id,
        { data: { results: PLACEHOLDER_RESULTS } },
      );
    } else {
      // Singleton doesn't exist yet — create with full payload (defaults + results)
      await strapi.entityService.create('api::decoder-quiz-page.decoder-quiz-page', {
        data: { results: PLACEHOLDER_RESULTS },
      });
    }
    strapi.log.info('[seed-decoder-quiz] seeded 3 placeholder state results');
  } catch (err) {
    strapi.log.warn('[seed-decoder-quiz] failed:', err.message);
  }
}

module.exports = seedDecoderQuiz;
