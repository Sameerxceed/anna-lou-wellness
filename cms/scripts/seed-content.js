/**
 * Seed Script — Anna Lou Wellness
 * Populates Strapi with articles, categories, coaching sessions, etc.
 *
 * Usage:
 *   STRAPI_URL=http://... STRAPI_EMAIL=admin@... STRAPI_PASSWORD=... node scripts/seed-content.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://si0ji9oa9ur0i32dtapo4k0w.217.160.147.201.sslip.io';
const ADMIN_EMAIL = process.env.STRAPI_EMAIL || '';
const ADMIN_PASSWORD = process.env.STRAPI_PASSWORD || '';

const API_TOKEN = process.env.STRAPI_TOKEN || '450ab5b5f933cd11b040324a85a9ae9622f671278bbb087ca24362c231d346abbf718d8c7770e32a141f03c055f03d8a87c4abd05a351fd443655b7f6a4bb270b9397aa4e3514fa3a693d133672c2846753c36cd677f80f3abdbd85ef76fc9fb12ca69c8b59671ec47af41bd7140816982d706160e4a1a1477a778c9af9db299';

async function login() {
  console.log('Using API token for authentication');
}

async function api(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${STRAPI_URL}/api${endpoint}`, opts);
  return res.json();
}

async function findOrCreate(endpoint, uniqueField, uniqueValue, data) {
  const existing = await api(`${endpoint}?filters[${uniqueField}][$eq]=${encodeURIComponent(uniqueValue)}`);
  if (existing.data?.length > 0) {
    console.log(`  [skip] ${uniqueValue} already exists`);
    return existing.data[0];
  }
  const created = await api(endpoint, 'POST', { data });
  if (created.data) {
    console.log(`  [created] ${uniqueValue}`);
    return created.data;
  }
  console.log(`  [error] ${uniqueValue}:`, JSON.stringify(created).slice(0, 200));
  return null;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function estimateReadTime(text) {
  const words = text.split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  return `${mins} min read`;
}

// ═══ CATEGORIES ═══

const categories = [
  // Reset Stories sub-categories
  { name: 'Holding Everything', slug: 'holding-everything', section: 'reset-stories', colour: '#6E3A5A', sort_order: 1 },
  { name: 'The Strong One', slug: 'the-strong-one', section: 'reset-stories', colour: '#6E3A5A', sort_order: 2 },
  { name: 'Signal vs Noise', slug: 'signal-vs-noise', section: 'reset-stories', colour: '#6E3A5A', sort_order: 3 },

  // Life sub-categories
  { name: 'Style and Beauty', slug: 'style-and-beauty', section: 'life', colour: '#FAA21B', sort_order: 1 },
  { name: 'Houseboat Life', slug: 'houseboat-life', section: 'life', colour: '#FAA21B', sort_order: 2 },
  { name: 'Spiritual Hygiene', slug: 'spiritual-hygiene', section: 'life', colour: '#FAA21B', sort_order: 3 },
  { name: 'Rituals and Energy', slug: 'rituals-and-energy', section: 'life', colour: '#FAA21B', sort_order: 4 },
  { name: 'Food and Nourishment', slug: 'food-and-nourishment', section: 'life', colour: '#FAA21B', sort_order: 5 },
  { name: 'Home and Space', slug: 'home-and-space', section: 'life', colour: '#FAA21B', sort_order: 6 },
  { name: 'Decluttering', slug: 'decluttering', section: 'life', colour: '#FAA21B', sort_order: 7 },
  { name: 'Educational', slug: 'educational', section: 'life', colour: '#FAA21B', sort_order: 8 },
  { name: 'Weekend Finds', slug: 'weekend-finds', section: 'life', colour: '#FAA21B', sort_order: 9 },

  // Love sub-categories
  { name: 'Dating and Patterns', slug: 'dating-and-patterns', section: 'love-and-relationships', colour: '#F280AA', sort_order: 1 },
  { name: 'Breakups and Reset', slug: 'breakups-and-reset', section: 'love-and-relationships', colour: '#F280AA', sort_order: 2 },
  { name: 'Friendship', slug: 'friendship', section: 'love-and-relationships', colour: '#F280AA', sort_order: 3 },
  { name: 'Motherhood', slug: 'motherhood', section: 'love-and-relationships', colour: '#F280AA', sort_order: 4 },
  { name: 'Self Worth and Identity', slug: 'self-worth-and-identity', section: 'love-and-relationships', colour: '#F280AA', sort_order: 5 },

  // Work sub-categories
  { name: 'Founder Reset', slug: 'founder-reset', section: 'work-and-money', colour: '#FFD07A', sort_order: 1 },
  { name: 'Burnout and Nervous System', slug: 'burnout-and-nervous-system', section: 'work-and-money', colour: '#FFD07A', sort_order: 2 },
  { name: 'Signal Method', slug: 'signal-method', section: 'work-and-money', colour: '#FFD07A', sort_order: 3 },
  { name: 'Career and Direction', slug: 'career-and-direction', section: 'work-and-money', colour: '#FFD07A', sort_order: 4 },
  { name: 'Money and Worth', slug: 'money-and-worth', section: 'work-and-money', colour: '#FFD07A', sort_order: 5 },
];

// ═══ ARTICLES ═══

const articles = [
  // RESET STORIES (Vol 1)
  {
    title: 'I worked so hard not to feel overwhelmed. So why am I still holding everything?',
    category_slug: 'holding-everything',
    is_featured: true,
    body: `I've spent years learning how not to feel overwhelmed. Regulating. Breathing. Stepping back. Rewriting the patterns. And it's worked. I don't spiral like I used to. From the outside, it probably looks like I've got it handled.

But I noticed something. I'm not overwhelmed. I'm just still holding everything. The plans. The energy. The emotional temperature of everything around me. Doing it so well that no one would even realise.

And for a moment I thought — well, isn't that the goal? To be able to handle everything?

But it didn't feel like peace. It felt like pressure in a prettier outfit.

So I've been asking a different question. Not how do I cope better. But where do I get to stop holding so much? Where do I soften? Where do I not step in? Even just by one degree.

Because maybe the next level isn't about managing everything more gracefully. Maybe it's about not gripping so tightly in the first place.

I've been reaching for Clear Quartz when my mind is doing too much. Moonstone when I need to come back to myself. Not as a fix. Just as a moment. Something that quietly says — you don't have to hold all of this.

Where in your life are you still holding more than you need to?`,
  },
  {
    title: 'Turns out I\'m the pattern. We move.',
    category_slug: 'signal-vs-noise',
    body: `I have done the breathwork. I have done the somatic sessions. I have sat in a cacao ceremony in a yurt in Glastonbury and cried with twelve strangers while someone played a singing bowl at a frequency that apparently rearranged my DNA.

Then I went home. And someone wanted to know what was for dinner.

Babe. I just had a kundalini awakening in the Tesco car park.

This is the gap nobody talks about. Between who you're becoming and whoever still needs feeding.

The harder thing I've had to sit with: I kept clearing the energy, clearing the space, clearing other people. And the same dynamic kept appearing. Different face. Same feeling.

I have cleared every chakra. I have cleared every man. Turns out I'm the pattern.

We move.

This is actually the most hopeful thing I've ever realised. Because if I'm the pattern, I'm also the solution. The work isn't out there. It never was. Understanding that — in your body not just your head — is the moment things actually start to shift.`,
  },
  {
    title: 'The problem with being the strong one.',
    category_slug: 'the-strong-one',
    body: `I was the strong one for most of my adult life. The one who kept going. The one who didn't fall apart in front of people. The one everyone brought their problems to because I seemed to know what to do with them.

Some of us handled the hard things by becoming so extraordinarily useful to everyone around us that we never had to look at our own boxes.

Some of us handled it by making ourselves very, very quiet.

And some of us handled it by going on a seventeen-year spiritual journey that has so far resulted in no external change whatsoever.

But here we are. Everything life has thrown at us — we handled it. Not always elegantly. But we handled it.

The work is not to stop being strong. The work is to discover that you can be both — strong and supported, capable and cared for, resilient and real. Not one or the other. Both at the same time.

That's what coming home to yourself actually looks like.`,
  },

  // STYLE & DESIGN (Vol 1) → Life > Style and Beauty
  {
    title: 'What I wore every day this month — and why it matters more than you think.',
    category_slug: 'style-and-beauty',
    body: `I've been wearing the same things for four weeks. Not because I ran out of ideas. Because I finally found mine.

The beauty uniform — a consistent, intentional way of dressing that removes the daily decision — has been one of the most unexpectedly powerful things I've introduced. Not because it makes me look better. Because it removes a tiny daily drain on my nervous system.

Every morning I reach for the same few pieces. Wide leg linen. The Return Hoops, because they catch the light in a way I can't quite explain except that it lifts something. A crystal pendant chosen based on what the day is asking for.

My one rule: each piece either holds a memory, supports how I want to feel, or both. No obligation. No performance. Just getting dressed with intention.

This is smaller than it sounds and more powerful than it looks.`,
  },
  {
    title: 'The houseboat interiors that cost almost nothing.',
    category_slug: 'houseboat-life',
    body: `The aesthetic on Half Mile did not come from a designer. It came from twenty-five years of knowing what I like, approximately forty pounds of charity shop finds, and the fortunate discovery that driftwood is free if you live on a river.

Every object earns its place. Not by being useful but by being meaningful. The crystals face the water. The throws are the colour of the Thames at low tide. The jewellery is laid out on a piece of driftwood because I like to see it, not because it photographs well.

If your home doesn't feel like yours, start small. One surface. Clear everything that doesn't make you feel something. Then notice what you put back. That's your aesthetic. It was there all along.`,
  },
  {
    title: 'The gift guide for the woman who has been through something.',
    category_slug: 'style-and-beauty',
    body: `Every gift guide I've ever read is for the woman who has everything. This one is for the woman who has been through something.

Not self-care in the bubble bath sense. In the I need something to hold when it's three in the morning sense.

Moonstone — for when you need to trust your own knowing again. The Exhale Necklace — a physical reminder to breathe. Palo Santo — because sometimes you just need to clear the room. The Crystal Starter Kit — for beginning a practice that actually helps.

These aren't luxury items. They're tools for the inner world. They're what I reach for when I need to come back to myself. They might be what she needs too.`,
  },

  // HOUSEBOAT LIFE (Vol 1) → Life > Houseboat Life
  {
    title: 'Living on Taggs Island — what the water teaches you about letting go.',
    category_slug: 'houseboat-life',
    is_featured: true,
    body: `I have lived on a floating island for long enough now that certain things have become non-negotiable. You do not fight the river. You do not ignore the tide. You do not assume the weather will cooperate.

The metaphors write themselves. But they also happen to be literally true.

Living on water teaches you, daily, that control is an illusion held together by good plumbing and a decent anchor. Everything moves. The light moves. The seasons move. The ducks have opinions.

And somehow, in all that movement, something in you settles. Because when the external world is never still, you have to find stillness inside yourself. It's not philosophical. It's practical.

Whatever your version of the river is — find it. Get near it as often as you can.`,
  },
  {
    title: 'How I actually feed three children on a tight budget — and why I\'m not embarrassed.',
    category_slug: 'food-and-nourishment',
    body: `I am not going to pretend I serve organic everything on hand-thrown ceramics. What I serve is: what I can afford, what they will actually eat, and what I can make without losing my mind after a full day of work.

The Vitality Kitchen started as a survival mechanism. Three children. One houseboat galley kitchen. Budget of someone who chose lifestyle over salary.

Here's what I actually do: batch cook on Sundays. One big pan of something. Freeze half. The other half becomes three dinners with different sides. Total cost: usually under fifteen pounds for the lot.

The shame around budget cooking is real. I felt it for years. Now I think — if I can feed three humans well on this budget and still have mental energy left for my work, that's not failure. That's a life skill.

I'll share the actual recipes. No performance. Just what we eat.`,
  },

  // RELATIONSHIPS & DATING (Vol 1) → Love
  {
    title: 'Dating in your mid-forties — what nobody says.',
    category_slug: 'dating-and-patterns',
    body: `Nobody tells you this: dating in your mid-forties is simultaneously the most terrifying and the most powerful thing you can do. Because by now you know exactly what you want. You just also know exactly how rare it is.

The apps are exhausting. The conversations are often shallow. The moment someone says "I'm looking for something casual" when what they mean is "I am emotionally unavailable but would like company" — you can spot it in three messages now. And somehow that's both a superpower and a curse.

But here's what also happens in your forties: you stop performing. You stop pretending to like things you don't like. You stop laughing at jokes that aren't funny. You stop shrinking to make someone else comfortable.

And that changes everything. Because the person who eventually arrives — if they do — meets you. The actual you. Not the version you think they want.

That's terrifying. And it's also the only version worth offering.`,
  },
  {
    title: 'The friendship audit — the most confronting list you\'ll ever make.',
    category_slug: 'friendship',
    body: `Somewhere in most of my coaching sessions, we get to the friendship list. Not every time. But often enough that I now bring it up directly.

Make a list of the twenty people you interact with most. Next to each name, write one word. Adds or drains. Not good or bad. Just the energy exchange.

What most women discover: the list is not what they expected. The person they thought was their closest friend is consistently draining. The colleague they thought was difficult is surprisingly energising.

This doesn't mean you cut everyone who drains you. Some relationships you maintain by choice, by love, by circumstance. But you maintain them as a choice, not a default. That distinction changes everything.`,
  },

  // NERVOUS SYSTEM & EDUCATION (Vol 1) → Life > Educational
  {
    title: 'Your nervous system is running the show — here\'s what that actually means.',
    category_slug: 'educational',
    is_featured: true,
    body: `Most of us are living in a nervous system state that was set decades ago by things we didn't choose, didn't understand, and in most cases don't even remember. Your autonomic nervous system has three primary states.

Ventral vagal — safe, connected, creative, clear. This is where you want to live. Sympathetic — fight or flight, urgency, anxiety. Appropriate in genuine danger and exhausting when it's chronic. Dorsal vagal — shutdown, flatness, disconnection. The freeze response.

Most of us bounce between sympathetic and dorsal. Too much, then nothing. On fire, then collapsed. The ventral state — where we actually thrive — requires specific conditions: safety, connection, rhythm, regulated relationships.

Everything I do in my coaching is helping people access the ventral vagal state more consistently. Not permanently. That's not how it works. But more often. For longer. With more ease.`,
  },
  {
    title: 'What trauma actually is — and why the definition changed everything.',
    category_slug: 'educational',
    body: `Trauma is the most misunderstood word in the wellness world. Trauma is not the event. It is what happened inside your nervous system as a result of the event.

This is why two people can go through the same experience and one is traumatised and one is not — not because one is weaker or more sensitive, but because their nervous systems processed the experience differently.

And here's what happens when something comes in that you can't handle: you push it away. But energy doesn't stop. It has to go somewhere. And so it goes round and round. Not leaving. Not resolving. Just forever circling.

The present moment standing there going: 'Hello? This is just a slightly awkward email?' And 1994 going: 'I RECOGNISE THIS FEELING. CODE RED.'

The feeling itself moves through in ninety seconds if you let it. Nine years of running from ninety seconds of feeling is an extraordinary amount of cardio for something that takes a minute and a half.`,
  },

  // SPIRITUAL HYGIENE (Vol 1) → Life > Spiritual Hygiene
  {
    title: 'What spiritual hygiene actually is — and why it changes everything.',
    category_slug: 'spiritual-hygiene',
    body: `Spiritual hygiene is not incense and crystals. Though I have both and I recommend both. Spiritual hygiene is the maintenance of your inner world with the same seriousness and consistency that you maintain your outer one.

You brush your teeth. You wash your face. You clean your house. These are non-negotiable. But most of us do absolutely nothing for the inner world on a daily basis and then wonder why we feel heavy, flat, reactive, or just generally off.

The inner world accumulates. Other people's energy. Conversations that didn't resolve. Decisions that haven't been made. All of it sits there, taking up space, until you deliberately clear it.

My morning practice takes fifteen minutes and it changed my life. Not the Instagram version. The real one, with three children asking questions while I try to hold a crystal with intention and simultaneously find a PE kit.`,
  },
  {
    title: 'How to start working with crystals — without it feeling strange.',
    category_slug: 'spiritual-hygiene',
    body: `The question I get asked more than any other at trunk shows and markets is: but how do I actually use them?

Not the healing properties. Not the chakra alignment chart. Just — what do I do with this stone once I've bought it?

You hold it. That's it. Not with expectation. Not with a seventeen-step ritual. You hold it with intention. For thirty seconds. Before a difficult meeting. During a moment when everything feels like too much. When you need to come back to yourself.

The stone doesn't do anything magical. What it does is give your nervous system a physical anchor for an intention you've already set. That's enough. That's actually everything.

Start with one stone. Moonstone if you want to trust your intuition. Clear Quartz if your mind is doing too much. Rose Quartz if you've been hard on yourself. The right one is the one you're drawn to. Trust that.`,
  },

  // COACHING (Vol 1) → Work > Signal Method
  {
    title: 'What somatic coaching actually is — and what it is absolutely not.',
    category_slug: 'signal-method',
    body: `Let me start with what somatic coaching is not: it is not someone telling you what's wrong with you. It is not lying on a table while someone moves energy around. It is not a replacement for therapy and it is not therapy in a different outfit.

Somatic coaching works with the body's own intelligence. Your nervous system stores everything — every pattern, every protection, every response you developed to keep yourself safe. Most of these were brilliant survival strategies. Some of them are still running when they're no longer needed.

The work is not about thinking your way to a new pattern. It's about feeling the old one, understanding where it lives in the body, and allowing it to complete. Because patterns don't release through insight. They release through the body.

This is not alternative. This is not fringe. This is neuroscience applied through the body. And it works.`,
  },

  // WORKSHOPS (Vol 1) → Experiences
  {
    title: 'What actually happens in a houseboat reset day — the real version.',
    category_slug: 'founder-reset',
    body: `Six women. A houseboat on a tidal island in the Thames. No phones. No agenda except the one that emerges.

I should probably describe what we do, but the honest answer is: it depends on who's in the room. Some days we start with breathwork and end with someone finally saying the thing they've been holding for months. Some days we start with tea and end with tears and laughter in equal measure.

The river does something. I can't explain it and I've stopped trying. People arrive wound tight and leave something different. Not fixed. Not healed. Just softer. More honest. More in contact with whatever they've been avoiding.

The next Reset Day is in the calendar. Six places. That's all there ever is, because the boat is thirty-two feet long and there are limits.`,
  },

  // COMMUNITY (Vol 1)
  {
    title: 'What The Returning Circle is — and what it is not.',
    category_slug: 'holding-everything',
    body: `Every Tuesday evening I hold a circle at The Hare and the Moon in Twickenham. Donation-based. Open to everyone. No booking required.

What it is: a room. People who are honest. No advice. No fixing. No cross-talk. Just being in the presence of other humans who are willing to say what's actually going on.

What it is not: therapy, a support group, a workshop, or anything with a curriculum. There is no programme. There is no progression. You come when you need to. You stop when you're done.

Most people who come for the first time look nervous. By the end of the evening something in them has settled. Not because anything dramatic happened. Because they were in a room where they didn't have to perform.

That sounds like nothing. It's actually everything. Connection is biological. Your nervous system needs co-regulation. It needs other regulated humans. That's not self-help language. That's neuroscience.

Come when you're ready.`,
  },

  // ABOUT (Vol 1)
  {
    title: 'From Portobello Road to a houseboat — the version nobody published.',
    category_slug: 'the-strong-one',
    body: `The press version goes like this: young designer starts selling jewellery on Portobello Road. Brand grows. Harrods, Selfridges, Harvey Nichols. QVC Japan. Disney collaborations. Twenty-five years of building something beautiful.

The real version goes like this: young woman with no business training and a lot of determination builds something extraordinary while simultaneously navigating a marriage breakdown, single parenthood, financial pressure that would have broken most people, and the discovery that success doesn't actually fix the thing you thought it would fix.

I didn't pivot from jewellery to coaching because I got bored. I pivoted because I broke. And in the breaking, I found the work that was always underneath — the real work. The inner work. The body work. The thing that no amount of external success can substitute for.

The houseboat was not a lifestyle choice. It was a financial reality that became the most honest thing I've ever done. Living on water strips away everything that isn't real. It teaches you what you actually need versus what you thought you needed.

Twenty-five years leaves a trail. Here's mine, unedited.`,
  },

  // COSMIC FORECAST (Vol 1)
  {
    title: 'The Cosmic Forecast is not an astrology column — it\'s my diary.',
    category_slug: 'rituals-and-energy',
    body: `I want to tell you about the way I use the moon. Not because I think everyone should. But because it changed how I make decisions, how I plan, and how I rest.

The Cosmic Forecast is a weekly practice I share on Substack. It combines the moon phase, an energy theme, a stone of the week, and a somatic practice. The full version — with the complete ritual and personal note — goes to Plus subscribers. A summary version appears on the website.

I started writing it for myself. A way to structure the week around something other than a to-do list. The moon doesn't care about your deadlines. It operates on its own rhythm. And there's something profoundly settling about aligning your inner work with a cycle that's been running for four and a half billion years.

You don't need to believe in astrology to use this. You just need to be willing to pause once a week and ask: what is this week asking of me?

That question alone will change more than you expect.`,
  },

  // SPIRITUAL HYGIENE (Vol 2 - additional)
  {
    title: 'What spiritual hygiene actually is — and why your inner world needs maintenance.',
    category_slug: 'spiritual-hygiene',
    body: `Strip it back and it's very simple: spiritual hygiene is the practice of maintaining your inner world the way you maintain your outer one.

The inner world accumulates. Other people's energy — their urgency, their anxiety, their unspoken things — lands on you throughout the day. If you don't clear it, it stays. This is not metaphor. If you've ever walked into a room and felt the weight of it before anyone said a word, you already know this.

What spiritual hygiene looks like depends entirely on you. For some women it's a morning ritual. For others it's the Palo Santo they light before a difficult conversation. For others it's the crystal they pick up when they notice they've drifted.

The measure of a good spiritual hygiene practice isn't whether it looks impressive on Instagram. It's whether, when you do it, something in your body settles. Find those things. Do them consistently.

Not as a performance of spiritual practice. As actual maintenance of your actual self.`,
  },

  // DECLUTTERING (Vol 2)
  {
    title: 'The physical space audit — why your home is telling you things your mind won\'t.',
    category_slug: 'decluttering',
    body: `The state of your external environment is always a mirror of your internal one. This is not philosophy. It's neuroscience.

Visual clutter activates the stress response. Your brain scans your environment continuously, unconsciously, and registers each unfinished thing, each pile, each item out of place as an unresolved task. This keeps your nervous system in a low-level activated state all day.

I learned this the hard way. During the hardest years of my life I let my environment reflect my internal state — and it became increasingly difficult to think clearly, rest deeply, or feel calm.

The moment I started clearing — not dramatically, not a whole house at once, but one surface at a time — something in my nervous system began to settle. The physical clearing was also an internal one.

Walk through your home with one question: does this thing have a place, and is it in its place? The things that don't have places are creating the noise. Give them a place. Or let them go.`,
  },

  // EDUCATIONAL (Vol 2)
  {
    title: 'Nervous system 101 — everything you weren\'t taught that explains everything.',
    category_slug: 'educational',
    body: `Nobody taught me how my nervous system worked. I went through school, university, early adulthood, a long marriage, entrepreneurship, extended legal proceedings — and nobody once explained to me the thing operating in the background of all of it.

Your autonomic nervous system has three primary states. Ventral vagal — safe, connected, creative, clear. This is optimal. The sympathetic state — fight or flight, urgency, anxiety. Appropriate in genuine danger and exhausting when it's constant. The dorsal vagal state — shutdown, flatness, disconnection. The freeze response.

Most of us oscillate between sympathetic and dorsal. Too activated, then collapsed. The ventral state — where we actually thrive — requires safety. Safety requires specific inputs: connection, rest, rhythm, regulated relationships.

Everything I do in my practice is essentially helping people access the ventral vagal state more consistently. Not permanently — that's not how it works. But more often. For longer. With more ease.`,
  },

  // TRE / EMDR (Vol 2)
  {
    title: 'TRE, Brainspotting and Flash EMDR — what they actually are, in plain language.',
    category_slug: 'educational',
    body: `The names of the modalities I use can make them sound more intimidating than they are. Let me translate.

TRE stands for Trauma Release Exercises. It's a sequence of simple exercises that activate the body's natural tremoring mechanism. Animals shake after a threatening experience to discharge stress. Humans do too, naturally, but we've been taught to suppress it. TRE safely reactivates that mechanism.

Brainspotting works on the principle that where you look affects how you feel — and that specific eye positions access specific unprocessed material in the subcortical brain. It reaches places that talking doesn't always reach.

Flash EMDR is a newer protocol — EMDR adapted to be gentler and faster, particularly effective for acute trauma and specific memories. It works by simultaneously engaging a positive focus and the traumatic memory, allowing the charge on the memory to discharge without requiring you to fully revisit it.

All three are evidence-based. All three are body-level. All three are gentle. And all three produce real change at the level where the pattern actually lives.`,
  },
];

// ═══ COACHING SESSIONS ═══

const coachingSessions = [
  {
    name: 'The Reset',
    slug: 'the-reset',
    description: `Most people arrive at The Reset after trying everything else. The therapy. The journalling. The courses. The spiritual work. Getting all the way to the insight — and then hitting the same wall.

The Reset is six weeks, 1:1, working directly with your inner guidance system. Not the story. Not the intellectual understanding of the pattern. The actual place the pattern lives — in the body, in the automatic responses that fire before your conscious mind catches up.

Week one: baseline. Where are you arriving from? What is your inner world doing right now? What does safety feel like in your body — and how long since you genuinely felt it?

By week three something usually shifts. A decision becomes clear. A pattern stops activating the same response. Your inner guidance system comes back online — and you realise it has been trying to speak to you for a very long time.`,
    duration: '6 weeks',
    price: 1500,
    price_label: '£1,500',
    sort_order: 1,
  },
  {
    name: 'Signal',
    slug: 'signal',
    description: `Twelve weeks is enough time for something to genuinely change. Not the surface — the pattern underneath it. The automatic response that has been running your decisions, your relationships, and your relationship to yourself without your full permission.

Signal is the full twelve-week somatic coaching programme. Inner world rewire, pattern release, belief repatterning, rebuilding from the inside out. Weekly sessions, integration support throughout. Dormant parts of yourself switch back online. What felt fixed becomes fluid.

Includes weekly 1:1 sessions, voice note support between sessions, a personalised Signal Method workbook, and lifetime access to recordings.`,
    duration: '12 weeks',
    price: 3000,
    price_label: '£3,000',
    sort_order: 2,
  },
  {
    name: 'Signal & Build',
    slug: 'signal-and-build',
    description: `Signal & Build is Signal with a second track: heart-led business strategy using the Signal Method. For founders, coaches, and leaders who want to regulate their inner world and build from that place.

You leave with a rewired inner guidance system and a business direction that comes from your own signal — not from fear, not from what you think you should do.

Includes weekly 1:1 sessions, voice note support between sessions, a personalised Signal Method workbook, and lifetime access to recordings. Neither is gendered. Neither requires prior knowledge. Both require only that you are ready.`,
    duration: '12 weeks',
    price: 3000,
    price_label: '£3,000',
    sort_order: 3,
  },
  {
    name: 'One Day Intensive',
    slug: 'one-day-intensive',
    description: `One Day is exactly that. A full day, 1:1, on the houseboat at Taggs Island or online. No multi-week commitment. One concentrated, unhurried, immersive day.

We begin with a full inner guidance system audit. We move through whatever the day calls for: somatic work, belief repatterning, breathwork, Signal Method, pendulum alignment, business strategy if you are building something.

You leave with a personalised practice, a completed Signal Method workbook, and a clear direction from your own signal rather than anyone else's opinion.`,
    duration: '1 day',
    price: null,
    price_label: 'Enquire',
    sort_order: 4,
  },
  {
    name: 'The Signal Collective',
    slug: 'the-signal-collective',
    description: `The Signal Collective is the mastermind. For coaches, founders, practitioners, and leaders who want depth plus community. Group and 1:1 coaching combined. Monthly intensive sessions. Peer co-regulation with people at the same level of seriousness.

Direct access to the Signal Method applied to everything — business, relationships, creative work, leadership. A curated community committed to operating from their highest level. Not a course. A container for those already in motion who want to accelerate.

By application. Limited intake. Waitlist available.`,
    duration: 'Ongoing',
    price: null,
    price_label: 'Enquire',
    sort_order: 5,
  },
];

// ═══ MEMBERSHIP ═══

const membershipData = {
  title: 'The Reset Room',
  description: `The Reset Room is the monthly membership for people who want ongoing access to the work without the commitment of a full programme.

For £25 per month you get: one live group session per month (90 minutes, hosted on Zoom, recorded for those who cannot attend live), full access to the resource library including the Signal Method workbook and all past workshop recordings, a monthly Signal Check delivered to your inbox, and the Reset Room community.

The Reset Room is for people who have done some work and want to keep going. For people who are not ready for 1:1 but know they need more than occasional workshops. For people who want community as part of their practice.

It is also the most natural next step after a workshop. You came to Signal Reset Day. Something shifted. You want to keep that aliveness going. This is where you come.

£25 per month. Cancel any time. First month free for anyone who has attended a paid workshop in the last three months.`,
  price_monthly: 25,
  features: [
    'Monthly live group session (90 mins, Zoom)',
    'Full workshop replay library',
    'Signal Method workbook',
    'Monthly Signal Check practice',
    'Reset Room community space',
    'Early retreat booking access',
  ],
};

// ═══ FAQs ═══

const faqs = [
  { question: 'What is somatic coaching?', answer: 'Somatic coaching works with the body\'s intelligence — your nervous system, physical sensations, and stored patterns — rather than just talking through problems intellectually. It helps you access and release patterns at the level where they actually live: in the body.', category: 'coaching', sort_order: 1 },
  { question: 'Do I need to have done therapy before coaching?', answer: 'No. Coaching and therapy serve different purposes. Therapy typically addresses diagnosis and past trauma in clinical depth. Coaching works with your current patterns and helps you move forward. Many clients do both simultaneously.', category: 'coaching', sort_order: 2 },
  { question: 'What happens in a discovery call?', answer: 'A free 15-minute call where we talk about where you are, what you\'re looking for, and whether 1:1 coaching is the right fit. No pressure. No sales pitch. We\'ll both know quickly.', category: 'coaching', sort_order: 3 },
  { question: 'Are sessions online or in person?', answer: 'Both. In-person sessions take place on the houseboat at Taggs Island, Hampton. Online sessions are via Zoom. Both are equally effective — the modalities I use work in both settings.', category: 'coaching', sort_order: 4 },
  { question: 'What is the Reset Room?', answer: 'The Reset Room is a monthly membership (£25/month) that includes a live group session, the Signal Method workbook, workshop replay library, and community space. It sits between workshops and 1:1 programmes — ongoing support without the full programme commitment.', category: 'membership', sort_order: 1 },
  { question: 'Can I cancel the Reset Room any time?', answer: 'Yes. No minimum commitment. Cancel any time through your Stripe account.', category: 'membership', sort_order: 2 },
  { question: 'What crystals do you recommend for beginners?', answer: 'Start with one stone you\'re drawn to. If unsure: Clear Quartz for clarity, Rose Quartz for self-love, Moonstone for intuition, Amethyst for calm, or Black Tourmaline for grounding and protection.', category: 'shop', sort_order: 1 },
  { question: 'Do you ship internationally?', answer: 'Yes. All jewellery ships worldwide. UK delivery is free on orders over £50. International shipping rates are calculated at checkout.', category: 'shop', sort_order: 2 },
  { question: 'What are retreat days like?', answer: 'Six people maximum. On the houseboat at Taggs Island. No phones, no fixed agenda. We work with whatever the group needs — breathwork, somatic practice, Signal Method, honest conversation. People arrive wound tight and leave softer.', category: 'experiences', sort_order: 1 },
  { question: 'Do you do corporate wellbeing?', answer: 'Yes. Bespoke workshops, keynotes, and ongoing wellbeing programmes for teams and organisations. The Signal Method adapted for corporate environments. Available in person or online.', category: 'experiences', sort_order: 2 },
];

// ═══ MAIN ═══

async function seed() {
  console.log('\n=== Anna Lou Wellness — Content Seed ===\n');
  console.log(`Strapi: ${STRAPI_URL}`);

  await login();

  // 1. Categories
  console.log('\n--- Article Categories ---');
  const categoryMap = {};
  for (const cat of categories) {
    const created = await findOrCreate('/article-categories', 'slug', cat.slug, cat);
    if (created) categoryMap[cat.slug] = created.id;
  }

  // 2. Articles
  console.log('\n--- Articles ---');
  for (const article of articles) {
    const catId = categoryMap[article.category_slug];
    const slug = slugify(article.title);
    const data = {
      title: article.title,
      slug,
      excerpt: article.body.split('\n\n')[0].slice(0, 300),
      body: article.body,
      author: 'Anna Lou',
      reading_time: estimateReadTime(article.body),
      is_featured: article.is_featured || false,
      is_free: true,
      category: catId || null,
    };
    await findOrCreate('/articles', 'slug', slug, data);
  }

  // 3. Coaching Sessions
  console.log('\n--- Coaching Sessions ---');
  for (const session of coachingSessions) {
    await findOrCreate('/coaching-sessions', 'slug', session.slug, session);
  }

  // 4. Membership
  console.log('\n--- Membership ---');
  try {
    const existing = await api('/membership');
    if (existing.data) {
      await api('/membership', 'PUT', { data: membershipData });
      console.log('  [updated] The Reset Room');
    }
  } catch {
    console.log('  [info] Membership update skipped');
  }

  // 5. FAQs
  console.log('\n--- FAQs ---');
  for (const faq of faqs) {
    await findOrCreate('/faqs', 'question', faq.question, { ...faq, is_active: true });
  }

  console.log('\n=== Seed Complete ===\n');
}

seed().catch(console.error);
