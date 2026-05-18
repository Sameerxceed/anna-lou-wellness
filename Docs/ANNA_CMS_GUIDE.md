# How to edit your website on iPhone

A quick guide for editing Anna Lou Wellness via Strapi CMS.

---

## 🔑 Logging in

1. Open Safari (works best) → go to **`cms.annalouwellness.com/admin`**
2. Bookmark it. Tap → Share → Add to Home Screen → install as an app icon.
3. Log in with your email + password.

---

## 📝 Where to edit each part of the site

The left sidebar shows two main sections.

### "Single Types" — pages that exist exactly once

| Single Type | Edits |
|---|---|
| **Homepage** | All sections on the homepage |
| **About Page** | Your bio, story, press logos, certifications |
| **Reset Room Page** | The Reset Room landing page (3 pillars, pricing, etc.) |
| **Reset Letters Page** | The /reset-letters holding page (Substack signup) |
| **Decoder Page** | The free Nervous System Decoder lead magnet page |
| **Site Settings** | Footer info, contact email, social links, logos |

### "Collection Types" — pages with multiple entries

| Collection | What's inside |
|---|---|
| **Programme** | All your coaching offers (The Reset, Signal, Founder Reset, etc.) — 9 entries |
| **Experience Page** | Workshops, Retreats, Corporate, Speaking — 4 entries |
| **Community Event Page** | Returning Circle, Events — 2 entries |
| **Page (generic)** | Smaller pages like Press, Partnerships, Mantras, etc. — 13 entries |
| **Article** | All your editorial articles (Reset Stories, Life, Love, Work) |
| **Article Category** | Categories for your articles |

---

## ✏️ Editing a field — the basics

Every field has a **little help text under the label** telling you what it does. Read it before editing.

### Text fields
- **Single-line:** for titles, button labels, short bits
- **Multi-line (textarea):** for body paragraphs. **To create multiple paragraphs, leave a BLANK LINE between them.**
- **Lists (bullet points):** one item per line — each line becomes a separate bullet

### Image fields
- Tap the field → upload from your camera roll
- Images automatically resize to 2400px wide max
- Photos from your iPhone get auto-rotated correctly
- Anything you upload becomes web-friendly file size (~500KB)

### URL fields
- Internal links: start with `/` (e.g. `/the-work`)
- External links: full URL (e.g. `https://...`)
- Anchor links: start with `#` (e.g. `#enquire`)

---

## 💾 Saving — one click

Tap the **Save** button (top right). That's it. No separate "Publish" step.

The change goes live on the site within seconds. Refresh `staging.annalouwellness.com` (or pull down to refresh in Safari) to see your edit.

---

## 🎨 Brand colours (hex codes)

When you see an `accentColour` or `kickerColour` field, use one of these:

| Colour | Hex | Used for |
|---|---|---|
| Plum | `#6E3A5A` | Primary brand colour |
| Pink | `#F280AA` | The Work / pink accents |
| Blue | `#7BAFDD` | Experiences / blue accents |
| Gold | `#FAA21B` | Life / yellow accents |
| Mint | `#5DCAA5` | Community / mint accents |
| Light Gold | `#FFD07A` | Highlights |
| Red | `#EE312F` | Bold accents |

---

## 🚨 Common gotchas

### "I edited but nothing changed on the live site"
- Did you click **Save** (top right)?
- Are you looking at the right URL? (staging.annalouwellness.com)
- Try a hard refresh — pull down further than usual in Safari, or close + reopen Safari

### "I can't find the page I want to edit"
- It might be in a different collection. Check **Collection Types** first.
- Some pages are intentionally not CMS-managed (Login, Cart, Checkout, Account) — these are functional, not editorial.
- Sub-pages like `/the-work/sessions/founder-reset` are under **Programme** collection (slug `founder-reset`).
- Sub-pages like `/experiences/workshops` are under **Experience Page** collection (slug `workshops`).

### "The slug field — what do I put?"
- Don't change it once an entry is created — it's the URL of the page.
- Slugs use hyphens, no spaces. e.g. `the-reset`, not `The Reset`.

### "I deleted something by accident"
- Strapi keeps a version history. Tap the 3-dot menu on the entry → can restore.
- If a whole entry is deleted, on Strapi restart the seed script will recreate it with the original content (one of the safety nets we built).

---

## 📱 iPhone-specific tips

- **Rotate to landscape** for editing long body text — easier to type and review
- **Long-press on the URL bar** in Safari for quick paste of links
- **Use voice dictation** for body paragraphs — much faster than thumb-typing
- **Set up Safari Reader Mode** to preview how your edits look without distractions

---

## ❓ When in doubt

- Email or message Sameer with a screenshot — he'll tell you exactly what to click.
- Don't delete content types or roles in Settings — those are infrastructure.
- Don't edit anything in **Settings** unless instructed — that's the dev side.

---

## What's NOT in the CMS (intentional)

These stay code-managed because they rarely change or are functional:

- Navigation menu items (sidebar / header links)
- Cart, Checkout, Login, Account pages
- Quiz logic (questions and routing — copy intro is CMS though)
- 404 page
- Terms / Privacy long-form text (titles are CMS, body is fixed legal)

Ask Sameer if you want any of these moved into the CMS.
