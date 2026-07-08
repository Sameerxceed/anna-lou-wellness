'use strict';

/**
 * Idempotent seed for wellness testimonials from Anna's
 * Docs/Anna_Lou_testimonials_for_the_website.docx (8 July 2026).
 *
 * Runs on Strapi bootstrap. Match key is reviewer_name + first 40 chars
 * of quote — safe against duplicates and re-running.
 *
 * Anna's crediting rules (from her cover note) are baked in:
 *   - Cymbeline Smith: full name + credentials approved
 *   - Anonymous Strawberry Moon guest: no name
 *   - First-name only for most reflection-form reviewers
 *   - Instagram handles kept as displayed
 *
 * Jewellery testimonials from the docx are NOT seeded here — they
 * belong to the Anna Lou of London jewellery site (separate stack).
 */

const TESTIMONIALS = [
  {
    reviewer_name: 'Zara',
    reviewer_location: 'Houseboat Reset',
    quote:
      'I came in carrying weeks of tension in my back and neck, and left feeling balanced and whole. The body tremors were intense but amazingly freeing, and I could feel them unlock things I had been holding. It galvanised my resolve to put myself at the heart of what I do. Anna is the perfect combination of relaxed, warm and encouraging, while being incredibly focused and knowledgeable. We went deep, but we also laughed. Welcoming, transformative and safe.',
    tags: 'retreats',
    display_style: 'card',
    is_featured: false,
    sort_order: 20,
  },
  {
    reviewer_name: 'Lauren',
    reviewer_location: 'Align and Amplify',
    quote:
      'I arrived panicked and worried, needing to release everything I had been feeling. By the end my mind was quieter and my anxiety had settled. The whole experience was amazing, calm and completely without judgement. If you are wondering whether to come, you would love it.',
    tags: 'workshops',
    display_style: 'card',
    is_featured: false,
    sort_order: 30,
  },
  {
    reviewer_name: 'Lindsay',
    reviewer_location: 'Houseboat Reset',
    quote:
      'I was drawn in by the calm energy and wanted to experience the techniques for myself. The guided meditation was the moment that stayed with me, and I left relaxed and refreshed, carrying that slower pace into the days afterwards. Wonderfully peaceful and inviting.',
    tags: 'retreats',
    display_style: 'card',
    is_featured: false,
    sort_order: 40,
  },
  {
    reviewer_name: 'Cymbeline Smith, MA, LMFT',
    reviewer_location: 'Align and Amplify. Psychology practitioner since 2010.',
    quote:
      'During the Bilateral Coherence and Flash Integration I felt real release and calm, and images surfaced that genuinely surprised me. Across the workshop I noticed stuck, nervous energy tied to old limiting beliefs about myself begin to shift, and I reconnected with a calmer, more confident part of myself. Having worked in psychology since 2010, I can honestly say it is rare to find someone as knowledgeable, skilled and genuinely caring as Anna. She creates a compassionate, emotionally safe environment, and her warm, trauma informed approach brings authenticity, expertise and deep passion to her work. I highly recommend working with Anna.',
    tags: 'workshops',
    display_style: 'banner',
    is_featured: true,
    sort_order: 10,
  },
  {
    reviewer_name: 'Sam',
    reviewer_location: 'Houseboat Reset',
    quote:
      'I arrived frazzled and exhausted, needing space to do something for my own wellbeing for a change. I loved the TRE and conscious breathing, and simply being in a group of women sharing openly. By the end I felt calm, focused and more like myself again, with more confidence in myself. Uplifting, relaxing and inspiring. Just do it. You will not regret it, and you can take it at your own pace.',
    tags: 'retreats',
    display_style: 'card',
    is_featured: false,
    sort_order: 50,
  },
  {
    reviewer_name: 'Valentina',
    reviewer_location: 'Somatic Healing Day Retreat',
    quote:
      'I thought it would be a relaxing day with some meditation, and it turned out to be so much more. The pendulum work was completely new to me and really stayed with me. Even though I moved through a lot emotionally, I was held and supported the whole way, and felt genuinely cared for, not only by Anna but by everyone in the group. That made me feel very safe. I left lighter, and reminded of how important it is to make time for ourselves. Dreamlike, peaceful, timeless.',
    tags: 'retreats',
    display_style: 'card',
    is_featured: false,
    sort_order: 60,
  },
  {
    reviewer_name: 'Hazel',
    reviewer_location: 'Strawberry Moon',
    quote:
      'I came curious and open, and the second part, lying down and imagining what is possible, was very, very powerful. By the end I felt deeply loved, almost as if I could feel my cells settling. The space is beautiful and Anna and Neptune are so welcoming, truly loving and genuine people. Beautiful, calm and deeply nurturing. Please go. You will not regret it.',
    tags: 'retreats',
    display_style: 'card',
    is_featured: false,
    sort_order: 70,
  },
  {
    reviewer_name: 'Sarah',
    reviewer_location: 'Strawberry Moon',
    quote:
      'I came curious and left grateful, having enjoyed a joyful, reflective and calm reset of my whole system. There was nothing to perform, just the friendly and open company of the others there. It was a lovely reminder to be softer with myself and to meet my triggers calmly and kindly. A welcoming, joyful retreat. Find the courage to go. You will be pleased that you did.',
    tags: 'retreats',
    display_style: 'card',
    is_featured: false,
    sort_order: 80,
  },
  {
    reviewer_name: 'Penelope',
    reviewer_location: 'Strawberry Moon',
    quote:
      'I came along to support a friend, not quite sure what to expect, and warmed to everyone there straight away. It left me reflective and lifted my mood. Warm, friendly and inviting. At least try it. You may be surprised.',
    tags: 'retreats',
    display_style: 'card',
    is_featured: false,
    sort_order: 90,
  },
  {
    reviewer_name: 'Anonymous',
    reviewer_location: 'Strawberry Moon Retreat',
    quote:
      'The houseboat is a special place where I can feel at peace and focus on my wellbeing, with no distractions or responsibilities. I am not usually a people person, but I loved the connection with the other women, and I found the trauma release deeply healing. When Neptune did his sage burning he kept using the word ease, which landed in a way that felt almost meant. I left calmer, grounded and released, as if I was in a gentle bubble for days afterwards. Sanctuary, sacred, spirit. Just go and allow yourself to experience Anna and Neptune healing gifts. You do not have to perform, just be and receive, and slowly return to yourself.',
    tags: 'retreats',
    display_style: 'card',
    is_featured: false,
    sort_order: 100,
  },
  {
    reviewer_name: 'Emma',
    reviewer_location: '@digital.mother · Instagram, 17 June',
    quote:
      'I loved Anna retreat on her gorgeous houseboat, deep but amazing work to help you leave lighter and brighter. I appreciate you.',
    tags: 'retreats',
    display_style: 'card',
    is_featured: true,
    sort_order: 15,
  },
  {
    reviewer_name: '@littlescandibaby',
    reviewer_location: 'Instagram, 27 March',
    quote:
      'Just want to take a minute to appreciate Anna. She has taught me a lot personally when it comes to business mindset and thinking, and how to stay grounded when everything around you moves so fast. She helped me learn to pause and ask, can this wait, or does it need to happen now. She taught me how my nervous system works and how to recognise the signs, because ignoring them can lead you to take the wrong actions. Check in with yourself and understand what is happening before you act. Be in control of your mind, rather than your mind controlling you. You can feel it, name it, work through it, and let your decisions be led by safety rather than fear. She is a fantastic coach.',
    rating: 5,
    tags: 'coaching',
    display_style: 'card',
    is_featured: true,
    sort_order: 12,
  },
];

async function seedTestimonials(strapi) {
  let created = 0;
  let skipped = 0;

  for (const t of TESTIMONIALS) {
    // Fingerprint: reviewer_name + first 40 chars of quote. Robust to
    // re-running and prevents dupes even if Anna edits the wording later
    // in the CMS (edit-then-reseed will skip, not clobber).
    const quotePrefix = (t.quote || '').slice(0, 40);
    const existing = await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters: {
        reviewer_name: t.reviewer_name,
        quote: { $startsWith: quotePrefix },
      },
      limit: 1,
    });
    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }
    await strapi.entityService.create('api::testimonial.testimonial', {
      data: {
        ...t,
        is_active: true,
        // Publish immediately so testimonials appear on the site as soon
        // as the deploy completes. Anna can unpublish or edit any of
        // them in the CMS after.
        publishedAt: new Date(),
      },
    });
    created++;
    strapi.log.info(`[seed-testimonials] created "${t.reviewer_name}"`);
  }

  strapi.log.info(
    `[seed-testimonials] done - created ${created}, skipped ${skipped} already present`,
  );
}

module.exports = seedTestimonials;
