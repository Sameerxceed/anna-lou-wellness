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

  // ═══ VOL 3 — PROGRAMMES ═══
  {
    title: 'The Reset — six weeks that actually change something.',
    category_slug: 'signal-method',
    body: `Most people arrive at The Reset after trying everything else. The therapy. The journalling. The courses. The spiritual work. Getting all the way to the insight — and then hitting the same wall.

The Reset is six weeks, 1:1, working directly with your inner guidance system. Not the story. Not the intellectual understanding of the pattern. The actual place the pattern lives — in the body, in the automatic responses that fire before your conscious mind catches up.

Week one is baseline. Where are you arriving from? What is your inner world doing right now? What does safety feel like in your body — and how long since you genuinely felt it?

By week three something usually shifts. A decision becomes clear. A pattern stops activating the same response. Your inner guidance system comes back online — and you realise it has been trying to speak to you for a very long time.

£1,500 for six sessions. Book a free discovery call to see if it is right for you.`,
  },
  {
    title: 'Signal and Signal & Build — the 12-week programmes.',
    category_slug: 'signal-method',
    body: `Signal is the full twelve-week somatic rewire. Inner world rewire, pattern release, belief repatterning, rebuilding from the inside out. Weekly sessions, integration support throughout. Dormant parts of yourself switch back online. What felt fixed becomes fluid.

Signal & Build adds a second track: heart-led business strategy using the Signal Method. For founders, coaches, and leaders who want to regulate their inner world and build from that place. You leave with a rewired inner guidance system and a business direction that comes from your own signal — not from fear, not from what you think you should do.

Both are £3,000. Weekly 1:1 sessions, voice note support between sessions, a personalised Signal Method workbook, and lifetime access to recordings. Neither is gendered. Neither requires prior knowledge. Both require only that you are ready.`,
  },
  {
    title: 'One Day. And The Signal Collective.',
    category_slug: 'signal-method',
    body: `One Day is exactly that. A full day, 1:1, on the houseboat at Taggs Island or online. No multi-week commitment. One concentrated, unhurried, immersive day.

We begin with a full inner guidance system audit. We move through whatever the day calls for: somatic work, belief repatterning, breathwork, Signal Method, pendulum alignment, business strategy if you are building something. You leave with a personalised practice, a completed Signal Method workbook, and a clear direction from your own signal rather than anyone else's opinion.

The Signal Collective is the mastermind. For coaches, founders, practitioners, and leaders who want depth plus community. Group and 1:1 coaching combined. Monthly intensive sessions. Peer co-regulation with people at the same level of seriousness. By application. Limited intake. Waitlist available.`,
  },

  // ═══ VOL 3 — RESET ROOM ═══
  {
    title: 'The Reset Room — what you get inside every month.',
    category_slug: 'holding-everything',
    body: `The Reset Room is the monthly membership for people who want ongoing access to the work without the commitment of a full programme.

For £25 per month you get: one live group session per month — ninety minutes, hosted on Zoom, recorded for those who cannot attend live. Full access to the resource library including the Signal Method workbook and all past workshop recordings. A monthly Signal Check delivered to your inbox. And the Reset Room community.

The Reset Room is for people who have done some work and want to keep going. For people who are not ready for 1:1 but know they need more than occasional workshops. For people who want community as part of their practice.

It is also the most natural next step after a workshop. You came to Signal Reset Day. Something shifted. You want to keep that aliveness going. This is where you come. Cancel any time. First month free for anyone who has attended a paid workshop in the last three months.`,
  },
  {
    title: 'Who The Reset Room is for — and who it is not for.',
    category_slug: 'holding-everything',
    body: `The Reset Room is for people who want consistent somatic practice and community. People maintaining shifts they have already made. People between programmes. People who want to stay connected to the work without the intensity of 1:1.

It is not for people in acute crisis. If you are currently in a crisis situation, you need 1:1 coaching or recovery coaching — not a group membership. The Reset Room is not a replacement for therapy. It is not a course. There is no curriculum and no progression path.

Think of it like the crab analogy from Out Of Our Minds — a safe space between big shifts. A container that holds you while the integration happens. The community aspect matters. Your nervous system needs co-regulation. It needs other regulated humans around it. The Reset Room provides that.`,
  },

  // ═══ VOL 3 — FREE RESOURCES ═══
  {
    title: 'The Nervous System Decoder — what it is and why it is free.',
    category_slug: 'educational',
    body: `The Nervous System Decoder is a free downloadable guide explaining three primary states of your inner guidance system. Ventral vagal — safe, connected, creative. Sympathetic — fight or flight, urgency, activation. Dorsal vagal — shutdown, flatness, freeze.

It includes three immediate practices you can use the moment you recognise which state you are in. Not theory. Not a workbook. Just the essential understanding that most people were never given.

It is free because understanding your inner world is foundational. You cannot work with something you cannot name. And most of us were never taught the language for what is happening inside us. This gives you that language. Everything else builds from here.`,
  },
  {
    title: 'The Crystal Guide — which stone is right for you and when.',
    category_slug: 'spiritual-hygiene',
    body: `This guide started as a handout at crystal parties. Women kept asking the same question: which stone do I need and when? So I wrote it down.

It covers fifteen stones: what each one does energetically, when to reach for it, which emotional states it helps, and how to work with it practically. Not the Instagram version of crystal healing. The version that actually helps.

Moonstone for trusting your own knowing. Rose Quartz for when you have been hard on yourself. Clear Quartz for mental clarity. Black Tourmaline for grounding and protection. Smoky Quartz for when your mind is running faster than your body. Tiger Eye for courage when you need to act.

£15 as a downloadable guide. Or free if you attend a crystal party or workshop.`,
  },
  {
    title: 'The coaching quiz — your starting point in five questions.',
    category_slug: 'educational',
    body: `Five questions. That is all. They identify your dominant pattern — the automatic response that fires under pressure before your conscious mind catches up.

Are you a fixer, a freezer, a fighter, a fleer, or a fawner? Most of us have a primary and a secondary. Knowing which one is yours changes how you approach everything: relationships, work, parenting, rest.

This is not a diagnosis. It is a starting point. A way to begin noticing what your nervous system does automatically so you can start choosing something different. Take the quiz. It takes two minutes.`,
  },

  // ═══ VOL 3 — PRESS & CREDENTIALS ═══
  {
    title: 'Twenty-five years of press — and what I am willing to say now.',
    category_slug: 'the-strong-one',
    body: `The press started in the early 2000s. A piece about someone selling handmade jewellery on Portobello Road. Then the Drapers feature when the brand hit Harrods, Selfridges, and Harvey Nichols simultaneously. Then QVC Japan. Then trade press across two decades.

For most of those years the press was about the brand and the jewellery. The design, the celebrities wearing it, the collaborations. Disney. Hello Kitty. The trunk shows.

More recently the coverage has shifted. The coaching, the houseboat, the pivot. The question is no longer just how did you build it — but what did building it cost you, what did you learn, and who are you now.

Twenty-five years leaves a trail. Here is mine, for the first time, unedited. For press enquiries, please use the contact page.`,
  },
  {
    title: 'Credentials — what I am trained in and why it matters.',
    category_slug: 'educational',
    body: `ICF-accredited. CPD-certified. Certified TRE provider. These are the formal ones. They matter because this work requires training, supervision, and ongoing professional development.

But formal accreditation is only part of it. I am also trained in Flash EMDR, Brainspotting, Internal Family Systems, breathwork facilitation, energy alignment, pendulum work, and somatic movement. Each one required significant training. Each one required supervision hours. Each one required me to do my own work first.

I say this not to list qualifications but because this field is unregulated and anyone can call themselves a coach. If someone is working with your nervous system, your trauma, your inner world — ask what they are trained in. Ask who supervises them. Ask whether they have done their own work.

The credentials matter because your safety matters.`,
  },

  // ═══ VOL 3 — SPEAKING ═══
  {
    title: 'Five talks — and which one is right for your event.',
    category_slug: 'founder-reset',
    body: `The Zen Hustler: how to build a business without burning out your nervous system. For founder events, entrepreneur networks, and anyone who has tried to meditate their way through a cash flow crisis.

Signal — How to hear yourself in a loud world: the Signal Method applied to decision-making, creativity, and leadership. For corporate events, leadership programmes, and teams that want to operate from clarity rather than urgency.

What Actually Happens in Trauma Recovery: the real version. Not the clinical one. For wellness events, mental health awareness, and organisations that want honest conversation about what healing actually looks like.

The Anna Lou of London Story: twenty-five years from Portobello Road to a houseboat. For entrepreneurship events, women in business, and anyone interested in what happens when you build something beautiful and then have to rebuild yourself.

What Community Actually Does to the Inner Guidance System: the neuroscience of co-regulation and why connection is not optional. For community organisations, membership businesses, and anyone building spaces for people to be honest.`,
  },
  {
    title: 'Why the talks that terrify me are the ones worth giving.',
    category_slug: 'the-strong-one',
    body: `The most memorable event I ever did was fifteen people. No microphone. Forty minutes talking. Then two hours of conversation that nobody wanted to end.

I do not do corporate platitudes. I do not have a slide deck with stock photos of mountains. What I have is twenty-five years of building something, losing myself inside it, breaking down, and rebuilding from the body up. And a willingness to tell the real version.

The talks that terrify me — the ones where I say the thing I have never said publicly before — are always the ones that land hardest. Because the room can feel it. Authenticity is not a brand value. It is a nervous system response. People know when you are performing and when you are present.

Based in Hampton, London. Travels nationally. Online welcome. For speaking enquiries and booking, please contact through the website.`,
  },
  {
    title: 'What event organisers say.',
    category_slug: 'founder-reset',
    body: `The consistent feedback is: people were still talking about it the next day.

Anna speaks from inside the material, not in front of it. She has a gift for reading a room and adjusting in real time. The vulnerability is what makes it work — she does not pretend to have all the answers, she shares what she has learned from inside the experience.

Available for keynotes, panels, Q&As, fireside chats, and interactive workshops. Happy to tailor content to your event theme. Best for audiences who want depth, honesty, and practical takeaways rather than motivation without substance.`,
  },

  // ═══ VOL 3 — SHOP EDITORIAL ═══
  {
    title: 'Personalised jewellery — why the word you choose matters more than the metal.',
    category_slug: 'style-and-beauty',
    body: `Twenty-five years of making personalised jewellery has taught me one thing: the word matters more than the metal.

The Cosmic Phrase Necklace collection lets you choose your phrase, your metal, your font. Made on Taggs Island in the Design Lab. Posted within five working days. Each piece laser-cut and hand-finished.

The phrases women choose tell you everything. Exhale. Enough. Begin Again. I Am The Storm. Some choose their children's names. Some choose the word they needed to hear at the worst moment of their life and now wear it every day as proof that they survived it.

Sterling silver from £35. Gold vermeil from £95. Solid 9ct gold from £175.`,
  },
  {
    title: 'Crystal jewellery — real gemstones and what each one means.',
    category_slug: 'spiritual-hygiene',
    body: `Every stone in the collection is real. Not resin. Not glass. Not lab-grown crystal that looks pretty but carries no energy. Real gemstones, set in sterling silver or gold, each chosen for its energetic property first and its aesthetic second.

Tiger Eye for courage when you need to act. Amethyst for calm when everything is too loud. Rose Quartz for self-love when you have been hard on yourself. Moonstone for intuition when you need to trust your own knowing. Labradorite for transformation when everything is shifting.

Each piece comes with a meaning card explaining the stone's properties and how to work with it. Because jewellery should do more than look beautiful. It should hold something.`,
  },
  {
    title: 'Digital downloads — guides, tools and deep-dives.',
    category_slug: 'style-and-beauty',
    body: `The Nervous System Decoder is free. Always will be. Understanding your inner world is foundational and should not be behind a paywall.

The Crystal Guide is £15. Fifteen stones, what each one does, when to reach for it, how to work with it practically.

The Relationship Audit guide is £15. The friendship audit, the partnership audit, and the energy exchange mapping tool. The most confronting list you will ever make — and the most clarifying.

The Emotional Declutter framework is £15. A structured process for clearing the inner world the way you would clear a physical space. One surface at a time.

The Signal Method workbook comes with coaching programmes and the Reset Room membership. Not available separately because it requires guidance to use effectively.

All digital downloads delivered immediately. No waiting.`,
  },

  // ═══ VOL 3 — RESOURCE LIBRARY ═══
  {
    title: 'What is in the free resource library.',
    category_slug: 'educational',
    body: `The free resource library is exactly that — free. For everyone. No email required for most resources.

It contains: the Nervous System Decoder, a three-part video series on the inner guidance system, selected Signal Checks from the archive, a somatic tools explainer covering TRE, Brainspotting, and Flash EMDR in plain language, and the Signal Method overview.

Everything is organised by what you are working with, not by format. So if you are dealing with overwhelm, you will find the relevant tools together. If you are navigating a relationship pattern, the resources are grouped by that.

Start anywhere. There is no sequence. The right entry point is whichever one your body responds to.`,
  },
  {
    title: 'The paid library — what Reset Room members and Substack subscribers access.',
    category_slug: 'educational',
    body: `The paid resource library is available to Reset Room members (£25/month) and paid Substack subscribers (£7/month). It contains everything in the free library plus significantly more depth.

The full Signal Method workbook. The Relationship Audit guide. All workshop recordings from the last six months. A personal founder reset audio. Monthly deep-dives on specific topics. The full Signal Checks archive.

The distinction is simple: the free library gives you understanding. The paid library gives you tools for practice. Both are valuable. The paid library is for people who want to go deeper and maintain a consistent practice.`,
  },
  {
    title: 'The tools actually used every day.',
    category_slug: 'rituals-and-energy',
    body: `People ask what I actually do. Not the Instagram version. The real morning.

Water first. Always. Then I walk to the edge of the boat and look at the Thames. Not as meditation. As orientation. A physical check-in with the day before the day begins.

Box breathing — four counts in, four counts hold, four counts out, four counts hold. Two rounds. Takes ninety seconds. Resets the nervous system to ventral vagal.

Pendulum for clarity. One question. Not what should I do — what does my body already know? The pendulum does not add information. It amplifies what is already there.

Palo Santo when the space feels heavy. Not as ritual for the sake of ritual. As energetic hygiene. The same way you would open a window.

All of these are available in the resource library with clear instructions. None of them require belief. All of them require consistency.`,
  },

  // ═══ VOL 3 — EVENTS ═══
  {
    title: 'How to hear about events before they sell out.',
    category_slug: 'rituals-and-energy',
    body: `Houseboat retreat days sell out quickly. Six places. That is all there ever is. The waiting list for some dates runs to twenty people.

The best way to hear about events first: the Reset Letters newsletter. Free. Weekly. Every event announcement goes there before it goes anywhere else.

Reset Room members and paid Substack subscribers get forty-eight hours early access to booking. This means by the time the event is publicly announced, half the places may already be gone.

The Returning Circle runs every Tuesday. No booking required. No waitlist. Donation-based. Just turn up at The Hare and the Moon, Twickenham.

For corporate events, speaking, and bespoke workshops — those do not sell out because they are created for you. Get in touch through the contact page.`,
  },
  {
    title: 'Guest practitioners at the houseboat.',
    category_slug: 'houseboat-life',
    body: `Occasionally I open the houseboat to trusted practitioners whose work complements mine. Not often. And only people whose work I have experienced personally.

Neptune Shade does shadow work. Her sessions on the houseboat have become some of the most requested events in the calendar. Six spaces. Intimate. Intense. Not for beginners — but if you are ready, transformative.

Guest events are limited to six spaces and invitations go to Reset Letters subscribers first. If you are a practitioner interested in collaboration, the best starting point is to come to the Returning Circle. Meet me in person. Experience the space. Then we can talk.`,
  },
  {
    title: 'The Agadir surf trip — why travel matters in this family.',
    category_slug: 'houseboat-life',
    body: `Every July we go to Agadir. Three children. Surfboards they can barely carry. A deliberate choice to do something physical, slightly scary, and completely outside of normal life.

Travel in this family is not about relaxation. It is about exposure. Teaching three humans that the world is bigger than their postcode, that discomfort is survivable, and that the willingness to try things that might not work is one of the most important skills you can develop.

The surf trip is the annual reset. Salt water, physical exhaustion, terrible wi-fi, and the particular joy of watching your children do something they did not think they could do. That moment — the wave they catch, the fall they survive, the pride on their face — is worth every logistical nightmare of travelling with three kids and four surfboards.`,
  },

  // ═══ VOL 3 — PARTNERS ═══
  {
    title: 'How collaborations work — and the ones that get a no.',
    category_slug: 'founder-reset',
    body: `Most partnership enquiries get declined. Not because they are bad opportunities. Because they do not align.

The ones that get a yes: brands I already use regardless of any commercial arrangement. Practitioners who have direct experience of the work, not just a business proposition. Editorial partnerships where I retain full editorial independence.

The ones that get a no: anything that positions advertising as editorial. Products I have not personally used and cannot honestly recommend. Partnerships that require me to dilute the message or perform enthusiasm I do not feel.

Disney and Hello Kitty licensing partnerships work because they are genuine — those collaborations reflect real design interests, not forced brand alignment. Harrods, Selfridges, Liberty — those relationships were built over years of trust, not a single email.`,
  },
  {
    title: 'Wholesale and Faire — how to stock Anna Lou of London.',
    category_slug: 'career-and-direction',
    body: `Anna Lou of London jewellery is available wholesale through Faire. Best-selling wholesale lines include the Cosmic Phrase Jewellery collection, personalised name necklaces, and the gemstone pendant range.

Previously stocked at Harrods, Selfridges, Harvey Nichols, Liberty in London, and internationally at Isetan and Hankyu in Tokyo and Henri Bendel in New York. Current wholesale is through Faire for independent retailers and boutiques.

Minimum orders, pricing tiers, and product catalogues are all available through the Faire platform. If you are a buyer for a larger retailer or department store, please get in touch directly through the contact page.`,
  },
  {
    title: 'Bespoke jewellery — for brands, events and commissions.',
    category_slug: 'style-and-beauty',
    body: `Corporate gifting: minimum fifty pieces, four to six week lead time. Choose from existing designs or commission something entirely new. All production in-house at the Anna Lou Design Lab on Taggs Island.

Event pieces: bespoke jewellery created for conferences, retreats, brand launches, and private events. Each piece can be personalised with event branding, individual names, or custom phrases.

Private commissions: one-of-a-kind pieces for individuals. Engagement rings, anniversary pieces, memorial jewellery. Consultation by appointment. Response within five working days.

All bespoke work starts with a conversation. Tell me what the piece needs to hold — the meaning, the occasion, the person — and I will design from there.`,
  },

  // ═══ VOL 3 — RECOVERY COACHING ═══
  {
    title: 'What narcissistic abuse actually does to your inner guidance system.',
    category_slug: 'educational',
    is_featured: true,
    body: `Gaslighting does not just confuse your thinking. It dismantles your ability to trust your own body. The signals that used to tell you something is wrong — the tightening in your chest, the instinct to leave the room, the quiet voice that says this is not right — those signals get systematically overridden until you cannot hear them at all.

What remains is hypervigilance. Freeze. Fawn. A nervous system permanently scanning for threat, even years after the relationship has ended. The body-level residue of narcissistic abuse is not a mindset problem. It is a nervous system injury.

This is why talk therapy alone often is not enough. You can understand what happened intellectually and still feel the activation in your body every time you hear a particular tone of voice or walk into a room with a certain energy.

Somatic coaching works at the level where the damage actually lives. In the body. In the automatic responses. In the nervous system patterns that were rewired by someone who needed you to doubt yourself.

I work with this from lived experience. Not as a clinical observer. As someone who rebuilt her own inner guidance system from the ground up.`,
  },
  {
    title: 'Three months to reclaim yourself, permanently.',
    category_slug: 'signal-method',
    body: `The recovery coaching programme is three months. Twelve weekly sessions with voice note support between sessions.

Month one — Untangle: somatic mapping, breathwork, Flash EMDR for specific traumatic memories. We identify where the patterns live in the body and begin to separate your responses from the ones that were installed by someone else.

Month two — Unbind: TRE for trauma release, Internal Family Systems parts work, boundary recalibration. The parts of you that learned to fawn, freeze, or fight begin to find new options. Your boundaries stop being theoretical and become felt.

Month three — Unbound: integration, intuition strengthening, personal recovery map. By now your inner guidance system is coming back online. The final month is about consolidation — making sure the changes are stable, your practices are sustainable, and your signal is clear.

This programme is not gentle encouragement. It is structured, evidence-based nervous system work delivered with compassion by someone who has walked the same road.`,
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

// ═══ SHOP PRODUCT CATEGORIES ═══

const productCategories = [
  { name: 'Retreats & Workshops', slug: 'retreats-workshops', sort_order: 1 },
  { name: 'Crystal Jewellery', slug: 'crystal-jewellery', sort_order: 2 },
  { name: 'Raw Crystals & Gifts', slug: 'raw-crystals-gifts', sort_order: 3 },
  { name: 'Digital Downloads', slug: 'digital-downloads', sort_order: 4 },
  { name: 'Personalised Jewellery', slug: 'personalised-jewellery', sort_order: 5 },
  { name: 'Corporate & Events', slug: 'corporate-events', sort_order: 6 },
];

// ═══ SHOP PRODUCTS ═══

const products = [
  // Retreats & Workshops
  {
    name: 'Houseboat Nervous System Reset Experience',
    slug: 'houseboat-reset-experience',
    category_slug: 'retreats-workshops',
    short_description: 'A full day on the houseboat at Taggs Island. Six people maximum.',
    description: `A one-day somatic experience on the houseboat at Taggs Island, Hampton. 10am to 4pm. Six participants maximum.\n\nThe day includes breathwork, somatic practice, Signal Method work, crystal healing, and honest conversation. Lunch provided. No phones. No fixed agenda — we work with whatever the group needs.\n\nPeople arrive wound tight and leave softer. Not fixed. Not healed. Just more in contact with whatever they have been avoiding.\n\nIncludes: full day on the houseboat, all materials, lunch, Signal Method workbook, recording access.`,
    price: 115,
    is_featured: true,
    is_active: true,
    stock: 6,
    tags: ['retreat', 'houseboat', 'somatic', 'in-person'],
  },
  {
    name: 'Align & Amplify: A One-Day Immersion in THE CODES',
    slug: 'align-amplify-the-codes',
    category_slug: 'retreats-workshops',
    short_description: 'Business coaching immersion combining the Signal Method with entrepreneurial strategy.',
    description: `A one-day immersive experience combining crystal healing, breathwork, and entrepreneurial strategy using the Signal Method. Limited to seven participants.\n\nDesigned for founders and business owners who want to build from their signal, not from fear. The day combines inner world work with practical business strategy.\n\nYou leave with a clear direction, a Signal Method workbook, and an action plan that comes from your own inner guidance system rather than someone else's blueprint.`,
    price: 90,
    is_featured: false,
    is_active: true,
    stock: 7,
    tags: ['business', 'founders', 'signal-method', 'immersive'],
  },
  {
    name: 'Sparkle Mastery Programme',
    slug: 'sparkle-mastery-programme',
    category_slug: 'retreats-workshops',
    short_description: '6-week virtual coaching programme for ongoing somatic practice.',
    description: `A six-week virtual coaching programme designed to build resilience, maintain your inner sparkle, and develop a consistent somatic practice.\n\nWeekly group sessions, guided practices, community support, and integration tools. Combines crystal healing, breathwork, and the Signal Method in a structured programme.\n\nValued at £375. Includes all materials, recordings, and community access.`,
    price: 375,
    is_featured: false,
    is_active: true,
    stock: 99,
    tags: ['programme', 'virtual', '6-week', 'group'],
  },

  // Crystal Jewellery
  {
    name: 'Emerald Gemstone Pendant — 18ct Gold Electroplated',
    slug: 'emerald-gemstone-pendant',
    category_slug: 'crystal-jewellery',
    short_description: 'Smooth tumble emerald pendant, 8x10mm, 18ct gold electroplated.',
    description: `A genuine emerald gemstone pendant, smooth tumble cut, 8x10mm. 18ct gold electroplated setting.\n\nEmerald is the stone of the heart chakra. It supports emotional healing, compassion, and the courage to love openly. Wear it when you need to soften without losing your strength.\n\nEach piece comes with a meaning card explaining the stone's properties and how to work with it.`,
    price: 45,
    is_featured: true,
    is_active: true,
    stock: 15,
    tags: ['gemstone', 'pendant', 'gold', 'emerald', 'heart-chakra'],
  },
  {
    name: 'Chakra Pastel Gemstone Bead Bracelet',
    slug: 'chakra-pastel-gemstone-bracelet',
    category_slug: 'crystal-jewellery',
    short_description: 'Seven chakra stones in pastel gemstone beads.',
    description: `A bracelet featuring seven genuine gemstone beads, each representing one of the seven chakras. Pastel tones for everyday wear.\n\nFrom root to crown: Red Jasper (grounding), Carnelian (creativity), Citrine (confidence), Rose Quartz (heart), Aquamarine (communication), Amethyst (intuition), Clear Quartz (clarity).\n\nEach bracelet comes with a chakra guide card.`,
    price: 35,
    is_featured: false,
    is_active: true,
    stock: 20,
    tags: ['bracelet', 'chakra', 'gemstone', 'pastel'],
  },
  {
    name: 'Cosmic Phrase Necklace',
    slug: 'cosmic-phrase-necklace',
    category_slug: 'personalised-jewellery',
    short_description: 'Choose your phrase, your metal, your font. Made on Taggs Island.',
    description: `The signature Anna Lou of London personalised necklace. Choose your word or phrase, your metal, and your font. Laser-cut and hand-finished at the Design Lab on Taggs Island.\n\nPopular phrases: Exhale. Enough. Begin Again. I Am The Storm. Children's names. Words that hold meaning.\n\nSterling silver from £35. Gold vermeil from £95. Solid 9ct gold from £175. Posted within five working days.`,
    price: 35,
    compare_at_price: null,
    is_featured: true,
    is_active: true,
    stock: 99,
    tags: ['personalised', 'necklace', 'signature', 'cosmic-phrase'],
  },
  {
    name: 'The Exhale Necklace',
    slug: 'exhale-necklace',
    category_slug: 'personalised-jewellery',
    short_description: 'A physical reminder to breathe. Sterling silver or gold.',
    description: `The word EXHALE in your choice of metal and font. A physical reminder to breathe — to let go of what you are holding.\n\nOne of the most popular pieces in the collection. Worn by women who need a daily anchor for their nervous system practice.\n\nSterling silver £30. Gold vermeil £95. Solid gold £540. Hand-finished at the Design Lab.`,
    price: 30,
    is_featured: false,
    is_active: true,
    stock: 99,
    tags: ['personalised', 'necklace', 'exhale', 'breathwork'],
  },
  {
    name: 'The Return Hoops',
    slug: 'the-return-hoops',
    category_slug: 'crystal-jewellery',
    short_description: 'Signature hoops that catch the light. Sterling silver.',
    description: `The Return Hoops. Sterling silver. The hoops that catch the light in a way that lifts something — Anna wears them every day.\n\nDesigned to be worn daily. Lightweight, comfortable, and designed to move with you. The signature earring of Anna Lou of London.`,
    price: 75,
    is_featured: false,
    is_active: true,
    stock: 25,
    tags: ['earrings', 'hoops', 'silver', 'signature'],
  },

  // Raw Crystals & Gifts
  {
    name: 'Chakra Bag — Seven Curated Crystals',
    slug: 'chakra-bag',
    category_slug: 'raw-crystals-gifts',
    short_description: 'Seven curated chakra crystals with a printed guide.',
    description: `Seven genuine crystals, each chosen for one of the seven chakras. Comes in a drawstring bag with a printed guide explaining each stone, its chakra, and how to work with it.\n\nIncludes: Red Jasper (root), Carnelian (sacral), Citrine (solar plexus), Rose Quartz (heart), Sodalite (throat), Amethyst (third eye), Clear Quartz (crown).\n\nA perfect starting point for anyone beginning a crystal practice.`,
    price: 25,
    is_featured: false,
    is_active: true,
    stock: 30,
    tags: ['crystals', 'chakra', 'gift', 'starter'],
  },
  {
    name: 'Crystal Starter Kit',
    slug: 'crystal-starter-kit',
    category_slug: 'raw-crystals-gifts',
    short_description: 'Beginner crystal set with wooden box, sage, selenite wand, and essential stones.',
    description: `Everything you need to begin a crystal practice. Presented in a wooden box.\n\nIncludes: selenite wand for cleansing, black tourmaline for grounding, rose quartz for self-love, amethyst for calm, clear quartz for clarity, white sage bundle, and a printed guide.\n\nEach kit is hand-curated. The crystals are genuine and ethically sourced.`,
    price: 45,
    is_featured: true,
    is_active: true,
    stock: 20,
    tags: ['crystals', 'starter-kit', 'gift', 'beginner'],
  },

  // Digital Downloads
  {
    name: 'The Crystal Guide',
    slug: 'crystal-guide-download',
    category_slug: 'digital-downloads',
    short_description: 'Fifteen stones — what each does, when to reach for it, how to use it.',
    description: `A downloadable guide covering fifteen crystals: what each one does energetically, when to reach for it, which emotional states it helps, and how to work with it practically.\n\nNot the Instagram version of crystal healing. The version that actually helps.\n\nDelivered immediately as a PDF. Free with any crystal party or workshop attendance.`,
    price: 15,
    is_featured: false,
    is_active: true,
    stock: 999,
    tags: ['digital', 'guide', 'crystals', 'downloadable'],
  },
  {
    name: 'Relationship Audit Guide',
    slug: 'relationship-audit-guide',
    category_slug: 'digital-downloads',
    short_description: 'The friendship audit, partnership audit, and energy exchange mapping tool.',
    description: `The most confronting list you will ever make — and the most clarifying.\n\nIncludes the friendship audit, the partnership audit, and the energy exchange mapping tool. A structured process for understanding which relationships add to your life and which drain it.\n\nThis does not mean you cut everyone who drains you. It means you maintain them as a choice, not a default. That distinction changes everything.\n\nDelivered immediately as a PDF.`,
    price: 15,
    is_featured: false,
    is_active: true,
    stock: 999,
    tags: ['digital', 'guide', 'relationships', 'audit'],
  },
  {
    name: 'Emotional Declutter Framework',
    slug: 'emotional-declutter-framework',
    category_slug: 'digital-downloads',
    short_description: 'Clear the inner world the way you would clear a physical space.',
    description: `A structured process for clearing your inner world the way you would clear a physical space. One surface at a time.\n\nIncludes the emotional inventory, the energy audit, and the daily clearing practice. Designed to reduce the background noise of unresolved decisions, conversations, and emotional residue.\n\nDelivered immediately as a PDF.`,
    price: 15,
    is_featured: false,
    is_active: true,
    stock: 999,
    tags: ['digital', 'guide', 'declutter', 'emotional'],
  },
  {
    name: 'Nervous System Decoder',
    slug: 'nervous-system-decoder',
    category_slug: 'digital-downloads',
    short_description: 'Free guide to understanding your three nervous system states.',
    description: `A free downloadable guide explaining three primary states of your inner guidance system — ventral vagal (safe), sympathetic (activated), dorsal vagal (shutdown).\n\nIncludes three immediate practices you can use the moment you recognise which state you are in.\n\nFree because understanding your inner world is foundational. You cannot work with something you cannot name.`,
    price: 0,
    is_featured: false,
    is_active: true,
    stock: 999,
    tags: ['digital', 'guide', 'nervous-system', 'free'],
  },

  // Corporate & Events
  {
    name: 'Level Up and Sparkle — Corporate Mini-Retreat',
    slug: 'corporate-mini-retreat',
    category_slug: 'corporate-events',
    short_description: 'Bespoke corporate wellness programme. The Signal Method for the workplace.',
    description: `A corporate wellness mini-retreat designed to build team resilience, reduce burnout, and create space for honest conversation in a professional setting.\n\nFormats range from a single 90-minute session to a full-day immersive experience. Available in person at your workplace, on the houseboat at Taggs Island, or online.\n\nUp to 10 participants: £1,200. Up to 20 participants: £2,000. Bespoke pricing for larger groups.\n\nAnna brings fifteen years of entrepreneurial experience and clinical somatic training to every corporate engagement. This is not generic mindfulness. This is nervous system work that actually changes how people show up.`,
    price: 1200,
    is_featured: false,
    is_active: true,
    stock: 99,
    tags: ['corporate', 'retreat', 'teams', 'bespoke'],
  },
  {
    name: 'Children\'s Crystal Parties',
    slug: 'childrens-crystal-parties',
    category_slug: 'corporate-events',
    short_description: 'Crystal-themed parties for children aged 6–12.',
    description: `Crystal-themed parties for children aged 6 to 12. Each child makes their own crystal bracelet, learns about the stones, and takes home a crystal and meaning card.\n\nAvailable at the houseboat on Taggs Island or at your venue. Groups of 6 to 12 children. Includes all materials and a party bag for each child.\n\nA fun, creative, and grounding experience for birthday parties and special occasions.`,
    price: 250,
    is_featured: false,
    is_active: true,
    stock: 99,
    tags: ['children', 'party', 'crystals', 'birthday'],
  },
  {
    name: 'Crystal Wellbeing Gatherings — Teens',
    slug: 'crystal-wellbeing-teens',
    category_slug: 'corporate-events',
    short_description: 'Crystal wellbeing sessions for young people aged 13–17.',
    description: `Group crystal wellbeing sessions designed for young people aged 13 to 17. Combines crystal healing, breathwork, and guided conversation in an age-appropriate format.\n\nDesigned to introduce nervous system awareness, emotional regulation tools, and self-care practices to teenagers. Available at schools, youth centres, or the houseboat.\n\nSmall groups of 6 to 10. All materials provided.`,
    price: 300,
    is_featured: false,
    is_active: true,
    stock: 99,
    tags: ['teens', 'wellbeing', 'crystals', 'youth'],
  },
];

// ═══ ADDITIONAL FAQs (Vol 3) ═══

const additionalFaqs = [
  { question: 'What is the Nervous System Decoder?', answer: 'A free downloadable guide explaining the three primary states of your inner guidance system — ventral vagal (safe), sympathetic (fight/flight), dorsal vagal (shutdown). Includes three immediate practices. Free because understanding your inner world is foundational.', category: 'coaching', sort_order: 5 },
  { question: 'Do you work with narcissistic abuse recovery?', answer: 'Yes. I offer a dedicated three-month recovery coaching programme. Month one: untangle (somatic mapping, breathwork, Flash EMDR). Month two: unbind (TRE, IFS parts work, boundary recalibration). Month three: unbound (integration, intuition strengthening, personal recovery map). I work from lived experience, not just clinical training.', category: 'coaching', sort_order: 6 },
  { question: 'Is phone support available?', answer: 'Yes. £60/week for up to four calls per month, each up to 60 minutes. Also available as an add-on to coaching programmes for between-session support.', category: 'coaching', sort_order: 7 },
  { question: 'How do I get a free discovery call?', answer: 'Book through the contact page or the coaching pages. It is a free 15-minute call where we talk about where you are, what you are looking for, and whether 1:1 coaching is the right fit. No pressure. No sales pitch.', category: 'coaching', sort_order: 8 },
  { question: 'How long does jewellery delivery take?', answer: 'Standard delivery: 3 to 5 working days. Made-to-order and personalised pieces: 4 to 7 working days. International shipping available. Free UK delivery on orders over £50.', category: 'shop', sort_order: 3 },
  { question: 'Can I return personalised jewellery?', answer: 'Non-personalised items can be returned within 14 days of delivery. Personalised items are made to order and cannot be returned. Digital downloads are non-refundable.', category: 'shop', sort_order: 4 },
  { question: 'Is the jewellery waterproof?', answer: 'Depends on the metal. Sterling silver will tarnish with water — remove before swimming or showering. Gold vermeil is more resilient but will eventually wear if constantly exposed. Solid gold is fine in water. All pieces come with care instructions.', category: 'shop', sort_order: 5 },
  { question: 'Do I need experience to come to the Returning Circle?', answer: 'No. The circle is open to everyone. No booking required. No experience needed. Just show up at The Hare and the Moon, Twickenham, on Tuesday evenings. Donation-based.', category: 'experiences', sort_order: 3 },
  { question: 'What should I wear to a retreat day?', answer: 'Comfortable clothes you can move in. Layers — the houseboat temperature changes. Flat shoes. Bring warm socks. Everything else is provided.', category: 'experiences', sort_order: 4 },
  { question: 'Can I attend a retreat if I am going through a difficult time?', answer: 'Yes, with honest communication. Let Anna know beforehand. The space is designed to hold whatever you bring. The group dynamic actually supports individual processing — your nervous system benefits from being around other regulated humans.', category: 'experiences', sort_order: 5 },
  { question: 'How do wholesale orders work?', answer: 'Anna Lou of London jewellery is available wholesale through Faire. Best-selling wholesale: Cosmic Phrase Jewellery. For larger retailer enquiries, contact directly through the website.', category: 'shop', sort_order: 6 },
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

  // 5. About Page
  console.log('\n--- About Page ---');
  try {
    await api('/about-page', 'PUT', {
      data: {
        kicker: 'About',
        title: 'Twenty-five years leaves a trail.',
        roles_tagline: 'Coach. Trainer. Podcaster. Author. Entrepreneur. Designer.',
        story_paragraph_1: `From the first piece about someone selling handmade jewellery on Portobello Road, to the Drapers feature when the brand hit Harrods, Selfridges, and Harvey Nichols simultaneously, to QVC Japan appearances, to trade press coverage across two decades. For most of those years the press was about the brand and the jewellery. More recently the coverage has shifted. The coaching, the houseboat, the pivot. The question is no longer just how did you build it but what did building it cost you, what did you learn, and who are you now.`,
        story_paragraph_2: `Anna Lou is a multifaceted entrepreneur, designer, and wellness advocate based on Taggs Island, London. She is the founder of Anna Lou of London — a jewellery brand known for vibrant, personalised designs that has been featured in Harrods, Selfridges, Liberty, Harvey Nichols, Isetan and Hankyu in Tokyo, and Henri Bendel in New York. To uphold quality and ethical production, Anna moved all manufacturing to the UK from her Design Lab on Taggs Island.`,
        additional_bio: `Anna Lou Wellness grew from her personal journey of overcoming significant challenges — narcissistic abuse, anxiety, and depression — while balancing single parenthood and business. Through her experiences, Anna became a somatic trauma-informed coach, offering support to women recovering from similar traumas. She provides one-on-one and group workshops that focus on holistic healing for mind, body, and spirit.

Beyond coaching, Anna is a podcaster, author, and the creative force behind "Kirra Kirra" — an animated children's show promoting mental health, resilience, and empathy. She is also creating Narc Abuse Aid, a charity focused on providing resources and community for victims of narcissistic abuse.

Across all her ventures, Anna inspires others to embrace their unique identities, heal from past traumas, and pursue lives filled with purpose and creativity.`,
        press_logos: [
          { name: 'Harrods' }, { name: 'Selfridges' }, { name: 'Harvey Nichols' },
          { name: 'Liberty' }, { name: 'QVC Japan' }, { name: 'Disney' },
          { name: 'The Telegraph' }, { name: 'Stylist' }, { name: 'SheerLuxe' },
          { name: 'Isetan Tokyo' }, { name: 'Henri Bendel NY' },
        ],
        certifications: [
          { name: 'ICF\nAccredited', colour: '#1a5276' },
          { name: 'CPD\nCertified', colour: '#c0392b' },
          { name: 'TRE®\nProvider', colour: '#27ae60' },
        ],
      },
    });
    console.log('  [updated] About Page');
  } catch (e) {
    console.log('  [info] About page seed skipped:', e.message);
  }

  // 6. Community Page
  console.log('\n--- Community Page ---');
  try {
    await api('/community-page', 'PUT', {
      data: {
        kicker: 'Community',
        title: 'Come and sit with us.',
        intro: `Connection is not a concept. It is biological. Your nervous system needs co-regulation. It needs other regulated humans. That's not self-help language. That's neuroscience. Every space here is designed to bring you into the room with people who are actually honest, actually present, and actually doing the work.`,
        circle_title: 'The Returning Circle',
        circle_description: `Every Tuesday evening I hold a circle at The Hare and the Moon in Twickenham. Donation-based. Open to everyone. No booking required.

What it is: a room. People who are honest. No advice. No fixing. No cross-talk. Just being in the presence of other humans who are willing to say what's actually going on.

What it is not: therapy, a support group, a workshop, or anything with a curriculum. There is no programme. There is no progression. You come when you need to. You stop when you're done.

Most people who come for the first time look nervous. By the end of the evening something in them has settled. Not because anything dramatic happened. Because they were in a room where they didn't have to perform. That sounds like nothing. It's actually everything.`,
        reset_room_title: 'The Reset Room',
        reset_room_description: `The Reset Room is the monthly membership for people who want ongoing access to the work without the commitment of a full programme.

It is for people who have done some work and want to keep going. For people who are not ready for 1:1 but know they need more than occasional workshops. For people who want community as part of their practice.

It is also the most natural next step after a workshop. You came to Signal Reset Day. Something shifted. You want to keep that aliveness going. This is where you come.

Cancel any time. First month free for anyone who has attended a paid workshop in the last three months.`,
        reset_room_price: '£25 per month',
        reset_room_features: [
          'Monthly live group session (90 mins, Zoom, recorded)',
          'Full workshop replay library',
          'Signal Method™ workbook',
          'Monthly Signal Check practice',
          'Founder reset audio',
          'Reset Room community space',
          'Early retreat booking access',
        ],
        events_title: 'Events Calendar',
        events_description: 'Upcoming retreats, live dates, guest experts, and member-only events. Crystal parties, children\'s crystal parties, crystal wellbeing gatherings, and the Crystal Clear Business Vortex.',
        resources_title: 'Resource Library',
        resources_description: 'Guides, tools, workshop replays, and member-only content. Free nervous system recalibration, subconscious clarity reset quiz, and the full healing resource library.',
      },
    });
    console.log('  [updated] Community Page');
  } catch (e) {
    console.log('  [info] Community page seed skipped:', e.message);
  }

  // 7. FAQs
  console.log('\n--- FAQs ---');
  for (const faq of faqs) {
    await findOrCreate('/faqs', 'question', faq.question, { ...faq, is_active: true });
  }

  // 8. Cosmic Forecast (sample)
  console.log('\n--- Cosmic Forecast ---');
  await findOrCreate('/cosmic-forecasts', 'title', 'The Week of Settling', {
    title: 'The Week of Settling',
    week_of: '2026-05-11',
    moon_phase: 'Waning Gibbous — time to release what you built last week and let the body integrate',
    energy_theme: 'Settling. Not collapsing. Not pushing. Settling into what is actually here.',
    stone_of_week: 'Smoky Quartz — the stone that grounds without numbing. Hold it when your mind is running faster than your body.',
    summary: `This is a week for doing less and noticing more. The waning gibbous asks you to stop adding and start absorbing. Whatever came up last week — the conversation, the realisation, the thing your body showed you — this is the week it lands.

Settling is not the same as giving up. It is the moment your nervous system stops scanning for threat and starts resting in what is. Most people skip this phase entirely. They move from insight straight to action. But the body needs time to reorganise around what it now knows.

Practice this week: ten minutes of stillness each morning before you reach for your phone. Not meditation. Not breathwork. Just being in the room with yourself before the world gets in.

The Cosmic Forecast is not an astrology column. It is my diary, shared weekly, using the moon as a framework for inner work. The full version — with the complete ritual, somatic practice, and personal note — goes to Reset Letters Plus subscribers.`,
  });

  // 9. Mantras
  console.log('\n--- Mantras ---');
  const mantras = [
    { title: 'I am safe in this moment', description: 'A grounding practice for when your nervous system is activated. Place both feet on the floor and repeat.', duration: '60 seconds', sort_order: 1 },
    { title: 'I release what is not mine to carry', description: 'For the women who hold everything. This is your permission to put it down.', duration: '75 seconds', sort_order: 2 },
    { title: 'I come back to myself', description: 'The core mantra of the Come Back to Yourself series. A daily reset in under ninety seconds.', duration: '90 seconds', sort_order: 3 },
    { title: 'My body knows the way', description: 'When your mind is too loud to think clearly, your body already has the answer. This practice helps you listen.', duration: '60 seconds', sort_order: 4 },
    { title: 'I trust the timing of my life', description: 'For the moments when nothing seems to be happening fast enough. Slow is not stuck.', duration: '75 seconds', sort_order: 5 },
    { title: 'I am allowed to take up space', description: 'A practice for women who have made themselves small. You do not need to shrink.', duration: '60 seconds', sort_order: 6 },
  ];
  for (const mantra of mantras) {
    await findOrCreate('/mantras', 'title', mantra.title, { ...mantra, is_active: true, youtube_url: '' });
  }

  // 10. Experiences
  console.log('\n--- Experiences ---');
  const experiences = [
    { name: 'Autumn Reset Day', slug: 'autumn-reset-day', type: 'retreat', description: 'A full day on the houseboat at Taggs Island. Six people maximum. No phones, no fixed agenda. We work with whatever the group needs — breathwork, somatic practice, Signal Method, honest conversation.', date: '2026-09-20', location: 'Taggs Island, Hampton', price: null, price_label: 'Enquire', is_upcoming: true, is_active: true, sort_order: 1 },
    { name: 'Surrendering and Raising Your Vibration', slug: 'surrendering-vibration', type: 'workshop', description: 'An online workshop focused on releasing tension patterns and reconnecting with your body\'s natural energy. Crystal healing, breathwork, and guided somatic practice.', date: '2026-10-15', location: 'Online', price: null, price_label: 'Enquire', is_upcoming: true, is_active: true, sort_order: 2 },
    { name: 'Crystal Clear Business Vortex', slug: 'crystal-clear-business-vortex', type: 'workshop', description: 'A journey to success — an immersive workshop combining crystal healing, breathwork, and entrepreneurial strategy for founders and business owners.', date: '2026-11-08', location: 'Taggs Island, Hampton', price: null, price_label: 'Enquire', is_upcoming: true, is_active: true, sort_order: 3 },
    { name: 'FREE Crystal Healing: Surrender & Sparkle', slug: 'free-crystal-healing', type: 'workshop', description: 'A complimentary online session open to everyone. No booking fee. Crystal exploration, guided meditation, and energy clearing.', date: '2026-10-01', location: 'Online', price: 0, price_label: 'Free', is_upcoming: true, is_active: true, sort_order: 4 },
    { name: 'Corporate Wellbeing: Level Up and Sparkle', slug: 'corporate-level-up-sparkle', type: 'corporate', description: 'A corporate wellness mini-retreat. Bespoke formats for teams — workshops, keynotes, and ongoing wellbeing programmes. The Signal Method adapted for the workplace.', date: '2026-12-31', location: 'Your workplace or online', price: null, price_label: 'Bespoke pricing', is_upcoming: true, is_active: true, sort_order: 5 },
  ];
  for (const exp of experiences) {
    await findOrCreate('/experiences', 'slug', exp.slug, exp);
  }

  // 11. Product Categories
  console.log('\n--- Product Categories ---');
  const prodCatMap = {};
  for (const cat of productCategories) {
    const created = await findOrCreate('/product-categories', 'slug', cat.slug, cat);
    if (created) prodCatMap[cat.slug] = created.id;
  }

  // 12. Products
  console.log('\n--- Products ---');
  for (const product of products) {
    const catId = prodCatMap[product.category_slug];
    const data = { ...product, category: catId || null };
    delete data.category_slug;
    await findOrCreate('/products', 'slug', product.slug, data);
  }

  // 13. Additional FAQs (Vol 3)
  console.log('\n--- Additional FAQs ---');
  for (const faq of additionalFaqs) {
    await findOrCreate('/faqs', 'question', faq.question, { ...faq, is_active: true });
  }

  console.log('\n=== Seed Complete ===\n');
}

seed().catch(console.error);
