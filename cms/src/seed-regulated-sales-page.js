'use strict';

/**
 * Seed the REGULATED sales-page Page entry from the 8 Jun HTML mockup
 * (Docs/REGULATED-sales-page-preview.html).
 *
 * Idempotent: if a Page with slug 'regulated' already exists we skip
 * entirely so Anna's edits are never overwritten. Run once on a clean
 * Strapi, then becomes a no-op.
 *
 * The Page slug 'regulated' shadows the URL /the-work/regulated. The
 * /the-work/[slug] dynamic route checks for a Page entry first and uses
 * the Page Builder render if found, falling back to the generic Programme
 * template if not. The Programme entry (also slug 'regulated', with the
 * grantsRegulatedAccess flag) stays as the source of truth for pricing
 * and Stripe checkout — the buy-programme section in this Page references
 * that Programme slug to render the Stripe button.
 */

const SLUG = 'regulated';
const PLUM = '#5B2E55';
const PLUM_LIGHT = '#E8DAE4';
const CREAM = '#F5F3EF';
const NEAR_BLACK = '#231F20';
const GOLD = '#FAA21B';
const RED = '#EE312F';

function section(component, data) {
  return { __component: component, ...data };
}

function style(opts = {}) {
  // Returns a shared.section-style payload. Empty fields default at render time.
  return {
    background_colour: opts.bg,
    text_colour: opts.text,
    accent_colour: opts.accent,
    padding: opts.padding || 'normal',
    alignment: opts.alignment || 'left',
    max_width: opts.max_width || 'medium',
  };
}

