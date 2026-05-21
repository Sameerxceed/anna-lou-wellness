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
    if (existing && existing.length > 0) {
      // Entry exists — backfill any fields that are null/empty (new schema fields).
      // Never overwrites a field Anna has already filled.
      const current = existing[0];
      const patch = {};
      for (const [key, val] of Object.entries(data)) {
        const cur = current[key];
        if (cur === null || cur === undefined || cur === '') {
          patch[key] = val;
        }
      }
      if (Object.keys(patch).length > 0) {
        await strapi.documents(uid).update({
          documentId: current.documentId,
          data: patch,
          status: 'published',
        });
        strapi.log.info(`[seed-pages] Backfilled ${uid} (${slug}): ${Object.keys(patch).join(', ')}`);
      }
      return false;
    }
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

// Same as ensure() but for singleTypes (no slug — exactly one record per UID).
async function ensureSingleType(strapi, uid, data) {
  try {
    const existing = await strapi.documents(uid).findFirst({});
    if (existing) {
      // Backfill empty fields only
      const patch = {};
      for (const [key, val] of Object.entries(data)) {
        const cur = existing[key];
        if (cur === null || cur === undefined || cur === '') {
          patch[key] = val;
        }
      }
      if (Object.keys(patch).length > 0) {
        await strapi.documents(uid).update({
          documentId: existing.documentId,
          data: patch,
          status: 'published',
        });
        strapi.log.info(`[seed-pages] Backfilled singleType ${uid}: ${Object.keys(patch).join(', ')}`);
      }
      return false;
    }
    await strapi.documents(uid).create({
      data,
      status: 'published',
    });
    strapi.log.info(`[seed-pages] Created singleType ${uid}`);
    return true;
  } catch (err) {
    strapi.log.warn(`[seed-pages] Skipped singleType ${uid}: ${err.message}`);
    return false;
  }
}

