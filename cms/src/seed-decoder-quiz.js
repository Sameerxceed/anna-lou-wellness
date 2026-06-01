'use strict';

/**
 * Idempotent seed for the Decoder Quiz singleton.
 *
 * Uses Anna's exact wireframe copy (decoder-journey-wireframes.html, 1 Jun 2026):
 *   Signal Clear     — A≥3 answers
 *   Signal Scrambled — else if B≥C
 *   Signal Faint     — else
 *
 * Re-seeds if existing records use the OLD polyvagal naming (ventral /
 * sympathetic / dorsal) so the meeting demo shows the new brand language.
 * Skips if records already use the new state values (so it never overwrites
 * Anna's edits once she's iterated on this in CMS).
 */

const RESULTS = [
  {
    state: 'clear',
    title: 'Your signal is clear.',
    blurb:
      'Right now, your inner world is mostly steady. You can think, rest, feel, and come back to yourself. That is not luck and it is not nothing. It is something to protect.\n\nThe world is loud, and even a clear signal gets pulled at. Staying clear is a practice, not a fixed state.\n\nSo here is a short meditation from me, to help you hold your ground and stay where you are.',
    practice_intro: 'A short meditation to stay clear:',
    meditation_url: '',
    cta_label: 'Step inside The Reset Room',
    cta_url: '/community/reset-room',
  },
  {
    state: 'scrambled',
    title: 'Your signal is scrambled.',
    blurb:
      'Read this as information, not a verdict. Your inner world has been picking up a lot of signal that was never yours to carry. That is why you are wired and tired at the same time.\n\nThe longer work, the one that teaches you how to stay anchored, lives inside REGULATED.',
    practice_intro: 'Try this now: Feet on the floor. Let your exhale grow a little longer than your inhale, three or four breaths. Look slowly around the room and name three things you can see. That is your signal coming back online. It is small, but it is real.',
    meditation_url: '',
    cta_label: 'See REGULATED',
    cta_url: '/the-work/regulated',
  },
  {
    state: 'faint',
    title: 'Your signal is faint.',
    blurb:
      'Something in you has gone quiet. That is not weakness and it is not a flaw. It is what an inner world does when it has been carrying too much for too long. It turns the volume down, to protect you.\n\nBe gentle with yourself today.\n\nWhen you feel ready for the longer work, REGULATED is the practice that brings you home, slowly and at your own pace.',
    practice_intro: 'One small thing: Look up and find one thing in front of you. A colour, a corner of light, a shape. Let your eyes rest on it for a moment. That is enough.',
    meditation_url: '',
    cta_label: 'See REGULATED',
    cta_url: '/the-work/regulated',
  },
];

const NEW_STATES = ['clear', 'scrambled', 'faint'];

async function seedDecoderQuiz(strapi) {
  try {
    const existing = await strapi.entityService.findMany(
      'api::decoder-quiz-page.decoder-quiz-page',
      { populate: { results: true } },
    );

    const hasNewStates = Array.isArray(existing?.results)
      && existing.results.length === 3
      && existing.results.every((r) => NEW_STATES.includes(r.state));

    if (hasNewStates) {
      strapi.log.info('[seed-decoder-quiz] skipped — singleton already on new state values');
      return;
    }

    if (existing) {
      // Singleton exists but either empty or using old polyvagal names. Overwrite.
      await strapi.entityService.update(
        'api::decoder-quiz-page.decoder-quiz-page',
        existing.id,
        {
          data: {
            // Update default copy too in case it's still the polyvagal default
            intro: 'Five short questions. We will read where your inner guidance system is right now, and give you a practice you can use today.',
            results: RESULTS,
          },
        },
      );
      strapi.log.info('[seed-decoder-quiz] migrated existing singleton to new state values (clear/scrambled/faint)');
    } else {
      await strapi.entityService.create('api::decoder-quiz-page.decoder-quiz-page', {
        data: { results: RESULTS },
      });
      strapi.log.info('[seed-decoder-quiz] seeded fresh singleton with new state values');
    }
  } catch (err) {
    strapi.log.warn('[seed-decoder-quiz] failed:', err.message);
  }
}

module.exports = seedDecoderQuiz;
