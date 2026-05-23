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

  // ═══ Menu-section landing-page singletypes — 6 main menu items get their own
  //     editable page so Anna controls every kicker/title/intro from CMS. Schema
  //     defaults already match the current hardcoded copy so seeding with empty
  //     objects materializes the entries with the right values. ═══
  await ensureSingleType(strapi, 'api::reset-stories-page.reset-stories-page', {});
  await ensureSingleType(strapi, 'api::life-page.life-page', {});
  await ensureSingleType(strapi, 'api::love-and-relationships-page.love-and-relationships-page', {});
  await ensureSingleType(strapi, 'api::work-and-money-page.work-and-money-page', {});
  await ensureSingleType(strapi, 'api::work-with-anna-page.work-with-anna-page', {});
  await ensureSingleType(strapi, 'api::shop-page.shop-page', {});

  // ═══ Site Settings — backfill fields added after the singleton was first
  //     created so Anna sees their default values rather than blank inputs.
  //     ensureSingleType only fills null/undefined/empty fields, so this is
  //     safe to re-run; Anna's edits are never overwritten. ═══
  await ensureSingleType(strapi, 'api::site-settings.site-settings', {
    max_subcategories_per_menu: 4,
    default_currency: 'GBP',
    supported_currencies: 'GBP, EUR, USD',
  });

  // ═══ Shop sub-pages — three sibling singletons under /shop/* ═══
  // Each was previously hardcoded inside its page.tsx; now CMS-editable
  // so Anna controls every paragraph and button label from admin.
  await ensureSingleType(strapi, 'api::shop-new-in-page.shop-new-in-page', {});
  await ensureSingleType(strapi, 'api::shop-personalised-page.shop-personalised-page', {});
  await ensureSingleType(strapi, 'api::shop-esj-page.shop-esj-page', {});

  // ═══ Quiz page — /the-work/quiz hero + 6 result blurbs ═══
  // Questions stay in code (complex weighted scoring matrix that Anna won't
  // tune by hand). Only the hero copy and the 6 result outcomes are CMS-
  // editable. Seed with exactly 6 results — one per slug the quiz routes to.
  await ensureSingleType(strapi, 'api::quiz-page.quiz-page', {
    results: [
      { slug: 'decoder', title: 'Start with the free Nervous System Decoder.', blurb: 'Before any programme, before any session, this is the foundation. Free guide. Seven self-audit questions. Three small practices to start with, today. It is the first thing offered to anyone who finds Anna Lou Wellness, because understanding your inner world is not a luxury, it is the foundation.', cta_label: 'Send me the free Decoder' },
      { slug: 'reset-room', title: 'The Reset Room is your room.', blurb: 'Monthly somatic membership for women doing the work on their own pace. Private podcast (two new episodes a month), monthly live call with Anna, growing vault of guided journeys. £25 a month, no minimum term. The slow, steady door. Cancel any time.', cta_label: 'Step into the Reset Room' },
      { slug: 'reset', title: 'The Reset is the right starting place.', blurb: 'A six-week 1:1 somatic coaching programme. Weekly 90-minute sessions with Anna. Nervous-system led, trauma-informed, designed to bring your signal system back online. £1,500. The door for women whose body is already telling them it is time.', cta_label: 'Read about The Reset' },
      { slug: 'signal', title: 'Signal is the right depth.', blurb: 'Twelve weeks of 1:1 work for a complete identity rewrite. Not a starter programme. For women already deep in the work who need depth, structure, and a coach who can hold the shape of a real transformation. Application required.', cta_label: 'Apply for Signal' },
      { slug: 'signal-build', title: 'Signal & Build is where business meets nervous system.', blurb: 'Twelve weeks of 1:1 work for the founder rebuilding her business from the body up. Strategy, somatic coaching, and a clear plan for the work that does not destroy you to maintain. Application required.', cta_label: 'Apply for Signal & Build' },
      { slug: 'one-day', title: 'One Day is the right reset.', blurb: 'A full 1:1 day with Anna. On the houseboat at Taggs Island, or in your space if you prefer. No calendar, no interruptions. Brought together for one specific decision, one specific weight, one specific moment of clarity. Enquire for pricing.', cta_label: 'Enquire about One Day' },
    ],
  });

  // ═══ Sessions hub — top-level /the-work/sessions page hero ═══
  // Cards on this page come from the Coaching Session collection (extended
  // with `tagline` + `accent_colour` fields so the card visuals are CMS-driven).
  // This singleton only holds the page-level hero copy.
  await ensureSingleType(strapi, 'api::sessions-hub-page.sessions-hub-page', {});

  // Back-fill tagline + accent_colour on existing coaching-session entries so
  // the /the-work/sessions card grid renders them on first paint. Idempotent —
  // only fills empties, never overwrites Anna's edits.
  const SESSION_DEFAULTS = [
    { slug: 'founder-reset', tagline: 'For the founder at a sticking point in the business or in herself.', accent_colour: '#FAA21B' },
    { slug: 'dating-reset', tagline: 'For the woman noticing the same pattern showing up again.', accent_colour: '#F280AA' },
    { slug: 'nervous-system-reset', tagline: 'For the woman whose signal system is scrambled and needs bringing back online.', accent_colour: '#7BAFDD' },
  ];
  for (const def of SESSION_DEFAULTS) {
    try {
      const existing = await strapi.documents('api::coaching-session.coaching-session').findFirst({ filters: { slug: def.slug } });
      if (!existing) continue;
      const patch = {};
      if (!existing.tagline) patch.tagline = def.tagline;
      if (!existing.accent_colour) patch.accent_colour = def.accent_colour;
      if (Object.keys(patch).length > 0) {
        await strapi.documents('api::coaching-session.coaching-session').update({ documentId: existing.documentId, data: patch });
      }
    } catch (err) {
      strapi.log.warn(`[seed-pages] coaching-session backfill failed for ${def.slug}: ${err.message}`);
    }
  }

  // ═══ Experiences landing — top-level /experiences page ═══
  // Was hardcoded with 4 category cards inline. Now editable as a singleton
  // with a repeatable categories component so Anna can reorder, rename, or
  // add a fifth card without touching code.
  await ensureSingleType(strapi, 'api::experiences-landing-page.experiences-landing-page', {
    categories: [
      { title: 'Retreats', description: 'A few times a year, a small group comes to Taggs Island, Hampton for a full reset day. Six people maximum. No phones, no fixed agenda. We work with whatever the group needs, breathwork, somatic practice, Signal Method, honest conversation. People arrive wound tight and leave softer.', href: '/experiences/retreats', colour: '#7BAFDD', link_label: 'View retreats' },
      { title: 'Workshops', description: 'Group sessions held on the houseboat at Taggs Island, online, and in corporate spaces. Every workshop includes full access or a recording and summary. Crystal healing, breathwork, jewellery-making, and restorative practices.', href: '/experiences/workshops', colour: '#7BAFDD', link_label: 'View workshops' },
      { title: 'Corporate Wellbeing', description: 'Bespoke formats for teams and organisations. Workshops, keynotes, and ongoing wellbeing programmes. The Signal Method adapted for corporate environments. Available in person or online.', href: '/experiences/corporate-wellbeing', colour: '#7BAFDD', link_label: 'Enquire' },
      { title: 'Speaking', description: 'Anna speaks on somatic coaching, the founder journey, nervous system regulation, and building a business from the body up. Available for conferences, panels, podcasts, and private events.', href: '/experiences/speaking', colour: '#7BAFDD', link_label: 'Enquire' },
    ],
  });

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

  // ═══ Individual Experience entries (Anna's currently-selling products) ═══
  // Migrated from the legacy WooCommerce shop on annalouwellness.com.
  // Anna can edit these in Strapi → Work · Experience. Dates and prices match
  // what she was actively selling as of 22 May 2026; she will roll new dates
  // here as she announces them. Hero images intentionally not seeded — Anna
  // uploads via the CMS so they land in Cloudinary with correct EXIF rotation.
  const houseboatResetDescription = [
    'A one-day somatic experience on the water. Step out of the noise, reconnect to your body, and return to a steadier, clearer way of being.',
    'The day includes conscious connected breathwork and sacral activation, surrender and release rituals with flash EMDR and tapping, body-based work with pendulum guidance, and a somatic closing ceremony.',
    'You receive chai on arrival, ceremonial cacao, an alkaline lunch in the island garden, and all materials needed for the sessions. A pendulum is provided if you don\'t have one.',
    'You leave with a genuine nervous system reset, subconscious loops named and released, clarity on the next aligned move, and body trust restored. Six places maximum.',
    'Arrive from 9.00am for tea on the deck. Day runs 10.00am to 4.00pm.',
  ].join('\n\n');

  await ensure(strapi, 'api::experience.experience', 'houseboat-reset-2026-06-13', {
    name: 'Houseboat Nervous System Reset · 13 June',
    type: 'retreat',
    description: houseboatResetDescription,
    date: '2026-06-13',
    location: 'Taggs Island, Half Mile, Hampton, TW12 2HA',
    price: 115.00,
    price_label: '£115 · Day immersion',
    is_upcoming: true,
    is_active: true,
    sort_order: 10,
    seo_title: 'Houseboat Nervous System Reset — 13 June',
    seo_description: 'One-day somatic retreat on the Thames at Taggs Island. Breathwork, EMDR, somatic release. £115. Six places.',
  });

  await ensure(strapi, 'api::experience.experience', 'houseboat-reset-2026-06-27', {
    name: 'Houseboat Nervous System Reset · 27 June',
    type: 'retreat',
    description: houseboatResetDescription,
    date: '2026-06-27',
    location: 'Taggs Island, Half Mile, Hampton, TW12 2HA',
    price: 115.00,
    price_label: '£115 · Day immersion',
    is_upcoming: true,
    is_active: true,
    sort_order: 20,
    seo_title: 'Houseboat Nervous System Reset — 27 June',
    seo_description: 'One-day somatic retreat on the Thames at Taggs Island. Breathwork, EMDR, somatic release. £115. Six places.',
  });

  await ensure(strapi, 'api::experience.experience', 'houseboat-reset-2026-07-18', {
    name: 'Houseboat Nervous System Reset · 18 July',
    type: 'retreat',
    description: houseboatResetDescription,
    date: '2026-07-18',
    location: 'Taggs Island, Half Mile, Hampton, TW12 2HA',
    price: 115.00,
    price_label: '£115 · Day immersion',
    is_upcoming: true,
    is_active: true,
    sort_order: 30,
    seo_title: 'Houseboat Nervous System Reset — 18 July',
    seo_description: 'One-day somatic retreat on the Thames at Taggs Island. Breathwork, EMDR, somatic release. £115. Six places.',
  });

  await ensure(strapi, 'api::experience.experience', 'houseboat-reset-2026-07-25', {
    name: 'Houseboat Nervous System Reset · 25 July',
    type: 'retreat',
    description: houseboatResetDescription,
    date: '2026-07-25',
    location: 'Taggs Island, Half Mile, Hampton, TW12 2HA',
    price: 115.00,
    price_label: '£115 · Day immersion',
    is_upcoming: true,
    is_active: true,
    sort_order: 40,
    seo_title: 'Houseboat Nervous System Reset — 25 July',
    seo_description: 'One-day somatic retreat on the Thames at Taggs Island. Breathwork, EMDR, somatic release. £115. Six places.',
  });

  await ensure(strapi, 'api::experience.experience', 'align-and-amplify', {
    name: 'Align & Amplify · A One-Day Immersion in THE CODES',
    type: 'workshop',
    description: [
      'An exclusive one-day immersion anchored in THE CODES — Anna\'s signature framework for decoding subconscious blocks and aligning with your unique essence.',
      'Led personally by Anna Lou, drawing from 25 years scaling a 7-figure jewellery brand. Hosted on a private houseboat on the Thames at Taggs Island. Seven places maximum.',
      'The day includes a ceremonial cacao opening, somatic nervous system regulation, conscious connected breathwork, pendulum guidance, TRE tension release, and subconscious pattern work.',
      'You leave with a nervous system reset, subconscious loops released, and one clear next direction your system trusts.',
      'Day runs 10.00am to 4.00pm. Next available date confirmed on enquiry.',
    ].join('\n\n'),
    date: '2026-06-20',
    location: 'Taggs Island, Hampton (private houseboat on the Thames)',
    price: 90.00,
    price_label: '£90 · Day immersion',
    is_upcoming: true,
    is_active: true,
    sort_order: 50,
    seo_title: 'Align & Amplify — One-Day Immersion in THE CODES',
    seo_description: 'One-day immersion in Anna\'s CODES framework. Breathwork, somatic regulation, pattern work. £90. Seven places.',
  });

  await ensure(strapi, 'api::experience.experience', 'returning-circle-class', {
    name: 'The Returning Circle · Learn the Language of Your Nervous System',
    type: 'workshop',
    description: [
      'An intimate 60-minute session designed to help you understand your nervous system and develop practical self-regulation tools. Pay what you can afford.',
      'The class combines TRE (Trauma Release Experience) with gentle tremor work, conscious connected breathwork, chakra opening meditation, and nervous system education.',
      'You learn to recognise the signals your body is sending you and respond to them with compassion instead of override. Suitable if you feel disconnected from your body, want to understand your patterns, or just want practical tools for self-regulation.',
      'No prior experience required. Runs weekly, Tuesdays 2.00pm to 3.00pm.',
    ].join('\n\n'),
    date: '2026-05-26',
    location: 'Online (Zoom)',
    price: 5.55,
    price_label: '£5.55 · Pay what you can',
    is_upcoming: true,
    is_active: true,
    sort_order: 60,
    seo_title: 'The Returning Circle — Weekly Nervous System Class',
    seo_description: 'Weekly 60-min online class. TRE, breathwork, chakra meditation. Pay what you can afford, from £5.55.',
  });

  await ensure(strapi, 'api::experience.experience', 'rise-and-shine-7-figures', {
    name: 'Rise and Shine · To Get to 7 Figures',
    type: 'workshop',
    description: [
      'A powerful day session on the houseboat for leaders and entrepreneurs ready to elevate their business.',
      'The day challenges the societal narratives about success and emphasises that seven-figure achievement is within reach when you are willing to embrace your full potential.',
      'You engage in somatic practices, breathwork journeys, crystal energy work, and vulnerability release exercises. The focus is on becoming a powerful entrepreneur who honours her own needs, reduces stress, and pursues ambitious goals without sacrifice.',
      'For driven women who refuse to settle and are committed to rewriting the rules of leadership and entrepreneurship.',
      'Day runs 10.00am to 4.00pm.',
    ].join('\n\n'),
    date: '2026-07-04',
    location: 'Taggs Island, Half Mile, Hampton, TW12 2HA',
    price: 90.00,
    price_label: '£90 · Day session',
    is_upcoming: true,
    is_active: true,
    sort_order: 70,
    seo_title: 'Rise and Shine — Get to 7 Figures (Houseboat Day Session)',
    seo_description: 'One-day session for women entrepreneurs on the houseboat. Somatic work, breathwork, vulnerability release. £90.',
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
