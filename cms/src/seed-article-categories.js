'use strict';

/**
 * Idempotent seed for editorial sub-category entries.
 *
 * Each editorial section (Reset Stories, Life, Love & Relationships,
 * Work & Money) has 3-5 sub-category links in the main nav. Visiting
 * /life/rituals-and-energy etc. routes through the dynamic article
 * page, which first tries to find an Article with that slug, then an
 * article-category. Without the category entries, the page falls
 * through to a "Not Found" placeholder with no real content.
 *
 * This seeder creates the category entries (matching the nav structure)
 * so each sub-category URL resolves to an EditorialFeed listing articles
 * in that category — even if no articles exist yet, you get a proper
 * branded landing page with "More stories coming soon" rather than 404.
 *
 * Idempotent — gated on slug. Re-running skips existing entries.
 */

const CATEGORIES = [
  // Reset Stories — plum #6E3A5A
  { section: 'reset-stories', slug: 'holding-everything', name: 'Holding Everything', colour: '#6E3A5A', description: 'For the woman who carries it all — and is starting to wonder what she would put down if she could.' },
  { section: 'reset-stories', slug: 'the-strong-one', name: 'The Strong One', colour: '#6E3A5A', description: 'Stories for the one everyone leans on. Strength reframed as nervous-system armour, and what comes after you take it off.' },
  { section: 'reset-stories', slug: 'signal-vs-noise', name: 'Signal vs Noise', colour: '#6E3A5A', description: 'Learning to hear your own signal under everyone else’s noise. Inner-world stories.' },

  // Life — gold #FAA21B
  { section: 'life', slug: 'rituals-and-energy', name: 'Rituals and Energy', colour: '#FAA21B', description: 'Small daily practices that change how a day actually feels. Mornings, evenings, breath, body.' },
  { section: 'life', slug: 'home-and-space', name: 'Home and Space', colour: '#FAA21B', description: 'The spaces we live in and what they ask of us. Slow home-making, considered objects, sanctuary thinking.' },
  { section: 'life', slug: 'style-and-beauty', name: 'Style and Beauty', colour: '#FAA21B', description: 'Style as a nervous-system choice. Wearing what regulates you, not what performs.' },
  { section: 'life', slug: 'food-and-nourishment', name: 'Food and Nourishment', colour: '#FAA21B', description: 'Eating that supports the body actually living the life. No diet talk, no purity, just nourishment.' },
  { section: 'life', slug: 'weekend-finds', name: 'Weekend Finds', colour: '#FAA21B', description: 'Recommendations — books, places, objects, recipes — that Anna would send to a friend.' },

  // Love & Relationships — pink #F280AA
  { section: 'love-and-relationships', slug: 'dating-and-patterns', name: 'Dating and Patterns', colour: '#F280AA', description: 'Why we choose who we choose, and how to start choosing differently. Nervous-system informed dating.' },
  { section: 'love-and-relationships', slug: 'breakups-and-reset', name: 'Breakups and Reset', colour: '#F280AA', description: 'The grief, the unbinding, and the return to self after a relationship ends.' },
  { section: 'love-and-relationships', slug: 'friendship', name: 'Friendship', colour: '#F280AA', description: 'Friendships as adult women: the keeping, the letting go, and the kind of love that quietly holds a life together.' },
  { section: 'love-and-relationships', slug: 'motherhood', name: 'Motherhood', colour: '#F280AA', description: 'Motherhood from the inside out. Identity, capacity, and meeting yourself again on the other side.' },
  { section: 'love-and-relationships', slug: 'self-worth-and-identity', name: 'Self Worth and Identity', colour: '#F280AA', description: 'Coming home to a self that does not depend on anyone else’s approval to feel real.' },

  // Work & Money — cream/gold #FFD07A
  { section: 'work-and-money', slug: 'founder-reset', name: 'Founder Reset', colour: '#FFD07A', description: 'For founders: how to lead from a regulated body, not a depleted one.' },
  { section: 'work-and-money', slug: 'burnout-and-nervous-system', name: 'Burnout and Nervous System', colour: '#FFD07A', description: 'Burnout is not a willpower problem. The biology of what happens, and the slow way back.' },
  { section: 'work-and-money', slug: 'signal-method', name: 'Signal Method™', colour: '#FFD07A', description: 'Anna’s framework for living and leading from your own signal. Pieces that go deeper into the method.' },
  { section: 'work-and-money', slug: 'career-and-direction', name: 'Career and Direction', colour: '#FFD07A', description: 'The work of choosing work. Listening to the signal that knows before the mind catches up.' },
  { section: 'work-and-money', slug: 'money-and-worth', name: 'Money and Worth', colour: '#FFD07A', description: 'Money as a nervous-system conversation. Worth, asking, charging, holding.' },
];

async function seedArticleCategories(strapi) {
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const existing = await strapi.entityService.findMany('api::article-category.article-category', {
      filters: { slug: cat.slug },
      limit: 1,
    });
    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }
    await strapi.entityService.create('api::article-category.article-category', {
      data: {
        name: cat.name,
        slug: cat.slug,
        section: cat.section,
        colour: cat.colour,
        description: cat.description,
        sort_order: (i + 1) * 10,
        // draftAndPublish is on for editorial content types — publish immediately
        // so seeded categories are live, not stuck as drafts.
        publishedAt: new Date(),
      },
    });
    created++;
    strapi.log.info(`[seed-article-categories] created "${cat.section}/${cat.slug}"`);
  }

  strapi.log.info(`[seed-article-categories] done — created ${created}, skipped ${skipped} already present`);
}

module.exports = seedArticleCategories;