async function seedRegulatedSalesPage(strapi) {
  try {
    const existing = await strapi.db.query('api::page.page').findOne({ where: { slug: SLUG } });
    if (existing) {
      strapi.log.info(`[seed-regulated-sales-page] skip — Page with slug '${SLUG}' already exists`);
      return;
    }

    const sections = [
      // HERO — black bg, gold accent, huge serif title, italic subtitle
      section('sections.hero', {
        title: 'REGULATED',
        subtitle: 'The somatic art of staying anchored, open, and yourself in a dysregulating world.',
        cta_text: 'Yes, I want in',
        cta_link: '#join',
        cta_secondary_text: 'Pay what you feel · From £5',
        cta_secondary_link: '#join',
        overlay_opacity: 40,
        style: style({ bg: NEAR_BLACK, text: CREAM, accent: RED, padding: 'spacious', alignment: 'center', max_width: 'medium' }),
      }),

      // OPENING NARRATIVE — long-form text block, narrow column
      section('sections.text-block', {
        body:
          'A few weeks back, I sat with a client on the boat. Late afternoon light, soft on the water, and she was crying. Not because anything in particular had happened. Because everything had.\n\nThe news. The group chat. The school WhatsApp. The Instagram comments. The friend who keeps spiralling. The mother in law. The headlines.\n\n"How do you do it, Anna?" she asked. "How do you stay regulated when the world is this loud?"\n\nI have been getting some version of that question a lot lately.\n\n**Good questions. All of them.**\n\nThe world is loud right now. Louder than most of us have nervous systems trained to handle.\n\nAnd the world needs you. It really does.\n\nIt needs you grounded. It needs you in your work, your community, your family, your friendships, your activism, your art. It needs your voice. It needs your gifts.',
        style: style({ bg: CREAM, padding: 'spacious', alignment: 'left', max_width: 'narrow' }),
      }),

      // PULL QUOTE 1 — short, centred, plum
      section('sections.anchor-band', {
        words: 'This is not the moment to disappear.',
        background_colour: CREAM,
        text_colour: PLUM,
      }),

      // CONTINUED NARRATIVE
      section('sections.text-block', {
        body:
          'But here is the thing nobody tells you. There is a skill to this.\n\nA skill to staying engaged as a citizen without your cortisol running the show.\n\nA skill to caring deeply without dissolving into other people\'s pain.\n\nA skill to being present with your children, your partner, your clients, your colleagues, without coming home empty.\n\nA skill to scrolling and not internalising. To witnessing and not absorbing. To holding your own ground when everything around you is shaking.',
        style: style({ bg: CREAM, padding: 'tight', alignment: 'left', max_width: 'narrow' }),
      }),

      // THE TRUTH
      section('sections.text-block', {
        heading: 'You are absorbing what was never yours to carry.',
        body:
          'You are not just tired. You are not too sensitive. You are not weak. You are not dramatic.\n\nYou are absorbing a tremendous amount of energy that was never yours to carry.\n\nThrough the news. Through the algorithm. Through the people in your life who do not know how to regulate themselves and have made you, somewhere along the way, their regulation strategy.\n\nYour nervous system has been picking up signal that does not belong to you. And until you learn how to clear it, ground it, and become unavailable to it, you will keep paying for it. With your sleep. With your patience. With your peace. With your capacity to actually show up for the things that matter.',
        style: style({ bg: CREAM, padding: 'spacious', alignment: 'left', max_width: 'narrow' }),
      }),

      // WHAT YOU ACTUALLY NEED
      section('sections.text-block', {
        heading: 'Skills, not slogans.',
        body:
          'You need somatic skills, not just self help quotes.\n\nYou need clean boundaries, both spoken and unspoken.\n\nYou need to know what is yours to feel and what is simply atmosphere.\n\nYou need to be able to stay open without becoming porous, and engaged without becoming entangled.\n\nYou need a practice that brings you back to your own body, your own breath, your own signal, when the noise is at full volume.',
        style: style({ bg: CREAM, padding: 'spacious', alignment: 'left', max_width: 'narrow' }),
      }),

      // INSIDE REGULATED — numbered list, plum-light background
      section('sections.numbered-list', {
        eyebrow: 'Inside REGULATED · You will learn',
        heading: 'A new pay-what-you-feel course.',
        items: [
          { heading: 'What somatic protection actually is', body: 'And how to use it in real time when the chaos arrives. A set of nervous system practices you can begin using today, on the bus, in the meeting, in bed at 3am.' },
          { heading: 'How to create clean boundaries', body: 'The kind that come from your body before they come from your mouth. With trolls, with mean girls, with in laws, with the well meaning people in your life who are projecting, leaking, taking, and asking you to carry what is not yours.' },
          { heading: 'How to engage with the world online and offline', body: 'From a regulated, sovereign, grounded place, without losing access to your softness.' },
          { heading: 'How to stay informed', body: 'And awake to what is happening, both close to home and globally, without your nervous system going into freeze, fawn, or flood. You are allowed to be furious. You are also allowed to be regulated. Both. At the same time.' },
          { heading: 'How to cultivate that deep, embodied knowing', body: 'Of "I am safe in myself, I am rooted, I am not for sale," and become genuinely unavailable for what was never yours to carry.' },
        ],
        style: style({ bg: PLUM_LIGHT, accent: PLUM, padding: 'spacious', alignment: 'center', max_width: 'medium' }),
      }),

      // CTA 1 — buy button mid-page
      section('sections.buy-programme', {
        programme_slug: SLUG,
        label: 'Yes, I want in',
        secondary_text: 'Pay what you feel · From £5',
        style: style({ bg: CREAM, accent: RED, padding: 'spacious', alignment: 'center' }),
      }),

      // LET ME BE CLEAR
      section('sections.text-block', {
        heading: 'This is not about going numb.',
        body:
          'This is not about going numb. It is not about checking out. It is not about pretending you do not care.\n\nThis is about learning to stop unconsciously absorbing other people\'s fear, projections, opinions, and chaos, and returning, gently and consistently, to the safety that lives inside your own body.\n\nIt is about knowing what is yours to feel, yours to act on, yours to hold. And what is simply weather.\n\nIt is about staying open without being porous. Engaged without being entangled. Tender without being trampled.\n\nSo that when the noise comes (and it will come), you do not lose yourself in it.\n\nI am, genuinely, mostly unaware of what people say about me online. There are about a million things I care about more. Starting with the people on my boat and ending with the work I am here to do.',
        style: style({ bg: CREAM, padding: 'spacious', alignment: 'left', max_width: 'narrow' }),
      }),

      // PULL QUOTE 2
      section('sections.anchor-band', {
        words: 'You get to be that woman too.',
        background_colour: CREAM,
        text_colour: PLUM,
      }),

      // ANCHOR QUOTE BAND — the iconic 4-word line on black
      section('sections.anchor-band', {
        words: 'Anchored. Clear. Sovereign. Yours.',
        background_colour: NEAR_BLACK,
        text_colour: GOLD,
      }),

      // A FINAL WORD
      section('sections.text-block', {
        heading: 'Come home to your nervous system.',
        body:
          'There is an art to staying engaged with the world while being completely unavailable for projection, chaos, and the things that were never yours to fix.\n\nIf you have been feeling overstimulated, overextended, quietly exhausted, reactive in ways you do not love, or like you are leaking energy you cannot afford to lose, this course was made for you.\n\nCome home to your nervous system. Come back to your body. Come back to yourself.',
        style: style({ bg: CREAM, padding: 'spacious', alignment: 'left', max_width: 'narrow' }),
      }),

      // ARE YOU READY + PAY-WHAT-YOU-FEEL + FINAL CTA
      section('sections.text-block', {
        heading: 'Are you ready?',
        body:
          'This grounded, practical, somatic course on nervous system sovereignty, clean boundaries, and staying yourself in a loud world is available now as your way in to the Anna Lou Wellness world.\n\nThis is a pay what you feel offering. You choose what feels right for you. Full details on the checkout page.\n\nOnce you are inside, you will also get a first look at The Reset Room, the membership space where this work goes deeper, week after week.',
        style: style({ bg: CREAM, padding: 'normal', alignment: 'center', max_width: 'narrow' }),
      }),

      section('sections.pay-what-you-feel', {
        label: 'Pay what you feel',
        price: 'from £5',
        note: 'You choose what feels right. Full details at checkout.',
        style: style({ bg: CREAM, accent: PLUM, padding: 'tight' }),
      }),

      // FINAL CTA — anchor target for the hero #join link
      section('sections.buy-programme', {
        programme_slug: SLUG,
        label: 'Step inside REGULATED',
        secondary_text: 'Trauma informed · Somatic · Sovereign',
        anchor_id: 'join',
        style: style({ bg: CREAM, accent: RED, padding: 'spacious', alignment: 'center' }),
      }),
    ];

    await strapi.entityService.create('api::page.page', {
      data: {
        title: 'REGULATED',
        slug: SLUG,
        summary: 'The somatic art of staying anchored, open, and yourself in a dysregulating world. Pay what you feel, from £5.',
        sections,
        seo_title: 'REGULATED · A somatic course on nervous-system sovereignty',
        seo_description: 'The somatic art of staying anchored, open, and yourself in a dysregulating world. Pay what you feel, from £5. By Anna Lou Wellness.',
        publishedAt: new Date(),
      },
    });

    strapi.log.info(`[seed-regulated-sales-page] created Page entry slug='${SLUG}' with ${sections.length} sections`);
  } catch (err) {
    strapi.log.warn(`[seed-regulated-sales-page] failed: ${err.message}`);
  }
}

module.exports = seedRegulatedSalesPage;
