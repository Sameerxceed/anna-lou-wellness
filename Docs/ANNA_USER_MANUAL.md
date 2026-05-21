# Anna Lou Wellness — User Manual

**Version 1.0 — Final handover edition · May 2026**

This is your complete reference for running the website day-to-day. Keep it bookmarked. Anything not covered here, message Sameer.

A 2-page cheatsheet with the 10 most common tasks is included separately (`ANNA_QUICK_REFERENCE.docx`). Use that for daily work; come back here when you need depth.

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

### Where things live in Content Manager

Content Manager splits into two columns:

**Collection Types** (left column) — content where there can be many entries:
- Articles (Reset Stories, Life, Love & Relationships, Work & Money)
- Article Categories (the subcategory tabs you see on the live site)
- Products (shop items)
- Product Categories
- Orders
- Customers
- Coaching Sessions
- Experiences
- Mantras
- Events
- Programmes
- Memberships
- Coupons
- Tax Rules
- Shipping Methods

**Single Types** (left column, lower) — content where there is exactly one entry:
- Homepage
- Navigation (the new editable menu)
- Site Settings
- About Page, Community Page, Contact Page, Experience Page, Decoder Page, Reset Room Page, Reset Letters Page, Welcome Page
- Cosmic Forecast

For each one, click to open. Most singles are "one big form". Most collections show a list with filter + search; click any row to edit.

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
- **The Work** section — kicker, title, body, two CTAs
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

Same shape: open the single type → edit kicker + title + body + intro paragraphs + CTA. Click Preview to see how it lands.

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

Content Manager → Coaching Sessions → click any. Same pattern as Programmes — title, tagline, opening, accent colour, image.

---

## 5. Articles (Reset Stories, Life, Love, Work)

This is the editorial heart of the site. Each article is one entry in **Articles**.

### Creating a new article

1. Content Manager → **Articles** → click **Create new entry** (top right)
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

To rename a category: Content Manager → **Article Categories** → click row → edit the name → Save. The change reflects on every article under that category and in the subcategory tab strip.

To delete a category: only do this if no articles are filed under it. Click the row → bottom of form → **Delete**. Articles previously filed under it will show "no category" until you reassign.

To add a new category: **Create new entry** → name, slug, optional colour and description → choose which section it belongs to.

### Paywall

When **Is free** is toggled OFF, only the first paragraph or two of the body shows on the public site, with a "Read the full piece on Substack" call to action linking to the Substack URL.

When **Is free** is ON, the full body shows directly on the website with no paywall.

For Reset Letters Founding Members, this distinction goes away — the page treats them as paid subscribers automatically.

---

## 6. Shop & products

### Adding a new product

1. Content Manager → **Products** → **Create new entry**
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

Content Manager → **Orders**. List shows the latest orders with order number, customer name, total, status.

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

*End of manual. Print this, bookmark it, or just keep it open in a browser tab. Updates land in `Docs/ANNA_USER_MANUAL.docx` — Sameer keeps the master version.*

*Anna x*
