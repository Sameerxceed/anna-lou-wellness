# Anna Lou Wellness — User Manual

**Version 1.5 — Updated 1 June 2026**

This is your complete reference for running the website day-to-day. Keep it bookmarked. Anything not covered here, message Sameer.

A 2-page cheatsheet with the 10 most common tasks is included separately (`ANNA_QUICK_REFERENCE.docx`). Use that for daily work; come back here when you need depth.

**Two ways to use this manual:**
- Sections 0–15 are organised **by feature** (Pages, Articles, Shop, Mailchimp, Stripe, etc.). Best when you want to learn how a system works.
- Section 16 is organised **by URL**. Best when you're looking at a live page and asking "where do I change this?". It includes a Quick Reference table mapping every page on the site to its CMS location.

---

## 0. First-time image upload (do this once, before anything else)

To make the site look "finished" on day one, upload these ~25 images into the Media Library and attach them to the corresponding pages. Total time: roughly 45 minutes.

Image specs to aim for:
- **Hero / portrait images:** 1600 × 1200 px or larger, JPG/PNG
- **Logo / wordmark / badge:** SVG preferred (vector), or transparent PNG 600 × 600
- **Square / product images:** 1500 × 1500 px

Strapi automatically generates 5 smaller variants (245 / 500 / 750 / 1200 / 1920 px wide) on upload — you upload once at full resolution and the site picks the right size per use.

### Site-wide (3 images)

| Where to upload | What to upload |
|---|---|
| `3. Site Settings → logo` | Anna Lou Wellness wordmark (light background) |
| `3. Site Settings → og_default_image` | 1200 × 630 social-share image (Anna portrait + wordmark) |
| `3. Site Settings → favicon` | (already set — only re-upload if you want a new one) |

### Homepage (4 images)

`1. Homepage` →
- `heroImage` — main portrait/hero (1600 × 1200, portrait orientation, e.g. you on the houseboat or studio shot)
- `workImage` — the "Work with Anna" section photo
- `communityImage` — the Community teaser photo
- `portraitImage` — small portrait for the About teaser block

### Pillar pages (8 images)

| Where | Field |
|---|---|
| `About` | `portrait` — main "Anna's story" photo (portrait orientation) |
| `About` | `press_logos` — one logo per row (Aneeza is sending the licensed artwork) |
| `About` | `certifications` — ICF, CPD, TRE badge per row |
| `Community` | `circle_image` — Returning Circle photo |
| `Community` | `reset_room_image` — Reset Room visual |
| `Reset Letters` | (uses brand colour wordmark, no extra image needed for now) |
| `Reset Room` | `hero_image` |
| `Decoder` | `hero_image` |
| `Experiences` | `hero_image` |
| `Work · Membership (Reset Room)` | `hero_image` |

### Work with Anna — programmes (5 images)

`Work · Programme` → for each entry (The Reset, Signal, Signal & Build, One Day, Signal Collective):
- `hero_image` — one portrait photo per programme

### Work with Anna — coaching sessions (3 images)

`Work · Coaching Session` → for each entry (Dating Reset, Founder Reset, Nervous System Reset):
- `hero_image`

### Articles, products, events

You add these gradually as you publish — each new article needs a `hero_image`, each product needs `images` (gallery), each event needs `hero_image`. No "first-time" lift; just attach the image when you create the entry.

### Tips for choosing photos

- **Portrait orientation** for hero images on individual pages (works better with the side-by-side image+text layout)
- **Landscape** for full-bleed sections (like community circle, retreat photos)
- **Square** for product photography and Instagram shares
- Same colour grading / mood across the brand for visual cohesion
- Avoid stock photo cliches — your own photography always reads better

When in doubt, upload what you have. The site degrades gracefully to placeholders if a field is empty.

---

## 1. Getting started

### What runs the site

Three pieces, all wired together:

1. **The website** at `annalouwellness.com` — what visitors see.
2. **The CMS (Strapi)** at `cms.annalouwellness.com` — where you edit everything.
3. **Stripe + Mailchimp** — payments + email automation, both already wired to the CMS.

You only ever log into the CMS. Stripe and Mailchimp are linked behind the scenes.

### Logging in

1. Open `https://cms.annalouwellness.com/admin` in any browser
2. Username: `anna@annalouwellness.com` (or whatever email Sameer set up for you)
3. Password: the one Sameer sent you separately

If you forget the password, click "Forgot password" on the login screen — it emails you a reset link.

### The admin tour

After login, you see a sidebar on the left with these main areas:

- **Content Manager** — where you do all editing. Pages, articles, products, orders, settings.
- **Media Library** — every image you've uploaded, in one place. Drag-and-drop new ones here.
- **Settings** — your account, your admin team, plugins (rarely touched).

You'll spend 90% of your time in Content Manager.

### Where things live in Content Manager — the new sidebar layout

Content Manager splits into Single Types and Collection Types. Both are grouped using prefix labels so you can scan them quickly. Reading top to bottom, you'll see:

