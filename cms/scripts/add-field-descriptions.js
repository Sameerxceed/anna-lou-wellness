/**
 * Bulk add helpful descriptions to common field-name patterns across
 * every Strapi content type schema in src/api/.
 *
 * Strategy:
 *  - Walk every src/api/<slug>/content-types/<slug>/schema.json
 *  - For each attribute whose name matches a known pattern (seo_title,
 *    slug, hero_image, etc.), set `description` to a helpful example
 *    BUT ONLY if the field has no existing description (or it's < 5 chars).
 *  - Preserves all other attributes verbatim.
 *
 * Idempotent — re-running won't overwrite descriptions added previously.
 *
 * Run:
 *   node cms/scripts/add-field-descriptions.js
 *
 * Then redeploy the CMS — Anna sees the new help text on every edit form.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Pattern -> description. First match wins (so put more-specific patterns first).
const PATTERNS = [
  {
    rx: /^(seo_title|seoTitle)$/i,
    desc: "SEO title shown in Google search results and the browser tab. Aim for 50-60 characters. Example: 'Nervous System Reset London — 6 Week Programme'. Leave blank — auto-fills with Claude when you Save.",
  },
  {
    rx: /^(seo_description|seoDescription|meta_description)$/i,
    desc: "Short summary for Google and ChatGPT (1-2 sentences, 140-160 chars). Example: '12-week 1:1 somatic coaching for women navigating burnout in London. Trauma-informed.' Auto-fills on Save if blank — leave empty unless you want to override.",
  },
  {
    rx: /^slug$/i,
    desc: "URL path after the slash. Lowercase, hyphens-not-spaces, no punctuation. Auto-fills from the name/title — only edit if you want to change the URL.",
  },
  {
    rx: /^(hero_image|heroImage|heroImg)$/i,
    desc: "Top banner photo for this page. Use a landscape JPG at least 1600x1000px. Smaller images will stretch and look blurry on big screens. PNG / HEIC work but JPG is half the file size.",
  },
  {
    rx: /^(portrait_image|portraitImage)$/i,
    desc: "Vertical photo (taller than wide). Use a portrait JPG at least 800x1200px. Anna recommends a soft, atmospheric shot rather than a headshot — sets the editorial tone.",
  },
  {
    rx: /^(cover_image|coverImage|cover)$/i,
    desc: "Cover image — shown as the card thumbnail when this entry appears in lists and social previews. Landscape JPG, at least 1200x800px.",
  },
  {
    rx: /^(cta_url|ctaUrl|booking_url|bookingUrl)$/i,
    desc: "Where the button takes people. Paste the full URL including https://. Calendly links open as a popup so visitors stay on your site (e.g. https://calendly.com/anna/discovery-call). Stripe checkout or internal pages open normally. Leave blank to hide the button.",
  },
  {
    rx: /^(cta_label|ctaLabel|button_label|buttonLabel)$/i,
    desc: "Button text. Keep it short and action-oriented. Examples: 'Book your place', 'Read more', 'Apply now'. Avoid filler like 'Click here'.",
  },
  {
    rx: /^(link|url|external_url|externalUrl|website_url|websiteUrl)$/i,
    desc: "Full URL including https://. Opens in a new tab so visitors don't lose your site. Example: https://annalouoflondon.com/products/silver-necklace",
  },
  {
    rx: /^(date|event_date|eventDate|published_date|publishedDate)$/i,
    desc: "Click the month name at the top of the picker to jump months or years. Use the < > arrows to step one month at a time. Leave empty for evergreen items (no fixed date).",
  },
  {
    rx: /^(email|contact_email|reply_to|replyTo)$/i,
    desc: "Email address. Format: name@domain.com — no spaces, must include the @ and the dot.",
  },
  {
    rx: /^(phone|tel|telephone|phone_number)$/i,
    desc: "Phone number. International format preferred. Example: +44 7700 900000",
  },
  {
    rx: /^(mailchimpTag|mailchimp_tag)$/i,
    desc: "Tag name that fires when someone buys this. Must match EXACTLY the trigger tag on the Mailchimp Customer Journey you want to fire. Case-sensitive, spaces and special chars allowed. Example: 'The Reset · Member'.",
  },
  {
    rx: /^(price|amount|total_amount|cost)$/i,
    desc: "Amount in GBP (pounds and pence). Just the number — no currency symbol, no commas. Example: 49.99",
  },
  {
    rx: /^(price_label|priceLabel)$/i,
    desc: "Free-text price label shown to customers. Use this when you want to add nuance ('£49 / month', 'From £200', 'Investment by enquiry'). For straight one-off prices use the Price field too.",
  },
  {
    rx: /^(kicker|eyebrow|section_label|sectionLabel)$/i,
    desc: "Small uppercase label that sits ABOVE the main heading. Keep it short — 1 to 3 words. Examples: 'For founders', 'A note from Anna', 'New series'.",
  },
  {
    rx: /^(kicker_colour|kickerColour|accent_colour|accentColour)$/i,
    desc: "Hex colour for the kicker / accent. Format: #6E3A5A (the # then 6 letters/numbers). Anna's brand palette: Plum #6E3A5A, Terracotta #C4704A, Honey #FFD07A, Pink #F280AA, Sage #5DCAA5.",
  },
  {
    rx: /^(intro|tagline|subtitle)$/i,
    desc: "One short paragraph that sits under the main heading. 2-3 sentences max. Tells the reader what this page or item IS in their language, not yours.",
  },
  {
    rx: /^(is_active|isActive|is_published|active)$/i,
    desc: "Untick to HIDE this entry from the public site without deleting it. Useful for seasonal items or things you're drafting privately.",
  },
  {
    rx: /^(is_featured|isFeatured|featured)$/i,
    desc: "Tick to promote this entry to the homepage / category landing page. Usually only 1-3 entries should be featured at any time — too many dilutes the effect.",
  },
  {
    rx: /^(sort_order|sortOrder|order|position)$/i,
    desc: "Lower numbers show first. Use 10, 20, 30 (not 1, 2, 3) so you can drop new entries between existing ones without renumbering everything.",
  },
  {
    rx: /^(reading_time|readingTime|read_time)$/i,
    desc: "Reading time label. Free text. Examples: '5 min read', '10 min', 'Quick read'.",
  },
  {
    rx: /^(author|author_name|by)$/i,
    desc: "Who wrote this. Free text. Defaults to 'Anna Lou' if blank.",
  },
];

const skipPaths = [
  // Skip non-content-type files
];

function processSchema(file) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); }
  catch { return { file, changed: false, error: 'read failed' }; }
  let json;
  try { json = JSON.parse(raw); }
  catch { return { file, changed: false, error: 'parse failed' }; }

  if (!json.attributes || typeof json.attributes !== 'object') {
    return { file, changed: false };
  }

  let changes = 0;
  for (const [name, attr] of Object.entries(json.attributes)) {
    if (!attr || typeof attr !== 'object') continue;
    const existing = typeof attr.description === 'string' ? attr.description.trim() : '';
    if (existing.length >= 5) continue;

    for (const p of PATTERNS) {
      if (p.rx.test(name)) {
        attr.description = p.desc;
        changes++;
        break;
      }
    }
  }

  if (changes > 0) {
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
  }
  return { file, changes };
}

function walk() {
  const root = path.resolve(__dirname, '..', 'src', 'api');
  const results = [];
  if (!fs.existsSync(root)) {
    console.error(`Root not found: ${root}`);
    process.exit(1);
  }
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        stack.push(full);
      } else if (e.name === 'schema.json' && full.includes(path.join('content-types'))) {
        results.push(processSchema(full));
      }
    }
  }
  return results;
}

const results = walk();
let total = 0;
const touched = [];
for (const r of results) {
  if (r.changes > 0) {
    touched.push(r);
    total += r.changes;
  }
}

console.log(`Updated ${total} field descriptions across ${touched.length} schemas:`);
for (const r of touched.sort((a, b) => b.changes - a.changes)) {
  const rel = r.file.split('src' + path.sep + 'api' + path.sep)[1] || r.file;
  console.log(`  +${String(r.changes).padStart(3)}  ${rel}`);
}
console.log('Done.');
