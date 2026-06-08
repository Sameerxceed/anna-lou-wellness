# Backend Feedback — Master Plan

Compiled from Anna's 5 Jun feedback PDF + the REGULATED sales-page mockup + Sameer's follow-up on per-page upsells + the "sections must also support uploading imagery throughout" requirement (8 Jun).

This is the working plan. We execute top-to-bottom; nothing skips ahead. Each section calls out **what changes, where, what Anna sees, and rough effort**.

## Core principle for everything below

**Every page Anna can build must let her drop in imagery freely** — not just one hero image. Galleries, image+text splits, full-bleed images, image-as-background sections, side-by-side image pairs. Imagery is a first-class block, not an afterthought. Where a section is text-heavy by nature (e.g. a numbered list, a pull-quote), Anna still gets at least one optional image slot.

---

## ALREADY SHIPPED (today, 8 Jun)

| # | Item | Commit |
|---|---|---|
| 1 | Mobile homepage Cup-of-Jo card pattern (image + category + excerpt + Read More, bigger text) | `e6f71cd` |
| 2 | CMS field tooltips on SEO title / SEO description / Booking URL / Date across 25 schemas | `e6f71cd` |
| 3 | Returning Circle now supports 2+ recurring sessions (Sessions repeater) | `e6f71cd` |
| 4 | Image filenames slugified (`IMG 5847.jpeg` → `img-5847.jpeg`) | `8143ebb` |
| 5 | iPhone HEIC photos auto-convert to JPEG | `8143ebb` |
| 6 | Bulk upload no longer OOM-crashes (sequential processing) | `8143ebb` |
| 7 | Upload caps raised (50 MB per file, 250 MB per batch) | `8143ebb` |
| 8 | "Generate SEO" AI button on every edit page, via Claude in Anna's voice | `0c49c5f` |
| 9 | Homepage hero / work / shop body copy trimmed (Cup-of-Jo brevity) + conditional one-time migration | `6a75166` |

Awaiting deploy of CMS + Web for Anna to see #1–9 live.

---

## TO BUILD — execution order

### 1. Page Builder (highest priority — Anna's "create a new page today" request)

**Why:** Anna wants to design new pages herself — colours, headers, multiple images, multiple sections — without dev help. Today her only option is plain text blocks. This blocks her from independently shipping landing pages, retreat detail pages, sales pages, etc.

**Foundation already present:** there's a hidden `Page` collection in Strapi with a Dynamic Zone of 13 section components (`sections.hero`, `sections.text-block`, `sections.gallery`, `sections.cta-banner`, `sections.faq`, `sections.testimonials`, `sections.card-grid`, `sections.team-grid`, `sections.contact-form`, `sections.embed`, `sections.featured-products`, `sections.custom-html`, `sections.press-strip`). Marked `visible: false` and never wired to a frontend route. We're going to wake it up.

**Steps:**

1. **New shared component `shared.section-style`** — bg colour, text colour, accent colour, padding (tight/normal/spacious), alignment, max width, **optional background image** (for sections that want a photo behind the text). Plain hex strings with examples in the field hints. *(File started: `cms/src/components/shared/section-style.json`)*
2. **Add `style` field to every section component** (13 of them) referencing the new style component. Existing entries unaffected because none exist.
3. **New image-rich section components — the imagery pillar of the page builder:**
   - `sections.image-text-split` — image left or right + heading + body
   - `sections.full-bleed-image` — single edge-to-edge image with optional overlay caption
   - `sections.image-pair` — two side-by-side images with optional captions (e.g. "before / after" or "boat exterior / boat interior")
   - `sections.image-with-caption` — single centred image with caption underneath
   - The existing `sections.gallery` (multi-image grid) and `sections.hero` (large hero image) cover the rest
4. **Wake up the Page collection:** rename to "Page (build your own)", set `visible: true`, add all new image-rich components to its Dynamic Zone, add a top-level `hero_image` field for OG/social previews + listing cards.
5. **Public read API + lifecycle hook** so saves go live in 1–2 sec.
6. **Frontend renderer `/p/[slug]/page.tsx`** that walks the Dynamic Zone and renders each section type with its style applied (bg colour, padding, alignment, bg image, etc.). Covers all section types including the new image components.
7. **User manual section: "Building a new page"** — step-by-step with screenshots: create entry → pick sections from "Add component" → fill fields → drop images → set style → save. Explicit guidance on which section to pick for each visual outcome (single hero photo, side-by-side images, full-width banner image, gallery, image-with-text). Send Anna a one-page PDF cheatsheet she can pin.

**Anna sees:** a new sidebar menu **"Page (build your own)"**. She clicks **Create new entry**, gives it a title + slug. She clicks **Add a component to sections**, picks **Hero**, fills it, picks **Image + Text split**, fills it, picks **Gallery**, drops 6 photos, etc. Each section has a **Style** field where she chooses bg colour, padding, alignment. Saves → page goes live at `/p/her-slug`.

**Effort:** ~3 hrs.

---

### 2. Per-page upsell ("Show next") mapping

**New requirement (8 Jun):** Anna provided a specific mapping of what to show as the "next step" on each programme/page. Currently the related-items / "you may also like" is auto-derived; she wants explicit control per page.

**The mapping she sent:**

