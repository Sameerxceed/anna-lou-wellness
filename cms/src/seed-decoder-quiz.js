'use strict';

/**
 * Idempotent seed for the Decoder Quiz singleton.
 *
 * Populates Anna's 1 June 2026 wireframe content end-to-end so the page
 * works the moment the singleton exists. Everything here is CMS-editable
 * once seeded — re-seeding NEVER overwrites Anna's edits.
 *
 * Strategy:
 *  - If singleton has 5 questions + 3 results with new state values → skip
 *  - If questions are missing OR results use old polyvagal slugs →
 *    refresh both with the wireframe defaults (this only happens during
 *    the initial rollout; once Anna has edited, the singleton has
 *    questions present and we never touch them again)
 */

const QUESTIONS = [
  {
    text: 'When I try to rest, lately…',
    answer_a: 'I can settle, even if it takes a moment.',
    answer_b: 'My mind starts racing and I cannot switch off.',
    answer_c: 'I shut down or zone out rather than properly rest.',
  },
  {
    text: 'When I look at my phone or read the news…',
    answer_a: 'I can engage and put it down without it staying with me.',
    answer_b: 'I feel it land in my body and stay buzzing afterwards.',
    answer_c: 'I scroll without really taking it in, or I avoid it altogether.',
  },
  {
    text: 'Other people’s moods and stress…',
    answer_a: 'I notice them, but they do not pull me out of myself.',
    answer_b: 'Land in me. I pick them up and carry them.',
    answer_c: 'Reach me faintly. It can feel like I am behind glass.',
  },
  {
    text: 'When something small goes wrong…',
    answer_a: 'I can take it, breathe, and move on.',
    answer_b: 'I am tipped over more easily than I would like.',
    answer_c: 'I freeze or go quiet, even when I want to respond.',
  },
  {
    text: 'If I check in with myself right now, what I notice is…',
    answer_a: 'I feel mostly here, in my body.',
    answer_b: 'I feel wired or on edge.',
    answer_c: 'I feel flat, foggy, or far away from myself.',
  },
];

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
    practice_intro:
      'Try this now: Feet on the floor. Let your exhale grow a little longer than your inhale, three or four breaths. Look slowly around the room and name three things you can see. That is your signal coming back online. It is small, but it is real.',
    meditation_url: '',
    cta_label: 'See REGULATED',
    cta_url: '/the-work/regulated',
  },
  {
    state: 'faint',
    title: 'Your signal is faint.',
    blurb:
      'Something in you has gone quiet. That is not weakness and it is not a flaw. It is what an inner world does when it has been carrying too much for too long. It turns the volume down, to protect you.\n\nBe gentle with yourself today.\n\nWhen you feel ready for the longer work, REGULATED is the practice that brings you home, slowly and at your own pace.',
    practice_intro:
      'One small thing: Look up and find one thing in front of you. A colour, a corner of light, a shape. Let your eyes rest on it for a moment. That is enough.',
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
      { populate: { results: true, questions: true } },
    );

    const hasNewStates =
      Array.isArray(existing?.results) &&
      existing.results.length === 3 &&
      existing.results.every((r) => NEW_STATES.includes(r.state));

    const hasQuestions =
      Array.isArray(existing?.questions) && existing.questions.length >= 5;

    if (hasNewStates && hasQuestions) {
      strapi.log.info('[seed-decoder-quiz] skipped — singleton already has questions + new state values');
      return;
    }

    // Build the update payload — only set what's missing/stale.
    const data = {};
    if (!hasNewStates) data.results = RESULTS;
    if (!hasQuestions) data.questions = QUESTIONS;

    if (existing) {
      await strapi.entityService.update(
        'api::decoder-quiz-page.decoder-quiz-page',
        existing.id,
        { data },
      );
      strapi.log.info(
        `[seed-decoder-quiz] populated singleton: ${
          !hasNewStates ? 'results ' : ''
        }${!hasQuestions ? 'questions' : ''}`.trim()
      );
    } else {
      await strapi.entityService.create('api::decoder-quiz-page.decoder-quiz-page', {
        data: { questions: QUESTIONS, results: RESULTS },
      });
      strapi.log.info('[seed-decoder-quiz] seeded fresh singleton with questions + results');
    }
  } catch (err) {
    strapi.log.warn('[seed-decoder-quiz] failed:', err.message);
  }
}

module.exports = seedDecoderQuiz;
