'use strict';

/**
 * Seed page-content collections (Experience, CommunityEvent, GenericPage).
 *
 * Runs on every Strapi boot, but is fully idempotent:
 *  - Only creates an entry if no entry exists for that slug
 *  - Never overwrites Anna's edits
 *
 * Goal: when Anna opens Strapi for the first time after this deploy, every
 * sub-page already has its current frontend copy pre-filled. She doesn't
 * have to retype anything — just upload images.
 */

async function ensure(strapi, uid, slug, data) {
  try {
    const existing = await strapi.documents(uid).findMany({
      filters: { slug },
      limit: 1,
    });
    if (existing && existing.length > 0) return false;
    await strapi.documents(uid).create({
      data: { ...data, slug },
      status: 'published',
    });
    strapi.log.info(`[seed-pages] Created ${uid} (${slug})`);
    return true;
  } catch (err) {
    strapi.log.warn(`[seed-pages] Skipped ${uid} (${slug}): ${err.message}`);
    return false;
  }
}

async function seedPages(strapi) {
  // ═══ Experience pages ═══
  await ensure(strapi, 'api::experience-page.experience-page', 'workshops', {
    title: 'Workshops',
    kicker: 'Experiences',
    kickerColour: '#7BAFDD',
    intro: [
      'Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. Every workshop includes either full access or a recording and summary so you can engage at whatever level feels right.',
      'Workshops combine somatic practice, breathwork, and honest conversation in an immersive format designed to help you maintain resilience.',
      'Surrendering and Raising Your Vibration is a regular online workshop focused on releasing tension patterns and reconnecting with your body’s natural energy.',
      'All workshop recordings are available in the Reset Room resource library for members.',
    ].join('\n\n'),
    ctaLabel: 'View upcoming workshops',
    ctaUrl: '/community/events',
  });

  await ensure(strapi, 'api::experience-page.experience-page', 'retreats', {
    title: 'Retreats',
    kicker: 'Experiences',
    kickerColour: '#7BAFDD',
    intro: [
      'A few times a year, a small group comes to Taggs Island, Hampton for a full reset day. Six people maximum. No phones, no fixed agenda.',
      'We work with whatever the group needs — breathwork, somatic practice, the Signal Method™, honest conversation. People arrive wound tight and leave softer.',
      'The houseboat is surrounded by water on all sides. There is something about being on the river that strips away everything that is not real. The space itself does half the work.',
      'Each retreat includes a full day of guided practice, lunch prepared on the houseboat, and a take-home integration guide.',
      'Retreats are announced to the mailing list first. Sign up to Reset Letters for priority access.',
    ].join('\n\n'),
    ctaLabel: 'Register interest',
    ctaUrl: '/contact',
  });

  await ensure(strapi, 'api::experience-page.experience-page', 'corporate-wellbeing', {
    title: 'Corporate Wellbeing.',
    kicker: 'Experiences · For teams',
    kickerColour: '#7BAFDD',
    intro: [
      'Bespoke formats for teams and organisations. Workshops, keynotes, and ongoing wellbeing programmes tailored to your workplace. The Signal Method adapted for corporate environments.',
      'Formats range from a single 90-minute session to a full-day immersive experience. Available in person at your workplace, on the houseboat at Taggs Island, or online.',
      'Anna brings fifteen years of entrepreneurial experience and clinical somatic training to every corporate engagement. This is not generic mindfulness. This is nervous system work that actually changes how people show up.',
    ].join('\n\n'),
  });

  await ensure(strapi, 'api::experience-page.experience-page', 'speaking', {
    title: 'Speaking.',
    kicker: 'Experiences · For events',
    kickerColour: '#FAA21B',
    intro: [
      'Anna speaks on the inner guidance system, the nervous system, somatic coaching, the recovery work that follows narcissistic abuse, and what it actually takes for a woman to rebuild from burnout. She also speaks to founders on the link between the body and the business.',
      'Format depends on what your audience needs. Keynote, panel, fireside, intimate Q&A. Online or in the room.',
    ].join('\n\n'),
  });

  // ═══ Community Event pages ═══
  await ensure(strapi, 'api::community-event-page.community-event-page', 'the-returning-circle', {
    title: 'The Returning Circle.',
    kicker: 'Community · Weekly · Donation-based',
    kickerColour: '#5DCAA5',
    intro: [
      'Every Wednesday evening Anna holds a circle. Hybrid. In person on the houseboat at Taggs Island for those who can travel. Live on Zoom for everyone else.',
      'What it is: a room. People who are honest. No advice. No fixing. No cross-talk. Just being in the presence of other humans who are willing to say what is actually going on.',
      'What it is not: therapy, a support group, a workshop, or anything with a curriculum. There is no programme. There is no progression. You come when you need to. You stop when you are done.',
    ].join('\n\n'),
    ctaLabel: 'Hold a place',
    ctaUrl: '#rsvp',
  });

  await ensure(strapi, 'api::community-event-page.community-event-page', 'events', {
    title: 'Events Calendar',
    kicker: 'Community',
    kickerColour: '#231F20',
    intro: [
      'All upcoming events in one place. Retreats on Taggs Island, workshops (online and in person), and member-only Reset Room sessions.',
      'For bespoke corporate events and private bookings, please get in touch directly.',
    ].join('\n\n'),
    ctaLabel: 'Enquire about events',
    ctaUrl: '/contact',
  });

  // ═══ Generic pages ═══
  await ensure(strapi, 'api::generic-page.generic-page', 'about-press', {
    title: 'Press',
    kicker: 'About',
    kickerColour: '#231F20',
    intro: [
      'Twenty-five years of press coverage. From the first piece about someone selling handmade jewellery on Portobello Road, to Harrods, Selfridges, Liberty, Harvey Nichols, QVC Japan, Disney, and Henri Bendel New York.',
      'For most of those years the press was about the brand and the jewellery. More recently the coverage has shifted. The coaching, the houseboat, the pivot.',
      'Anna holds ICF coaching accreditation, CPD certification, and is a certified TRE® provider. She is a somatic trauma-informed coach specialising in nervous system regulation and healing from narcissistic abuse.',
      'For press enquiries, interviews, podcast appearances, and media features, please contact hello@annalouwellness.com.',
    ].join('\n\n'),
    ctaLabel: 'Press enquiries',
    ctaUrl: '/contact',
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'about-partnerships', {
    title: 'Work With Me',
    kicker: 'About',
    kickerColour: '#231F20',
    intro: [
      "Anna Lou Wellness is open to collaborations that align with the brand's values: honest storytelling, somatic wellbeing, ethical production, and supporting women through real transformation.",
      'Previous collaborations include Harrods, Selfridges, Harvey Nichols, Liberty, Disney, Hello Kitty, Ray-Ban, QVC Japan, and a range of independent retailers worldwide.',
      'We are interested in brand partnerships, product collaborations, editorial sponsorships, and event co-hosting. If what you do supports women coming back to themselves, we want to hear from you.',
      'For all enquiries, please email hello@annalouwellness.com with a brief outline of what you have in mind.',
    ].join('\n\n'),
    ctaLabel: 'Get in touch',
    ctaUrl: '/contact',
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'the-work-client-stories', {
    title: 'Client Stories',
    kicker: 'The Work',
    kickerColour: '#F280AA',
    intro: [
      'These are not testimonials. They are editorial pieces — real stories from real clients about what happens when you come home to yourself.',
      '“The thing about Anna is she doesn’t let you stay comfortable. Not in a confrontational way. In a way where your body suddenly shows you what you’ve been avoiding, and you realise you’re ready.” — Claudine, London',
      '“I thought I needed a business coach. Turns out I needed someone who could see that my nervous system was making every business decision for me.” — Susan, New York',
      'More stories are coming. If you have worked with Anna and would like to share your experience, please get in touch.',
    ].join('\n\n'),
    ctaLabel: 'Start your story',
    ctaUrl: '/contact',
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'the-work-ways-to-work-with-me', {
    title: 'Ways to Work With Me',
    kicker: 'The Work',
    kickerColour: '#F280AA',
    intro: [
      'The Signal Method™ is the umbrella for all the coaching work here. It is a somatic framework Anna developed from fifteen years of personal practice and clinical training.',
      'Underneath it sit the programmes, each designed for a different stage of the journey. Whether you are just beginning to notice the patterns, or you are ready to rewire them completely, there is a way in.',
      'The Reset (6 weeks, £1,500) — The starting point. Identify and begin releasing the patterns running your life.',
      'Signal (12 weeks, £3,000) — The deep dive. For women ready to rewire at a deeper level.',
      'Signal & Build (12 weeks, £3,000) — Signal plus business coaching. For founders whose nervous system is affecting their business.',
      'One Day Intensive (enquire) — A full day on the houseboat. Immersive, concentrated work.',
      'The Signal Collective (by application) — Ongoing mastermind for women who have completed a programme and want continued support.',
      'Not sure which is right? Book a free 15-minute discovery call.',
    ].join('\n\n'),
    ctaLabel: 'Book a discovery call',
    ctaUrl: '/contact',
  });

  strapi.log.info('[seed-pages] Page content seed run complete');
}

module.exports = seedPages;