| On this page | Show as next steps |
|---|---|
| Nervous System Decoder | REGULATED, The Reset Room |
| REGULATED | The Reset Room, Workshops |
| Workshops | The Reset Room, The Reset |
| The Reset Room | The Reset, Pendulum Subconscious Healing |
| Pendulum Subconscious Healing | The Reset, The Reset Room |
| The Reset (6 weeks) | Signal & Build, One Founder Heart-Led Strategy Day, Houseboat Retreats |
| Signal & Build (12 wks founders) | The Signal Collective, One Founder Heart-Led Strategy Day |
| One Founder Heart-Led Strategy Day | Signal & Build, The Signal Collective |
| The Signal Collective (mastermind) | Houseboat Retreats, One Founder Heart-Led Strategy Day |
| Houseboat Retreats | The Reset, Signal & Build |
| Corporate Workshops | **(nothing — B2B page, no upsells)** |

**Steps:**

1. **CMS:** new component `shared.upsell-reference` — fields: `label` (string), `link` (string), `image` (media optional), `eyebrow` (e.g. "Next step", "Go deeper").
2. **Add `upsells` repeatable field (max 3) to:** Programme schema, Experience schema, and the new Page collection. Plus the Decoder Quiz singleton already in place.
3. **Render an `<UpsellBlock>` component** at the bottom of programme/experience/page templates. If `upsells` is empty, show nothing (covers the Corporate Workshops "show nothing" rule).
4. **Replace the existing "You may also like" logic** with this explicit block on service pages. Leave it alone on shop product pages (jewellery), where related-items still makes sense.
5. **Seed Anna's exact mapping** so it's live the moment she deploys. She can edit later via CMS.

**Effort:** ~1.5 hrs.

---

### 3. REGULATED sales page (custom build matching the HTML mockup)

**Spec:** Anna's `Docs/REGULATED-sales-page-preview.html` — full editorial sales page with hero, opening narrative, question block, pulled quotes, "The Truth" + "What You Actually Need" sections, 5 numbered learn-item cards, anchor quote band (Anchored. Clear. Sovereign. Yours.), pay-what-you-feel block, two red CTAs.

**Approach:** Build it using the Page Builder from #1. The mockup decomposes into the existing components plus 3 new ones we should add to the section library:

1. `sections.numbered-list` — for the "Inside REGULATED · You Will Learn" 5 cards
2. `sections.anchor-band` — for "Anchored. Clear. Sovereign. Yours." (4 words on black bg with gold text)
3. `sections.pay-what-you-feel` — for the price block

Then the REGULATED sales page becomes a single `Page` entry — title "REGULATED · Sales Page", slug `regulated-sales`, sections stacked. Plus a redirect from `/the-work/regulated` → `/p/regulated-sales` so the URL stays clean.

**Bonus:** Once these 3 specialised sections exist, Anna can build similar sales pages for other programmes herself.

**Effort:** ~3 hrs (the 3 new components + frontend renderers + populating the actual page content + redirect).

---

### 4. Workshops & retreats: scrollable visual grid

**Anna's complaint:** "users will not be able to find anything and scroll through options easily." Reference: chriscorsini.com/pages/all-workshops — one long scrollable grid of large image cards.

**Today:** `/experiences` shows 4 category cards then a 3-column upcoming list with text-only cards. To see every workshop she runs, a visitor has to click into multiple sub-pages.

**Steps:**

1. Beef up `/experiences` into a one-page visual grid of every Experience entry — image-first cards.
2. Each card: hero image (16:9), type pill (Retreat / Workshop / Corporate / Speaking) in brand colour, name, date, location, price label.
3. Filter pills at the top: All / Retreats / Workshops / Corporate / Speaking. Client-side filter, no extra page loads.
4. Keep the sub-pages (`/experiences/retreats` etc.) as deeper detail. They become optional rather than required.
5. No CMS schema change — uses existing Experience collection fields.

**Effort:** ~2 hrs.

---

### 5. Investigations needing eyes on the screen

Items I can't fix blind — need a screen-share or screenshot URLs from Anna:

| # | What | Best guess |
|---|---|---|
| 5a | "Align & Amplify preview jumps to homepage" | Wrong `previewUrl` config on Experience content type. ~30 min to fix once I see the URL she clicks. |
| 5b | "Align & Amplify product page saves but no proper sales content" | Likely a content-type / route mismatch. Need to see staging URL. |
| 5c | "Corporate wellbeing page — no design, just text jumbled up" | Visual bug. 30 min once seen. |
| 5d | "What does this mean as there is no white space" | Unclear which screen. Skip until clarified. |

**Action:** ask Anna for either screenshots with URLs or a 5-min Loom of each.

---

### 6. Documentation-only items (no code)

| # | What | Output |
|---|---|---|
| 6a | "Content Type Builder is locked" — by design (dev-only) | One-line in user manual |
| 6b | "How do we add a new page?" | New section in user manual covering both flows: new entry in an existing collection vs. new Page-builder page from #1 |
| 6c | Live preview while editing | Add a manual note: "Strapi shows fields, not the rendered page. Use the Live URL link in the right sidebar of each entry to open the page in a new tab — refresh after save." |

---

## Execution order (today + tomorrow)

1. **Page Builder (#1)** — biggest unlock for Anna, foundation for #3
2. **Per-page upsells (#2)** — concrete spec, small effort, immediate visible improvement
3. **REGULATED sales page (#3)** — uses the new Page Builder
4. **Workshops grid (#4)** — independent, self-contained
5. **User manual updates (#6 + walkthrough for #1)** — wraps everything for Anna
6. **Investigations (#5)** — once Anna sends URLs/screenshots

Each step ships as its own commit + push. Sameer redeploys after each so progress is visible end-to-end.