async function seedPages(strapi) {
  // ═══ Membership singleType (Reset Room subscription) ═══
  await ensureSingleType(strapi, 'api::membership.membership', {
    title: 'The Reset Room',
    description: 'A monthly membership for women rebuilding their nervous system. Live calls, somatic library, a quiet room of women doing the work.',
    pricePence: 2500,
    currency: 'gbp',
    isRecurring: true,
    recurringInterval: 'month',
    mailchimpTag: 'Reset Room Members',
    grantsResetRoomAccess: true,
  });

  // ═══ Reset Room Page singleType (landing page copy) ═══
  // Schema defines defaults for every field; passing empty object lets Strapi
  // materialize the entry with schema defaults. Anna edits in admin.
  await ensureSingleType(strapi, 'api::reset-room-page.reset-room-page', {});

  // ═══ Reset Letters Page singleType (holding page copy) ═══
  await ensureSingleType(strapi, 'api::reset-letters-page.reset-letters-page', {});

  // ═══ Decoder Page singleType (free lead-magnet page) ═══
  await ensureSingleType(strapi, 'api::decoder-page.decoder-page', {});

  // ═══ About Page — seed press logos + certifications as components ═══
  // Schema converted these from JSON to repeatable components so Anna can edit
  // through a form (with image upload per row) instead of raw JSON. Pre-populate
  // with the current names so the structure is visible from day one.
  await ensureSingleType(strapi, 'api::about-page.about-page', {
    press_logos: [
      { name: 'Harrods' },
      { name: 'Selfridges' },
      { name: 'Harvey Nichols' },
      { name: 'Liberty' },
      { name: 'QVC Japan' },
      { name: 'Disney' },
      { name: 'The Telegraph' },
      { name: 'Stylist' },
    ],
    certifications: [
      { name: 'ICF\nCertified Coach', colour: '#6E3A5A' },
      { name: 'CPD\nAccredited', colour: '#7BAFDD' },
      { name: 'TRE®\nProvider', colour: '#5DCAA5' },
    ],
  });

  // ═══ Community Page — seed Reset Room features as components ═══
  await ensureSingleType(strapi, 'api::community-page.community-page', {
    reset_room_features: [
      { text: 'Live monthly Reset Call with Anna (90 minutes)' },
      { text: 'Full Resource Library — workshop replays, founder resets, paid archive' },
      { text: 'Members-only events, seasonal resets, in-person houseboat days' },
      { text: 'First access to new retreats (48 hours before public)' },
      { text: '10% off all 1:1 work' },
    ],
  });

  // ═══ Membership — seed features as components (in addition to other defaults) ═══
  // Note: this won't overwrite the existing membership singleType seed above; ensureSingleType
  // only backfills empty fields. Calling again just to populate the new features field.
  await ensureSingleType(strapi, 'api::membership.membership', {
    features: [
      { text: 'Live monthly Reset Call with Anna' },
      { text: 'Full Resource Library access' },
      { text: 'Members-only events' },
      { text: 'First access to new retreats' },
      { text: '10% off 1:1 work' },
    ],
  });

  // ═══ Navigation singleType — Anna edits all menus + sub-menus here ═══
  // Seeded with the current site.ts fallback so the first admin page-load
  // shows the live nav rather than an empty form. The frontend reads this
  // singleType at request time (cached) and falls back to site.ts if Strapi
  // is unreachable, so editing here is the source of truth going forward.
  await ensureSingleType(strapi, 'api::navigation.navigation', {
    top_strip_text: 'Stories · Work with Anna · Experiences · Shop · Community',
    items: [
      {
        __component: 'nav.menu-item',
        label: 'Reset Stories',
        href: '/reset-stories',
        colour: '#6E3A5A',
        children: [
          { __component: 'nav.child-link', label: 'All Stories', href: '/reset-stories' },
          { __component: 'nav.child-link', label: 'Holding Everything', href: '/reset-stories/holding-everything' },
          { __component: 'nav.child-link', label: 'The Strong One', href: '/reset-stories/the-strong-one' },
          { __component: 'nav.child-link', label: 'Signal vs Noise', href: '/reset-stories/signal-vs-noise' },
          { __component: 'nav.child-link', label: 'Houseboat Life', href: '/life/houseboat-life' },
          { __component: 'nav.child-link', label: 'Spiritual Hygiene', href: '/life/spiritual-hygiene' },
        ],
      },
      {
        __component: 'nav.menu-item',
        label: 'Life',
        href: '/life',
        colour: '#FAA21B',
        children: [
          { __component: 'nav.child-link', label: 'Rituals and Energy', href: '/life/rituals-and-energy' },
          { __component: 'nav.child-link', label: 'Home and Space', href: '/life/home-and-space' },
          { __component: 'nav.child-link', label: 'Style and Beauty', href: '/life/style-and-beauty' },
          { __component: 'nav.child-link', label: 'Food and Nourishment', href: '/life/food-and-nourishment' },
        ],
      },
      {
        __component: 'nav.menu-item',
        label: 'Love & Relationships',
        href: '/love-and-relationships',
        colour: '#F280AA',
        children: [
          { __component: 'nav.child-link', label: 'Dating and Patterns', href: '/love-and-relationships/dating-and-patterns' },
          { __component: 'nav.child-link', label: 'Breakups and Reset', href: '/love-and-relationships/breakups-and-reset' },
          { __component: 'nav.child-link', label: 'Friendship', href: '/love-and-relationships/friendship' },
          { __component: 'nav.child-link', label: 'Motherhood', href: '/love-and-relationships/motherhood' },
          { __component: 'nav.child-link', label: 'Self Worth and Identity', href: '/love-and-relationships/self-worth-and-identity' },
        ],
      },
      {
        __component: 'nav.menu-item',
        label: 'Work & Money',
        href: '/work-and-money',
        colour: '#FFD07A',
        children: [
          { __component: 'nav.child-link', label: 'Founder Reset', href: '/work-and-money/founder-reset' },
          { __component: 'nav.child-link', label: 'Burnout and Nervous System', href: '/work-and-money/burnout-and-nervous-system' },
          { __component: 'nav.child-link', label: 'Career and Direction', href: '/work-and-money/career-and-direction' },
          { __component: 'nav.child-link', label: 'Money and Worth', href: '/work-and-money/money-and-worth' },
        ],
      },
      {
        __component: 'nav.menu-item',
        label: 'Experiences',
        href: '/experiences',
        colour: '#7BAFDD',
        children: [
          { __component: 'nav.child-link', label: 'Retreats', href: '/experiences/retreats' },
          { __component: 'nav.child-link', label: 'Workshops', href: '/experiences/workshops' },
          { __component: 'nav.child-link', label: 'Corporate Wellbeing', href: '/experiences/corporate-wellbeing' },
          { __component: 'nav.child-link', label: 'Speaking', href: '/experiences/speaking' },
        ],
      },
      {
        __component: 'nav.menu-item',
        label: 'Work with Anna',
        href: '/the-work',
        colour: '#F280AA',
        children: [
          { __component: 'nav.child-link', label: 'Take the Quiz', href: '/the-work/quiz' },
          { __component: 'nav.child-link', label: 'The Reset · 6 weeks', href: '/the-work/the-reset' },
          { __component: 'nav.child-link', label: 'Signal · 12 weeks', href: '/the-work/signal' },
          { __component: 'nav.child-link', label: 'Signal & Build · Founders', href: '/the-work/signal-and-build' },
          { __component: 'nav.child-link', label: 'One Day · Intensive', href: '/the-work/one-day' },
          { __component: 'nav.child-link', label: 'Signal Collective · Mastermind', href: '/the-work/signal-collective' },
          { __component: 'nav.child-link', label: '1:1 Reset Sessions', href: '/the-work/sessions' },
          { __component: 'nav.child-link', label: 'Recovery Coaching', href: '/the-work/recovery' },
          { __component: 'nav.child-link', label: 'Client Stories', href: '/the-work/client-stories' },
        ],
      },
      {
        __component: 'nav.menu-item',
        label: 'Shop',
        href: '/shop',
        colour: '#5DCAA5',
        children: [
          { __component: 'nav.child-link', label: 'All Jewellery', href: '/shop' },
          { __component: 'nav.child-link', label: 'Emotional Support Jewellery', href: '/shop/emotional-support-jewellery' },
          { __component: 'nav.child-link', label: 'Personalised Pieces', href: '/shop/personalised' },
          { __component: 'nav.child-link', label: 'New In', href: '/shop/new-in' },
        ],
      },
      {
        __component: 'nav.menu-item',
        label: 'Community',
        href: '/community',
        colour: '#231F20',
        children: [
          { __component: 'nav.child-link', label: 'The Returning Circle', href: '/community/the-returning-circle' },
          { __component: 'nav.child-link', label: 'The Reset Room', href: '/community/reset-room' },
          { __component: 'nav.child-link', label: 'Events Calendar', href: '/community/events' },
          { __component: 'nav.child-link', label: 'Resource Library', href: '/community/resources' },
        ],
      },
      {
        __component: 'nav.menu-item',
        label: 'About',
        href: '/about',
        colour: '#231F20',
        children: [
          { __component: 'nav.child-link', label: "Anna's Story", href: '/about' },
          { __component: 'nav.child-link', label: 'Press', href: '/about/press' },
          { __component: 'nav.child-link', label: 'Work With Me', href: '/about/partnerships' },
          { __component: 'nav.child-link', label: 'Contact', href: '/contact' },
        ],
      },
    ],
  });

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
    secondaryList: [
      '90-minute session|A single workshop. Online or in person. Topic shaped to your team.',
      'Half-day or full-day|Immersive teambuilding plus nervous system regulation. On houseboat or at your space.',
      'Keynote / panel|For conferences and offsites. Up to 200 attendees.',
      'Ongoing programme|Quarterly or monthly cadence. Depth over time. Bespoke design.',
    ].join('\n'),
  });

  await ensure(strapi, 'api::experience-page.experience-page', 'speaking', {
    title: 'Speaking.',
    kicker: 'Experiences · For events',
    kickerColour: '#FAA21B',
    intro: [
      'Anna speaks on the inner guidance system, the nervous system, somatic coaching, the recovery work that follows narcissistic abuse, and what it actually takes for a woman to rebuild from burnout. She also speaks to founders on the link between the body and the business.',
      'Format depends on what your audience needs. Keynote, panel, fireside, intimate Q&A. Online or in the room.',
    ].join('\n\n'),
    secondaryList: [
      'The Inner Guidance System.|What it is, how it gets scrambled, how to bring it back online.',
      'Burnout is a nervous system event.|The biology of what happens, and why willpower will not fix it.',
      'Recovering from narcissistic abuse.|Honest, somatic, no jargon. For survivors and the people supporting them.',
      'The body knows first.|Why founder decisions made from a dysregulated body are almost always wrong.',
      "The Signal Method.|A framework for living and leading from your own signal, not someone else's noise.",
    ].join('\n'),
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
    kicker: 'Work with Anna',
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
    kicker: 'Work with Anna',
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

  // ═══ Programmes (Reset Sessions + Recovery + Signal Collective) ═══
  await ensure(strapi, 'api::programme.programme', 'founder-reset', {
    title: 'Founder Reset',
    tagline: 'For the founder at a sticking point in the business or in herself.',
    accentColour: '#FAA21B',
    intro: 'Most founder problems are not strategy problems. They are capacity problems wearing strategy clothes. A Founder Reset is the session where we work out which one yours is, and we move it.',
    pricingLabel: 'Investment',
    pricingBody: '£200, paid at booking. 90 minutes, virtual.',
    ctaLabel: 'Book this session',
    ctaUrl: '/contact',
    pricePence: 20000,
    currency: 'gbp',
    isRecurring: false,
    mailchimpTag: 'Reset Session (90-min)',
    grantsResetRoomAccess: false,
  });

  await ensure(strapi, 'api::programme.programme', 'dating-reset', {
    title: 'Dating Reset',
    tagline: 'For the woman noticing the same pattern showing up again.',
    accentColour: '#F280AA',
    intro: 'Dating Reset is for the woman who has noticed the same pattern showing up again and is ready to ask why. We do not do dating tips. We do the underneath. The patterns, the attachment shape, the unfinished business with the version of love you grew up with.',
    pricingLabel: 'Investment',
    pricingBody: '£200, paid at booking. 90 minutes, virtual.',
    ctaLabel: 'Book this session',
    ctaUrl: '/contact',
    pricePence: 20000,
    currency: 'gbp',
    isRecurring: false,
    mailchimpTag: 'Reset Session (90-min)',
    grantsResetRoomAccess: false,
  });

  await ensure(strapi, 'api::programme.programme', 'nervous-system-reset', {
    title: 'Nervous System Reset',
    tagline: 'For the woman whose signal system is scrambled and needs bringing back online.',
    accentColour: '#7BAFDD',
    intro: 'Nervous System Reset is for the woman whose body has been holding the line for a long time and has started to lose the signal. We do not talk it out. We work with what is happening in the body, gently and slowly, and we bring the signal back online.',
    pricingLabel: 'Investment',
    pricingBody: '£200, paid at booking. 90 minutes, virtual.',
    ctaLabel: 'Book this session',
    ctaUrl: '/contact',
    pricePence: 20000,
    currency: 'gbp',
    isRecurring: false,
    mailchimpTag: 'Reset Session (90-min)',
    grantsResetRoomAccess: false,
  });

  await ensure(strapi, 'api::programme.programme', 'recovery', {
    title: 'Untangle. Unbind. Unbound.',
    tagline: 'Three months to reclaim yourself, permanently.',
    accentColour: '#6E3A5A',
    intro: [
      'Gaslighting does not just confuse your thinking. It dismantles your ability to trust your own body. The signals that used to tell you something is wrong — the tightening in your chest, the instinct to leave the room, the quiet voice that says this is not right — those signals get systematically overridden until you cannot hear them at all.',
      'What remains is hypervigilance. Freeze. Fawn. A nervous system permanently scanning for threat, even years after the relationship has ended. The body-level residue of narcissistic abuse is not a mindset problem. It is a nervous system injury.',
      'This is why talk therapy alone often is not enough. You can understand what happened intellectually and still feel the activation in your body every time you hear a particular tone of voice or walk into a room with a certain energy.',
      'Somatic coaching works at the level where the damage actually lives. In the body. In the automatic responses. In the nervous system patterns that were rewired by someone who needed you to doubt yourself.',
    ].join('\n\n'),
    stagesList: [
      'Month One|Untangle.|Somatic mapping, breathwork, Flash EMDR for specific traumatic memories. We identify where the patterns live in the body and begin to separate your responses from the ones that were installed by someone else.',
      'Month Two|Unbind.|TRE for trauma release, Internal Family Systems parts work, boundary recalibration. The parts of you that learned to fawn, freeze, or fight begin to find new options. Your boundaries stop being theoretical and become felt.',
      'Month Three|Unbound.|Integration, intuition strengthening, personal recovery map. The signal comes back. You start hearing your own body again. By month three something genuine has shifted, not at the level of insight but at the level of automatic response.',
    ].join('\n'),
    pricingLabel: 'Investment',
    pricingBody: 'By enquiry. Anna shapes the price to your situation. Payment plans available. Some places held at reduced rate for women genuinely unable to pay full price.',
    ctaLabel: 'Send a private enquiry',
    ctaUrl: '#enquire',
    pricePence: 0,
    currency: 'gbp',
    isRecurring: false,
    mailchimpTag: '',
    grantsResetRoomAccess: false,
  });

  await ensure(strapi, 'api::programme.programme', 'signal-collective', {
    title: 'The Signal Collective.',
    tagline: 'The inner work, in community. Six months.',
    accentColour: '#6E3A5A',
    intro: [
      'The Signal Collective is the mastermind. For coaches, founders, practitioners, and leaders who want depth plus community. Group and 1:1 coaching combined. Monthly intensive sessions. Peer co-regulation with people at the same level of seriousness. Direct access to the Signal Method applied to everything: business, relationships, creative work, leadership.',
      'A curated community committed to operating from their highest level. Not a course. A container for those already in motion who want to accelerate.',
    ].join('\n\n'),
    pricingLabel: 'Investment',
    pricingBody: 'By enquiry. Application form first, then a discovery call.',
    ctaLabel: 'Apply',
    ctaUrl: '#apply',
    pricePence: 0,
    currency: 'gbp',
    isRecurring: false,
    mailchimpTag: 'Signal Collective',
    grantsResetRoomAccess: false,
  });

  await ensure(strapi, 'api::programme.programme', 'the-reset', {
    title: 'The Reset.',
    tagline: 'Six weeks. One-to-one. Signal back online.',
    accentColour: '#F280AA',
    intro: [
      'Most people arrive at The Reset after trying everything else. The therapy. The journalling. The courses. The spiritual work. Getting all the way to the insight, and then hitting the same wall.',
      'The Reset is six weeks, 1:1, working directly with your inner guidance system. Not the story. Not the intellectual understanding of the pattern. The actual place the pattern lives, in the body, in the automatic responses that fire before your conscious mind catches up.',
      'Most of us spend years trying to fight the current. The Reset is the work of learning to stop gripping. Because when you stop gripping you realise the river was always guiding you. Your inner guidance system was never broken. It was waiting for you to stop overriding it.',
      'Week one: baseline. Where are you arriving from? What is your inner world doing right now? What does safety feel like in your body, and how long since you genuinely felt it?',
      'By week three something usually shifts. A decision becomes clear. A pattern stops activating the same response.',
    ].join('\n\n'),
    whatsIncludedLabel: "What's included",
    whatsIncludedItems: [
      'Six 1:1 sessions, weekly, 60 minutes each',
      'Voxer support between sessions, Tuesday to Thursday',
      'Starting audit of your inner world',
      'Tools that fit your actual life',
      'A clear close at week six. Many clients roll into Signal. Many do not need to.',
    ].join('\n'),
    pricingLabel: 'Investment',
    pricingBody: '£1,500. Paid in full at booking, or two instalments of £750 across the six weeks. If you are not sure, book a free fifteen-minute discovery call.',
    ctaLabel: 'Book a discovery call',
    ctaUrl: '/contact',
    pricePence: 150000,
    currency: 'gbp',
    isRecurring: false,
    mailchimpTag: 'The Reset (6-week)',
    grantsResetRoomAccess: false,
    displayOrder: 10,
  });

  await ensure(strapi, 'api::programme.programme', 'signal', {
    title: 'Signal.',
    tagline: 'Twelve weeks. One-to-one. The deeper container.',
    accentColour: '#6E3A5A',
    intro: [
      'Twelve weeks is enough time for something to genuinely change. Not the surface, the pattern underneath it. The automatic response that has been running your decisions, your relationships, and your relationship to yourself without your full permission.',
      'Signal is the full twelve-week somatic coaching programme. Inner world rewire, pattern release, belief repatterning, rebuilding from the inside out. Weekly sessions, integration support throughout.',
    ].join('\n\n'),
    whatsIncludedLabel: "What's included",
    whatsIncludedItems: [
      'Twelve 1:1 sessions, weekly, 60 minutes each',
      'Voxer support Tuesday to Thursday',
      'Personalised Signal Method workbook',
      'Lifetime access to recordings',
      'Optional in-person session at the Hampton studio',
    ].join('\n'),
    pricingLabel: 'Investment',
    pricingBody: '£3,000. Paid in full, or three instalments of £1,000.',
    ctaLabel: 'Book a discovery call',
    ctaUrl: '/contact',
    pricePence: 300000,
    currency: 'gbp',
    isRecurring: false,
    mailchimpTag: 'Signal (12-week)',
    grantsResetRoomAccess: false,
    displayOrder: 20,
  });

  await ensure(strapi, 'api::programme.programme', 'signal-and-build', {
    title: 'Signal & Build.',
    tagline: 'Twelve weeks. The inner work and the business, held together.',
    accentColour: '#FAA21B',
    intro: [
      'Signal & Build is Signal with a second track: heart-led business strategy using the Signal Method. For founders, coaches, and leaders who want to regulate their inner world and build from that place.',
    ].join('\n\n'),
    whatsIncludedLabel: "What's included",
    whatsIncludedItems: [
      'Everything in Signal: twelve 1:1 sessions, Voxer support, full inner-world audit',
      'Business strategy sessions interleaved with the inner work — pricing, positioning, capacity, decision-making, team, founder energy',
      'Drawn from twenty years building Anna Lou of London across Harrods, Selfridges, Liberty, Harvey Nichols',
      'Voxer access widened to include in-the-moment business questions',
    ].join('\n'),
    pricingLabel: 'Investment',
    pricingBody: '£3,000. Paid in full, or three instalments of £1,000.',
    ctaLabel: 'Book a discovery call',
    ctaUrl: '/contact',
    pricePence: 300000,
    currency: 'gbp',
    isRecurring: false,
    mailchimpTag: 'Signal & Build (founders)',
    grantsResetRoomAccess: false,
    displayOrder: 25,
  });

  await ensure(strapi, 'api::programme.programme', 'one-day', {
    title: 'One Day.',
    tagline: 'A full day. Held, focused, finished.',
    accentColour: '#5DCAA5',
    intro: [
      'One Day is exactly that. A full day, 1:1, on the houseboat at Taggs Island or online. No multi-week commitment. One concentrated, unhurried, immersive day.',
      'We begin with a full inner guidance system audit. We move through whatever the day calls for: somatic work, belief repatterning, breathwork, Signal Method, pendulum alignment, business strategy if you are building something.',
    ].join('\n\n'),
    whatsIncludedLabel: "What's included",
    whatsIncludedItems: [
      'A full day, 10am to 5pm UK, with breaks',
      'In person at the Hampton studio, or virtual via Zoom',
      'Pre-day intake form and a 30-minute scoping call the week before',
      'The day itself: nervous-system work, somatic enquiry, decision mapping, integration',
      'Lunch and refreshments included if in person',
      'A 60-minute integration call two weeks later',
    ].join('\n'),
    pricingLabel: 'Investment',
    pricingBody: 'By enquiry. Each One Day is shaped around the person it is for.',
    ctaLabel: 'Send an enquiry below',
    ctaUrl: '#enquire',
    pricePence: 0,
    currency: 'gbp',
    isRecurring: false,
    mailchimpTag: 'One Day Intensive',
    grantsResetRoomAccess: false,
    displayOrder: 30,
  });

  // ═══ Section landing pages + standalone ═══
  await ensure(strapi, 'api::generic-page.generic-page', 'the-work', {
    title: 'Your inner world already knows.',
    kicker: 'Work with Anna',
    kickerColour: '#F280AA',
    intro: 'Most people arrive here after trying everything else. The therapy. The journalling. The courses. The spiritual work. Getting all the way to the insight, and then hitting the same wall. This work meets you in the body, where the patterns actually live.',
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'experiences-landing', {
    title: 'Workshops, retreats, and reset days.',
    kicker: 'Experiences',
    kickerColour: '#7BAFDD',
    intro: 'Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. A few times a year, a small group comes to the island for a full reset day. Water outside, no agenda, just space to come back to yourself.',
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'mantras', {
    title: 'Mantras',
    kicker: 'Life · Rituals and Energy',
    kickerColour: '#FAA21B',
    tagline: 'Short practices to bring you back to yourself. 60 to 90 seconds each.',
    intro: 'These are not affirmations. They are somatic anchors — phrases paired with breath and body awareness to help regulate your nervous system in real time. Each one comes from the "Come Back to Yourself" series.',
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'cosmic-forecast', {
    title: 'Cosmic Forecast',
    kicker: 'Life · Rituals and Energy',
    kickerColour: '#FAA21B',
    tagline: "This week's energy, moon phase, and stone.",
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'contact', {
    title: 'Contact',
    kicker: 'Say Hello',
    kickerColour: '#6E3A5A',
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'welcome', {
    title: "You're in.",
    kicker: 'Reset Letters · Confirmation',
    kickerColour: '#F280AA',
    intro: [
      'Welcome to Reset Letters. You are now a Founding Member, which means you get full access to everything, for life. No charge. Ever.',
      'Your first edition will land in your inbox on **22 June 2026**. Until then, here are three things you can do:',
    ].join('\n\n'),
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'terms', {
    title: 'Terms & Conditions',
    kicker: 'Legal',
    kickerColour: '#8C8880',
  });

  await ensure(strapi, 'api::generic-page.generic-page', 'privacy', {
    title: 'Privacy Policy',
    kicker: 'Legal',
    kickerColour: '#8C8880',
  });

  strapi.log.info('[seed-pages] Page content seed run complete');
}

module.exports = seedPages;
