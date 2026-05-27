'use strict';

/**
 * Idempotent FAQ seeder.
 *
 * For every page in PAGE_SEEDS, creates 4-5 starter FAQ entries the first
 * time the page has zero rows. If Anna has already added or edited FAQs for
 * a page, the seeder skips that page entirely — never trampling her work.
 *
 * To add new starter content for a page Anna hasn't touched yet, just edit
 * PAGE_SEEDS and re-deploy. To force a re-seed, delete all FAQs for that
 * page in Strapi and the next bootstrap will refill.
 */

const PAGE_SEEDS = {
  'the-reset': [
    { q: 'How is The Reset different from therapy?', a: 'Therapy mostly works through talking and insight. The Reset works through the body — somatic enquiry, nervous-system regulation, and the patterns that fire before your conscious mind catches up. They sit alongside each other beautifully.' },
    { q: 'Do I need to be in crisis to book?', a: 'No. Most Reset clients are functioning well on the outside. They come because the inside is not matching the outside any more, and they want to close that gap.' },
    { q: 'What if six weeks is not enough?', a: 'Many clients roll into Signal (twelve weeks) at the end. Many do not — six weeks is genuinely enough to feel something real shift. There is no pressure either way.' },
    { q: 'Is this 1:1 or group?', a: 'Fully 1:1. Six weekly 60-minute sessions, just you and Anna.' },
    { q: 'How is the £1,500 paid?', a: 'In full at booking, or two instalments of £750 across the six weeks. If cost is a barrier, mention it in your enquiry — Anna holds a small number of reduced-rate places each quarter.' },
  ],
  'signal': [
    { q: 'How is Signal different from The Reset?', a: 'Signal is twelve weeks instead of six. Same 1:1 format, same Voxer support — but the longer container means we can go deeper into the patterns underneath the patterns. The Reset is brilliant for one focused shift. Signal is for whole-system rewire.' },
    { q: 'Can I start with The Reset and roll into Signal?', a: 'Yes. Many clients do exactly that. The fee already paid for The Reset is credited toward Signal if you decide to extend.' },
    { q: 'What does the in-person Hampton session involve?', a: 'A single 90-minute session on the houseboat at Taggs Island, optional, usually around week six. Useful as a deeper integration point — but Signal works completely virtually too.' },
    { q: 'How much support is included between sessions?', a: 'Voxer access Tuesday to Thursday. Voice or text. Anna replies within the working day.' },
    { q: 'What does the £3,000 include?', a: 'Twelve 1:1 sessions, Voxer support throughout, the personalised Signal Method workbook, and lifetime access to your session recordings. Three instalments of £1,000 if you prefer.' },
  ],
  'signal-and-build': [
    { q: 'Who is this for?', a: 'Founders, coaches, consultants, and leaders building something real. People who are already in motion and want to regulate the inner world that the business is running on.' },
    { q: 'How is the business strategy delivered?', a: 'Interleaved with the inner work. Some sessions are pure somatic. Some are pricing, positioning, capacity, decision-making. Most are a blend — because in practice the two are inseparable.' },
    { q: 'Do you guarantee revenue outcomes?', a: 'No. Anyone who guarantees revenue outcomes from coaching is selling you something. What clients consistently report is clearer decisions, less reactive leadership, and a business that stops costing them their nervous system.' },
    { q: 'What is the Voxer access like?', a: 'Tuesday to Thursday for both inner-world and in-the-moment business questions. Anna built Anna Lou of London across Harrods, Selfridges, Liberty and Harvey Nichols — practical experience is on tap.' },
    { q: 'Can I expense this as a business investment?', a: 'Anna invoices through her UK Ltd company. Many clients put it through their business as a leadership development expense — please check with your own accountant.' },
  ],
  'one-day': [
    { q: 'Why a single day instead of a series of sessions?', a: 'Some work needs concentration, not distribution. A day removes the start-stop friction of weekly sessions. By 3pm you are usually in a place you would not reach in a normal six-session container.' },
    { q: 'In person or online — which works better?', a: 'Both work. In person on the houseboat is more immersive (the river itself does work). Online is logistically easier and Anna has run dozens of brilliant virtual Days. Pick what your nervous system actually has capacity for.' },
    { q: 'What does the price include?', a: 'Pricing is bespoke per Day. The pre-day scoping call, the day itself, lunch and refreshments if in person, and the two-week integration call are all included.' },
    { q: 'What if I get there and freeze?', a: 'Most people do, at some point. Freezing is data. We work with it as it shows up — that is the work.' },
    { q: 'Can I bring a specific issue or topic?', a: 'Yes — the pre-day intake captures exactly that. Anna shapes the day around it. Bring it in writing if it helps.' },
  ],
  'signal-collective': [
    { q: 'How is the Collective different from 1:1 Signal?', a: 'You get a monthly 1:1 plus two group calls a month and a private community. It is the depth of 1:1 work alongside peer co-regulation with women operating at a similar level.' },
    { q: 'Why is it by application?', a: 'Group containers only work when everyone in them is genuinely ready. Anna reads every application and personally chooses each cohort.' },
    { q: 'When does the next cohort start?', a: 'Cohorts open twice a year. The next intake date is announced to the Reset Letters mailing list first — sign up to be told ahead of public release.' },
    { q: 'Is the group space on social media?', a: 'No. The community sits on a private platform, off Instagram, off Facebook. Privacy is part of why it works.' },
    { q: 'What is the investment?', a: 'By enquiry once your application is reviewed. Anna will share the full fee structure on the discovery call.' },
  ],
  'sessions': [
    { q: 'How do single sessions differ from a programme?', a: 'A single session is 90 minutes on one specific theme — useful when you have a clear decision to make or one pattern you want to look at. A programme is the longer arc of real change.' },
    { q: 'Can I book one to see if Anna is the right fit?', a: 'Yes — many clients do exactly that. A Reset Session is also a great way to test whether the longer 6 or 12-week container is for you.' },
    { q: 'What happens after I book?', a: 'You get a short intake form by email and a calendar link to choose your slot. The session is on Zoom. A written summary lands in your inbox within 48 hours of the session.' },
    { q: 'Can I roll a session into a longer programme later?', a: 'Yes. The £200 session fee credits toward The Reset or Signal if you book within four weeks.' },
    { q: 'Is there a refund policy?', a: 'Full refund if you cancel more than 48 hours before your session. Within 48 hours, the session can be moved once free of charge.' },
  ],
  'recovery': [
    { q: 'Is this only for people who have left the relationship?', a: 'No. Some clients are still navigating contact (co-parenting, work, family). The work meets you where you are.' },
    { q: 'How is somatic recovery different from talk therapy?', a: 'Talk therapy works on the story. Somatic recovery works on the body-level residue — the hypervigilance, the fawn, the freeze, the chronic activation. You can understand what happened and still feel it firing. The body is where the rewire happens.' },
    { q: 'Is the phone support optional?', a: 'Yes. £60 per week add-on, up to four 60-minute calls a month. Useful in the early weeks for many clients. Not required.' },
    { q: 'What if I cannot afford the full fee?', a: 'Anna shapes pricing to the situation. A small number of reduced-rate places are held for women genuinely unable to pay full price. Mention it in your enquiry — there is no judgement.' },
    { q: 'Will this trigger me?', a: 'Recovery work is by nature confronting. Anna is trauma-informed and paces the work carefully. You stay in the driving seat the whole way.' },
  ],
  'the-work': [
    { q: 'I am not sure which programme is right for me — how do I choose?', a: 'Take the [3-minute quiz](/the-work/quiz) for a tailored recommendation. Or book a free 15-minute discovery call and Anna will help you decide.' },
    { q: 'What is The Signal Method?', a: 'Anna\'s framework for somatic coaching — nervous-system regulation, inner-guidance work, and pattern release combined. It underpins every programme on this page.' },
    { q: 'Are all sessions virtual?', a: 'Default is virtual on Zoom. In-person sessions are available at the Hampton studio for most programmes — see the individual programme pages.' },
    { q: 'Do you take male clients?', a: 'Anna\'s practice is currently focused on women. For male enquiries, she is happy to point you to trusted practitioners — just ask via the contact form.' },
    { q: 'How quickly can I start?', a: 'Most programmes can begin within 1-2 weeks of a confirmed discovery call. Specific in-person dates depend on availability.' },
  ],
  'retreats': [
    { q: 'Where is the houseboat?', a: 'Taggs Island, Hampton — about 30 minutes from central London by train. Full travel directions go out with your booking confirmation.' },
    { q: 'How many people attend each retreat?', a: 'Six maximum. The intimate group size is non-negotiable — it is part of what makes the day work.' },
    { q: 'What is included in the retreat fee?', a: 'A full day of guided practice, lunch prepared on the houseboat, refreshments throughout, and the take-home integration guide.' },
    { q: 'Can I bring a friend?', a: 'Of course — both of you would need to book separately. Many people find arriving with a friend makes the first retreat easier.' },
    { q: 'I have never done somatic work before — is this for me?', a: 'Yes. Retreats are designed for all levels. No prior somatic experience needed.' },
  ],
  'workshops': [
    { q: 'Are workshops online or in person?', a: 'Both. Most workshops have an in-person option on the houseboat and a live Zoom option for everyone else. Recordings are also added to the Reset Room library.' },
    { q: 'What is the typical workshop length?', a: 'Most run 90 minutes to 2 hours. Day-long workshops are run a few times a year and announced separately.' },
    { q: 'Do I need to attend live or can I watch the replay?', a: 'Either. Live attendance is brilliant for the energy of the room. The replay still lets you do the practice in your own time.' },
    { q: 'How do I hear about new workshop dates?', a: 'Sign up to Reset Letters at the bottom of any page — workshop dates are announced there first, before public release.' },
    { q: 'Is there a workshop refund policy?', a: 'Full refund up to 7 days before the workshop date. Within 7 days, you can transfer your spot to a friend or to the next workshop.' },
  ],
  'corporate-wellbeing': [
    { q: 'What size of team do you typically work with?', a: 'Anything from intimate leadership teams of 6-10 up to all-staff sessions of 200+ for keynote formats.' },
    { q: 'How quickly can you turn around a proposal?', a: 'Anna writes every proposal personally and responds within 48 hours of an enquiry. Pricing is bespoke per engagement.' },
    { q: 'Do you travel for corporate work?', a: 'Yes — UK and Europe by default, further afield by arrangement. Travel costs are added at cost.' },
    { q: 'Can this be billed through procurement?', a: 'Yes. Anna invoices through her UK Ltd company and is set up on most major procurement systems.' },
    { q: 'What outcomes do teams typically report?', a: 'Less reactive decision-making, clearer team communication, reduced burnout cycles, and a shared somatic vocabulary the team can keep using. Anna can share case studies on a call.' },
  ],
  'speaking': [
    { q: 'What is your typical speaking fee?', a: 'Fees vary by event format, audience size, and whether it is a brand-aligned engagement. Anna shares a fee guide in her response to every enquiry.' },
    { q: 'Do you do free speaking for charity or community events?', a: 'Yes, a small number per year — particularly for women\'s mental health and narcissistic abuse recovery causes.' },
    { q: 'How far in advance should we book?', a: 'For keynotes ideally 3-6 months out. Smaller events and panels can sometimes be arranged within a few weeks.' },
    { q: 'Can you record a custom talk for our event?', a: 'Yes — pre-recorded keynotes are available for online events, conferences, and internal team channels.' },
    { q: 'What topics can be tailored to a specific audience?', a: 'All of them. Anna re-shapes every talk to the room she is walking into. The brief you send sets the direction.' },
  ],
  'reset-room': [
    { q: 'What if I cancel?', a: 'Your access continues until the end of your current billing month. No questions, no hard sell. You can rejoin any time.' },
    { q: 'Do I need to use a podcast app?', a: 'No. Episodes also play directly inside the member dashboard. The podcast player option is there if you prefer it.' },
    { q: 'Can I join just for one month?', a: 'Yes. There is no minimum term. Many members come in for a month, do the founding journeys, and decide whether to stay.' },
    { q: 'Is this a course?', a: 'No. It is a room. There is no curriculum, no progression path, no feeling behind. You come in when you need it, take what you need, and stay as long as it serves you.' },
    { q: 'Is the live call recorded?', a: 'Yes — the replay lands in the Vault by Friday lunchtime. Live attendance is not required. Most members watch the replay.' },
  ],
  'the-returning-circle': [
    { q: 'Do I need to be a member of the Reset Room to come?', a: 'No. The Returning Circle is open to anyone — donation-based, drop in when you can.' },
    { q: 'What do I pay?', a: 'Whatever feels right. There is a suggested £10 per session, but pay nothing if money is tight, or more if you want to help cover someone else.' },
    { q: 'Can I just watch and not speak?', a: 'Yes. Many people do exactly that for the first few circles. Speaking is never required.' },
    { q: 'Is the circle recorded?', a: 'Live attendees only — recordings are not made available publicly out of respect for the privacy of the room. The Reset Room vault holds curated practice content instead.' },
    { q: 'How do I find the houseboat if I am coming in person?', a: 'Full directions go out with your RSVP confirmation. Taggs Island is a 5-minute walk from Hampton train station.' },
  ],
  'membership': [
    { q: 'What do I get for £25 a month?', a: 'Monthly live group session, full access to the replay library and Signal Method workbook, the monthly Signal Check email, and access to the Reset Room community.' },
    { q: 'How do I cancel?', a: 'One click in your member portal. No phone call, no email exchange. Cancel any time, no minimum term.' },
    { q: 'Can I get a free trial?', a: 'Yes — if you have attended any paid workshop in the last three months, your first month is free. Use the same email at signup.' },
    { q: 'Is this the same as The Reset Room?', a: 'Yes — The Reset Room is the name of the membership. Same thing.' },
    { q: 'What payment methods do you accept?', a: 'All major cards via Stripe. Apple Pay and Google Pay supported at checkout.' },
  ],
  'shop': [
    { q: 'How long does delivery take?', a: 'UK orders: 2-3 working days. International: 5-10 working days depending on destination. You\'ll get a tracking link as soon as we dispatch.' },
    { q: 'Can I return a piece if it is not right?', a: 'Yes — 30-day returns on non-personalised pieces in original condition. Personalised pieces are made to order and not returnable unless faulty.' },
    { q: 'Are the pieces ethically made?', a: 'Yes. All manufacturing happens in the UK at the Design Lab on Taggs Island. We know everyone who works on every piece.' },
    { q: 'Do you offer gift wrapping?', a: 'Every order is sent in our signature gift packaging at no extra cost.' },
    { q: 'How do I care for my piece?', a: 'A care card comes with every order. In short: store in the pouch, avoid water and perfume, polish gently with a soft cloth.' },
  ],
  'about': [
    { q: 'How long has Anna been coaching?', a: 'Anna trained as a somatic, trauma-informed coach after a 25-year career building Anna Lou of London. She coaches full-time now alongside the brand.' },
    { q: 'What credentials does Anna hold?', a: 'ICF-accredited coach, CPD-certified, and trained provider of TRE® (Tension and Trauma Releasing Exercises). Additional clinical training in Flash EMDR, IFS parts work, and Brainspotting.' },
    { q: 'Is Anna available for press or media?', a: 'Yes — please use the [press page](/about/press) to download the press kit and request interview slots.' },
    { q: 'Does Anna take on collaborators or partnerships?', a: 'Selectively. See the [Work With Me page](/about/partnerships) for current openings.' },
    { q: 'Where is Anna based?', a: 'London, UK. The studio and houseboat are at Taggs Island, Hampton. Most coaching is virtual; in-person sessions are at Hampton by arrangement.' },
  ],
  'contact': [
    { q: 'How quickly does Anna reply?', a: 'Within 48 hours on weekdays. Recovery and 1:1 enquiries are read and answered personally by Anna.' },
    { q: 'What is the best way to reach the team?', a: 'For coaching: this form or the discovery call link. For press: see the press page. For partnerships: see Work With Me. For shop orders: hello@annalouwellness.com.' },
    { q: 'Can I book a free discovery call?', a: 'Yes — every coaching programme includes a free 15-minute discovery call. Use the contact form and we\'ll send a booking link.' },
    { q: 'Do you offer in-person consultations?', a: 'Yes — at the Hampton studio by arrangement. Most discovery calls happen virtually first.' },
    { q: 'Is there an address I can post to?', a: 'Studio post can go to: Anna Lou Wellness, Taggs Island, Hampton, London. Please email first to confirm a parcel is incoming.' },
  ],
  'testimonials': [
    { q: 'Can I leave a review?', a: 'Yes — Anna would love that. Email hello@annalouwellness.com with your story (text, photo, or video) and we will add it to the wall with your permission.' },
    { q: 'Are these reviews verified?', a: 'Yes. Every reviewer is a real coaching client, retreat attendee, or member. We do not run incentivised reviews or use stock testimonials.' },
    { q: 'Can I be anonymous?', a: 'Absolutely. Many reviewers share a first name only or a profession only. Tell us what you are comfortable with.' },
    { q: 'How do you choose which stories to feature as banners?', a: 'The banner format is reserved for stories where the reviewer is happy for their full story to be told at length. Most reviews live in the standard card layout.' },
  ],
};

async function seedFAQs(strapi) {
  let createdTotal = 0;
  let skippedPages = 0;

  for (const [page, items] of Object.entries(PAGE_SEEDS)) {
    const existing = await strapi.entityService.findMany('api::faq.faq', {
      filters: { page },
      limit: 1,
    });
    if (existing && existing.length > 0) {
      skippedPages++;
      continue;
    }
    for (let i = 0; i < items.length; i++) {
      const { q, a } = items[i];
      await strapi.entityService.create('api::faq.faq', {
        data: {
          question: q,
          answer: a,
          page,
          sort_order: (i + 1) * 10,
          is_active: true,
        },
      });
      createdTotal++;
    }
    strapi.log.info(`[seed-faqs] seeded ${items.length} FAQs for page "${page}"`);
  }

  strapi.log.info(`[seed-faqs] done — created ${createdTotal}, skipped ${skippedPages} pages already populated`);
}

module.exports = seedFAQs;