**Pinned at top (the three you'll touch most often):**
- `1. Homepage` — the front page of the site
- `2. Navigation` — the menu items + top strip
- `3. Site Settings` — global logo / SEO / social URLs / bank details

**Page singletons** (each one matches a menu item on the website — click `ABOUT` in the menu, edit `About` in the CMS):
- About / Community / Contact / Decoder / Experiences / Reset Letters / Reset Room / Sub-pages / Community Event / Welcome

**Editorial content** (`Story · X`):
- Story · Article (every blog/Reset Story/Life/Love/Work article lives here, separated by Category)
- Story · Category (the subcategory tabs)
- Story · Mantra (the rotating quote strip)
- Story · Cosmic Forecast

**Coaching / programmes** (`Work · X`):
- Work · Programme (The Reset, Signal, Signal & Build, One Day, Signal Collective)
- Work · Coaching Session (Dating Reset, Founder Reset, Nervous System Reset)
- Work · Membership (Reset Room subscription settings)
- Work · FAQ
- Work · Experience

**E-commerce** (`Shop · X`):
- Shop · Product
- Shop · Category
- Shop · Order
- Shop · Customer

**Other groups:**
- Event · Event
- Team · Member

**Sorted to the very bottom** (`zz · X (unused)`) — internal/system content types you should ignore. Cart, Coupon, Currency Rate, Page-legacy, Product Option / Review / Variant, Return Request, Shipping Method / Zone, Tax Rule, Wishlist. They sort last and are marked "(unused)" so you know to skip them.

For each one, click to open. Singles are "one big form"; collections show a list with filter + search; click any row to edit.

---

## 2. The daily editing workflow

### Edit → Preview → Save → Live

Every time you edit a page:

1. Open the page or article in Content Manager
2. Make your changes in the form fields on the left
3. Click **Preview** in the top right — opens the actual live website in a side panel showing your changes
4. Happy? Click **Save** (or **Save & Publish** if it's not yet published)
5. The change goes live on the website within 1 minute

### Live preview — your new best friend

The Preview button shows you the page as visitors will see it, before you save. Edit, preview, edit again, preview again, then save when it looks right.

- Works on every page, article, product, programme
- Side-by-side: form on left, live page on right
- Updates as you type (give it a second)

### Save vs Save & Publish

Most content types have two states: **Draft** (only you can see it) and **Published** (visible to the world).

- **Save** — writes your changes but keeps the previous published version live. Use when you want to keep working before showing the world.
- **Save & Publish** — writes changes AND makes them live. Use when you're done.

For pages that have no draft/publish distinction (e.g. Site Settings, Navigation), just **Save** does it all.

### Undo a mistake

Strapi keeps version history on every entry. Top right of any edit screen, click the clock icon → **Version History** → pick an earlier version → click **Restore**. Done.

### When changes actually appear

After Save & Publish:
- The CMS marks the entry as published immediately
- The website checks for changes every 60 seconds (it caches to be fast)
- Hard-refresh your browser if you don't see the change (Ctrl+Shift+R / Cmd+Shift+R)

---

## 3. Navigation menu

The whole top-of-page menu is now editable from CMS. Open **Content Manager → Navigation**.

### Editing the menu

You'll see a list called **Items** — one for each top-level menu item (Reset Stories, Life, Love & Relationships, Work & Money, Experiences, Work with Anna, Shop, Community, About).

**To rename an item:** click it open → change the **label** field → Save. Changes the text shown in the menu.

**To change where it links:** edit the **href** field. Examples: `/about`, `/shop`, `/reset-stories`. Always start with `/` for an internal page.

**To change the colour tint:** edit **colour** (hex like `#6E3A5A` for plum, `#5DCAA5` for green). Leave blank for default black.

**To reorder:** drag the small handle on the left of each item.

**To delete:** click the trash icon on the right.

**To add a new top-level item:** scroll to bottom of Items → click **Add an entry to Items** → choose "Top-Level Menu Item" → fill in.

### Editing the dropdown sub-menu

Open any top-level item → scroll down to its **children** list. Each child is one sub-menu link.

Same controls: rename via **label**, change link via **href**, reorder by drag, delete by trash, add new via the button at the bottom.

### Editing the top strip

That tiny text strip across the very top of every page is the **top_strip_text** field at the top of the Navigation form. Use middle dots `·` between words. Example: `Stories · Work with Anna · Experiences · Shop · Community`.

### Common changes

**Removing a subcategory** (e.g. remove "Weekend" from Life): open Navigation → expand the "Life" item → find "Weekend" in its children list → click the trash icon → Save.

**Renaming "Work with Anna" to something else**: open Navigation → click the item → change the **label** field → Save.

**Adding "Newsletter" to the menu**: open Navigation → bottom of Items → Add an entry → label: `Newsletter`, href: `/reset-letters`, colour: `#5B2E55` → optionally add child links → Save.

---

## 4. Pages

The website has two kinds of pages:

- **Single types** (one of each) — Homepage, About, Community, Contact, Reset Letters, Welcome, Decoder, Reset Room, Experience
- **Programme pages** (collection, one entry per programme) — The Reset, Signal, Signal & Build, One Day, etc.

### Homepage

Content Manager → Single Types → **Homepage**.

Sections you can edit:
- **Issue line** (e.g. "Issue No. 01 · Summer 2026") and **Inside this issue**
- **Hero** — kicker, title, body paragraph, two CTA buttons (label + URL each), hero image
- **Featured story** — fallback fields if no featured article is set; usually leave defaults
- **Editorial sections** — the colored tiles (Life, Love, Work & Money)
- **Work with Anna** section — kicker, title, body, two CTAs
- **Quote slides** — two quote sections, each with text + attribution
- **Newsletter / Substack** — Reset Letters callout
- **Shop teaser** — kicker, title, body
- **Mantras strip** — short rotating mantras
- **Media tiles** — YouTube, Podcast, Substack tile titles + URLs
- **Community section** — kicker, title, body
- **Press strip** — names of press logos (full artwork swap comes later — Anna sending logos)
- **Testimonials** — fallback testimonials if no client stories pulled
- **Portrait/about teaser** — your photo + intro paragraph

Every field has a placeholder showing the default copy. Empty fields use the default; filled fields override it.

### About, Community, Contact, etc.

Same shape: open the single type (`About`, `Community`, etc.) → edit kicker + title + body + intro paragraphs + CTA. Click Preview to see how it lands.

**About page — press logos and certifications:** these are now editable as form lists, not raw text. Open `About` → scroll to **press_logos** → each row is one outlet (name + logo upload). Same for **certifications** (name + colour + badge upload). Click "Add an entry to press_logos" / "Add an entry to certifications" to add rows. Drag the handle to reorder. Click the trash icon to remove. When Aneeza sends the licensed press artwork and certification badges, upload them into the existing rows.

### Reset Letters Holding Page

Until 22 June 2026 launch, this is the holding page. Fields cover every section: hero, what it is, each week, voices, about Anna, launch date, founder offer, signup button label.

After 22 June you'll repurpose this page or redirect to the Substack.

### Welcome Page

The "you're in" page shown after someone signs up for Reset Letters. Edit `headline` and `intro` to change the welcome message.

### Reset Room Page

The membership landing page. Edit copy describing what's inside, pricing, CTA.

### Decoder Page

The free Nervous System Decoder lead-magnet page. Edit headline, intro, download CTA.

### Programmes

Each coaching programme is a Programme entry. Content Manager → Programmes → click a row (The Reset, Signal, Signal & Build, One Day, etc.).

Fields:
- **Title** — what shows as the page title
- **Tagline** — small italic line under the title
- **Accent colour** — hex for the colored eyebrow + section labels
- **Hero image** — upload a portrait-orientation photo
- **Intro paragraphs** — main body, paragraph per line (separate with a blank line)
- **What's included items** — bullet list, one per line
- **Pricing body** — the pricing paragraph
- **CTA label + URL** — bottom button

### Coaching Sessions

These are the smaller 1:1 sessions (Founder Reset, Dating Reset, Nervous System Reset).

Content Manager → **Work · Coaching Session** → click any. Same pattern as Programmes — title, tagline, opening, accent colour, image.

### Programmes

Each coaching programme is one entry under **Work · Programme** (The Reset, Signal, Signal & Build, One Day, Signal Collective).

---

## 5. Articles (Reset Stories, Life, Love, Work)

This is the editorial heart of the site. Each article is one entry in **Articles**.

### Creating a new article

1. Content Manager → **Story · Article** → click **Create new entry** (top right)
2. Fill in:
   - **Title** — the article headline
   - **Slug** — the URL part. Auto-fills from title but you can edit. Use lowercase, dashes, no special characters.
   - **Excerpt** — a one-paragraph summary that shows on cards and SEO
   - **Body** — the full article. Paragraph per block, separated by blank lines.
   - **Hero image** — main image for the article
   - **Category** — REQUIRED. Pick from existing Article Categories. The category determines which section the article appears under (Reset Stories / Life / Love & Relationships / Work & Money) and which subcategory tab.
   - **Author** — defaults to "Anna Lou". Override for guest writers.
   - **Reading time** — like "5 min read"
   - **Is featured** — toggles whether this becomes the featured article on the homepage
   - **Is free** — toggles whether the full body is shown or only a preview (paywall)
   - **Substack URL** — link to the Substack version if cross-posted (for the "Read on Substack" link)
   - **SEO title** — overrides the default page title (defaults to article title + section)
   - **SEO description** — overrides the default meta description
   - **Published at** — leave blank for "now"; set a future date to schedule
3. Click **Save & Publish** (or **Save** if you want to keep editing before going live)

### Editing an existing article

Click the row in the Articles list → edit fields → Save.

### Article categories

These are the labels under each editorial section (e.g. "Holding Everything" sits under Reset Stories). 

To rename a category: Content Manager → **Story · Category** → click row → edit the name → Save. The change reflects on every article under that category and in the subcategory tab strip.

To delete a category: only do this if no articles are filed under it. Click the row → bottom of form → **Delete**. Articles previously filed under it will show "no category" until you reassign.

To add a new category: **Create new entry** → name, slug, optional colour and description → choose which section it belongs to.

### Paywall

When **Is free** is toggled OFF, only the first paragraph or two of the body shows on the public site, with a "Read the full piece on Substack" call to action linking to the Substack URL.

When **Is free** is ON, the full body shows directly on the website with no paywall.

For Reset Letters Founding Members, this distinction goes away — the page treats them as paid subscribers automatically.

---

## 6. Shop & products

### Adding a new product

1. Content Manager → **Shop · Product** → **Create new entry**
2. Fill in:
   - **Name** — product name
   - **Slug** — URL part (auto-generated)
   - **Short description** — one line for product cards
   - **Description** — long form on the product page
   - **Price** — number only, no currency symbol (e.g. `45.00`)
   - **Stock** — integer (e.g. `12`). Decremented automatically when an order is paid.
   - **Is active** — toggle ON to show in shop, OFF to hide without deleting
   - **Images** — upload multiple. First image is the main one. Drag to reorder.
   - **Category** — pick from Product Categories (Emotional Support Jewellery, Personalised, New In)
3. Save & Publish

### Hiding a product without deleting

Set **Is active** to OFF, save. The product disappears from the shop. Existing orders referencing it stay intact. Toggle back ON to show again.

### Editing a price

Click the product → change the **Price** field → Save. New orders use the new price immediately. Old orders keep their original price (they stored the price at time of order).

### Stock

Stock decrements automatically when an order is marked paid (via Stripe webhook). You can also manually update — open product, change Stock number, save.

When stock hits 0, the product shows "Out of stock" and customers can't add it to cart.

### Variants and options

For pieces with size or material options (e.g. "Necklace — gold / silver / rose gold"), use **Product Variants** and **Product Options**. Each variant has its own price, stock, and SKU. The product page automatically renders the option selector.

You probably won't use these often — most ALW pieces are single SKU.

### Product reviews

Customers can submit reviews. They appear in **Product Reviews**. By default reviews start as "unapproved" — you check them in CMS and toggle Approved ON before they show publicly.

---

## 7. Orders & customers

### Where to find orders

Content Manager → **Shop · Order**. List shows the latest orders with order number, customer name, total, status.

Click any row to see the full order details:
- Order number (ALW-XXXXXXXX format)
- Customer name, email, phone
- Shipping address
- Items array — each item with name, price, qty
- Subtotal, discount, tax, shipping, total
- Currency (gbp)
- Payment method (stripe or bank_transfer)
- Stripe payment ID (clickable in Stripe dashboard to see the actual transaction)
- Status
- Internal notes (your private workspace, customers never see)

### Order status lifecycle

- **pending** — order created, customer hasn't paid yet (Stripe checkout in progress, or bank transfer pending)
- **paid** — payment confirmed by Stripe, ready to pack and ship
- **shipped** — you've sent it
- **completed** — customer has received it (optional final state)
- **cancelled** — you cancelled (e.g. out of stock, customer changed mind)
- **refunded** — full refund issued

### Marking an order shipped

1. Open the order
2. Change **Status** to `shipped`
3. Add tracking info in **Notes** (e.g. "Royal Mail tracked, AB1234567890GB")
4. Save

(Customer-facing shipping notification email is on the roadmap — not wired yet. For now, manually email tracking.)

### Issuing a refund

Two-step:
1. **In Stripe dashboard** (`dashboard.stripe.com` — log in with your Stripe account) — find the payment using the Stripe Payment ID from the order → click **Refund** → full or partial → submit. The actual money refund happens here.
2. **In Strapi** — open the order → change **Status** to `refunded` → optionally note the reason in Notes → Save.

If it's a partial refund, keep status as `paid` and note the partial amount in Notes.

### Customer records

Content Manager → **Customers**. One entry per email address. Auto-created at first order. Shows order history.

You can manually add a tag, internal note, or VIP flag for any customer.

### Bank transfer orders

When someone picks "Bank Transfer" at checkout, the order is created with status `pending` and payment method `bank_transfer`. You'll see it in Orders. When you confirm receipt of the bank payment:
1. Open the order
2. Change Status to `paid`
3. Save

The Mailchimp `Shop Customers` tag will NOT auto-apply on bank transfer (only Stripe triggers the webhook). To tag them, manually open Mailchimp Audience and apply the tag.

---

## 8. Mailchimp & email automations

### What's wired

12 Customer Journeys (transactional email sequences) live in Mailchimp. Each is triggered when a specific Mailchimp tag is applied to a subscriber.

Tags get applied automatically from the website / Stripe:

| Journey | When it fires |
|---|---|
| Reset Letters — Founding Welcome | Someone signs up for Reset Letters before 22 June 2026 |
| Reset Letters — Standard Welcome | Someone signs up after 22 June 2026 (or after the 500-Founders cap) |
| Decoder — Free Download | Someone fills the Decoder form on the website |
| Workshops — Confirmation | Someone buys a workshop via Stripe |
| Discovery Call — Booked | Someone books a discovery call (Calendly integration) |
| Returning Circle — RSVP | Someone RSVPs on the website form |
| Reset Room — Member Onboarding | Someone subscribes to Reset Room (£25/mo via Stripe) |
| The Reset — Programme Onboarding | Someone books The Reset (£1,500 via Stripe) |
| Signal — Programme Onboarding | Someone books Signal (£3,000 via Stripe) |
| Signal & Build — Founder Onboarding | Someone books Signal & Build (via Stripe) |
| One Day — Intensive Onboarding | Someone books One Day intensive |
| Signal Collective — Mastermind | Someone is enrolled in Signal Collective |
| Reset Session — 90min Booking | Someone books a single 1:1 session |

All 12 journeys have:
- The trigger tag wired
- Subject + preheader set
- The branded HTML email template attached (your existing 23 HTML files with `mc:edit` zones)
- All copy populated (from your "ALW Email Automations FINAL" doc)

What's left for you: review each one, tweak any copy you want, then click **Start** to activate.

### Editing email content

1. Log in to Mailchimp at `mailchimp.com`
2. Navigate to **Automations → Customer Journeys**
3. Click the journey you want to edit (e.g. "Reset Letters - Founding Welcome")
4. Click the email step in the canvas
5. Click **Edit content**
6. Each editable region in the email is highlighted — click any of them to edit just that text (headline, body, button label, etc.)
7. The surrounding design stays locked so you can't accidentally break the layout
8. Save changes
9. Send a test email to yourself (button in the editor) to verify
10. When happy, close the editor

### Activating a journey

ONLY do this when the three pre-launch dependencies are met (see Section 12):
1. Website live at `annalouwellness.com` (not staging)
2. All button URLs in the email point to real production URLs
3. Stripe is in live mode (for the journeys that trigger from Stripe events)

To activate:
- Open the journey
- Top right corner → **Start**
- Confirm

From that point on, every time the trigger tag is applied to a subscriber, the journey fires.

### Audience management

Audience → **Audience dashboard** in Mailchimp. The `Anna Lou Wellness` audience is the only one you'll use.

To find a specific subscriber: top search bar → type email → opens their profile showing all tags, signup source, journey activity.

To manually tag someone (e.g. a bank transfer customer): open their profile → **Tags** → Add tag → pick the right one.

To remove someone: open profile → top right menu → **Unsubscribe** or **Archive**.

### Reading email analytics

Inside any journey, click the email step → **Reports**. Shows opens, clicks, bounces over time.

---

## 9. Stripe lookup

You don't need to touch Stripe day-to-day — orders and tags handle themselves. But occasionally you'll want to look something up.

### Logging in

`dashboard.stripe.com` → log in with your Stripe account credentials.

### Finding a payment

Top of dashboard → search bar → paste the Stripe Payment ID from an order (`pi_3OAbc...`) OR the customer's email. Opens the full transaction record.

### Refunding

See Section 7 above.

### Live vs Test mode

Top right of Stripe dashboard → toggle **Test mode** / **Live mode**. While the site is on staging, you're in Test mode. After go-live, you're in Live mode for real transactions.

The first real customer transaction in Live mode is a good moment to verify everything is connected. If you don't see the order in Strapi → the webhook isn't connected. Call Sameer.

### Stripe customer dashboard

You can also see all customers + lifetime value in Stripe → Customers. Useful for "how many people have bought from us" or "give me a list of repeat customers".

---

## 10. Media library

Sidebar → **Media Library**. Everything you've uploaded across all pages and articles, in one searchable grid.

### Uploading

Drag-and-drop files into the upload zone, or click **Add new assets**.

- Image formats: JPG, PNG, WebP, GIF, SVG
- PDF and audio files supported (for downloads like the Decoder)
- Max file size: 10 MB per file
- Recommended image dimensions:
  - Hero images: 1600 × 1200 px minimum
  - Article body images: 1200 × 800 px
  - Product images: 1500 × 1500 px (square)
  - Logos / wordmarks: SVG preferred (vector, scales perfectly)

### Image optimisation

Images are automatically rotated to correct orientation (iPhone EXIF rotation is handled — your photos won't appear sideways).

Images uploaded via the Media Library are served through Cloudinary, optimised for each device automatically. You don't need to resize before uploading.

### Reusing images

When picking an image in any content field, Strapi shows the Media Library — pick an existing one or upload new. Reuse is encouraged (Anna's headshot, brand patterns, etc. should be uploaded once and picked from the library).

---

## 11. Site Settings

Sidebar → Content Manager → Single Types → **Site Settings**.

Global stuff that appears everywhere:
- **Site name** — used in browser tabs, SEO titles
- **Site tagline** — short descriptor used in metadata
- **Logo / Logo dark / Favicon** — brand assets
- **OG default image** — what shows when someone shares a page on Facebook / WhatsApp (1200 × 630 recommended)
- **SEO description, SEO keywords** — defaults for pages that don't have their own
- **Social URLs** — Instagram, Facebook, Pinterest, TikTok, YouTube. Used in the footer + sharing widgets.
- **Payment defaults** — Stripe publishable key, PayPal client ID (already set by Sameer, don't change unless told)
- **Bank transfer details** — your real bank account info for shop orders that pick "Bank Transfer"
- **Default currency** — `gbp`
- **Low stock threshold** — when stock falls below this, the "only N left" warning shows on product pages
- **Notification email** — where order notifications get sent (set to your email)
- **Shop email** — public-facing email for shop queries
- **Cookie banner text** — the small popup
- **Footer copyright** — bottom of every page
- **Footer short about** — small paragraph in the footer
- **Contact email, Address** — used in the footer + Schema.org markup
- **Substack URL** — where the Reset Letters footer button points

When in doubt about a setting, message Sameer before changing.

---

## 12. Going live — full pre-launch checklist

Before the new site replaces the old one at `annalouwellness.com`, all of this must be done in order. Each step can be done by you or Sameer (marked).

### A — Content readiness (Anna)

- [ ] Every page reviewed visually — no placeholder copy or "Lorem ipsum"
- [ ] Every article in **Articles** is either Published or Draft (no half-finished)
- [ ] Hero images set on Homepage, About, Reset Letters, all programme pages
- [ ] Press logos uploaded (Aneeza is sending licensed logo artwork)
- [ ] Certification badges uploaded (ICF, CPD, TRE)
- [ ] Bank transfer details filled in Site Settings (sort code, account number, IBAN)
- [ ] Real intake form URL (Calendly/Typeform) plugged into the welcome emails (the 9-URL list Sameer sent)
- [ ] Mailchimp email templates reviewed visually — open each, send a test to yourself, sign off

### B — Mailchimp activation order (Anna)

Activate in this order (so simpler ones are battle-tested before complex ones):
1. **Reset Letters — Founding Welcome** (1A) → start
2. **Reset Letters — Standard Welcome** (1B) → start
3. **Decoder — Free Download** (2.1 + 2.2) → start (both emails in the sequence)
4. **Discovery Call — Booked** (4) → start
5. **Returning Circle — RSVP** (5) → start
6. **Workshops — Confirmation & Follow-up** (3.1 + 3.2) → start
7. **Reset Session — 90min Booking** (12.1 + 12.2) → start
8. **The Reset / Signal / Signal & Build / One Day / Signal Collective / Reset Room** → start each

After activating each one, sign up / book / RSVP yourself to verify the email arrives. If it doesn't, ping Sameer immediately.

### C — Stripe LIVE mode swap (Sameer)

Sameer's job — won't impact your work, but you should know it's happening:

1. Sameer logs into Stripe dashboard → Live mode → API keys → copy `sk_live_...` and `pk_live_...`
2. Sameer registers a webhook endpoint in Stripe Live mode pointing to `https://annalouwellness.com/api/stripe/webhook` → copies the signing secret `whsec_...`
3. Sameer swaps 3 env vars on the website hosting (Coolify):
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_WEBHOOK_SECRET` = the new `whsec_...`
4. Sameer redeploys the Next.js website
5. Sameer makes a real £1 test purchase from your bank card to verify end-to-end
6. The £1 order appears in Strapi → status `paid` → Mailchimp tag applied
7. Sameer refunds the £1 from Stripe

### D — Domain DNS cutover (Sameer + your hosting provider)

1. Sameer coordinates with IONOS (where the domain is registered)
2. Update the A-record for `annalouwellness.com` to point at the new server's IP (currently the old WordPress site IP)
3. DNS propagation takes 1-4 hours. During propagation, some visitors see old WordPress, some see new Next.js. Plan the cutover for a quiet time (e.g. midnight UK).
4. When propagation is complete, `annalouwellness.com` shows the new site
5. `staging.annalouwellness.com` stays live too (useful for ongoing previews)

### E — Update Strapi CLIENT_URL (Sameer)

After domain cutover, Sameer changes the Strapi env var `CLIENT_URL` from `https://staging.annalouwellness.com` to `https://annalouwellness.com` and restarts Strapi. This makes the live preview in CMS show the production site.

### F — Final verification (you both)

After all of the above:
- [ ] Visit `annalouwellness.com` from your phone — full site loads
- [ ] Visit a few key pages — homepage, a Reset Story, a programme, the shop, a product
- [ ] Add a product to cart → checkout → £1 real transaction (use a card you control)
- [ ] Order arrives in Strapi as `paid`, Mailchimp shows you tagged as `Shop Customers`, you get the workshop/Reset confirmation email in your inbox
- [ ] Sign up for Reset Letters with a personal email → Founding Welcome arrives → you appear in Mailchimp audience tagged `Founding Members`
- [ ] If all pass: you're live. Tell your audience.

### G — Old WordPress site

Decide with Sameer whether to:
- Take WordPress completely offline (cleanest)
- Keep it as a backup for 30 days at a redirect-only URL
- Archive it for reference

---

## 13. Troubleshooting

### Preview isn't loading / shows 401

The `PREVIEW_SECRET` env var got out of sync between Strapi and the website, OR they were never deployed together. Ping Sameer.

### Image upload failing

- File too big? Compress with something like Squoosh.app first.
- Wrong format? Stick to JPG/PNG/WebP/SVG.
- Try again after a minute (sometimes Cloudinary is slow).
- If persistent: ping Sameer.

### "Save" button greyed out

You probably have a required field empty. Look for red borders or asterisks. Fill them in.

### I saved a change but the website hasn't updated

- Hard-refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Wait 60 seconds and refresh again — caching delay
- Check **Save & Publish** was clicked, not just **Save**
- Look in version history — confirm the latest version is published
- Still nothing? Ping Sameer.

### Customer says they paid but order still shows pending

- Stripe webhook didn't fire OR the order isn't matched. Open the order → check Stripe Payment ID is set.
- If Payment ID is set: open it in Stripe dashboard → confirm payment succeeded
- If yes: manually change order status to `paid`, then ping Sameer to investigate the webhook

### Mailchimp email didn't arrive

- Open the journey in Mailchimp → check Reports → did the email send?
- Check spam folder
- Re-test with a different email address (Gmail sometimes blocks rapid test emails)
- Verify the trigger tag was actually applied: search the subscriber in Mailchimp audience → look at their Tags

### Subcategory tabs not showing under a section

The section needs at least one Article Category linked. Content Manager → Article Categories → check that the categories you want to show are linked to the correct parent section (Reset Stories, Life, etc.).

### Reset Letters founding count

The 500-founder cap is hardcoded based on the launch date (22 June 2026). It auto-flips from Founding to Standard on that date. To force the cap earlier or extend later, ping Sameer to change the cutoff.

---

## 14. Who to contact

**Sameer** — for anything to do with: the website breaking, deployments, env vars, code changes, hosting issues, Stripe webhook problems, domain DNS issues, schema changes in Strapi, custom integrations, "I tried clicking X and got an error".

WhatsApp / email — fastest is WhatsApp.

**Anna's bank (NatWest)** — payment receipt confirmation, bank transfer settlement queries.

**Stripe support** (`stripe.com/support`) — disputes, refund issues you can't resolve, account flagging.

**Mailchimp support** — billing, audience limits, deliverability issues.

**Aneeza** — brand artwork (logos, certification badges, the Reset Letters wordmark).

**Hettal** — site review feedback, content / UX discussion.

---

## 15. Glossary

- **CMS** — Content Management System. The Strapi admin where you edit everything.
- **Single type** — a Strapi entry where there's only ever one of them (like Homepage).
- **Collection type** — a Strapi entry where you can create many (like Articles).
- **Draft / Published** — a Draft is visible only to you in CMS; Published is live on the website.
- **Slug** — the URL-safe text part. `/reset-stories/holding-everything` has the slug `holding-everything`.
- **Hero image** — the big main image at the top of a page or article.
- **Tag (Mailchimp)** — a label on a subscriber that triggers automations.
- **Webhook** — Stripe sends a message to the website when a payment succeeds. Triggers order update + Mailchimp tagging.
- **DNS** — the system that maps `annalouwellness.com` to a server. Changing it = "cutover" or "going live".
- **Staging** — `staging.annalouwellness.com`, the test version. Stays live alongside the production site.
- **Production / Live** — the real customer-facing site at `annalouwellness.com`.
- **Cache** — the website remembers content for 60 seconds for speed. Why your saves take ~1 minute to appear.

---

## 16. Page-by-Page Edit Reference

This section is organised by URL. Open any page on the live website, find its URL in the Quick Reference below, then jump to the matching detail section for full editing instructions.

**Two browser tabs, side by side, work best:**
- Left tab: the live page you want to edit
- Right tab: `https://cms.annalouwellness.com/admin` (the CMS)

Edit on the right → save → refresh on the left to see the change appear (usually within 1–2 seconds).

### 16.1 Quick Reference — every page on the site

#### Site-wide chrome (visible on every page)

| What you see on the site | Where to edit in Strapi |
|---|---|
| Logo, top strip, social URLs, SEO defaults | Single Types → **Site Settings** |
| Top navigation menu (dropdowns under each item) | Single Types → **Navigation** |
| Footer (legal links, columns, newsletter CTA) | Single Types → **Footer** |
| Cookie banner text | Single Types → **Site Settings** → `cookie_banner_text` |

#### Homepage and one-off pages

| URL | Where to edit |
|---|---|
| `/` (Homepage) | Single Types → **Homepage** + the 3 article cards pick from Story → Article (see §16.3 + §16.7) |
| `/about` | Single Types → **About Page** |
| `/about/press` | Content Manager → **Pages · Standalone** → entry with slug `about-press` |
| `/about/partnerships` | Content Manager → **Pages · Standalone** → entry with slug `about-partnerships` |
| `/contact` | Single Types → **Contact Page** + Site Settings (for email/address) |
| `/testimonials` | Single Types → **Testimonials Page** (hero copy) + Content Manager → **Testimonial / Review** (each card) |
| `/our-mission` | Content Manager → **Pages · Standalone** → entry with slug `our-mission` |
| `/privacy-policy` | Content Manager → **Pages · Standalone** → entry with slug `privacy-policy` |
| `/terms-and-conditions` | Content Manager → **Pages · Standalone** → entry with slug `terms-and-conditions` |
| `/reset-letters` | Single Types → **Reset Letters Page** |
| `/ask-anna` | No editable content (the AI assistant) |
| `/free/nervous-system-decoder` | Single Types → **Decoder** (page copy) |
| `/free/nervous-system-decoder/quiz` | Single Types → **Decoder Quiz (Free)** (hero + 3 result blurbs) |
| `/the-work/regulated` | Content Manager → **Work · Programme** → entry `regulated` (pay-what-you-feel course) |

#### Work with Anna

| URL | Where to edit |
|---|---|
| `/the-work` (hub) | Single Types → **Work With Anna Page** |
| `/the-work/the-reset` | Content Manager → **Work · Programme** → slug `the-reset` |
| `/the-work/signal` | Content Manager → **Work · Programme** → slug `signal` |
| `/the-work/signal-and-build` | Content Manager → **Work · Programme** → slug `signal-and-build` |
| `/the-work/one-day` | Content Manager → **Work · Programme** → slug `one-day` |
| `/the-work/signal-collective` | Content Manager → **Work · Programme** → slug `signal-collective` |
| `/the-work/recovery` | Content Manager → **Work · Programme** → slug `recovery` |
| `/the-work/sessions` | Single Types → **Sessions Hub Page** + Content Manager → **Work · Coaching Session** |
| `/the-work/sessions/{slug}` | Content Manager → **Work · Coaching Session** → matching slug |
| `/the-work/quiz` | Single Types → **Quiz Page** |
| `/the-work/ways-to-work-with-me` | Content Manager → **Pages · Standalone** → slug `the-work-ways-to-work-with-me` |

#### Experiences

| URL | Where to edit |
|---|---|
| `/experiences` (hub) | Single Types → **Experiences Landing Page** |
| `/experiences/retreats` | Content Manager → **Experiences · Sub-page** slug `retreats` + Content Manager → **Experiences · Event** (dates) |
| `/experiences/workshops` | **Experiences · Sub-page** slug `workshops` + **Experiences · Event** |
| `/experiences/corporate-wellbeing` | **Experiences · Sub-page** slug `corporate-wellbeing` |
| `/experiences/speaking` | **Experiences · Sub-page** slug `speaking` |

#### Community

| URL | Where to edit |
|---|---|
| `/community` (hub) | Single Types → **Community Page** |
| `/community/the-returning-circle` | Content Manager → **Community Event Page** → slug `the-returning-circle` |
| `/community/reset-room` | Single Types → **Reset Room Page** |
| `/community/reset-room/vault` (members) | Content Manager → **Reset Room · Vault Journey** |
| `/community/reset-room/replays` (members) | Content Manager → **Reset Room · Workshop Replay** |
| `/community/membership` | Single Types → **Membership Page** |
| `/community/events` | Content Manager → **Community Event Page** slug `events` + Content Manager → **Experiences · Event** |
| `/community/resources` | Content Manager → **Pages · Standalone** → slug `community-resources` |

#### Editorial sections (magazine)

| URL | Where to edit |
|---|---|
| `/reset-stories` (hub) | Single Types → **Reset Stories Page** |
| `/reset-stories/{slug}` | Content Manager → **Story · Article** → matching slug |
| `/reset-stories/{category}` (sub-category landing) | Content Manager → **Story · Category** → matching slug |
| `/life`, `/love-and-relationships`, `/work-and-money` (hubs + categories + articles) | Same pattern as Reset Stories — Single Type for hub copy, **Story · Category** for sub-pages, **Story · Article** for individual articles |
| `/mantras` | Single Types → **Mantras Page** + Content Manager → **Story · Mantra** |
| `/cosmic-forecast` | Content Manager → **Story · Cosmic Forecast** |

#### Shop

| URL | Where to edit |
|---|---|
| `/shop` (hub) | Single Types → **Shop Page** |
| `/shop/{slug}` (individual product) | Content Manager → **Shop · Product** → matching slug |
| `/shop?category={slug}` (category filter) | Content Manager → **Shop · Category** (tick `is_visible_in_nav` to add to dropdown) |
| `/shop/emotional-support-jewellery` | Single Types → **Shop ESJ Page** |
| `/shop/new-in` | Single Types → **Shop New In Page** |
| `/shop/personalised` | Single Types → **Shop Personalised Page** |

#### Other / system

| URL | Where to edit |
|---|---|
| FAQ accordion at bottom of any page | Content Manager → **FAQ · Per Page** → filter by `page` field |
| Email signup forms | Mailchimp-driven, see §8 |
| `/cart`, `/checkout`, `/thank-you` | Stripe-driven, copy in code (ask Sameer) |
| `/login`, `/account`, member dashboards | Auth flows — no editable content |

### 16.2 Site-wide settings (Site Settings, Navigation, Footer)

Three Single Types control everything that appears across every page. Edit once → applies everywhere.

#### Site Settings

**Strapi:** Single Types → **Site Settings**

The global control panel. Key fields:

| Field | What it controls |
|---|---|
| `site_name` | Browser tab suffix, SEO meta. Default: "Anna Lou Wellness" |
| `site_tagline` | Below logo in some headers; SEO meta description |
| `logo` | Top-nav logo. Upload SVG ideally, or transparent PNG 600×600 |
| `favicon` | Browser tab icon |
| `og_default_image` | Social share image (1200×630 JPG). Used when a specific page doesn't set its own |
| `seo_description` | Default Google meta description (<160 chars) |
| `instagram_url`, `facebook_url`, `youtube_url`, `tiktok_url`, `linkedin_url`, `substack_url`, `podcast_url` | Footer + nav social links. Blank → icon hidden. Use full `https://...` URLs |
| `email` | Contact email shown in footer + Contact page |
| `address` | Postal address shown in footer |
| `notification_email` | Where order notifications go |
| `cookie_banner_text` | Wording in the cookie consent bar |
| `footer_copyright` | Bottom line of the footer |
| `maintenance_mode` (boolean) | If ticked, site shows a maintenance message instead of normal content. **Use with care.** |

#### Navigation

**Strapi:** Single Types → **Navigation**

| Field | What it controls |
|---|---|
| `top_strip_text` | Small dot-separated line above the logo. Decorative, not clickable |
| `items` (repeatable) | Each top-level menu item |

Per item: `label` (the menu word), `href` (where it links — `/path` for internal), `colour` (hex accent), `children` (the dropdown — same shape).

**To add Client Stories under About:** open the "About" item → scroll to its `children` → click **+ Add an entry** → label `Client Stories`, href `/testimonials` → save.

#### Footer

**Strapi:** Single Types → **Footer**

| Field | What it controls |
|---|---|
| `closing_message` | Big italic line at the bottom |
| `substack_cta_label` + `substack_cta_url` | Newsletter button |
| `explore_links`, `connect_links`, `legal_links` (each repeatable) | The three footer columns. Each entry is label + href |

**Important:** every internal `href` MUST start with a `/` (e.g. `/privacy-policy`, not `privacy-policy`) or the link 404s.

### 16.3 The Homepage (`/`)

**Strapi:** Single Types → **Homepage** (most fields) + Story → Article (the 3 article cards).

#### Anatomy, top to bottom

**1. Issue line** — `issue_line` + `inside_this_issue_line`

**2. Hero block** (text left, image + Substack box right):
- Left text: `hero_kicker`, `hero_title`, `hero_body`, `hero_cta_primary_label`/`url`, `hero_cta_secondary_label`/`url`
- Right image: `hero_image` (portrait or square)
- Right Substack box: `hero_substack_kicker`, `hero_substack_title`, `hero_substack_cta_label`, `hero_substack_cta_url`
- Mobile: image first (hook), then text, then box

**3. Featured Reset Story** — long-form excerpt with drop-cap. The article shown is whichever Story · Article has `is_featured` ticked. Fallback fields on Homepage: `featured_fallback_title`, `_author`, `_reading_time`, `_excerpt`.

**4. The 3-card article grid:**
- Articles with `is_homepage_pinned` ticked appear first (ordered by `homepage_pin_order`, lower = earlier).
- If fewer than 3 pinned, remaining slots fill with most-recent non-pinned, non-featured articles.
- Pin up to 3 for exact control. Pin 0 for automatic.

**5. Section colour blocks** — four pillar promos. Each has `*_block_kicker`, `_title`, `_body` (reset_stories, life, love, work_money).

**6. Work with Anna teaser** — `work_kicker`, `work_title`, `work_body`, `work_cta_label`/`url`, `work_image`.

**7. Community teaser** — same shape with `community_*` prefix.

**8. Reviews section** — 3 testimonials where `is_featured = true` on the Testimonial entry. "Read all" link goes to `/testimonials`.

**9. Press + certifications** — Content Manager → **Trust · Press Mention** + **Trust · Certification Badge**, with `is_homepage_featured` flag on each.

**10. Newsletter / Substack final block** — `newsletter_kicker`, `_title`, `_body`, `_cta_label`, `_cta_url`.

#### Common homepage edits

| You want to... | Do this |
|---|---|
| Change the big hero headline | Homepage → `hero_title` |
| Replace the hero image | Homepage → `hero_image` → upload new |
| Update the Substack box wording | Homepage → 4 `hero_substack_*` fields |
| Pick a different featured article | Story · Article → tick `is_featured` on your choice, untick the old one |
| Curate the 3 small article cards | Story · Article → tick `is_homepage_pinned` on up to 3 |
| Swap a homepage testimonial | Testimonial / Review → adjust `is_featured` flags |
| Add a press logo | Trust · Press Mention → + Create → upload logo + tick `is_homepage_featured` |

#### Surfacing content to the homepage — cheat sheet

Most homepage sections aren't edited on the Homepage form — they pull from other collections via a "show on homepage" tick. Here's every one in one place. **Find the entry you want to feature → open it → tick the right flag → save.**

| Homepage section | Where the content lives | What to tick / fill |
|---|---|---|
| Big featured story (with drop-cap) | Story · Article | `is_featured` (only one wins — most recent if multiple) |
| The 3 article cards below | Story · Article | `is_homepage_pinned` on up to 3 articles. Set `homepage_pin_order` (1, 2, 3) to lock the left-to-right order |
| Reviews row (3 testimonials) | Testimonial / Review | `is_featured` on the 3 you want shown. Adjust `sort_order` (lower = earlier) for ordering |
| "Jewellery with meaning" product row (3 cards) | Shop · Product | `is_homepage_featured` on the products you want shown. Also fill `homepage_hook` (the italic Anna's-voice line on the card) |
| "As seen in" press logo strip | Trust · Press Mention | `is_homepage_featured` on each logo. `sort_order` controls left-to-right |
| "Certified" badge strip | Trust · Certification Badge | `is_homepage_featured` on each badge. `sort_order` for ordering |

For everything else on the homepage (the hero copy, the four pillar promos, the Work / Community teasers, the newsletter band), edit fields **directly on the Homepage singleton** — they're not pulled from other collections.

**One rule of thumb:** if it's a single piece of text/image, look in Homepage singleton. If it's a list of cards (articles, reviews, products, logos), look in the matching collection and find the `_homepage_` flag.

### 16.4 About, Contact, and standalone pages

#### `/about`

**Strapi:** Single Types → **About Page**

| Field | What it controls |
|---|---|
| `kicker`, `title`, `roles_tagline` | Header at top |
| `portrait` | Main portrait photo (3:4 portrait, max 400px tall) |
| `story_paragraph_1` | First paragraph (with the drop-cap) |
| `story_paragraph_2` | Second paragraph |
| `additional_bio` | Body section below the press strip. Blank lines = paragraph breaks |
| `press_logos` (repeatable) | Brand logos. Upload per row or leave empty for text fallback |
| `certifications` (repeatable) | Accreditations. Each: name + colour. Upload `badge` for image, else styled text shows |

#### `/about/press`, `/about/partnerships`

Both are standalone pages. Content Manager → **Pages · Standalone** → find entry with slug `about-press` or `about-partnerships`. Standard fields (see §16.5 below).

#### `/contact`

**Strapi:** Single Types → **Contact Page** (hero copy) + Site Settings (email/address shown).

Form is hardcoded — to change fields or destination, ask Sameer.

#### Standalone pages (`/our-mission`, `/privacy-policy`, `/terms-and-conditions`, and any new ones)

**Strapi:** Content Manager → **Pages · Standalone (Mission, Cookies, etc.)**

Common fields per entry:

| Field | What it controls |
|---|---|
| `title` | Big page heading |
| `slug` | URL after the domain. **Don't change on existing pages** — footer links would break |
| `kicker` | Small uppercase label above title |
| `kicker_colour` | Hex colour. Pink `#F280AA`, blue `#7BAFDD`, gold `#FAA21B`, mint `#5DCAA5`, plum `#6E3A5A` |
| `tagline` | Italic subtitle (one sentence) |
| `hero_image` | Optional landscape image at the top |
| `intro` | Main body — use the toolbar editor (H2/H3, bold, italic, lists, links, quotes). Blank lines between paragraphs |
| `cta_label` + `cta_url` | Optional button at the bottom |
| `seo_title`, `seo_description` | Optional SEO overrides |

**Pasting from Word:** the richtext editor strips most Word formatting. Two options:
1. Paste plain text → re-apply formatting using the toolbar buttons (H2 for sections, B for bold, list buttons for bullets).
2. Send the Word doc to Sameer — he runs a script that imports it cleanly with formatting preserved.

#### Add a brand new standalone page (e.g. Cookies, Returns)

1. Content Manager → **Pages · Standalone** → **+ Create new entry**
2. Fill the fields. The slug becomes the URL (`cookies` → `/cookies`).
3. **Save & Publish.** Page is live within 1–2 seconds.
4. To link from the footer: Single Types → **Footer** → add an entry to `legal_links` with the matching href (e.g. `/cookies`).

No dev work needed.

### 16.5 Testimonials (`/testimonials`)

**Strapi:**
- Single Types → **Testimonials Page** — hero copy at the top
- Content Manager → **Testimonial / Review** — each individual card

| Field | What it controls |
|---|---|
| `quote` | The testimonial text |
| `reviewer_name` | Who said it |
| `reviewer_location` | Their context (e.g. "Reset alumna", "Houseboat retreat") |
| `photo` | Upload to make this a photo card |
| `youtube_url` | Paste a YouTube URL to embed as a video card |
| `video` + `video_thumbnail` | Alternative: upload MP4 + poster image |
| `display_style` | `card` (default 3-col grid) or `banner` (full-width plum block — use sparingly, one every 6 cards) |
| `tag` | Optional — bind to a specific page (e.g. `retreats`, `the-reset`) so it also shows in that page's reviews section |
| `is_featured` | Tick → also appears on homepage's 3-review row |
| `sort_order` | Lower = appears earlier |
| `is_active` | Untick → hides from the site without deleting |

**Add a new testimonial:** Content Manager → Testimonial / Review → + Create → at minimum fill `quote` + `reviewer_name` → save & publish. Add a photo or YouTube URL for richer formats.

### 16.6 Common tasks (cheatsheet)

**Save / publish:**
- Single Types: just **Save** (publishes immediately)
- Collection Types: **Save** = draft only, **Save & Publish** = live

**See a change immediately:** hard-refresh with Ctrl + Shift + R after saving.

**Undo a mistake:** clock icon (top right of edit screen) → Version History → pick earlier version → Restore.

**Upload images:**
- From the edit form: click any image field → drag-drop or browse
- Pre-upload: left sidebar → Media Library → drag-drop

**Recommended image sizes:**
- Hero / large feature: 1600×1200+ JPG or PNG
- Square / product / portrait: 1500×1500
- Logo / badge: SVG ideally, or transparent PNG 600×600
- Social share: 1200×630 JPG

Strapi automatically generates 5 resized variants. Upload once at full res.

**Brand colour palette** (use anywhere a hex code is asked for):
- Plum `#6E3A5A` — Reset Stories, deep editorial, primary CTAs
- Pink `#F280AA` — Love & Relationships, soft moments
- Gold `#FAA21B` — Life, ritual
- Mint `#5DCAA5` — Shop, fresh things
- Blue `#7BAFDD` — Experiences, water
- Cream `#FFD07A` — Work & Money

### 16.7 Programme pages (The Reset, Signal, Signal & Build, One Day, Signal Collective, Recovery)

**Strapi:** Content Manager → **Work · Programme** → each programme is one entry.

All six programme pages share the same template, so the field walkthrough below applies to every entry — only the slug, copy, colour, and price change. To edit `/the-work/the-reset`, open the Work · Programme entry with slug `the-reset`. Same pattern for `signal`, `signal-and-build`, `one-day`, `signal-collective`, `recovery`.

#### The fields, in the order they appear on the page

| Field | What it controls | Notes |
|---|---|---|
| `title` | Big heading at the top of the page (e.g. "The Reset.") | Keep punctuation if it's part of the brand voice (the trailing dot is intentional) |
| `slug` | URL after `/the-work/` (e.g. `the-reset`). **Don't change** on existing programmes — links across the site would break | |
| `tagline` | Italic single-line subtitle under the title | One sentence. "Six weeks. One-to-one. Signal back online." |
| `accentColour` | Hex code that tints the page (kicker colour, button accents, section labels) | Pink `#F280AA`, blue `#7BAFDD`, gold `#FAA21B`, mint `#5DCAA5`, plum `#6E3A5A` |
| `heroImage` | Image on the right side of the hero | Portrait orientation works best (4:5). 1600×2000 ideal. |
| `intro` | The main long-form body below the hero. **Separate paragraphs with a blank line** between them | Each blank line = new paragraph on the page |
| `whatsIncludedLabel` | Heading above the bullet-list section | Default: "What's included" |
| `whatsIncludedItems` | The bullet points themselves. **One bullet per line.** No `-` prefix needed — each line becomes a bullet | "Six 1:1 sessions, weekly, 60 minutes each" |
| `approachLabel` + `approachBody` | Optional second info section (heading + body). Leave both blank to hide | Use for "The approach", "How it works", etc. |
| `outcomesLabel` + `outcomesBody` | Optional third info section. Same shape | Use for "What changes", "What you'll leave with" |
| `pricingLabel` | Heading above the price block | Default: "Investment" |
| `pricingBody` | Price details in prose | "£1,500. Paid in full or two instalments of £750." |
| `ctaLabel` + `ctaUrl` | The big button at the bottom of the page | Default: "Book a discovery call" → `/contact` |
| `displayOrder` | Lower numbers show first in lists. Used to order programmes on `/the-work` hub | Default 100 — change only if reordering |
| `stagesList` | Optional. Only used by Recovery (Untangle / Unbind / Unbound). **One stage per line, format: `Label\|Title\|Body`** | Example: `Month One\|Untangle.\|We identify where the patterns live.` Leave blank for non-staged programmes |

#### Stripe / payment fields (advanced — usually set once)

| Field | What it controls |
|---|---|
| `pricePence` | Programme price in **pence** (1500.00 GBP = `150000`). Leave `0` for "by enquiry" programmes — Stripe checkout button won't show |
| `currency` | 3-letter ISO code, lowercase. Default `gbp` |
| `isRecurring` | Tick only if billed monthly/yearly. Leave OFF for normal programmes |
| `recurringInterval` | `month` or `year`. Only relevant when `isRecurring` is on |
| `mailchimpTag` | The exact Mailchimp tag attached to a customer on successful payment. **Case-sensitive — must match Mailchimp exactly.** Examples: "The Reset (6-week)", "Signal (12-week)" |
| `grantsResetRoomAccess` | Leave OFF. Only the Reset Room membership entry has this on |
| `seoTitle` + `seoDescription` | Optional SEO overrides. Keep description <160 chars |

#### Common programme edits

| You want to... | Do this |
|---|---|
| Change The Reset's price | Work · Programme → entry `the-reset` → update `pricingBody` (the prose) + `pricePence` (the Stripe-charged value). Keep both in sync |
| Rewrite the body copy | Update `intro`. Use blank lines for paragraph breaks |
| Add/remove a bullet from "What's included" | Edit `whatsIncludedItems` — one bullet per line. Reorder by moving lines |
| Swap the hero image | Upload a new one to `heroImage`. Old one stays in Media Library |
| Add a "What changes" section | Fill `outcomesLabel` + `outcomesBody`. Both must have content for the section to appear |
| Re-route the discovery call button to a Calendly link | Update `ctaUrl` to the full Calendly URL |

#### Add a new programme

1. Content Manager → Work · Programme → **+ Create new entry**.
2. Fill `title` (e.g. "New Programme") — `slug` auto-generates.
3. Fill the rest of the fields (intro, what's included, pricing, etc.).
4. Set `displayOrder` to control where it sits in the /the-work hub list.
5. **Save & Publish.** The page is live at `/the-work/{your-slug}` within seconds.
6. If you want it linked from the main nav, also add an entry to Navigation → Work with Anna → children.

### 16.8 1:1 Sessions (`/the-work/sessions` + individual sessions)

The Sessions page has two layers:

1. **Hub page** (`/the-work/sessions`) — the top section with the heading + intro copy
2. **Individual session cards** — one card per coaching session type (Dating Reset, Founder Reset, Nervous System Reset)

#### Hub page

**Strapi:** Single Types → **Sessions Hub Page**

Fields:

| Field | What it controls |
|---|---|
| `kicker` | Small uppercase label above the heading |
| `kicker_colour` | Hex colour for the kicker |
| `title` | Main heading (e.g. "1:1 Reset Sessions") |
| `intro` | The intro paragraph(s) below the heading. Blank line between paragraphs |
| `seo_title`, `seo_description` | Optional SEO overrides |

#### Individual session cards

**Strapi:** Content Manager → **Work · Coaching Session** → one entry per session

Fields per session:

| Field | What it controls |
|---|---|
| `name` | Session name (e.g. "Founder Reset") |
| `slug` | URL after `/the-work/sessions/` (e.g. `founder-reset`) |
| `tagline` | The one-line hook under the title on the card |
| `description` | Long body for the session detail page. Richtext (bold, italic, lists via toolbar) |
| `duration` | Free-text, e.g. "60 minutes", "90 minutes" |
| `price` | Numeric price (e.g. `200` for £200) |
| `price_label` | Free-text price display (e.g. "£200 per session", "Enquire", "From £200") |
| `accent_colour` | Hex code for the card's accent line + page colour. Pink for Dating, gold for Founder, blue for Nervous System |
| `hero_image` | Image at the top of the individual session page |
| `is_active` | Untick to hide from the site without deleting |
| `sort_order` | Lower number = appears earlier on the hub grid |

#### Common session edits

- **Add a new session:** Coaching Session → + Create → fill name (slug auto), tagline, description, price → save. It auto-appears on `/the-work/sessions` and is live at `/the-work/sessions/{slug}`.
- **Reorder sessions on the hub:** adjust `sort_order` on each. Lower wins.
- **Temporarily hide a session:** untick `is_active`. Re-tick to bring back.

### 16.9 Experiences (Retreats, Workshops, Corporate Wellbeing, Speaking)

Two layers, same as sessions:

1. **Each experience type page** — the hero + intro at `/experiences/retreats`, `/experiences/workshops`, etc.
2. **Individual upcoming events** — the actual retreat/workshop instances that get listed on those pages

#### Each experience page

**Strapi:** Content Manager → **Experiences · Sub-page** → one entry per experience type (`retreats`, `workshops`, `corporate-wellbeing`, `speaking`)

Fields:

| Field | What it controls |
|---|---|
| `title` | Heading (e.g. "Workshops") |
| `slug` | URL — must match exactly: `retreats`, `workshops`, `corporate-wellbeing`, `speaking` |
| `kicker` + `kickerColour` | Small uppercase label above the title and its colour |
| `eyebrow` | Optional secondary label (e.g. "Experiences · For teams") |
| `tagline` | Optional italic one-liner under the title |
| `heroImage` | Top-of-page image |
| `intro` | Body copy. Blank lines = paragraph breaks |
| `ctaLabel` + `ctaUrl` | Optional button (e.g. "View upcoming workshops" → `/community/events`) |
| `secondaryList` | Optional. For pages with a list of cards (Corporate "Formats" grid, Speaking "Talks" list). **One item per line, format: `Title\|Body`** |
| `seoTitle`, `seoDescription` | Optional SEO overrides |

#### Individual upcoming events

**Strapi:** Content Manager → **Experiences · Event** → one entry per upcoming retreat / workshop / etc.

These power the "Book your place" grids on each experience page (and on `/community/events`).

Fields per event:

| Field | What it controls |
|---|---|
| `name` | Event title (e.g. "Houseboat Nervous System Reset · 27 June") |
| `slug` | URL slug (auto-generated from name) |
| `type` | `retreat`, `workshop`, `corporate`, or `speaking` — determines which experience page lists it |
| `description` | Long body (richtext). Shown on the card and event detail |
| `date` | Date of the event |
| `location` | e.g. "Taggs Island, Hampton" or "Online (Zoom)" |
| `price` | Numeric price |
| `price_label` | Display label, e.g. "£115 · Day immersion", "Pay what you can" |
| `hero_image` | Event image |
| `booking_url` | **Where the "Book this place" button links to.** Paste a Stripe checkout URL, Calendly, Eventbrite — anything. **Leave blank** to fall back to a /contact link |
| `is_upcoming` | Tick to show in upcoming lists. Untick when the date has passed |
| `is_active` | Untick to hide entirely |
| `sort_order` | Lower = earlier in the list |

#### Common experience edits

- **Add a new retreat:** Experiences · Event → + Create → `type = retreat`, fill name/date/location/price, paste booking link in `booking_url` → save. Auto-appears on `/experiences/retreats` and `/community/events`.
- **Workshop sold out:** untick `is_upcoming` on the event entry (keeps the entry for archive purposes; just hides from upcoming lists).
- **Change the booking destination for an event:** edit `booking_url`. If you want to revert to "open my email", just clear that field.
- **Edit the page hero copy for /experiences/retreats:** Experiences · Sub-page → entry `retreats` → update `intro`.

### 16.10 Articles (write, format, publish)

This is the editorial collection. Every Reset Story, Life piece, Love & Relationships, Work & Money article is one entry in this collection.

**Strapi:** Content Manager → **Story · Article**

#### Fields

| Field | What it controls |
|---|---|
| `title` | Article title. Appears as the H1 on the article page |
| `slug` | URL slug (auto from title). Final URL is `/{section}/{slug}` based on category |
| `excerpt` | Short summary (1-2 sentences). Shown on article cards across the site and in the homepage featured area |
| `body` | The full article body. Richtext — use toolbar for headings, bold/italic, lists, links, quotes. **Blank line between paragraphs** |
| `hero_image` | Main article image. Landscape works best (16:9 or 4:3) |
| `category` | **Required.** Pick from Story · Category. The category's `section` field (reset-stories / life / love-and-relationships / work-and-money) determines which URL section the article lives in |
| `author` | Default: "Anna Lou". Change for guest writers |
| `reading_time` | Free-text, e.g. "6 min read", "2 min read" |
| `is_featured` | Tick to make this the big banner article on the homepage. Only one should be ticked at a time (most recent wins if multiple) |
| `is_homepage_pinned` | Tick to lock this article into one of the 3 homepage cards |
| `homepage_pin_order` | Among pinned articles, lower number = earlier (1 = leftmost) |
| `is_free` | Tick = full article shows on the website. Untick = paywall + Substack-only |
| `substack_canonical_url` | If the article also lives on Substack, paste the Substack URL here. Adds a "Read on Substack →" link and sets the SEO canonical |
| `related_products` | Optional. Link to Shop products to make a "Shop the story" section |
| `shop_tags` | Repeatable. Each tag is a photo + product link with a hover caption ("Anna is wearing the [piece]"). Use only when a product is central to the story |
| `seo_title` + `seo_description` | Optional SEO overrides |

#### Write a new article — step by step

1. Content Manager → Story · Article → **+ Create new entry**
2. Fill `title` → `slug` auto-generates
3. Write the `excerpt` — this shows on cards, so make it pull people in
4. Write the `body` using the toolbar — use H2 for sections, **bold** for emphasis, blockquotes for pull quotes
5. Upload `hero_image` (landscape, ideally 1600×900 or larger)
6. Pick a `category` — this decides the URL section
7. Set `reading_time` ("3 min read" etc.)
8. Decide flags:
   - `is_free` — almost always ticked (untick only for paywalled paid articles)
   - `is_featured` — only tick if you want this to be the big homepage banner (untick the previous one)
   - `is_homepage_pinned` — tick if you want to control which articles are in the 3-card grid
9. **Save & Publish.** The article is live at `/{section}/{slug}` (e.g. `/life/houseboat-life`) within seconds.

#### Common article edits

- **Change which article is the homepage featured one:** untick `is_featured` on the current one → tick on the new one → save both.
- **Re-categorise an article:** change `category` → the URL section changes automatically (the slug stays the same).
- **Hide an article without deleting it:** the easiest way is to set `category` to nothing and the article disappears from listings (but is still accessible by URL). Cleaner: untick the published state.
- **Add "Shop the story" photos:** in the article, expand `shop_tags` → + Add an entry → upload a photo, link to a product → set caption prefix and alt text. Repeat for each photo.

### 16.11 Editorial section hubs (Reset Stories / Life / Love & Relationships / Work & Money)

Each of the four editorial sections has a hub page and a set of sub-category landing pages.

#### Section hubs

**Strapi:** Single Types — one per section:
- **Reset Stories Page** — `/reset-stories`
- **Life Page** — `/life`
- **Love And Relationships Page** — `/love-and-relationships`
- **Work And Money Page** — `/work-and-money`

Each has the same fields:

| Field | What it controls |
|---|---|
| `kicker` + `kicker_colour` | Small uppercase label above the title |
| `title` | Main heading |
| `tagline` / `intro` | Body copy below the title |
| `hero_image` | Top-of-page image (optional — most use brand colour blocks instead) |
| Various block fields (`featured_kicker`, `recent_label`, etc.) | Headings for sub-sections of the hub |
| `seo_title`, `seo_description` | Optional SEO overrides |

The actual articles shown on each hub come from the **Story · Article** collection — articles whose `category.section` matches that hub.

#### Sub-category landing pages

URLs like `/life/rituals-and-energy`, `/love-and-relationships/motherhood` — each is a landing page for one sub-category showing all articles in that category.

**Strapi:** Content Manager → **Story · Category**

Fields:

| Field | What it controls |
|---|---|
| `name` | Display name (e.g. "Motherhood") |
| `slug` | URL slug — **must match the nav link exactly** (e.g. `motherhood`) |
| `section` | Which top-level section this category lives under (`reset-stories`, `life`, `love-and-relationships`, `work-and-money`) |
| `colour` | Hex accent colour. Matches the section colour by default |
| `description` | Subtitle shown on the category landing page |
| `sort_order` | Lower = earlier in lists |

#### Common edits

- **Rename a category:** open the entry → change `name`. **Do NOT change `slug`** unless you also update the nav link, or the URL will 404.
- **Add a new sub-category:** Story · Category → + Create → name + section + colour + description. Then add it to Navigation → matching section → children, with href `/{section}/{slug}`.
- **Articles in the new category:** open any article → set its `category` to the new one.

### 16.12 Community pages

#### `/community` (hub)

**Strapi:** Single Types → **Community Page**

Standard hub-page fields: kicker, title, intro, plus headers for each block (Reset Room, Returning Circle, Events, Resources).

#### `/community/reset-room`

**Strapi:** Single Types → **Reset Room Page**

A long page. Fields are grouped by section in the form:

- **Hero:** `hero_eyebrow`, `hero_title`, `hero_tagline`, `hero_cta_label`, `hero_secondary_label`, `hero_image`
- **What's inside / pillars:** repeatable list of pillar cards
- **Vault preview:** copy + link to vault
- **Live call info:** schedule, format
- **Pricing:** `price_title`, `price_body`, `price_cta_label`
- **SEO**: standard fields

Each field has an inline description in Strapi explaining where it shows on the page. Edit any field → live in 1-2 seconds.

#### `/community/reset-room/vault` (members only) — audio meditations, e-books, journeys

The Reset Room vault is the library Reset Room members log in to. One entry per item — audio meditation, e-book, workbook, or guided journey. The `kind` field acts as folders for members (filter pills at the top of the page).

**Strapi:** Content Manager → **Reset Room · Vault Journey** → **+ Create new entry**

##### To upload an audio meditation

1. Fill `name` — title of the meditation (e.g. "Coming Back Online")
2. Fill `description` — 1-2 sentences shown on the card
3. Set `kind` = **"Audio meditation"**
4. Fill `duration` — free text, e.g. "12 min"
5. Upload your MP3 in **`audio_file`**
6. Optional: upload a thumbnail in `video_thumbnail` (acts as the cover image — 1280×720 JPEG, max 500KB)
7. Pick a `tone_colour` (hex, brand colours: #F280AA pink, #FFD07A yellow, #7BAFDD blue, #5DCAA5 green, #FAA21B amber, #6E3A5A plum)
8. Set `sort_order` — lower numbers appear earlier in the grid
9. **Save & Publish**. Live for members within 1-2 seconds.

##### To upload an e-book or workbook

Same flow, but:
- Set `kind` = **"E-book"** (or **"Workbook"** if it's something to write into)
- Leave `audio_file` blank
- Upload your PDF in **`companion_pdf`**
- Add a cover image in `video_thumbnail` if you want one
- Use the `body` field for a longer description or chapter overview if helpful

##### To upload a guided journey (with audio + video + PDF)

- Set `kind` = **"Foundational journey"** (or one of the journey types)
- Fill all media fields you have: `audio_file`, `video_url`, `companion_pdf`
- Use `body` for the "About this journey" content shown below the player

##### How members find your content

On `/community/reset-room/vault` they see filter pills at the top: **All / Audio meditation / E-book / Foundational journey / Workbook / Daily practice** etc. They click a pill, only that kind shows. So everything tagged the same way lives together for them — categories work like folders.

##### Organising your own uploaded files

Strapi → **Media Library** (left sidebar) → you can create folders here for your own admin convenience (e.g. "Meditations 2026", "E-books"). This is just for your file management — members see content via the Vault, not the Media Library.

All Vault fields at a glance:

| Field | What it controls |
|---|---|
| `name` | Title shown on the card and at the top of the detail page |
| `slug` | URL slug (auto-generates from name) |
| `description` | Short description shown on the grid card (1-2 sentences) |
| `kind` | Filter tag — acts as folders for members. New options: Audio meditation, E-book, Workbook |
| `tone_colour` | Hex accent colour for the card border + filter |
| `duration` | Free-text, e.g. "12 min", "20 mins", "85 pages" |
| `audio_file` | MP3 upload — for meditations or journey audio |
| `video_url` | Optional video embed URL (Bunny.net, YouTube unlisted, any iframe) |
| `video_thumbnail` | Poster / cover image (1280×720 JPEG, max 500KB) |
| `companion_pdf` | PDF upload — use this for e-books, workbooks, or companion docs |
| `body` | Full "About this" content shown below the player / on the detail page |
| `recorded_date` | When this was recorded (optional, shown in metadata) |
| `sort_order` | Lower = appears earlier in vault grid |
| `is_active` | Untick to hide without deleting |

#### `/community/reset-room/replays` (members only)

Recordings of past workshops + monthly live calls.

**Strapi:** Content Manager → **Reset Room · Workshop Replay**

Fields:

| Field | What it controls |
|---|---|
| `title` | Replay title |
| `slug` | URL slug |
| `description` | Short description shown on the card |
| `kind` | Monthly live call, Workshop, Q&A session, Special event |
| `recorded_date` | **Required.** Date — sorted newest-first on the page |
| `duration` | e.g. "90 min", "45 min" |
| `video_url` | Embed URL (Bunny.net or similar) |
| `video_thumbnail` | Poster image |
| `audio_file` | Optional audio-only version for the podcast feed |
| `body` | Show notes, summary, links (richtext) |
| `is_active` | Hide without deleting |

#### `/community/membership` (the Reset Room signup page)

**Strapi:** Single Types → **Membership Page**

Standard fields: kicker, title, intro paragraphs, price details, CTA label.

The actual signup → Stripe checkout flow is wired automatically — Anna doesn't need to do anything Stripe-related, just edit the copy.

#### `/community/the-returning-circle`, `/community/events`

Both use the **Community Event Page** collection. Open the entry with the matching slug (`the-returning-circle` or `events`) and edit kicker/title/intro/cta.

`/community/events` also pulls upcoming events from Experiences · Event (any event with `is_upcoming` ticked appears in the list below the hero).

#### `/community/resources`

Standalone page (Pages · Standalone, slug `community-resources`). Standard fields as in §16.4.

### 16.13 Shop products + categories

#### Products

**Strapi:** Content Manager → **Shop · Product** → one entry per product

Fields:

| Field | What it controls |
|---|---|
| `name` | Product name (e.g. "Citrine Strength Bracelet") |
| `slug` | URL slug (auto) — final URL is `/shop/{slug}` |
| `description` | Long product description (richtext) |
| `short_description` | One-line tagline shown on product cards |
| `price` | Numeric price (e.g. `48.00` for £48) |
| `compare_at_price` | Optional. If set higher than `price`, the product shows a sale price + strikethrough on the original |
| `category` | Pick from Shop · Category. **Required for the product to show in the right shop section** |
| `images` | Multiple uploads. The first one is the main thumbnail; the rest become a gallery |
| `stock` | Numeric stock count. Drops automatically when orders are placed |
| `is_featured` | Generic featured flag (in-shop carousel etc.) |
| `is_homepage_featured` | Show in the "Jewellery with meaning" homepage row. Top 3 by `sort_order` win |
| `homepage_hook` | Italic line shown on the homepage product card (Anna's voice — "I reach for this one when I need…") |
| `is_active` | Untick to hide from the shop without deleting |
| `sku` | Optional SKU code |
| `weight_grams` | Used for shipping calculations |
| `tax_class` | `standard`, `reduced`, or `zero` |
| `tags` | Comma-separated tags for filtering/search ("best-seller, gift, new-in") |

#### Categories

**Strapi:** Content Manager → **Shop · Category** → one entry per category or sub-category

Fields:

| Field | What it controls |
|---|---|
| `name` | Display name (e.g. "Bracelets") |
| `slug` | URL slug (auto from name) |
| `parent` | Optional. Set to a parent category to make this a sub-category (e.g. "Bracelets" → parent "Jewellery") |
| `description` | Optional. Short text shown on the category landing page above the product grid |
| `is_visible_in_nav` | **Important.** Tick to show this category in the shop dropdown menu. Untick to keep it for internal organisation but hide from the menu |
| `sort_order` | Lower = appears first in the nav |

#### Common shop edits

- **Add a new product:** Shop · Product → + Create → fill name, price, description, upload images, pick category → save. Live on the shop instantly.
- **Mark a product as out of stock:** set `stock` to `0`. The product still shows but with an out-of-stock indicator and the buy button disabled.
- **Hide a product temporarily:** untick `is_active`.
- **Add a new top-level shop category:** Shop · Category → + Create → name, leave `parent` blank, tick `is_visible_in_nav` → save. Appears in the Shop dropdown.
- **Add a sub-category (e.g. new jewellery type):** Shop · Category → + Create → name, set `parent` to the top-level category (e.g. "Jewellery") → save. Appears under that parent in the dropdown.

### 16.14 The FAQ system (per-page FAQs)

Every meaningful page on the site has an FAQ accordion at the bottom — programme pages, experience pages, shop, about, contact, etc. The questions and answers come from a single CMS collection, tagged by page.

**Strapi:** Content Manager → **FAQ · Per Page**

Fields per FAQ entry:

| Field | What it controls |
|---|---|
| `question` | The Q in Q&A |
| `answer` | The A. Richtext — use the toolbar for bold/italic/links/lists. Markdown links work too: `[text](url)` |
| `page` | **Required.** Which page this FAQ appears on. Dropdown of 25 page slugs (the-reset, signal, retreats, workshops, reset-room, etc.) |
| `category` | Optional grouping for future FAQ overview pages. Not displayed today |
| `sort_order` | Lower = appears earlier on the page. Use 10, 20, 30 for easy reordering |
| `is_active` | Untick to hide without deleting |

#### Add a new FAQ

1. FAQ · Per Page → + Create
2. Type the question + answer
3. Pick the `page` dropdown — this binds the FAQ to that page (`the-reset` → shows on `/the-work/the-reset`)
4. Set `sort_order` to control position (or leave at 0 — most recent shows first within the page)
5. Save & Publish. The FAQ accordion on that page updates within 1-2 seconds.

#### How many FAQs per page?

5-8 is the sweet spot. 10-12 fine if a page genuinely needs that depth (e.g. shop returns / shipping). 15+ becomes a wall of plus-signs and Google starts truncating in rich snippets.

#### Bulk-add Anna's FAQs

If you have a Word doc / spreadsheet of FAQs to add in bulk, Sameer has a script (`Docs/upload-faqs.ps1`) that reads a JSON file and creates them all at once. Send him the content and he'll run it.

### 16.15 Other landing pages (Reset Letters, Decoder, Quiz, Mantras, Cosmic Forecast)

Five smaller pages that each have their own dedicated CMS entry. Cover them here so they're not orphaned.

#### `/reset-letters` — Reset Letters Substack landing page

**Strapi:** Single Types → **Reset Letters**

A long landing page for the Substack publication. The fields are grouped by section in the form:

| Section | Fields |
|---|---|
| Top label + strapline | `comingSoonLabel`, `strapline` |
| Hero | `heroHeadline`, `heroBody1`, `heroBody2`, `heroImage` |
| "What it is" block | `whatItIsTitle`, `whatItIsBody` |
| "Each week" schedule | `eachWeekTitle`, `eachWeekBody` (one line per cadence item — Sunday / Wednesday / Monthly) |
| Voices & Contributors | `voicesTitle`, `voicesBody` |
| About Anna | `aboutAnnaTitle`, `aboutAnnaBody` |
| Launch date | `launchLabel`, `launchDate` |
| Founding member offer | `founderEyebrow`, `founderHeadline`, `founderBody`, `founderBenefits` (one benefit per line) |
| Signup form | `ctaButtonLabel`, `ctaPlaceholder`, `ctaMicrocopy` |

All fields have sensible defaults — edit any to change the on-page copy. The signup form itself submits to Mailchimp (Founding tag) — that wiring is set up and you don't need to touch it.

#### `/free/nervous-system-decoder` — Free download lead magnet

**Strapi:** Single Types → **Decoder**

| Section | Fields |
|---|---|
| Hero | `heroEyebrow`, `heroTitle`, `heroTagline` |
| Book cover graphic on the left | `coverLabel`, `coverTitle`, `coverSubtitle`, `coverAuthor`, `coverImage` (the photo behind the dark overlay) |
| "Why this exists" body | `whyTitle`, `whyBody` (blank lines = paragraphs) |
| "What's inside" bullet list | `insideTitle`, `insideItems` (one bullet per line) |
| Signup form | `formTitle`, `formButtonLabel`, `formMicrocopy` |
| After-submit success message | `successTitle`, `successBody` |

The form on this page subscribes Anna's audience to Mailchimp and triggers the Decoder PDF email.

#### `/the-work/quiz` — The Signal Method quiz

**Strapi:** Single Types → **Quiz Page**

Fields:

| Field | What it controls |
|---|---|
| `eyebrow`, `title`, `intro` | Hero copy at the top of the quiz |
| `back_to_label`, `back_to_url` | The back-link at the top |
| `results` (repeatable component) | The 6 result blurbs — one per programme/destination |

Each result row has:
- `slug` — which programme this result points to (`decoder`, `reset-room`, `reset`, `signal`, `signal-build`, `one-day`)
- `title` — the "Start with X" headline
- `blurb` — the longer body explaining the recommendation
- `cta_label` — the button text

The quiz questions themselves are in code (not editable from CMS) because the routing logic depends on the exact question structure. To change a question, ask Sameer.

#### `/mantras` — the rotating mantra videos

Two layers:

**Page hero copy:** Single Types → **Mantras Page** (standard kicker/title/intro/SEO fields)

**The mantra videos themselves:** Content Manager → **Story · Mantra**

Per mantra:

| Field | What it controls |
|---|---|
| `title` | Mantra title (e.g. "Come Back to Yourself") |
| `youtube_url` | **Required.** Full YouTube URL — page extracts the video ID and embeds it |
| `description` | Optional. Short text shown below the video |
| `duration` | Free-text (e.g. "60 seconds", "90 seconds") |
| `sort_order` | Lower = appears first |
| `is_active` | Untick to hide without deleting |

**Add a new mantra:** Story · Mantra → + Create → paste the YouTube URL → fill title → save. Live on `/mantras` instantly.

#### `/cosmic-forecast` — weekly cosmic forecast posts

**Strapi:** Content Manager → **Story · Cosmic Forecast**

Anna posts a new forecast entry roughly weekly. The page shows the most recent one prominently and lists older ones below.

Standard fields per entry: `title`, `slug`, `published_date`, `summary`, `body` (richtext), `hero_image`, `is_active`.

To add a new forecast: + Create → set the published date → write the body → save & publish. Auto-becomes the latest forecast on the page.

### 16.16 Ask Anna AI assistant

**Strapi:** No CMS editing. The Ask Anna widget on the right side of the screen + the `/ask-anna` page are wired to the Anthropic API directly.

What Anna can do:
- Change the API key (rotate periodically) — that's an environment variable change Sameer handles
- Change the system prompt (the "voice" / personality of the assistant) — code change, ask Sameer

What it does automatically:
- Searches the live site's Experiences, Articles, and Products to answer questions like "do you have a retreat in June?" → returns real upcoming events + links
- Stays in Anna's voice and refuses out-of-scope questions
- Streaming responses, mobile-friendly widget

If you want changes to what it can search or how it responds, message Sameer with the desired behaviour.

### 16.17 The Sales Funnel: Decoder → REGULATED → Reset Room

A coordinated 3-step funnel was added on 28 May:

1. **Free entry — The Nervous System Decoder**
   - Landing page: `/free/nervous-system-decoder` (Decoder singleton in Strapi)
   - Interactive quiz: `/free/nervous-system-decoder/quiz` (Decoder Quiz singleton)
   - The signup form on the landing page POSTs to `/api/lead/decoder`, which:
     - Verifies a Cloudflare Turnstile token (anti-spam)
     - Upserts the subscriber in Mailchimp
     - Applies the **`Decoder Subscriber`** tag → triggers Anna's "Decoder Upsell" journey

2. **Paid course — REGULATED**
   - Sales page: `/the-work/regulated` (Work · Programme entry, slug `regulated`)
   - Pay-what-you-feel from £5 (`pricePence = 500`)
   - The "Step inside REGULATED" CTA hits Stripe Checkout (via `/api/stripe/checkout` with `strapi_type=programme`, `strapi_id=regulated`)
   - On successful checkout, the Stripe webhook applies the **`REGULATED Buyer`** tag → triggers Anna's "REGULATED Follow-up" journey AND exits the Decoder Upsell journey

3. **Membership — The Reset Room** (already wired)
   - Sales page: `/community/membership`
   - Monthly subscription £25/month
   - On checkout, applies `Reset Room Members` tag

#### Mailchimp tags used by the funnel

| Tag | When applied | Triggers / exits |
|---|---|---|
| `Decoder Subscriber` | Decoder form submit | Triggers Decoder Upsell journey |
| `REGULATED Buyer` | REGULATED Stripe checkout completes | Triggers REGULATED Follow-up journey + exits Decoder journey |
| `Reset Room Members` | Reset Room Stripe checkout completes | Triggers Reset Room welcome journey |

#### The 6 templates Anna built for the funnel (in Mailchimp)

| Template | Sent when |
|---|---|
| `ALW - 13.1 - Decoder results ready (immediate)` | Trigger fires |
| `ALW - 13.2 - Decoder upsell to REGULATED (2 days)` | +2 days, if not yet bought REGULATED |
| `ALW - 13.3 - Decoder upsell final (4 days)` | +4 days, if still not bought |
| `ALW - 14.1 - REGULATED welcome (on access)` | REGULATED Buyer tag applied |
| `ALW - 14.2 - REGULATED nudge to Reset Room` | +few days into REGULATED |
| `ALW - 14.3 - REGULATED final + Reset Room (1 week)` | +1 week into REGULATED |

These live in Strapi-free; Anna picks them in Mailchimp's Customer Journey builder. The hardcoded URLs in them already point to the right pages on the production site.

#### Where Anna edits

- **Decoder page copy** → Strapi → Single Types → **Decoder**
- **Quiz hero + 3 state result blurbs + meditation URLs** → Strapi → Single Types → **Decoder Quiz (Free)**. The 3 results are pre-seeded with placeholder copy; Anna replaces them with her own.
- **REGULATED sales page copy + price + Mailchimp tag** → Strapi → Content Manager → Work · Programme → entry `regulated`
- **Email templates** → Mailchimp → Email templates → Saved templates (the 6 `ALW - 13.*` and `ALW - 14.*` entries)
- **The 2 customer journeys** → Mailchimp → Automations → Customer Journeys

### 16.18 REGULATED course modules (the content buyers access after purchase)

When someone buys REGULATED, they're redirected to **`/the-work/regulated/access`** — the private course area. Whatever you publish in the **REGULATED · Module** collection appears there, in the order you set.

#### One-time setup (before the first sale)

1. Strapi → Content Manager → **Work · Programme** → open the **REGULATED** entry
2. Find the field **`grantsRegulatedAccess`** → tick it on
3. **Save**

This tells the system that a Stripe purchase of REGULATED should grant the buyer access to the course area. You only do this once.

#### Adding course modules

1. Strapi → Content Manager → **REGULATED · Module** → **+ Create new entry**
2. Fill the fields that fit your content (all are optional except `title` and `sort_order`):

| Field | What it controls |
|---|---|
| `title` | Module heading (e.g. "Module 1: Coming Home to Your Body") |
| `slug` | URL slug (auto from title) |
| `sort_order` | Lower numbers appear first. Use 10, 20, 30 so you can insert later modules between (e.g. 15) without renumbering |
| `intro` | Short intro sentence shown under the title |
| `body` | Main lesson content — markdown supported. Use for text-led modules |
| `video_url` | YouTube unlisted, Vimeo, or any embeddable URL. Renders as a video player |
| `audio_file` | **Easiest path** — drag-drop an MP3 here. File hosted in your Media Library, plays in-browser. |
| `audio_url` | Alternative to `audio_file` — paste a URL if the audio is hosted elsewhere (Bunny.net, podcast feed, external MP3). Leave blank if you uploaded a file above. |
| `downloadable_file` | Optional PDF, worksheet, or audio file customers can download |
| `thumbnail` | Optional thumbnail shown above the title (800×600 recommended) |
| `duration_label` | Free text, e.g. "12 minutes" or "15 min audio + worksheet" |
| `is_intro` | Tick ONE module to highlight at the top of the access page. Leave the rest unticked |

3. **Save & Publish.** The module appears for buyers within 1-2 seconds.

#### Module shapes

You can mix and match per module:
- **Text-led lesson** — fill `title`, `body`, optionally `downloadable_file` (worksheet)
- **Video lesson** — fill `title`, `video_url`, optionally `intro` (1-line summary)
- **Audio meditation** — fill `title`, drag-drop MP3 into `audio_file`, `duration_label` (e.g. "12 minutes")
- **PDF download** — fill `title`, `downloadable_file`, `intro` describing what's inside

#### Verified working end-to-end (1 Jun 2026)

The full funnel was tested on staging: Stripe purchase → user auto-created with REGULATED access → password set → login → access page renders with the uploaded audio meditation playing inline. Anna can demo this exact flow to her brother on the meeting recording.

#### The access link for your welcome email

In your REGULATED welcome email in Mailchimp, the access link is:

**`https://annalouwellness.com/the-work/regulated/access`**

Paste that wherever your email says `[access link]`.

### 16.19 Building a brand-new page yourself (the Page Builder)

You can now create new pages on your site without help — full design control, multiple images, colours, the lot. This is the **Page (build your own)** collection in your CMS sidebar.

**It works on your phone.** Strapi's admin is responsive — you can build entire pages from mobile. The flow below is written assuming you're on iPhone or iPad. Desktop is the same but easier (more screen space).

#### Step 1 — Create the page

1. Tap the menu (☰) → **Content Manager** → **Page (build your own)** → **Create new entry**
2. Fill in:
   - **Title** — appears in the browser tab. Example: *"Beach Reset Day"*
   - **Slug** — auto-fills from the title. This becomes the URL: `annalouwellness.com/p/beach-reset-day`
   - **Hero image** — the photo used when this page is shared on social (Instagram, WhatsApp). Optional but recommended.
   - **Summary** — one line that shows up in search results and link previews. ~155 characters.
3. **Save** as a draft (top-right). You can keep editing.

#### Step 2 — Add sections

Scroll down to **Sections**. Tap **+ Add a component to sections**. You'll see a list of section types:

| Section | When to use |
|---|---|
| **Hero** | A big opening with title, subtitle, optional background image, and CTA buttons. Almost every page starts with one. |
| **Text Block** | A heading + body paragraphs. Good for long-form copy. |
| **Image + Text split** | One image side-by-side with a heading + body. Choose left or right for the image. |
| **Full-bleed image** | A big edge-to-edge photo, optionally with text floating on top. Great between long text sections. |
| **Image pair** | Two photos side-by-side (e.g. boat exterior + interior). |
| **Image with caption** | A single centred photo with caption underneath. |
| **Gallery** | A grid of multiple photos. |
| **CTA Banner** | A call to action with heading + button. |
| **Testimonials** | Customer quotes. |
| **FAQ** | Question-and-answer accordion. |
| **Embed** | Embed a YouTube or Vimeo video by pasting its URL. |
| **Custom HTML** | For anything else — drop in raw HTML. Use sparingly. |

Pick one. Fill in its fields. Save. Repeat for the next section. **Drag** the small ≡ handle to reorder sections.

#### Step 3 — Style each section

Inside every section there's a **Style** block. Tap to expand. You'll see:

- **Background colour** — paste a hex code. Common ones for the ALW palette:
  - `#FFFFFF` (white)
  - `#F5F3EF` (cream)
  - `#FCE8EF` (soft pink)
  - `#DCEFE6` (mint)
  - `#FFD07A` (warm gold)
  - `#231F20` (near-black — pair with cream text)
- **Text colour** — usually leave blank (defaults to dark). Set to `#F5F3EF` (cream) when using a dark background.
- **Accent colour** — colour for buttons and links inside this section. Defaults to plum `#6E3A5A`.
- **Padding** — Tight / Normal / Spacious. Normal is the default.
- **Alignment** — Left / Center / Right text alignment.
- **Max width** — Narrow / Medium / Wide / Full. Narrow = best for long reading.
- **Background image** — drop in a photo to sit behind the text. Set **Background image overlay** (0–80) to dim it so the text stays readable.

#### Step 4 — Add images everywhere you want

Every section type that allows images lets you drop in a photo from your phone:

- Tap the image field → **Add an asset** → **Upload assets** → choose from your camera roll
- Once uploaded, the image is auto-rotated, auto-resized, and renamed to something readable
- You can use the same image multiple times across pages — just upload once

#### Step 5 — Save and preview

1. Tap **Save**
2. Tap **Publish** (top-right, blue button)
3. Open `annalouwellness.com/p/<your-slug>` in another tab. Your page is live.

Edits go live in 1–2 seconds — no waiting for a rebuild.

#### Tips for mobile editing

- Strapi remembers what you typed if your phone screen locks — relaunch and continue
- If a long form feels cramped, rotate to landscape
- For the Sections list, **drag the ≡ handle slowly** — too fast and the page scrolls instead
- If you accidentally tap **Delete** on a section, **Save** without publishing and reload — drafts are preserved
- Photos taken on iPhone (HEIC format) work — they're auto-converted to JPEG on upload

#### Mistakes that don't matter

- **Wrong colour** — change it, save, refresh the live page. Instant.
- **Wrong order** — drag to reorder, save, refresh. Instant.
- **Wrong image** — open the section, remove the image, add a new one, save.
- **Page looks bad** — leave it as a draft. Only published pages are live. Nothing public breaks.

#### Mistakes that do matter

- **Don't change the slug** after the page is live and shared — the URL will break for anyone with the old link
- **Don't paste invalid hex codes** (e.g. `#GGGGGG`) — the colour will silently default to white

### 16.20 What's coming next

The manual is now substantially complete for v1.3. Possible future additions based on Anna's feedback:
- Screenshots inside each section (currently text-only — Anna may want visual reference)
- A 5-minute video walkthrough of the most-used edits
- A printable 1-page emergency cheatsheet for the launch day

Tell Sameer if any of those would help.

---

*End of manual. Print this, bookmark it, or just keep it open in a browser tab. Updates land in `Docs/ANNA_USER_MANUAL.docx` — Sameer keeps the master version.*

*Anna x*
