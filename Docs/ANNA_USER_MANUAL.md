# Anna Lou Wellness â€” User Manual

**Version 1.6 â€” Updated 16 June 2026**

This is your complete reference for running the website day-to-day. Keep it bookmarked. Anything not covered here, message Sameer.

A 2-page cheatsheet with the 10 most common tasks is included separately (`ANNA_QUICK_REFERENCE.docx`). Use that for daily work; come back here when you need depth.

**Two ways to use this manual:**
- Sections 0â€“15 are organised **by feature** (Pages, Articles, Shop, Mailchimp, Stripe, etc.). Best when you want to learn how a system works.
- Section 16 is organised **by URL**. Best when you're looking at a live page and asking "where do I change this?". It includes a Quick Reference table mapping every page on the site to its CMS location.

---

## 0. First-time image upload (do this once, before anything else)

To make the site look "finished" on day one, upload these ~25 images into the Media Library and attach them to the corresponding pages. Total time: roughly 45 minutes.

Image specs to aim for:
- **Hero / portrait images:** 1600 Ã— 1200 px or larger, JPG/PNG
- **Logo / wordmark / badge:** SVG preferred (vector), or transparent PNG 600 Ã— 600
- **Square / product images:** 1500 Ã— 1500 px

Strapi automatically generates 5 smaller variants (245 / 500 / 750 / 1200 / 1920 px wide) on upload â€” you upload once at full resolution and the site picks the right size per use.

### Site-wide (3 images)

| Where to upload | What to upload |
|---|---|
| `3. Site Settings â†’ logo` | Anna Lou Wellness wordmark (light background) |
| `3. Site Settings â†’ og_default_image` | 1200 Ã— 630 social-share image (Anna portrait + wordmark) |
| `3. Site Settings â†’ favicon` | (already set â€” only re-upload if you want a new one) |

### Homepage (4 images)

`1. Homepage` â†’
- `heroImage` â€” main portrait/hero (1600 Ã— 1200, portrait orientation, e.g. you on the houseboat or studio shot)
- `workImage` â€” the "Work with Anna" section photo
- `communityImage` â€” the Community teaser photo
- `portraitImage` â€” small portrait for the About teaser block

### Pillar pages (8 images)

| Where | Field |
|---|---|
| `About` | `portrait` â€” main "Anna's story" photo (portrait orientation) |
| `About` | `press_logos` â€” one logo per row (Aneeza is sending the licensed artwork) |
| `About` | `certifications` â€” ICF, CPD, TRE badge per row |
| `Community` | `circle_image` â€” Returning Circle photo |
| `Community` | `reset_room_image` â€” Reset Room visual |
| `Reset Letters` | (uses brand colour wordmark, no extra image needed for now) |
| `Reset Room` | `hero_image` |
| `Decoder` | `hero_image` |
| `Experiences` | `hero_image` |
| `Work Â· Membership (Reset Room)` | `hero_image` |

### Work with Anna â€” programmes (5 images)

`Work Â· Programme` â†’ for each entry (The Reset, Signal, Signal & Build, One Day, Signal Collective):
- `hero_image` â€” one portrait photo per programme

### Work with Anna â€” coaching sessions (3 images)

`Work Â· Coaching Session` â†’ for each entry (Dating Reset, Founder Reset, Nervous System Reset):
- `hero_image`

### Articles, products, events

You add these gradually as you publish â€” each new article needs a `hero_image`, each product needs `images` (gallery), each event needs `hero_image`. No "first-time" lift; just attach the image when you create the entry.

### Tips for choosing photos

- **Portrait orientation** for hero images on individual pages (works better with the side-by-side image+text layout)
- **Landscape** for full-bleed sections (like community circle, retreat photos)
- **Square** for product photography and Instagram shares
- Same colour grading / mood across the brand for visual cohesion
- Avoid stock photo cliches â€” your own photography always reads better

When in doubt, upload what you have. The site degrades gracefully to placeholders if a field is empty.

---

## 1. Getting started

### What runs the site

Three pieces, all wired together:

1. **The website** at `annalouwellness.com` â€” what visitors see.
2. **The CMS (Strapi)** at `cms.annalouwellness.com` â€” where you edit everything.
3. **Stripe + Mailchimp** â€” payments + email automation, both already wired to the CMS.

You only ever log into the CMS. Stripe and Mailchimp are linked behind the scenes.

### Logging in

1. Open `https://cms.annalouwellness.com/admin` in any browser
2. Username: `anna@annalouwellness.com` (or whatever email Sameer set up for you)
3. Password: the one Sameer sent you separately

If you forget the password, click "Forgot password" on the login screen â€” it emails you a reset link.

### The admin tour

After login, you see a sidebar on the left with these main areas:

- **Content Manager** â€” where you do all editing. Pages, articles, products, orders, settings.
- **Media Library** â€” every image you've uploaded, in one place. Drag-and-drop new ones here.
- **Settings** â€” your account, your admin team, plugins (rarely touched).

You'll spend 90% of your time in Content Manager.

### Where things live in Content Manager â€” the new sidebar layout

Content Manager splits into Single Types and Collection Types. Both are grouped using prefix labels so you can scan them quickly. Reading top to bottom, you'll see:

**Pinned at top (the three you'll touch most often):**
- `1. Homepage` â€” the front page of the site
- `2. Navigation` â€” the menu items + top strip
- `3. Site Settings` â€” global logo / SEO / social URLs / bank details

**Page singletons** (each one matches a menu item on the website â€” click `ABOUT` in the menu, edit `About` in the CMS):
- About / Community / Contact / Decoder / Experiences / Reset Letters / Reset Room / Sub-pages / Community Event / Welcome

**Editorial content** (`Story Â· X`):
- Story Â· Article (every blog/Reset Story/Life/Love/Work article lives here, separated by Category)
- Story Â· Category (the subcategory tabs)
- Story Â· Mantra (the rotating quote strip)
- Story Â· Cosmic Forecast

**Coaching / programmes** (`Work Â· X`):
- Work Â· Programme (The Reset, Signal, Signal & Build, One Day, Signal Collective)
- Work Â· Coaching Session (Dating Reset, Founder Reset, Nervous System Reset)
- Work Â· Membership (Reset Room subscription settings)
- Work Â· FAQ
- Work Â· Experience

**E-commerce** (`Shop Â· X`):
- Shop Â· Product
- Shop Â· Category
- Shop Â· Order
- Shop Â· Customer

**Other groups:**
- Event Â· Event
- Team Â· Member

**Sorted to the very bottom** (`zz Â· X (unused)`) â€” internal/system content types you should ignore. Cart, Coupon, Currency Rate, Page-legacy, Product Option / Review / Variant, Return Request, Shipping Method / Zone, Tax Rule, Wishlist. They sort last and are marked "(unused)" so you know to skip them.

For each one, click to open. Singles are "one big form"; collections show a list with filter + search; click any row to edit.

---

## 2. The daily editing workflow

### Edit â†’ Preview â†’ Save â†’ Live

Every time you edit a page:

1. Open the page or article in Content Manager
2. Make your changes in the form fields on the left
3. Click **Preview** in the top right â€” opens the actual live website in a side panel showing your changes
4. Happy? Click **Save** (or **Save & Publish** if it's not yet published)
5. The change goes live on the website within 1 minute

### Live preview â€” your new best friend

The Preview button shows you the page as visitors will see it, before you save. Edit, preview, edit again, preview again, then save when it looks right.

- Works on every page, article, product, programme
- Side-by-side: form on left, live page on right
- Updates as you type (give it a second)

### Save vs Save & Publish

Most content types have two states: **Draft** (only you can see it) and **Published** (visible to the world).

- **Save** â€” writes your changes but keeps the previous published version live. Use when you want to keep working before showing the world.
- **Save & Publish** â€” writes changes AND makes them live. Use when you're done.

For pages that have no draft/publish distinction (e.g. Site Settings, Navigation), just **Save** does it all.

### Undo a mistake

Strapi keeps version history on every entry. Top right of any edit screen, click the clock icon â†’ **Version History** â†’ pick an earlier version â†’ click **Restore**. Done.

### When changes actually appear

After Save & Publish:
- The CMS marks the entry as published immediately
- The website checks for changes every 60 seconds (it caches to be fast)
- Hard-refresh your browser if you don't see the change (Ctrl+Shift+R / Cmd+Shift+R)

### Tools that save you time

Three sidebar items make life faster — use them often:

- **Quick Edit** — homepage dashboard listing every editable page with a one-click open button. Skip the Content Manager tree when you know where you're going.
- **Site URLs** — every URL on the public site with Copy buttons. Use when editing nav, Mailchimp emails, or social posts.
- **SEO & AI Files** — see what Google + ChatGPT read about your site, AND run the bulk SEO backfill button to auto-fill missing SEO across every entry in one click.
- **Quick Photos** — every hero / portrait image across the site, with a one-tap Replace button. Skip navigating into each entry.

### Auto-SEO on Save

Every time you Save an Article / Programme / Experience / Coaching Session / Generic Page / Page Builder entry, the CMS automatically generates an SEO title and description from the entry's name + body and saves them to the seo_title and seo_description fields — IF those fields are blank. Your own edits to those fields are NEVER overwritten.

For existing entries that pre-date this feature, run **SEO & AI Files → Bulk fill missing SEO** (one click).

---

## 3. Navigation menu

The whole top-of-page menu is now editable from CMS. Open **Content Manager â†’ Navigation**.

### Editing the menu

You'll see a list called **Items** â€” one for each top-level menu item (Reset Stories, Life, Love & Relationships, Work & Money, Experiences, Work with Anna, Shop, Community, About).

**To rename an item:** click it open â†’ change the **label** field â†’ Save. Changes the text shown in the menu.

**To change where it links:** edit the **href** field. Examples: `/about`, `/shop`, `/reset-stories`. Always start with `/` for an internal page.

> **Tip:** if you can't remember a URL, open the **Site URLs** sidebar item in a new tab. It lists every page on the site with a Copy button next to each. Click "Copy path" and paste it into href.

**To change the colour tint:** edit **colour** (hex like `#6E3A5A` for plum, `#5DCAA5` for green). Leave blank for default black.

**To reorder:** drag the small handle on the left of each item.

**To delete:** click the trash icon on the right.

**To add a new top-level item:** scroll to bottom of Items â†’ click **Add an entry to Items** â†’ choose "Top-Level Menu Item" â†’ fill in.

### Editing the dropdown sub-menu

Open any top-level item â†’ scroll down to its **children** list. Each child is one sub-menu link.

Same controls: rename via **label**, change link via **href**, reorder by drag, delete by trash, add new via the button at the bottom.

### Editing the top strip

That tiny text strip across the very top of every page is the **top_strip_text** field at the top of the Navigation form. Use middle dots `Â·` between words. Example: `Stories Â· Work with Anna Â· Experiences Â· Shop Â· Community`.

### Common changes

**Removing a subcategory** (e.g. remove "Weekend" from Life): open Navigation â†’ expand the "Life" item â†’ find "Weekend" in its children list â†’ click the trash icon â†’ Save.

**Renaming "Work with Anna" to something else**: open Navigation â†’ click the item â†’ change the **label** field â†’ Save.

**Adding "Newsletter" to the menu**: open Navigation â†’ bottom of Items â†’ Add an entry â†’ label: `Newsletter`, href: `/reset-letters`, colour: `#5B2E55` â†’ optionally add child links â†’ Save.

---

## 4. Pages

The website has two kinds of pages:

- **Single types** (one of each) â€” Homepage, About, Community, Contact, Reset Letters, Welcome, Decoder, Reset Room, Experience
- **Programme pages** (collection, one entry per programme) â€” The Reset, Signal, Signal & Build, One Day, etc.

### Homepage

Content Manager â†’ Single Types â†’ **Homepage**.

Sections you can edit:
- **Issue line** (e.g. "Issue No. 01 Â· Summer 2026") and **Inside this issue**
- **Hero** â€” kicker, title, body paragraph, two CTA buttons (label + URL each), hero image
- **Featured story** â€” fallback fields if no featured article is set; usually leave defaults
- **Editorial sections** â€” the colored tiles (Life, Love, Work & Money)
- **Work with Anna** section â€” kicker, title, body, two CTAs
- **Quote slides** â€” two quote sections, each with text + attribution
- **Newsletter / Substack** â€” Reset Letters callout
- **Shop teaser** â€” kicker, title, body
- **Mantras strip** â€” short rotating mantras
- **Media tiles** â€” YouTube, Podcast, Substack tile titles + URLs
- **Community section** â€” kicker, title, body
- **Press strip** â€” names of press logos (full artwork swap comes later â€” Anna sending logos)
- **Testimonials** â€” fallback testimonials if no client stories pulled
- **Portrait/about teaser** â€” your photo + intro paragraph

Every field has a placeholder showing the default copy. Empty fields use the default; filled fields override it.

### About, Community, Contact, etc.

Same shape: open the single type (`About`, `Community`, etc.) â†’ edit kicker + title + body + intro paragraphs + CTA. Click Preview to see how it lands.

**About page â€” press logos and certifications:** these are now editable as form lists, not raw text. Open `About` â†’ scroll to **press_logos** â†’ each row is one outlet (name + logo upload). Same for **certifications** (name + colour + badge upload). Click "Add an entry to press_logos" / "Add an entry to certifications" to add rows. Drag the handle to reorder. Click the trash icon to remove. When Aneeza sends the licensed press artwork and certification badges, upload them into the existing rows.

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

Each coaching programme is a Programme entry. Content Manager â†’ Programmes â†’ click a row (The Reset, Signal, Signal & Build, One Day, etc.).

Fields:
- **Title** â€” what shows as the page title
- **Tagline** â€” small italic line under the title
- **Accent colour** â€” hex for the colored eyebrow + section labels
- **Hero image** â€” upload a portrait-orientation photo
- **Intro paragraphs** â€” main body, paragraph per line (separate with a blank line)
- **What's included items** â€” bullet list, one per line
- **Pricing body** â€” the pricing paragraph
- **CTA label + URL** â€” bottom button

### Coaching Sessions

These are the smaller 1:1 sessions (Founder Reset, Dating Reset, Nervous System Reset).

Content Manager â†’ **Work Â· Coaching Session** â†’ click any. Same pattern as Programmes â€” title, tagline, opening, accent colour, image.

### Programmes

Each coaching programme is one entry under **Work Â· Programme** (The Reset, Signal, Signal & Build, One Day, Signal Collective).

---

## 5. Articles (Reset Stories, Life, Love, Work)

This is the editorial heart of the site. Each article is one entry in **Articles**.

### Creating a new article

1. Content Manager â†’ **Story Â· Article** â†’ click **Create new entry** (top right)
2. Fill in:
   - **Title** â€” the article headline
   - **Slug** â€” the URL part. Auto-fills from title but you can edit. Use lowercase, dashes, no special characters.
   - **Excerpt** â€” a one-paragraph summary that shows on cards and SEO
   - **Body** â€” the full article. Paragraph per block, separated by blank lines.
   - **Hero image** â€” main image for the article
   - **Category** â€” REQUIRED. Pick from existing Article Categories. The category determines which section the article appears under (Reset Stories / Life / Love & Relationships / Work & Money) and which subcategory tab.
   - **Author** â€” defaults to "Anna Lou". Override for guest writers.
   - **Reading time** â€” like "5 min read"
   - **Is featured** â€” toggles whether this becomes the featured article on the homepage
   - **Is free** â€” toggles whether the full body is shown or only a preview (paywall)
   - **Substack URL** â€” link to the Substack version if cross-posted (for the "Read on Substack" link)
   - **SEO title** â€” overrides the default page title (defaults to article title + section)
   - **SEO description** â€” overrides the default meta description
   - **Published at** â€” leave blank for "now"; set a future date to schedule
3. Click **Save & Publish** (or **Save** if you want to keep editing before going live)

### Editing an existing article

Click the row in the Articles list â†’ edit fields â†’ Save.

### Article categories

These are the labels under each editorial section (e.g. "Holding Everything" sits under Reset Stories). 

To rename a category: Content Manager â†’ **Story Â· Category** â†’ click row â†’ edit the name â†’ Save. The change reflects on every article under that category and in the subcategory tab strip.

To delete a category: only do this if no articles are filed under it. Click the row â†’ bottom of form â†’ **Delete**. Articles previously filed under it will show "no category" until you reassign.

To add a new category: **Create new entry** â†’ name, slug, optional colour and description â†’ choose which section it belongs to.

### Paywall

When **Is free** is toggled OFF, only the first paragraph or two of the body shows on the public site, with a "Read the full piece on Substack" call to action linking to the Substack URL.

When **Is free** is ON, the full body shows directly on the website with no paywall.

For Reset Letters Founding Members, this distinction goes away â€” the page treats them as paid subscribers automatically.

---

## 6. Shop & products

### Adding a new product

1. Content Manager â†’ **Shop Â· Product** â†’ **Create new entry**
2. Fill in:
   - **Name** â€” product name
   - **Slug** â€” URL part (auto-generated)
   - **Short description** â€” one line for product cards
   - **Description** â€” long form on the product page
   - **Price** â€” number only, no currency symbol (e.g. `45.00`)
   - **Stock** â€” integer (e.g. `12`). Decremented automatically when an order is paid.
   - **Is active** â€” toggle ON to show in shop, OFF to hide without deleting
   - **Images** â€” upload multiple. First image is the main one. Drag to reorder.
   - **Category** â€” pick from Product Categories (Emotional Support Jewellery, Personalised, New In)
3. Save & Publish

### Hiding a product without deleting

Set **Is active** to OFF, save. The product disappears from the shop. Existing orders referencing it stay intact. Toggle back ON to show again.

### Editing a price

Click the product â†’ change the **Price** field â†’ Save. New orders use the new price immediately. Old orders keep their original price (they stored the price at time of order).

### Stock

Stock decrements automatically when an order is marked paid (via Stripe webhook). You can also manually update â€” open product, change Stock number, save.

When stock hits 0, the product shows "Out of stock" and customers can't add it to cart.

### Variants and options

For pieces with size or material options (e.g. "Necklace â€” gold / silver / rose gold"), use **Product Variants** and **Product Options**. Each variant has its own price, stock, and SKU. The product page automatically renders the option selector.

You probably won't use these often â€” most ALW pieces are single SKU.

### Product reviews

Customers can submit reviews. They appear in **Product Reviews**. By default reviews start as "unapproved" â€” you check them in CMS and toggle Approved ON before they show publicly.

---

## 7. Orders & customers

### Where to find orders

Content Manager â†’ **Shop Â· Order**. List shows the latest orders with order number, customer name, total, status.

Click any row to see the full order details:
- Order number (ALW-XXXXXXXX format)
- Customer name, email, phone
- Shipping address
- Items array â€” each item with name, price, qty
- Subtotal, discount, tax, shipping, total
- Currency (gbp)
- Payment method (stripe or bank_transfer)
- Stripe payment ID (clickable in Stripe dashboard to see the actual transaction)
- Status
- Internal notes (your private workspace, customers never see)

### Order status lifecycle

- **pending** â€” order created, customer hasn't paid yet (Stripe checkout in progress, or bank transfer pending)
- **paid** â€” payment confirmed by Stripe, ready to pack and ship
- **shipped** â€” you've sent it
- **completed** â€” customer has received it (optional final state)
- **cancelled** â€” you cancelled (e.g. out of stock, customer changed mind)
- **refunded** â€” full refund issued

### Marking an order shipped

1. Open the order
2. Change **Status** to `shipped`
3. Add tracking info in **Notes** (e.g. "Royal Mail tracked, AB1234567890GB")
4. Save

(Customer-facing shipping notification email is on the roadmap â€” not wired yet. For now, manually email tracking.)

### Issuing a refund

Two-step:
1. **In Stripe dashboard** (`dashboard.stripe.com` â€” log in with your Stripe account) â€” find the payment using the Stripe Payment ID from the order â†’ click **Refund** â†’ full or partial â†’ submit. The actual money refund happens here.
2. **In Strapi** â€” open the order â†’ change **Status** to `refunded` â†’ optionally note the reason in Notes â†’ Save.

If it's a partial refund, keep status as `paid` and note the partial amount in Notes.

### Customer records

Content Manager â†’ **Customers**. One entry per email address. Auto-created at first order. Shows order history.

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
| Reset Letters â€” Founding Welcome | Someone signs up for Reset Letters before 22 June 2026 |
| Reset Letters â€” Standard Welcome | Someone signs up after 22 June 2026 (or after the 500-Founders cap) |
| Decoder â€” Free Download | Someone fills the Decoder form on the website |
| Workshops â€” Confirmation | Someone buys a workshop via Stripe |
| Discovery Call â€” Booked | Someone books a discovery call (Calendly integration) |
| Returning Circle â€” RSVP | Someone RSVPs on the website form |
| Reset Room â€” Member Onboarding | Someone subscribes to Reset Room (Â£25/mo via Stripe) |
| The Reset â€” Programme Onboarding | Someone books The Reset (Â£1,500 via Stripe) |
| Signal â€” Programme Onboarding | Someone books Signal (Â£3,000 via Stripe) |
| Signal & Build â€” Founder Onboarding | Someone books Signal & Build (via Stripe) |
| One Day â€” Intensive Onboarding | Someone books One Day intensive |
| Signal Collective â€” Mastermind | Someone is enrolled in Signal Collective |
| Reset Session â€” 90min Booking | Someone books a single 1:1 session |

All 12 journeys have:
- The trigger tag wired
- Subject + preheader set
- The branded HTML email template attached (your existing 23 HTML files with `mc:edit` zones)
- All copy populated (from your "ALW Email Automations FINAL" doc)

What's left for you: review each one, tweak any copy you want, then click **Start** to activate.

### Editing email content

1. Log in to Mailchimp at `mailchimp.com`
2. Navigate to **Automations â†’ Customer Journeys**
3. Click the journey you want to edit (e.g. "Reset Letters - Founding Welcome")
4. Click the email step in the canvas
5. Click **Edit content**
6. Each editable region in the email is highlighted â€” click any of them to edit just that text (headline, body, button label, etc.)
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
- Top right corner â†’ **Start**
- Confirm

From that point on, every time the trigger tag is applied to a subscriber, the journey fires.

### Audience management

Audience â†’ **Audience dashboard** in Mailchimp. The `Anna Lou Wellness` audience is the only one you'll use.

To find a specific subscriber: top search bar â†’ type email â†’ opens their profile showing all tags, signup source, journey activity.

To manually tag someone (e.g. a bank transfer customer): open their profile â†’ **Tags** â†’ Add tag â†’ pick the right one.

To remove someone: open profile â†’ top right menu â†’ **Unsubscribe** or **Archive**.

### Reading email analytics

Inside any journey, click the email step â†’ **Reports**. Shows opens, clicks, bounces over time.

---

## 9. Stripe lookup

You don't need to touch Stripe day-to-day â€” orders and tags handle themselves. But occasionally you'll want to look something up.

### Logging in

`dashboard.stripe.com` â†’ log in with your Stripe account credentials.

### Finding a payment

Top of dashboard â†’ search bar â†’ paste the Stripe Payment ID from an order (`pi_3OAbc...`) OR the customer's email. Opens the full transaction record.

### Refunding

See Section 7 above.

### Live vs Test mode

Top right of Stripe dashboard â†’ toggle **Test mode** / **Live mode**. While the site is on staging, you're in Test mode. After go-live, you're in Live mode for real transactions.

The first real customer transaction in Live mode is a good moment to verify everything is connected. If you don't see the order in Strapi â†’ the webhook isn't connected. Call Sameer.

### Stripe customer dashboard

You can also see all customers + lifetime value in Stripe â†’ Customers. Useful for "how many people have bought from us" or "give me a list of repeat customers".

---

## 10. Media library

Sidebar â†’ **Media Library**. Everything you've uploaded across all pages and articles, in one searchable grid.

### Uploading

Drag-and-drop files into the upload zone, or click **Add new assets**.

- Image formats: JPG, PNG, WebP, GIF, SVG
- PDF and audio files supported (for downloads like the Decoder)
- Max file size: 10 MB per file
- Recommended image dimensions:
  - Hero images: 1600 Ã— 1200 px minimum
  - Article body images: 1200 Ã— 800 px
  - Product images: 1500 Ã— 1500 px (square)
  - Logos / wordmarks: SVG preferred (vector, scales perfectly)

### Image optimisation

Images are automatically rotated to correct orientation (iPhone EXIF rotation is handled â€” your photos won't appear sideways).

Images uploaded via the Media Library are served through Cloudinary, optimised for each device automatically. You don't need to resize before uploading.

### Reusing images

When picking an image in any content field, Strapi shows the Media Library â€” pick an existing one or upload new. Reuse is encouraged (Anna's headshot, brand patterns, etc. should be uploaded once and picked from the library).

---

## 11. Site Settings

Sidebar â†’ Content Manager â†’ Single Types â†’ **Site Settings**.

Global stuff that appears everywhere:
- **Site name** â€” used in browser tabs, SEO titles
- **Site tagline** â€” short descriptor used in metadata
- **Logo / Logo dark / Favicon** â€” brand assets
- **OG default image** â€” what shows when someone shares a page on Facebook / WhatsApp (1200 Ã— 630 recommended)
- **SEO description, SEO keywords** â€” defaults for pages that don't have their own
- **Social URLs** â€” Instagram, Facebook, Pinterest, TikTok, YouTube. Used in the footer + sharing widgets.
- **Payment defaults** â€” Stripe publishable key, PayPal client ID (already set by Sameer, don't change unless told)
- **Bank transfer details** â€” your real bank account info for shop orders that pick "Bank Transfer"
- **Default currency** â€” `gbp`
- **Low stock threshold** â€” when stock falls below this, the "only N left" warning shows on product pages
- **Notification email** â€” where order notifications get sent (set to your email)
- **Shop email** â€” public-facing email for shop queries
- **Cookie banner text** â€” the small popup
- **Footer copyright** â€” bottom of every page
- **Footer short about** â€” small paragraph in the footer
- **Contact email, Address** â€” used in the footer + Schema.org markup
- **Substack URL** â€” where the Reset Letters footer button points

When in doubt about a setting, message Sameer before changing.

---

## 12. Going live â€” full pre-launch checklist

Before the new site replaces the old one at `annalouwellness.com`, all of this must be done in order. Each step can be done by you or Sameer (marked).

### A â€” Content readiness (Anna)

- [ ] Every page reviewed visually â€” no placeholder copy or "Lorem ipsum"
- [ ] Every article in **Articles** is either Published or Draft (no half-finished)
- [ ] Hero images set on Homepage, About, Reset Letters, all programme pages
- [ ] Press logos uploaded (Aneeza is sending licensed logo artwork)
- [ ] Certification badges uploaded (ICF, CPD, TRE)
- [ ] Bank transfer details filled in Site Settings (sort code, account number, IBAN)
- [ ] Real intake form URL (Calendly/Typeform) plugged into the welcome emails (the 9-URL list Sameer sent)
- [ ] Mailchimp email templates reviewed visually â€” open each, send a test to yourself, sign off

### B â€” Mailchimp activation order (Anna)

Activate in this order (so simpler ones are battle-tested before complex ones):
1. **Reset Letters â€” Founding Welcome** (1A) â†’ start
2. **Reset Letters â€” Standard Welcome** (1B) â†’ start
3. **Decoder â€” Free Download** (2.1 + 2.2) â†’ start (both emails in the sequence)
4. **Discovery Call â€” Booked** (4) â†’ start
5. **Returning Circle â€” RSVP** (5) â†’ start
6. **Workshops â€” Confirmation & Follow-up** (3.1 + 3.2) â†’ start
7. **Reset Session â€” 90min Booking** (12.1 + 12.2) â†’ start
8. **The Reset / Signal / Signal & Build / One Day / Signal Collective / Reset Room** â†’ start each

After activating each one, sign up / book / RSVP yourself to verify the email arrives. If it doesn't, ping Sameer immediately.

### C â€” Stripe LIVE mode swap (Sameer)

Sameer's job â€” won't impact your work, but you should know it's happening:

1. Sameer logs into Stripe dashboard â†’ Live mode â†’ API keys â†’ copy `sk_live_...` and `pk_live_...`
2. Sameer registers a webhook endpoint in Stripe Live mode pointing to `https://annalouwellness.com/api/stripe/webhook` â†’ copies the signing secret `whsec_...`
3. Sameer swaps 3 env vars on the website hosting (Coolify):
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_WEBHOOK_SECRET` = the new `whsec_...`
4. Sameer redeploys the Next.js website
5. Sameer makes a real Â£1 test purchase from your bank card to verify end-to-end
6. The Â£1 order appears in Strapi â†’ status `paid` â†’ Mailchimp tag applied
7. Sameer refunds the Â£1 from Stripe

### D â€” Domain DNS cutover (Sameer + your hosting provider)

1. Sameer coordinates with IONOS (where the domain is registered)
2. Update the A-record for `annalouwellness.com` to point at the new server's IP (currently the old WordPress site IP)
3. DNS propagation takes 1-4 hours. During propagation, some visitors see old WordPress, some see new Next.js. Plan the cutover for a quiet time (e.g. midnight UK).
4. When propagation is complete, `annalouwellness.com` shows the new site
5. `staging.annalouwellness.com` stays live too (useful for ongoing previews)

### E â€” Update Strapi CLIENT_URL (Sameer)

After domain cutover, Sameer changes the Strapi env var `CLIENT_URL` from `https://staging.annalouwellness.com` to `https://annalouwellness.com` and restarts Strapi. This makes the live preview in CMS show the production site.

### F â€” Final verification (you both)

After all of the above:
- [ ] Visit `annalouwellness.com` from your phone â€” full site loads
- [ ] Visit a few key pages â€” homepage, a Reset Story, a programme, the shop, a product
- [ ] Add a product to cart â†’ checkout â†’ Â£1 real transaction (use a card you control)
- [ ] Order arrives in Strapi as `paid`, Mailchimp shows you tagged as `Shop Customers`, you get the workshop/Reset confirmation email in your inbox
- [ ] Sign up for Reset Letters with a personal email â†’ Founding Welcome arrives â†’ you appear in Mailchimp audience tagged `Founding Members`
- [ ] If all pass: you're live. Tell your audience.

### G â€” Old WordPress site

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
- Wait 60 seconds and refresh again â€” caching delay
- Check **Save & Publish** was clicked, not just **Save**
- Look in version history â€” confirm the latest version is published
- Still nothing? Ping Sameer.

### Customer says they paid but order still shows pending

- Stripe webhook didn't fire OR the order isn't matched. Open the order â†’ check Stripe Payment ID is set.
- If Payment ID is set: open it in Stripe dashboard â†’ confirm payment succeeded
- If yes: manually change order status to `paid`, then ping Sameer to investigate the webhook

### Mailchimp email didn't arrive

- Open the journey in Mailchimp â†’ check Reports â†’ did the email send?
- Check spam folder
- Re-test with a different email address (Gmail sometimes blocks rapid test emails)
- Verify the trigger tag was actually applied: search the subscriber in Mailchimp audience â†’ look at their Tags

### Subcategory tabs not showing under a section

The section needs at least one Article Category linked. Content Manager â†’ Article Categories â†’ check that the categories you want to show are linked to the correct parent section (Reset Stories, Life, etc.).

### Reset Letters founding count

The 500-founder cap is hardcoded based on the launch date (22 June 2026). It auto-flips from Founding to Standard on that date. To force the cap earlier or extend later, ping Sameer to change the cutoff.

---

## 14. Who to contact

**Sameer** â€” for anything to do with: the website breaking, deployments, env vars, code changes, hosting issues, Stripe webhook problems, domain DNS issues, schema changes in Strapi, custom integrations, "I tried clicking X and got an error".

WhatsApp / email â€” fastest is WhatsApp.

**Anna's bank (NatWest)** â€” payment receipt confirmation, bank transfer settlement queries.

**Stripe support** (`stripe.com/support`) â€” disputes, refund issues you can't resolve, account flagging.

**Mailchimp support** â€” billing, audience limits, deliverability issues.

**Aneeza** â€” brand artwork (logos, certification badges, the Reset Letters wordmark).

**Hettal** â€” site review feedback, content / UX discussion.

---

## 15. Glossary

- **CMS** â€” Content Management System. The Strapi admin where you edit everything.
- **Single type** â€” a Strapi entry where there's only ever one of them (like Homepage).
- **Collection type** â€” a Strapi entry where you can create many (like Articles).
- **Draft / Published** â€” a Draft is visible only to you in CMS; Published is live on the website.
- **Slug** â€” the URL-safe text part. `/reset-stories/holding-everything` has the slug `holding-everything`.
- **Hero image** â€” the big main image at the top of a page or article.
- **Tag (Mailchimp)** â€” a label on a subscriber that triggers automations.
- **Webhook** â€” Stripe sends a message to the website when a payment succeeds. Triggers order update + Mailchimp tagging.
- **DNS** â€” the system that maps `annalouwellness.com` to a server. Changing it = "cutover" or "going live".
- **Staging** â€” `staging.annalouwellness.com`, the test version. Stays live alongside the production site.
- **Production / Live** â€” the real customer-facing site at `annalouwellness.com`.
- **Cache** â€” the website remembers content for 60 seconds for speed. Why your saves take ~1 minute to appear.

---

## 16. Page-by-Page Edit Reference

This section is organised by URL. Open any page on the live website, find its URL in the Quick Reference below, then jump to the matching detail section for full editing instructions.

**Two browser tabs, side by side, work best:**
- Left tab: the live page you want to edit
- Right tab: `https://cms.annalouwellness.com/admin` (the CMS)

Edit on the right â†’ save â†’ refresh on the left to see the change appear (usually within 1â€“2 seconds).

### Two universal fields you'll see almost everywhere (read this first)

Almost every page entry in CMS now has these two fields. They're not unique to any one section, so they're documented here once instead of repeated per page:

#### `seo_title` + `seo_description`

Auto-fill themselves on Save (Claude reads the entry's name + body and writes them). Your manual edits are NEVER overwritten — once you type something, that's what stays. Leave blank to let auto-SEO run.

To bulk-fill missing SEO across every existing entry: sidebar → **SEO & AI Files** → **Run bulk SEO backfill** button at the top. Idempotent — skips anything already filled.

#### `upsells` (repeatable, max 3 cards per entry — added 12 Jun)

Three "Where next" cards rendered at the bottom of the page. Each card has:
- **Label** (required) — what's on the card
- **Link** (required) — searchable dropdown of every URL on the site. Type to filter, click to set. Paste a custom URL for external links (Calendly etc.).
- **Eyebrow** — small uppercase tag like "Next step" or "Continue"
- **Blurb** — one-line description
- **Image** — optional thumbnail

Leave the field empty to hide the upsell block entirely on the public page. The block renders as a "Where next · Continue exploring" section.

### 16.1 Quick Reference â€” every page on the site

#### Site-wide chrome (visible on every page)

| What you see on the site | Where to edit in Strapi |
|---|---|
| Logo, top strip, social URLs, SEO defaults | Single Types â†’ **Site Settings** |
| Top navigation menu (dropdowns under each item) | Single Types â†’ **Navigation** |
| Footer (legal links, columns, newsletter CTA) | Single Types â†’ **Footer** |
| Cookie banner text | Single Types â†’ **Site Settings** â†’ `cookie_banner_text` |

#### Homepage and one-off pages

| URL | Where to edit |
|---|---|
| `/` (Homepage) | Single Types â†’ **Homepage** + the 3 article cards pick from Story â†’ Article (see Â§16.3 + Â§16.7) |
| `/about` | Single Types â†’ **About Page** |
| `/about/press` | Content Manager â†’ **Pages Â· Standalone** â†’ entry with slug `about-press` |
| `/about/partnerships` | Content Manager â†’ **Pages Â· Standalone** â†’ entry with slug `about-partnerships` |
| `/contact` | Single Types â†’ **Contact Page** + Site Settings (for email/address) |
| `/testimonials` | Single Types â†’ **Testimonials Page** (hero copy) + Content Manager â†’ **Testimonial / Review** (each card) |
| `/our-mission` | Content Manager â†’ **Pages Â· Standalone** â†’ entry with slug `our-mission` |
| `/privacy-policy` | Content Manager â†’ **Pages Â· Standalone** â†’ entry with slug `privacy-policy` |
| `/terms-and-conditions` | Content Manager â†’ **Pages Â· Standalone** â†’ entry with slug `terms-and-conditions` |
| `/reset-letters` | Single Types â†’ **Reset Letters Page** |
| `/ask-anna` | No editable content (the AI assistant) |
| `/free/nervous-system-decoder` | Single Types â†’ **Decoder** (page copy) |
| `/free/nervous-system-decoder/quiz` | Single Types â†’ **Decoder Quiz (Free)** (hero + 3 result blurbs) |
| `/the-work/regulated` | Content Manager â†’ **Work Â· Programme** â†’ entry `regulated` (pay-what-you-feel course) |

#### Work with Anna

| URL | Where to edit |
|---|---|
| `/the-work` (hub) | Single Types â†’ **Work With Anna Page** |
| `/the-work/the-reset` | Content Manager â†’ **Work Â· Programme** â†’ slug `the-reset` |
| `/the-work/signal` | Content Manager â†’ **Work Â· Programme** â†’ slug `signal` |
| `/the-work/signal-and-build` | Content Manager â†’ **Work Â· Programme** â†’ slug `signal-and-build` |
| `/the-work/one-day` | Content Manager â†’ **Work Â· Programme** â†’ slug `one-day` |
| `/the-work/signal-collective` | Content Manager â†’ **Work Â· Programme** â†’ slug `signal-collective` |
| `/the-work/recovery` | Content Manager â†’ **Work Â· Programme** â†’ slug `recovery` |
| `/the-work/sessions` | Single Types â†’ **Sessions Hub Page** + Content Manager â†’ **Work Â· Coaching Session** |
| `/the-work/sessions/{slug}` | Content Manager â†’ **Work Â· Coaching Session** â†’ matching slug |
| `/the-work/quiz` | Single Types â†’ **Quiz Page** |
| `/the-work/ways-to-work-with-me` | Content Manager â†’ **Pages Â· Standalone** â†’ slug `the-work-ways-to-work-with-me` |

#### Experiences

| URL | Where to edit |
|---|---|
| `/experiences` (hub) | Single Types â†’ **Experiences Landing Page** |
| `/experiences/retreats` | Content Manager â†’ **Experiences · Category Pages** slug `retreats` + Content Manager â†’ **Experiences · Event Bookings** (dates) |
| `/experiences/workshops` | **Experiences · Category Pages** slug `workshops` + **Experiences · Event Bookings** |
| `/experiences/corporate-wellbeing` | **Experiences · Category Pages** slug `corporate-wellbeing` |
| `/experiences/speaking` | **Experiences · Category Pages** slug `speaking` |

#### Community

| URL | Where to edit |
|---|---|
| `/community` (hub) | Single Types â†’ **Community Page** |
| `/community/the-returning-circle` | Content Manager â†’ **Community Event Page** â†’ slug `the-returning-circle` |
| `/community/reset-room` | Single Types â†’ **Reset Room Page** |
| `/community/reset-room/vault` (members) | Content Manager â†’ **Reset Room Â· Vault Journey** |
| `/community/reset-room/replays` (members) | Content Manager â†’ **Reset Room Â· Workshop Replay** |
| `/community/membership` | Single Types â†’ **Membership Page** |
| `/community/events` | Content Manager â†’ **Community Event Page** slug `events` + Content Manager â†’ **Experiences · Event Bookings** |
| `/community/resources` | Content Manager â†’ **Pages Â· Standalone** â†’ slug `community-resources` |

#### Editorial sections (magazine)

| URL | Where to edit |
|---|---|
| `/reset-stories` (hub) | Single Types â†’ **Reset Stories Page** |
| `/reset-stories/{slug}` | Content Manager â†’ **Story Â· Article** â†’ matching slug |
| `/reset-stories/{category}` (sub-category landing) | Content Manager â†’ **Story Â· Category** â†’ matching slug |
| `/life`, `/love-and-relationships`, `/work-and-money` (hubs + categories + articles) | Same pattern as Reset Stories â€” Single Type for hub copy, **Story Â· Category** for sub-pages, **Story Â· Article** for individual articles |
| `/mantras` | Single Types â†’ **Mantras Page** + Content Manager â†’ **Story Â· Mantra** |
| `/cosmic-forecast` | Content Manager â†’ **Story Â· Cosmic Forecast** |

#### Shop

| URL | Where to edit |
|---|---|
| `/shop` (hub) | Single Types â†’ **Shop Page** |
| `/shop/{slug}` (individual product) | Content Manager â†’ **Shop Â· Product** â†’ matching slug |
| `/shop?category={slug}` (category filter) | Content Manager â†’ **Shop Â· Category** (tick `is_visible_in_nav` to add to dropdown) |
| `/shop/emotional-support-jewellery` | Single Types â†’ **Shop ESJ Page** |
| `/shop/new-in` | Single Types â†’ **Shop New In Page** |
| `/shop/personalised` | Single Types â†’ **Shop Personalised Page** |

#### Other / system

| URL | Where to edit |
|---|---|
| FAQ accordion at bottom of any page | Content Manager â†’ **FAQ Â· Per Page** â†’ filter by `page` field |
| Email signup forms | Mailchimp-driven, see Â§8 |
| `/cart`, `/checkout`, `/thank-you` | Stripe-driven, copy in code (ask Sameer) |
| `/login`, `/account`, member dashboards | Auth flows â€” no editable content |

### 16.2 Site-wide settings (Site Settings, Navigation, Footer)

Three Single Types control everything that appears across every page. Edit once â†’ applies everywhere.

#### Site Settings

**Strapi:** Single Types â†’ **Site Settings**

The global control panel. Key fields:

| Field | What it controls |
|---|---|
| `site_name` | Browser tab suffix, SEO meta. Default: "Anna Lou Wellness" |
| `site_tagline` | Below logo in some headers; SEO meta description |
| `logo` | Top-nav logo. Upload SVG ideally, or transparent PNG 600Ã—600 |
| `favicon` | Browser tab icon |
| `og_default_image` | Social share image (1200Ã—630 JPG). Used when a specific page doesn't set its own |
| `seo_description` | Default Google meta description (<160 chars) |
| `instagram_url`, `facebook_url`, `youtube_url`, `tiktok_url`, `linkedin_url`, `substack_url`, `podcast_url` | Footer + nav social links. Blank â†’ icon hidden. Use full `https://...` URLs |
| `email` | Contact email shown in footer + Contact page |
| `address` | Postal address shown in footer |
| `notification_email` | Where order notifications go |
| `cookie_banner_text` | Wording in the cookie consent bar |
| `footer_copyright` | Bottom line of the footer |
| `maintenance_mode` (boolean) | If ticked, site shows a maintenance message instead of normal content. **Use with care.** |

#### Navigation

**Strapi:** Single Types â†’ **Navigation**

| Field | What it controls |
|---|---|
| `top_strip_text` | Small dot-separated line above the logo. Decorative, not clickable |
| `items` (repeatable) | Each top-level menu item |

Per item: `label` (the menu word), `href` (where it links â€” `/path` for internal), `colour` (hex accent), `children` (the dropdown â€” same shape).

**To add Client Stories under About:** open the "About" item â†’ scroll to its `children` â†’ click **+ Add an entry** â†’ label `Client Stories`, href `/testimonials` â†’ save.

#### Footer

**Strapi:** Single Types â†’ **Footer**

| Field | What it controls |
|---|---|
| `closing_message` | Big italic line at the bottom |
| `substack_cta_label` + `substack_cta_url` | Newsletter button |
| `explore_links`, `connect_links`, `legal_links` (each repeatable) | The three footer columns. Each entry is label + href |

**Important:** every internal `href` MUST start with a `/` (e.g. `/privacy-policy`, not `privacy-policy`) or the link 404s.

### 16.3 The Homepage (`/`)

**Strapi:** Single Types â†’ **Homepage** (most fields) + Story â†’ Article (the 3 article cards).

#### Anatomy, top to bottom

**1. Issue line** â€” `issue_line` + `inside_this_issue_line`

**2. Hero block** (text left, image + Substack box right):
- Left text: `hero_kicker`, `hero_title`, `hero_body`, `hero_cta_primary_label`/`url`, `hero_cta_secondary_label`/`url`
- Right image: `hero_image` (portrait or square)
- Right Substack box: `hero_substack_kicker`, `hero_substack_title`, `hero_substack_cta_label`, `hero_substack_cta_url`
- Mobile: image first (hook), then text, then box

**3. Featured Reset Story** â€” long-form excerpt with drop-cap. The article shown is whichever Story Â· Article has `is_featured` ticked. Fallback fields on Homepage: `featured_fallback_title`, `_author`, `_reading_time`, `_excerpt`.

**4. The 3-card article grid:**
- Articles with `is_homepage_pinned` ticked appear first (ordered by `homepage_pin_order`, lower = earlier).
- If fewer than 3 pinned, remaining slots fill with most-recent non-pinned, non-featured articles.
- Pin up to 3 for exact control. Pin 0 for automatic.

**5. Section colour blocks** â€” four pillar promos. Each has `*_block_kicker`, `_title`, `_body` (reset_stories, life, love, work_money).

**6. Work with Anna teaser** â€” `work_kicker`, `work_title`, `work_body`, `work_cta_label`/`url`, `work_image`.

**7. Community teaser** â€” same shape with `community_*` prefix.

**8. Reviews section** â€” 3 testimonials where `is_featured = true` on the Testimonial entry. "Read all" link goes to `/testimonials`.

**9. Press + certifications** â€” Content Manager â†’ **Trust Â· Press Mention** + **Trust Â· Certification Badge**, with `is_homepage_featured` flag on each.

**10. Newsletter / Substack final block** â€” `newsletter_kicker`, `_title`, `_body`, `_cta_label`, `_cta_url`.

#### Common homepage edits

| You want to... | Do this |
|---|---|
| Change the big hero headline | Homepage â†’ `hero_title` |
| Replace the hero image | Homepage â†’ `hero_image` â†’ upload new |
| Update the Substack box wording | Homepage â†’ 4 `hero_substack_*` fields |
| Pick a different featured article | Story Â· Article â†’ tick `is_featured` on your choice, untick the old one |
| Curate the 3 small article cards | Story Â· Article â†’ tick `is_homepage_pinned` on up to 3 |
| Swap a homepage testimonial | Testimonial / Review â†’ adjust `is_featured` flags |
| Add a press logo | Trust Â· Press Mention â†’ + Create â†’ upload logo + tick `is_homepage_featured` |

#### Surfacing content to the homepage â€” cheat sheet

Most homepage sections aren't edited on the Homepage form â€” they pull from other collections via a "show on homepage" tick. Here's every one in one place. **Find the entry you want to feature â†’ open it â†’ tick the right flag â†’ save.**

| Homepage section | Where the content lives | What to tick / fill |
|---|---|---|
| Big featured story (with drop-cap) | Story Â· Article | `is_featured` (only one wins â€” most recent if multiple) |
| The 3 article cards below | Story Â· Article | `is_homepage_pinned` on up to 3 articles. Set `homepage_pin_order` (1, 2, 3) to lock the left-to-right order |
| Reviews row (3 testimonials) | Testimonial / Review | `is_featured` on the 3 you want shown. Adjust `sort_order` (lower = earlier) for ordering |
| "Jewellery with meaning" product row (3 cards) | Shop Â· Product | `is_homepage_featured` on the products you want shown. Also fill `homepage_hook` (the italic Anna's-voice line on the card) |
| "As seen in" press logo strip | Trust Â· Press Mention | `is_homepage_featured` on each logo. `sort_order` controls left-to-right |
| "Certified" badge strip | Trust Â· Certification Badge | `is_homepage_featured` on each badge. `sort_order` for ordering |

For everything else on the homepage (the hero copy, the four pillar promos, the Work / Community teasers, the newsletter band), edit fields **directly on the Homepage singleton** â€” they're not pulled from other collections.

**One rule of thumb:** if it's a single piece of text/image, look in Homepage singleton. If it's a list of cards (articles, reviews, products, logos), look in the matching collection and find the `_homepage_` flag.

### 16.4 About, Contact, and standalone pages

#### `/about`

**Strapi:** Single Types â†’ **About Page**

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

Both are standalone pages. Content Manager â†’ **Pages Â· Standalone** â†’ find entry with slug `about-press` or `about-partnerships`. Standard fields (see Â§16.5 below).

#### `/contact`

**Strapi:** Single Types â†’ **Contact Page** (hero copy) + Site Settings (email/address shown).

Form is hardcoded â€” to change fields or destination, ask Sameer.

#### Standalone pages (`/our-mission`, `/privacy-policy`, `/terms-and-conditions`, and any new ones)

**Strapi:** Content Manager â†’ **Pages Â· Standalone (Mission, Cookies, etc.)**

Common fields per entry:

| Field | What it controls |
|---|---|
| `title` | Big page heading |
| `slug` | URL after the domain. **Don't change on existing pages** â€” footer links would break |
| `kicker` | Small uppercase label above title |
| `kicker_colour` | Hex colour. Pink `#F280AA`, blue `#7BAFDD`, gold `#FAA21B`, mint `#5DCAA5`, plum `#6E3A5A` |
| `tagline` | Italic subtitle (one sentence) |
| `hero_image` | Optional landscape image at the top |
| `intro` | Main body â€” use the toolbar editor (H2/H3, bold, italic, lists, links, quotes). Blank lines between paragraphs |
| `cta_label` + `cta_url` | Optional button at the bottom |
| `seo_title`, `seo_description` | Optional SEO overrides |

**Pasting from Word:** the richtext editor strips most Word formatting. Two options:
1. Paste plain text â†’ re-apply formatting using the toolbar buttons (H2 for sections, B for bold, list buttons for bullets).
2. Send the Word doc to Sameer â€” he runs a script that imports it cleanly with formatting preserved.

#### Add a brand new standalone page (e.g. Cookies, Returns)

1. Content Manager â†’ **Pages Â· Standalone** â†’ **+ Create new entry**
2. Fill the fields. The slug becomes the URL (`cookies` â†’ `/cookies`).
3. **Save & Publish.** Page is live within 1â€“2 seconds.
4. To link from the footer: Single Types â†’ **Footer** â†’ add an entry to `legal_links` with the matching href (e.g. `/cookies`).

No dev work needed.

### 16.5 Testimonials (`/testimonials`)

**Strapi:**
- Single Types â†’ **Testimonials Page** â€” hero copy at the top
- Content Manager â†’ **Testimonial / Review** â€” each individual card

| Field | What it controls |
|---|---|
| `quote` | The testimonial text |
| `reviewer_name` | Who said it |
| `reviewer_location` | Their context (e.g. "Reset alumna", "Houseboat retreat") |
| `photo` | Upload to make this a photo card |
| `youtube_url` | Paste a YouTube URL to embed as a video card |
| `video` + `video_thumbnail` | Alternative: upload MP4 + poster image |
| `display_style` | `card` (default 3-col grid) or `banner` (full-width plum block â€” use sparingly, one every 6 cards) |
| `tag` | Optional â€” bind to a specific page (e.g. `retreats`, `the-reset`) so it also shows in that page's reviews section |
| `is_featured` | Tick â†’ also appears on homepage's 3-review row |
| `sort_order` | Lower = appears earlier |
| `is_active` | Untick â†’ hides from the site without deleting |

**Add a new testimonial:** Content Manager â†’ Testimonial / Review â†’ + Create â†’ at minimum fill `quote` + `reviewer_name` â†’ save & publish. Add a photo or YouTube URL for richer formats.

### 16.6 Common tasks (cheatsheet)

**Save / publish:**
- Single Types: just **Save** (publishes immediately)
- Collection Types: **Save** = draft only, **Save & Publish** = live

**See a change immediately:** hard-refresh with Ctrl + Shift + R after saving.

**Undo a mistake:** clock icon (top right of edit screen) â†’ Version History â†’ pick earlier version â†’ Restore.

**Upload images:**
- From the edit form: click any image field â†’ drag-drop or browse
- Pre-upload: left sidebar â†’ Media Library â†’ drag-drop

**Recommended image sizes:**
- Hero / large feature: 1600Ã—1200+ JPG or PNG
- Square / product / portrait: 1500Ã—1500
- Logo / badge: SVG ideally, or transparent PNG 600Ã—600
- Social share: 1200Ã—630 JPG

Strapi automatically generates 5 resized variants. Upload once at full res.

**Brand colour palette** (use anywhere a hex code is asked for):
- Plum `#6E3A5A` â€” Reset Stories, deep editorial, primary CTAs
- Pink `#F280AA` â€” Love & Relationships, soft moments
- Gold `#FAA21B` â€” Life, ritual
- Mint `#5DCAA5` â€” Shop, fresh things
- Blue `#7BAFDD` â€” Experiences, water
- Cream `#FFD07A` â€” Work & Money

### 16.7 Programme pages (The Reset, Signal, Signal & Build, One Day, Signal Collective, Recovery)

**Strapi:** Content Manager â†’ **Work Â· Programme** â†’ each programme is one entry.

All six programme pages share the same template, so the field walkthrough below applies to every entry â€” only the slug, copy, colour, and price change. To edit `/the-work/the-reset`, open the Work Â· Programme entry with slug `the-reset`. Same pattern for `signal`, `signal-and-build`, `one-day`, `signal-collective`, `recovery`.

#### The fields, in the order they appear on the page

| Field | What it controls | Notes |
|---|---|---|
| `title` | Big heading at the top of the page (e.g. "The Reset.") | Keep punctuation if it's part of the brand voice (the trailing dot is intentional) |
| `slug` | URL after `/the-work/` (e.g. `the-reset`). **Don't change** on existing programmes â€” links across the site would break | |
| `tagline` | Italic single-line subtitle under the title | One sentence. "Six weeks. One-to-one. Signal back online." |
| `accentColour` | Hex code that tints the page (kicker colour, button accents, section labels) | Pink `#F280AA`, blue `#7BAFDD`, gold `#FAA21B`, mint `#5DCAA5`, plum `#6E3A5A` |
| `heroImage` | Image on the right side of the hero | Portrait orientation works best (4:5). 1600Ã—2000 ideal. |
| `intro` | The main long-form body below the hero. **Separate paragraphs with a blank line** between them | Each blank line = new paragraph on the page |
| `whatsIncludedLabel` | Heading above the bullet-list section | Default: "What's included" |
| `whatsIncludedItems` | The bullet points themselves. **One bullet per line.** No `-` prefix needed â€” each line becomes a bullet | "Six 1:1 sessions, weekly, 60 minutes each" |
| `approachLabel` + `approachBody` | Optional second info section (heading + body). Leave both blank to hide | Use for "The approach", "How it works", etc. |
| `outcomesLabel` + `outcomesBody` | Optional third info section. Same shape | Use for "What changes", "What you'll leave with" |
| `pricingLabel` | Heading above the price block | Default: "Investment" |
| `pricingBody` | Price details in prose | "Â£1,500. Paid in full or two instalments of Â£750." |
| `ctaLabel` + `ctaUrl` | The big button at the bottom of the page | Default: "Book a discovery call" â†’ `/contact` |
| `displayOrder` | Lower numbers show first in lists. Used to order programmes on `/the-work` hub | Default 100 â€” change only if reordering |
| `stagesList` | Optional. Only used by Recovery (Untangle / Unbind / Unbound). **One stage per line, format: `Label\|Title\|Body`** | Example: `Month One\|Untangle.\|We identify where the patterns live.` Leave blank for non-staged programmes |

#### Stripe / payment fields (advanced â€” usually set once)

| Field | What it controls |
|---|---|
| `pricePence` | Programme price in **pence** (1500.00 GBP = `150000`). Leave `0` for "by enquiry" programmes â€” Stripe checkout button won't show |
| `currency` | 3-letter ISO code, lowercase. Default `gbp` |
| `isRecurring` | Tick only if billed monthly/yearly. Leave OFF for normal programmes |
| `recurringInterval` | `month` or `year`. Only relevant when `isRecurring` is on |
| `mailchimpTag` | The exact Mailchimp tag attached to a customer on successful payment. **Case-sensitive â€” must match Mailchimp exactly.** Examples: "The Reset (6-week)", "Signal (12-week)" |
| `grantsResetRoomAccess` | Leave OFF. Only the Reset Room membership entry has this on |
| `seoTitle` + `seoDescription` | Optional SEO overrides. Keep description <160 chars |

#### Common programme edits

| You want to... | Do this |
|---|---|
| Change The Reset's price | Work Â· Programme â†’ entry `the-reset` â†’ update `pricingBody` (the prose) + `pricePence` (the Stripe-charged value). Keep both in sync |
| Rewrite the body copy | Update `intro`. Use blank lines for paragraph breaks |
| Add/remove a bullet from "What's included" | Edit `whatsIncludedItems` â€” one bullet per line. Reorder by moving lines |
| Swap the hero image | Upload a new one to `heroImage`. Old one stays in Media Library |
| Add a "What changes" section | Fill `outcomesLabel` + `outcomesBody`. Both must have content for the section to appear |
| Re-route the discovery call button to a Calendly link | Update `ctaUrl` to the full Calendly URL |

#### Add a new programme

1. Content Manager â†’ Work Â· Programme â†’ **+ Create new entry**.
2. Fill `title` (e.g. "New Programme") â€” `slug` auto-generates.
3. Fill the rest of the fields (intro, what's included, pricing, etc.).
4. Set `displayOrder` to control where it sits in the /the-work hub list.
5. **Save & Publish.** The page is live at `/the-work/{your-slug}` within seconds.
6. If you want it linked from the main nav, also add an entry to Navigation â†’ Work with Anna â†’ children.

### 16.8 1:1 Sessions (`/the-work/sessions` + individual sessions)

The Sessions page has two layers:

1. **Hub page** (`/the-work/sessions`) â€” the top section with the heading + intro copy
2. **Individual session cards** â€” one card per coaching session type (Dating Reset, Founder Reset, Nervous System Reset)

#### Hub page

**Strapi:** Single Types â†’ **Sessions Hub Page**

Fields:

| Field | What it controls |
|---|---|
| `kicker` | Small uppercase label above the heading |
| `kicker_colour` | Hex colour for the kicker |
| `title` | Main heading (e.g. "1:1 Reset Sessions") |
| `intro` | The intro paragraph(s) below the heading. Blank line between paragraphs |
| `seo_title`, `seo_description` | Optional SEO overrides |

#### Individual session cards

**Strapi:** Content Manager â†’ **Work Â· Coaching Session** â†’ one entry per session

Fields per session:

| Field | What it controls |
|---|---|
| `name` | Session name (e.g. "Founder Reset") |
| `slug` | URL after `/the-work/sessions/` (e.g. `founder-reset`) |
| `tagline` | The one-line hook under the title on the card |
| `description` | Long body for the session detail page. Richtext (bold, italic, lists via toolbar) |
| `duration` | Free-text, e.g. "60 minutes", "90 minutes" |
| `price` | Numeric price (e.g. `200` for Â£200) |
| `price_label` | Free-text price display (e.g. "Â£200 per session", "Enquire", "From Â£200") |
| `accent_colour` | Hex code for the card's accent line + page colour. Pink for Dating, gold for Founder, blue for Nervous System |
| `hero_image` | Image at the top of the individual session page |
| `is_active` | Untick to hide from the site without deleting |
| `sort_order` | Lower number = appears earlier on the hub grid |

#### Common session edits

- **Add a new session:** Coaching Session â†’ + Create â†’ fill name (slug auto), tagline, description, price â†’ save. It auto-appears on `/the-work/sessions` and is live at `/the-work/sessions/{slug}`.
- **Reorder sessions on the hub:** adjust `sort_order` on each. Lower wins.
- **Temporarily hide a session:** untick `is_active`. Re-tick to bring back.

### 16.9 Experiences (Retreats, Workshops, Corporate Wellbeing, Speaking)

Two layers, same as sessions:

1. **Each experience type page** â€” the hero + intro at `/experiences/retreats`, `/experiences/workshops`, etc.
2. **Individual upcoming events** â€” the actual retreat/workshop instances that get listed on those pages

#### Each experience page

**Strapi:** Content Manager â†’ **Experiences · Category Pages** â†’ one entry per experience type (`retreats`, `workshops`, `corporate-wellbeing`, `speaking`)

Fields:

| Field | What it controls |
|---|---|
| `title` | Heading (e.g. "Workshops") |
| `slug` | URL â€” must match exactly: `retreats`, `workshops`, `corporate-wellbeing`, `speaking` |
| `kicker` + `kickerColour` | Small uppercase label above the title and its colour |
| `eyebrow` | Optional secondary label (e.g. "Experiences Â· For teams") |
| `tagline` | Optional italic one-liner under the title |
| `heroImage` | Top-of-page image |
| `intro` | Body copy. Blank lines = paragraph breaks |
| `ctaLabel` + `ctaUrl` | Optional button (e.g. "View upcoming workshops" â†’ `/community/events`) |
| `secondaryList` | Optional. For pages with a list of cards (Corporate "Formats" grid, Speaking "Talks" list). **One item per line, format: `Title\|Body`** |
| `seoTitle`, `seoDescription` | Optional SEO overrides |

#### Individual upcoming events

**Strapi:** Content Manager â†’ **Experiences · Event Bookings** â†’ one entry per upcoming retreat / workshop / etc.

These power the "Book your place" grids on each experience page (and on `/community/events`).

Fields per event:

| Field | What it controls |
|---|---|
| `name` | Event title (e.g. "Houseboat Nervous System Reset Â· 27 June") |
| `slug` | URL slug (auto-generated from name) |
| `type` | `retreat`, `workshop`, `corporate`, or `speaking` â€” determines which experience page lists it |
| `description` | Long body (richtext). Shown on the card and event detail |
| `date` | Date of the event |
| `location` | e.g. "Taggs Island, Hampton" or "Online (Zoom)" |
| `price` | Numeric price |
| `price_label` | Display label, e.g. "Â£115 Â· Day immersion", "Pay what you can" |
| `hero_image` | **Now used as the card image** on /experiences/retreats etc. (16 Jun upgrade). Upload a landscape JPG at least 1600×1000px. Cards stack 3-2-1 across desktop/tablet/mobile and lead with this photo. Date overlays as a coloured pill. Empty = placeholder card. |
| `booking_url` | **Where the "Book this place" button links to.** Paste a Stripe checkout URL, Calendly, Eventbrite — anything. Calendly links open as a popup so visitors stay on your site. **Leave blank** to fall back to a /contact link. |
| `is_upcoming` | Tick to show in upcoming lists. Untick when the date has passed |
| `is_active` | Untick to hide entirely |
| `sort_order` | Lower = earlier in the list |
| `upsells` | Up to 3 "where next" cards shown at the bottom of the event's detail page. Pick label, link (dropdown of every page on the site), eyebrow, blurb, image. Leave empty to hide the block. |

#### Common experience edits

- **Add a new retreat:** Experiences · Event Bookings â†’ + Create â†’ `type = retreat`, fill name/date/location/price, paste booking link in `booking_url` â†’ save. Auto-appears on `/experiences/retreats` and `/community/events`.
- **Workshop sold out:** untick `is_upcoming` on the event entry (keeps the entry for archive purposes; just hides from upcoming lists).
- **Change the booking destination for an event:** edit `booking_url`. If you want to revert to "open my email", just clear that field.
- **Edit the page hero copy for /experiences/retreats:** Experiences · Category Pages â†’ entry `retreats` â†’ update `intro`.

### 16.10 Articles (write, format, publish)

This is the editorial collection. Every Reset Story, Life piece, Love & Relationships, Work & Money article is one entry in this collection.

**Strapi:** Content Manager â†’ **Story Â· Article**

#### Fields

| Field | What it controls |
|---|---|
| `title` | Article title. Appears as the H1 on the article page |
| `slug` | URL slug (auto from title). Final URL is `/{section}/{slug}` based on category |
| `excerpt` | Short summary (1-2 sentences). Shown on article cards across the site and in the homepage featured area |
| `body` | The full article body. Richtext â€” use toolbar for headings, bold/italic, lists, links, quotes. **Blank line between paragraphs** |
| `hero_image` | Main article image. Landscape works best (16:9 or 4:3) |
| `category` | **Required.** Pick from Story Â· Category. The category's `section` field (reset-stories / life / love-and-relationships / work-and-money) determines which URL section the article lives in |
| `author` | Default: "Anna Lou". Change for guest writers |
| `reading_time` | Free-text, e.g. "6 min read", "2 min read" |
| `is_featured` | Tick to make this the big banner article on the homepage. Only one should be ticked at a time (most recent wins if multiple) |
| `is_homepage_pinned` | Tick to lock this article into one of the 3 homepage cards |
| `homepage_pin_order` | Among pinned articles, lower number = earlier (1 = leftmost) |
| `is_free` | Tick = full article shows on the website. Untick = paywall + Substack-only |
| `substack_canonical_url` | If the article also lives on Substack, paste the Substack URL here. Adds a "Read on Substack â†’" link and sets the SEO canonical |
| `related_products` | Optional. Link to Shop products to make a "Shop the story" section |
| `shop_tags` | Repeatable. Each tag is a photo + product link with a hover caption ("Anna is wearing the [piece]"). Use only when a product is central to the story |
| `seo_title` + `seo_description` | Optional SEO overrides |

#### Write a new article â€” step by step

1. Content Manager â†’ Story Â· Article â†’ **+ Create new entry**
2. Fill `title` â†’ `slug` auto-generates
3. Write the `excerpt` â€” this shows on cards, so make it pull people in
4. Write the `body` using the toolbar â€” use H2 for sections, **bold** for emphasis, blockquotes for pull quotes
5. Upload `hero_image` (landscape, ideally 1600Ã—900 or larger)
6. Pick a `category` â€” this decides the URL section
7. Set `reading_time` ("3 min read" etc.)
8. Decide flags:
   - `is_free` â€” almost always ticked (untick only for paywalled paid articles)
   - `is_featured` â€” only tick if you want this to be the big homepage banner (untick the previous one)
   - `is_homepage_pinned` â€” tick if you want to control which articles are in the 3-card grid
9. **Save & Publish.** The article is live at `/{section}/{slug}` (e.g. `/life/houseboat-life`) within seconds.

#### Common article edits

- **Change which article is the homepage featured one:** untick `is_featured` on the current one â†’ tick on the new one â†’ save both.
- **Re-categorise an article:** change `category` â†’ the URL section changes automatically (the slug stays the same).
- **Hide an article without deleting it:** the easiest way is to set `category` to nothing and the article disappears from listings (but is still accessible by URL). Cleaner: untick the published state.
- **Add "Shop the story" photos:** in the article, expand `shop_tags` â†’ + Add an entry â†’ upload a photo, link to a product â†’ set caption prefix and alt text. Repeat for each photo.

### 16.11 Editorial section hubs (Reset Stories / Life / Love & Relationships / Work & Money)

Each of the four editorial sections has a hub page and a set of sub-category landing pages.

#### Section hubs

**Strapi:** Single Types â€” one per section:
- **Reset Stories Page** â€” `/reset-stories`
- **Life Page** â€” `/life`
- **Love And Relationships Page** â€” `/love-and-relationships`
- **Work And Money Page** â€” `/work-and-money`

Each has the same fields:

| Field | What it controls |
|---|---|
| `kicker` + `kicker_colour` | Small uppercase label above the title |
| `title` | Main heading |
| `tagline` / `intro` | Body copy below the title |
| `hero_image` | Top-of-page image (optional â€” most use brand colour blocks instead) |
| Various block fields (`featured_kicker`, `recent_label`, etc.) | Headings for sub-sections of the hub |
| `seo_title`, `seo_description` | Optional SEO overrides |

The actual articles shown on each hub come from the **Story Â· Article** collection â€” articles whose `category.section` matches that hub.

#### Sub-category landing pages

URLs like `/life/rituals-and-energy`, `/love-and-relationships/motherhood` â€” each is a landing page for one sub-category showing all articles in that category.

**Strapi:** Content Manager â†’ **Story Â· Category**

Fields:

| Field | What it controls |
|---|---|
| `name` | Display name (e.g. "Motherhood") |
| `slug` | URL slug â€” **must match the nav link exactly** (e.g. `motherhood`) |
| `section` | Which top-level section this category lives under (`reset-stories`, `life`, `love-and-relationships`, `work-and-money`) |
| `colour` | Hex accent colour. Matches the section colour by default |
| `description` | Subtitle shown on the category landing page |
| `sort_order` | Lower = earlier in lists |

#### Common edits

- **Rename a category:** open the entry â†’ change `name`. **Do NOT change `slug`** unless you also update the nav link, or the URL will 404.
- **Add a new sub-category:** Story Â· Category â†’ + Create â†’ name + section + colour + description. Then add it to Navigation â†’ matching section â†’ children, with href `/{section}/{slug}`.
- **Articles in the new category:** open any article â†’ set its `category` to the new one.

### 16.12 Community pages

#### `/community` (hub)

**Strapi:** Single Types â†’ **Community Page**

Standard hub-page fields: kicker, title, intro, plus headers for each block (Reset Room, Returning Circle, Events, Resources).

#### `/community/reset-room`

**Strapi:** Single Types â†’ **Reset Room Page**

A long page. Fields are grouped by section in the form:

- **Hero:** `hero_eyebrow`, `hero_title`, `hero_tagline`, `hero_cta_label`, `hero_secondary_label`, `hero_image`
- **What's inside / pillars:** repeatable list of pillar cards
- **Vault preview:** copy + link to vault
- **Live call info:** schedule, format
- **Pricing:** `price_title`, `price_body`, `price_cta_label`
- **SEO**: standard fields

Each field has an inline description in Strapi explaining where it shows on the page. Edit any field â†’ live in 1-2 seconds.

#### `/community/reset-room/vault` (members only) â€” audio meditations, e-books, journeys

The Reset Room vault is the library Reset Room members log in to. One entry per item â€” audio meditation, e-book, workbook, or guided journey. The `kind` field acts as folders for members (filter pills at the top of the page).

**Strapi:** Content Manager â†’ **Reset Room Â· Vault Journey** â†’ **+ Create new entry**

##### To upload an audio meditation

1. Fill `name` â€” title of the meditation (e.g. "Coming Back Online")
2. Fill `description` â€” 1-2 sentences shown on the card
3. Set `kind` = **"Audio meditation"**
4. Fill `duration` â€” free text, e.g. "12 min"
5. Upload your MP3 in **`audio_file`**
6. Optional: upload a thumbnail in `video_thumbnail` (acts as the cover image â€” 1280Ã—720 JPEG, max 500KB)
7. Pick a `tone_colour` (hex, brand colours: #F280AA pink, #FFD07A yellow, #7BAFDD blue, #5DCAA5 green, #FAA21B amber, #6E3A5A plum)
8. Set `sort_order` â€” lower numbers appear earlier in the grid
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

On `/community/reset-room/vault` they see filter pills at the top: **All / Audio meditation / E-book / Foundational journey / Workbook / Daily practice** etc. They click a pill, only that kind shows. So everything tagged the same way lives together for them â€” categories work like folders.

##### Organising your own uploaded files

Strapi â†’ **Media Library** (left sidebar) â†’ you can create folders here for your own admin convenience (e.g. "Meditations 2026", "E-books"). This is just for your file management â€” members see content via the Vault, not the Media Library.

All Vault fields at a glance:

| Field | What it controls |
|---|---|
| `name` | Title shown on the card and at the top of the detail page |
| `slug` | URL slug (auto-generates from name) |
| `description` | Short description shown on the grid card (1-2 sentences) |
| `kind` | Filter tag â€” acts as folders for members. New options: Audio meditation, E-book, Workbook |
| `tone_colour` | Hex accent colour for the card border + filter |
| `duration` | Free-text, e.g. "12 min", "20 mins", "85 pages" |
| `audio_file` | MP3 upload â€” for meditations or journey audio |
| `video_url` | Optional video embed URL (Bunny.net, YouTube unlisted, any iframe) |
| `video_thumbnail` | Poster / cover image (1280Ã—720 JPEG, max 500KB) |
| `companion_pdf` | PDF upload â€” use this for e-books, workbooks, or companion docs |
| `body` | Full "About this" content shown below the player / on the detail page |
| `recorded_date` | When this was recorded (optional, shown in metadata) |
| `sort_order` | Lower = appears earlier in vault grid |
| `is_active` | Untick to hide without deleting |

#### `/community/reset-room/replays` (members only)

Recordings of past workshops + monthly live calls.

**Strapi:** Content Manager â†’ **Reset Room Â· Workshop Replay**

Fields:

| Field | What it controls |
|---|---|
| `title` | Replay title |
| `slug` | URL slug |
| `description` | Short description shown on the card |
| `kind` | Monthly live call, Workshop, Q&A session, Special event |
| `recorded_date` | **Required.** Date â€” sorted newest-first on the page |
| `duration` | e.g. "90 min", "45 min" |
| `video_url` | Embed URL (Bunny.net or similar) |
| `video_thumbnail` | Poster image |
| `audio_file` | Optional audio-only version for the podcast feed |
| `body` | Show notes, summary, links (richtext) |
| `is_active` | Hide without deleting |

#### `/community/membership` (the Reset Room signup page)

**Strapi:** Single Types â†’ **Membership Page**

Standard fields: kicker, title, intro paragraphs, price details, CTA label.

The actual signup â†’ Stripe checkout flow is wired automatically â€” Anna doesn't need to do anything Stripe-related, just edit the copy.

#### `/community/the-returning-circle`, `/community/events`

Both use the **Community Event Page** collection. Open the entry with the matching slug (`the-returning-circle` or `events`) and edit kicker/title/intro/cta.

`/community/events` also pulls upcoming events from Experiences · Event Bookings (any event with `is_upcoming` ticked appears in the list below the hero).

#### `/community/resources`

Standalone page (Pages Â· Standalone, slug `community-resources`). Standard fields as in Â§16.4.

### 16.13 Shop products + categories

#### Products

**Strapi:** Content Manager â†’ **Shop Â· Product** â†’ one entry per product

Fields:

| Field | What it controls |
|---|---|
| `name` | Product name (e.g. "Citrine Strength Bracelet") |
| `slug` | URL slug (auto) â€” final URL is `/shop/{slug}` |
| `description` | Long product description (richtext) |
| `short_description` | One-line tagline shown on product cards |
| `price` | Numeric price (e.g. `48.00` for Â£48) |
| `compare_at_price` | Optional. If set higher than `price`, the product shows a sale price + strikethrough on the original |
| `category` | Pick from Shop Â· Category. **Required for the product to show in the right shop section** |
| `images` | Multiple uploads. The first one is the main thumbnail; the rest become a gallery |
| `stock` | Numeric stock count. Drops automatically when orders are placed |
| `is_featured` | Generic featured flag (in-shop carousel etc.) |
| `is_homepage_featured` | Show in the "Jewellery with meaning" homepage row. Top 3 by `sort_order` win |
| `homepage_hook` | Italic line shown on the homepage product card (Anna's voice â€” "I reach for this one when I needâ€¦") |
| `is_active` | Untick to hide from the shop without deleting |
| `sku` | Optional SKU code |
| `weight_grams` | Used for shipping calculations |
| `tax_class` | `standard`, `reduced`, or `zero` |
| `tags` | Comma-separated tags for filtering/search ("best-seller, gift, new-in") |

#### Categories

**Strapi:** Content Manager â†’ **Shop Â· Category** â†’ one entry per category or sub-category

Fields:

| Field | What it controls |
|---|---|
| `name` | Display name (e.g. "Bracelets") |
| `slug` | URL slug (auto from name) |
| `parent` | Optional. Set to a parent category to make this a sub-category (e.g. "Bracelets" â†’ parent "Jewellery") |
| `description` | Optional. Short text shown on the category landing page above the product grid |
| `is_visible_in_nav` | **Important.** Tick to show this category in the shop dropdown menu. Untick to keep it for internal organisation but hide from the menu |
| `sort_order` | Lower = appears first in the nav |

#### Common shop edits

- **Add a new product:** Shop Â· Product â†’ + Create â†’ fill name, price, description, upload images, pick category â†’ save. Live on the shop instantly.
- **Mark a product as out of stock:** set `stock` to `0`. The product still shows but with an out-of-stock indicator and the buy button disabled.
- **Hide a product temporarily:** untick `is_active`.
- **Add a new top-level shop category:** Shop Â· Category â†’ + Create â†’ name, leave `parent` blank, tick `is_visible_in_nav` â†’ save. Appears in the Shop dropdown.
- **Add a sub-category (e.g. new jewellery type):** Shop Â· Category â†’ + Create â†’ name, set `parent` to the top-level category (e.g. "Jewellery") â†’ save. Appears under that parent in the dropdown.

### 16.14 The FAQ system (per-page FAQs)

Every meaningful page on the site has an FAQ accordion at the bottom â€” programme pages, experience pages, shop, about, contact, etc. The questions and answers come from a single CMS collection, tagged by page.

**Strapi:** Content Manager â†’ **FAQ Â· Per Page**

Fields per FAQ entry:

| Field | What it controls |
|---|---|
| `question` | The Q in Q&A |
| `answer` | The A. Richtext â€” use the toolbar for bold/italic/links/lists. Markdown links work too: `[text](url)` |
| `page` | **Required.** Which page this FAQ appears on. Dropdown of 31 page slugs covering every CMS page. Includes (added 16 Jun): `practitioners`, `regulated`, `reset-stories`, `life`, `love-and-relationships`, `work-and-money` alongside the original `the-reset` / `signal` / `retreats` / `workshops` / `reset-room` etc. |
| `category` | Optional grouping for future FAQ overview pages. Not displayed today |
| `sort_order` | Lower = appears earlier on the page. Use 10, 20, 30 for easy reordering |
| `is_active` | Untick to hide without deleting |

#### Add a new FAQ

1. FAQ Â· Per Page â†’ + Create
2. Type the question + answer
3. Pick the `page` dropdown â€” this binds the FAQ to that page (`the-reset` â†’ shows on `/the-work/the-reset`)
4. Set `sort_order` to control position (or leave at 0 â€” most recent shows first within the page)
5. Save & Publish. The FAQ accordion on that page updates within 1-2 seconds.

#### How many FAQs per page?

5-8 is the sweet spot. 10-12 fine if a page genuinely needs that depth (e.g. shop returns / shipping). 15+ becomes a wall of plus-signs and Google starts truncating in rich snippets.

#### Bulk-add Anna's FAQs

If you have a Word doc / spreadsheet of FAQs to add in bulk, Sameer has a script (`Docs/upload-faqs.ps1`) that reads a JSON file and creates them all at once. Send him the content and he'll run it.

### 16.15 Other landing pages (Reset Letters, Decoder, Quiz, Mantras, Cosmic Forecast)

Five smaller pages that each have their own dedicated CMS entry. Cover them here so they're not orphaned.

#### `/reset-letters` â€” Reset Letters Substack landing page

**Strapi:** Single Types â†’ **Reset Letters**

A long landing page for the Substack publication. The fields are grouped by section in the form:

| Section | Fields |
|---|---|
| Top label + strapline | `comingSoonLabel`, `strapline` |
| Hero | `heroHeadline`, `heroBody1`, `heroBody2`, `heroImage` |
| "What it is" block | `whatItIsTitle`, `whatItIsBody` |
| "Each week" schedule | `eachWeekTitle`, `eachWeekBody` (one line per cadence item â€” Sunday / Wednesday / Monthly) |
| Voices & Contributors | `voicesTitle`, `voicesBody` |
| About Anna | `aboutAnnaTitle`, `aboutAnnaBody` |
| Launch date | `launchLabel`, `launchDate` |
| Founding member offer | `founderEyebrow`, `founderHeadline`, `founderBody`, `founderBenefits` (one benefit per line) |
| Signup form | `ctaButtonLabel`, `ctaPlaceholder`, `ctaMicrocopy` |

All fields have sensible defaults â€” edit any to change the on-page copy. The signup form itself submits to Mailchimp (Founding tag) â€” that wiring is set up and you don't need to touch it.

#### `/free/nervous-system-decoder` â€” Free download lead magnet

**Strapi:** Single Types â†’ **Decoder**

| Section | Fields |
|---|---|
| Hero | `heroEyebrow`, `heroTitle`, `heroTagline` |
| Book cover graphic on the left | `coverLabel`, `coverTitle`, `coverSubtitle`, `coverAuthor`, `coverImage` (the photo behind the dark overlay) |
| "Why this exists" body | `whyTitle`, `whyBody` (blank lines = paragraphs) |
| "What's inside" bullet list | `insideTitle`, `insideItems` (one bullet per line) |
| Signup form | `formTitle`, `formButtonLabel`, `formMicrocopy` |
| After-submit success message | `successTitle`, `successBody` |

The form on this page subscribes Anna's audience to Mailchimp and triggers the Decoder PDF email.

#### `/the-work/quiz` â€” The Signal Method quiz

**Strapi:** Single Types â†’ **Quiz Page**

Fields:

| Field | What it controls |
|---|---|
| `eyebrow`, `title`, `intro` | Hero copy at the top of the quiz |
| `back_to_label`, `back_to_url` | The back-link at the top |
| `results` (repeatable component) | The 6 result blurbs â€” one per programme/destination |

Each result row has:
- `slug` â€” which programme this result points to (`decoder`, `reset-room`, `reset`, `signal`, `signal-build`, `one-day`)
- `title` â€” the "Start with X" headline
- `blurb` â€” the longer body explaining the recommendation
- `cta_label` â€” the button text

The quiz questions themselves are in code (not editable from CMS) because the routing logic depends on the exact question structure. To change a question, ask Sameer.

#### `/mantras` â€” the rotating mantra videos

Two layers:

**Page hero copy:** Single Types â†’ **Mantras Page** (standard kicker/title/intro/SEO fields)

**The mantra videos themselves:** Content Manager â†’ **Story Â· Mantra**

Per mantra:

| Field | What it controls |
|---|---|
| `title` | Mantra title (e.g. "Come Back to Yourself") |
| `youtube_url` | **Required.** Full YouTube URL â€” page extracts the video ID and embeds it |
| `description` | Optional. Short text shown below the video |
| `duration` | Free-text (e.g. "60 seconds", "90 seconds") |
| `sort_order` | Lower = appears first |
| `is_active` | Untick to hide without deleting |

**Add a new mantra:** Story Â· Mantra â†’ + Create â†’ paste the YouTube URL â†’ fill title â†’ save. Live on `/mantras` instantly.

#### `/cosmic-forecast` â€” weekly cosmic forecast posts

**Strapi:** Content Manager â†’ **Story Â· Cosmic Forecast**

Anna posts a new forecast entry roughly weekly. The page shows the most recent one prominently and lists older ones below.

Standard fields per entry: `title`, `slug`, `published_date`, `summary`, `body` (richtext), `hero_image`, `is_active`.

To add a new forecast: + Create â†’ set the published date â†’ write the body â†’ save & publish. Auto-becomes the latest forecast on the page.

### 16.16 Ask Anna AI assistant

**Strapi:** No CMS editing. The Ask Anna widget on the right side of the screen + the `/ask-anna` page are wired to the Anthropic API directly.

What Anna can do:
- Change the API key (rotate periodically) â€” that's an environment variable change Sameer handles
- Change the system prompt (the "voice" / personality of the assistant) â€” code change, ask Sameer

What it does automatically:
- Searches the live site's Experiences, Articles, and Products to answer questions like "do you have a retreat in June?" â†’ returns real upcoming events + links
- Stays in Anna's voice and refuses out-of-scope questions
- Streaming responses, mobile-friendly widget

If you want changes to what it can search or how it responds, message Sameer with the desired behaviour.

### 16.17 The Sales Funnel: Decoder â†’ REGULATED â†’ Reset Room

A coordinated 3-step funnel was added on 28 May:

1. **Free entry â€” The Nervous System Decoder**
   - Landing page: `/free/nervous-system-decoder` (Decoder singleton in Strapi)
   - Interactive quiz: `/free/nervous-system-decoder/quiz` (Decoder Quiz singleton)
   - The signup form on the landing page POSTs to `/api/lead/decoder`, which:
     - Verifies a Cloudflare Turnstile token (anti-spam)
     - Upserts the subscriber in Mailchimp
     - Applies the **`Decoder Subscriber`** tag â†’ triggers Anna's "Decoder Upsell" journey

2. **Paid course â€” REGULATED**
   - Sales page: `/the-work/regulated` (Work Â· Programme entry, slug `regulated`)
   - Pay-what-you-feel from Â£5 (`pricePence = 500`)
   - The "Step inside REGULATED" CTA hits Stripe Checkout (via `/api/stripe/checkout` with `strapi_type=programme`, `strapi_id=regulated`)
   - On successful checkout, the Stripe webhook applies the **`REGULATED Buyer`** tag â†’ triggers Anna's "REGULATED Follow-up" journey AND exits the Decoder Upsell journey

3. **Membership â€” The Reset Room** (already wired)
   - Sales page: `/community/membership`
   - Monthly subscription Â£25/month
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

- **Decoder page copy** â†’ Strapi â†’ Single Types â†’ **Decoder**
- **Quiz hero + 3 state result blurbs + meditation URLs** â†’ Strapi â†’ Single Types â†’ **Decoder Quiz (Free)**. The 3 results are pre-seeded with placeholder copy; Anna replaces them with her own.
- **REGULATED sales page copy + price + Mailchimp tag** â†’ Strapi â†’ Content Manager â†’ Work Â· Programme â†’ entry `regulated`
- **Email templates** â†’ Mailchimp â†’ Email templates â†’ Saved templates (the 6 `ALW - 13.*` and `ALW - 14.*` entries)
- **The 2 customer journeys** â†’ Mailchimp â†’ Automations â†’ Customer Journeys

### 16.18 REGULATED course modules (the content buyers access after purchase)

When someone buys REGULATED, they're redirected to **`/the-work/regulated/access`** â€” the private course area. Whatever you publish in the **REGULATED Â· Module** collection appears there, in the order you set.

#### One-time setup (before the first sale)

1. Strapi â†’ Content Manager â†’ **Work Â· Programme** â†’ open the **REGULATED** entry
2. Find the field **`grantsRegulatedAccess`** â†’ tick it on
3. **Save**

This tells the system that a Stripe purchase of REGULATED should grant the buyer access to the course area. You only do this once.

#### Adding course modules

1. Strapi â†’ Content Manager â†’ **REGULATED Â· Module** â†’ **+ Create new entry**
2. Fill the fields that fit your content (all are optional except `title` and `sort_order`):

| Field | What it controls |
|---|---|
| `title` | Module heading (e.g. "Module 1: Coming Home to Your Body") |
| `slug` | URL slug (auto from title) |
| `sort_order` | Lower numbers appear first. Use 10, 20, 30 so you can insert later modules between (e.g. 15) without renumbering |
| `intro` | Short intro sentence shown under the title |
| `body` | Main lesson content â€” markdown supported. Use for text-led modules |
| `video_url` | YouTube unlisted, Vimeo, or any embeddable URL. Renders as a video player |
| `audio_file` | **Easiest path** â€” drag-drop an MP3 here. File hosted in your Media Library, plays in-browser. |
| `audio_url` | Alternative to `audio_file` â€” paste a URL if the audio is hosted elsewhere (Bunny.net, podcast feed, external MP3). Leave blank if you uploaded a file above. |
| `downloadable_file` | Optional PDF, worksheet, or audio file customers can download |
| `thumbnail` | Optional thumbnail shown above the title (800Ã—600 recommended) |
| `duration_label` | Free text, e.g. "12 minutes" or "15 min audio + worksheet" |
| `is_intro` | Tick ONE module to highlight at the top of the access page. Leave the rest unticked |

3. **Save & Publish.** The module appears for buyers within 1-2 seconds.

#### Module shapes

You can mix and match per module:
- **Text-led lesson** â€” fill `title`, `body`, optionally `downloadable_file` (worksheet)
- **Video lesson** â€” fill `title`, `video_url`, optionally `intro` (1-line summary)
- **Audio meditation** â€” fill `title`, drag-drop MP3 into `audio_file`, `duration_label` (e.g. "12 minutes")
- **PDF download** â€” fill `title`, `downloadable_file`, `intro` describing what's inside

#### Verified working end-to-end (1 Jun 2026)

The full funnel was tested on staging: Stripe purchase â†’ user auto-created with REGULATED access â†’ password set â†’ login â†’ access page renders with the uploaded audio meditation playing inline. Anna can demo this exact flow to her brother on the meeting recording.

#### The access link for your welcome email

In your REGULATED welcome email in Mailchimp, the access link is:

**`https://annalouwellness.com/the-work/regulated/access`**

Paste that wherever your email says `[access link]`.

### 16.19 Building a brand-new page yourself (the Page Builder)

You can now create new pages on your site without help â€” full design control, multiple images, colours, the lot. This is the **Page (build your own)** collection in your CMS sidebar.

**It works on your phone.** Strapi's admin is responsive â€” you can build entire pages from mobile. The flow below is written assuming you're on iPhone or iPad. Desktop is the same but easier (more screen space).

#### Step 1 â€” Create the page

1. Tap the menu (â˜°) â†’ **Content Manager** â†’ **Page (build your own)** â†’ **Create new entry**
2. Fill in:
   - **Title** â€” appears in the browser tab. Example: *"Beach Reset Day"*
   - **Slug** â€” auto-fills from the title. This becomes the URL: `annalouwellness.com/p/beach-reset-day`
   - **Hero image** â€” the photo used when this page is shared on social (Instagram, WhatsApp). Optional but recommended.
   - **Summary** â€” one line that shows up in search results and link previews. ~155 characters.
3. **Save** as a draft (top-right). You can keep editing.

#### Step 2 â€” Add sections

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
| **Custom HTML** | For anything else â€” drop in raw HTML. Use sparingly. |

Pick one. Fill in its fields. Save. Repeat for the next section. **Drag** the small â‰¡ handle to reorder sections.

#### Step 3 â€” Style each section

Inside every section there's a **Style** block. Tap to expand. You'll see:

- **Background colour** â€” paste a hex code. Common ones for the ALW palette:
  - `#FFFFFF` (white)
  - `#F5F3EF` (cream)
  - `#FCE8EF` (soft pink)
  - `#DCEFE6` (mint)
  - `#FFD07A` (warm gold)
  - `#231F20` (near-black â€” pair with cream text)
- **Text colour** â€” usually leave blank (defaults to dark). Set to `#F5F3EF` (cream) when using a dark background.
- **Accent colour** â€” colour for buttons and links inside this section. Defaults to plum `#6E3A5A`.
- **Padding** â€” Tight / Normal / Spacious. Normal is the default.
- **Alignment** â€” Left / Center / Right text alignment.
- **Max width** â€” Narrow / Medium / Wide / Full. Narrow = best for long reading.
- **Background image** â€” drop in a photo to sit behind the text. Set **Background image overlay** (0â€“80) to dim it so the text stays readable.

#### Step 4 â€” Add images everywhere you want

Every section type that allows images lets you drop in a photo from your phone:

- Tap the image field â†’ **Add an asset** â†’ **Upload assets** â†’ choose from your camera roll
- Once uploaded, the image is auto-rotated, auto-resized, and renamed to something readable
- You can use the same image multiple times across pages â€” just upload once

#### Step 5 â€” Save and preview

1. Tap **Save**
2. Tap **Publish** (top-right, blue button)
3. Open `annalouwellness.com/p/<your-slug>` in another tab. Your page is live.

Edits go live in 1â€“2 seconds â€” no waiting for a rebuild.

#### Tips for mobile editing

- Strapi remembers what you typed if your phone screen locks â€” relaunch and continue
- If a long form feels cramped, rotate to landscape
- For the Sections list, **drag the â‰¡ handle slowly** â€” too fast and the page scrolls instead
- If you accidentally tap **Delete** on a section, **Save** without publishing and reload â€” drafts are preserved
- Photos taken on iPhone (HEIC format) work â€” they're auto-converted to JPEG on upload

#### Mistakes that don't matter

- **Wrong colour** â€” change it, save, refresh the live page. Instant.
- **Wrong order** â€” drag to reorder, save, refresh. Instant.
- **Wrong image** â€” open the section, remove the image, add a new one, save.
- **Page looks bad** â€” leave it as a draft. Only published pages are live. Nothing public breaks.

#### Mistakes that do matter

- **Don't change the slug** after the page is live and shared â€” the URL will break for anyone with the old link
- **Don't paste invalid hex codes** (e.g. `#GGGGGG`) â€” the colour will silently default to white

### 16.20 Practitioners â€” your trusted circle directory

`/practitioners` is a dedicated page that mirrors the look of `/testimonials` â€” a 3-column grid of practitioner cards, with occasional full-width "banner" entries between rows for featured names. Same workflow you already know from testimonials.

#### Adding a practitioner

1. CMS â†’ **Practitioner** (in the sidebar list of collections)
2. **Create new entry**
3. Fill in:
   - **Name** â€” full name. Required.
   - **Role** â€” short specialism, e.g. "Somatic Therapist", "EMDR Practitioner". 1â€“4 words.
   - **Bio** â€” 1â€“3 sentences. Plain text.
   - **Portrait** â€” square photo (~800Ã—800), JPEG, max 500 KB.
   - **Website URL** â€” full URL `https://...`. Clicking the card sends visitors here.
   - **Instagram handle** â€” just the handle, no @. Optional.
   - **Email** â€” optional. Currently shown as a "Get in touch" if you fill it.
   - **Location** â€” e.g. "London, in-person + online" or "Online only". Optional.
   - **Display style** â€” leave **card** for normal entries. Pick **banner** for 1 in every 6â€“10 entries to feature them prominently (same as how it works for testimonials).
   - **Sort order** â€” lower numbers show first. Default 100. Use 10, 20, 30â€¦ if you want fine control.
   - **Is active** â€” leave on. Untick to hide from the live site without deleting.
4. Save

#### Editing the hero copy

CMS â†’ **Practitioners (Page)** singleton â†’ edit kicker, title, tagline. Saves go live in 1â€“2 seconds.

#### Where it's linked

About menu â†’ **Practitioners** (next to Client Stories).

#### "Apply to be listed" enquiry form (new — 16 Jun)

The page now has a CTA block above the FAQ where wellness professionals can apply to be added to the directory. They fill name + email + phone + optional practice + optional message. On submit:

- They become a contact in your **Mailchimp** audience, tagged "Practitioner Enquiry". Any Customer Journey wired to that tag fires automatically.
- You receive a **notification email** with all their details.

The email subject/body is editable in CMS → **Email Templates → admin_practitioner_enquiry**. Tweak the wording in your voice if you want.

No additional setup needed — the form is live as soon as a new practitioner submits it.

### 16.21 Duplicating an existing page to create a new one

You don't have to build pages from scratch â€” Strapi has a built-in **Clone** feature that works for almost every collection (Page Builder pages, programmes, practitioners, testimonials, articles, experiences, the lot).

#### How to clone

1. CMS â†’ open the collection of the entry you want to duplicate (e.g. **Page (build your own)** or **Work Â· Programme**)
2. In the list view, find the entry's row
3. Click the **â‹® (three dots)** at the right-hand end of that row
4. Pick **Clone**
5. Strapi opens a new draft pre-filled with everything from the original â€” sections, images, style, links, the lot
6. Change the **Title** + **Slug** to something unique (otherwise the URL will clash with the original)
7. Tweak whatever's different (copy, hero image, sections you want to add or remove)
8. **Save** â†’ **Publish**

The clone goes live at its own URL. The original is untouched.

#### When to use this

- **New sales page for a different programme** â†’ clone REGULATED, swap the copy, change the buy-programme section's slug
- **New retreat or workshop landing page** â†’ clone the closest existing one, change details
- **Seasonal variant of an existing page** ("Summer Reset Day" from an existing "Reset Day" template)
- **A/B testing different page layouts** â†’ clone, edit one, see which feels better

#### Adding the new page to a menu

After you've cloned and published a page, the URL exists but no menu item points to it yet. To add to nav:

1. CMS â†’ **Navigation** singleton (in the sidebar list of single types)
2. Find the menu group you want to add to â€” e.g. "Work with Anna" or "About" â€” and scroll to its **Children** list
3. Click **+ Add another to Children**
4. Fill in:
   - **Label** â€” the text shown in the menu (e.g. "Houseboat Reset Day")
   - **Href** â€” the URL of your new page (e.g. `/p/houseboat-reset-day` for a Page Builder page, or `/the-work/your-slug` for a programme)
5. Drag the new item to where you want it in the order (within that menu group)
6. Save

Saves go live in 1â€“2 seconds. The menu updates everywhere on the site.

### 16.22 Draft / Publish â€” your new safety net

Every page, programme, practitioner, testimonial, FAQ, and editorial entry in your CMS now has a **draft mode**. Saving no longer makes the change live immediately.

#### How it changes your flow

**Before** (until 9 Jun 2026):
1. Edit a field â†’ Save â†’ live in 2 seconds. Mistake = mistake.

**Now**:
1. Edit a field â†’ **Save** â†’ the change is stored as a draft. **Live site shows the previous version, untouched.**
2. Open the live page in another tab (or use **View Live page â†’** button â€” see 16.23) to preview
3. When happy â†’ **Publish** (blue button, top-right of the edit form). Live in 1â€“2 seconds.

#### Reverting a mistake

You have three options:

1. **Discard changes** (best) â€” top-right of the edit form, near Publish, there's a discard button. Wipes the draft back to whatever the live version says.
2. **Just don't publish** â€” the draft sits there until you do something with it. Live site stays as it was.
3. **Edit it back** â€” if you've already published a bad change, edit again to fix and re-publish. (For real disasters, Sameer can restore from the previous day's database backup â€” see 16.27.)

#### What now requires a Publish tap

Anything in: Programmes, Practitioners, Testimonials, Articles, FAQ, all the page singletons (Homepage, About, Community, Reset Room, all section landing pages, Decoder, Quiz, all the shop pages), Experiences, Page Builder pages, Navigation, Footer.

What does NOT need Publish: Orders, Cart, Coupon entries, customer records, shop product catalogue (still live-on-save because these are transactional).

#### Mobile-specific note

On your phone, the Publish button is at the top-right of the edit form. Sometimes it scrolls off-screen if the form is long â€” pinch to zoom out, or scroll up.

### 16.23 View live page (one tap from any edit screen)

Every entry in your CMS now has a **green "View live page â†’" button** in the right sidebar.

#### What it does

Tap the button â†’ opens the page the entry powers in a new tab. For example:
- Editing **Homepage** singleton â†’ opens `https://annalouwellness.com/`
- Editing **REGULATED** programme â†’ opens `https://annalouwellness.com/the-work/regulated`
- Editing **Sarah Hughes** practitioner â†’ opens `https://annalouwellness.com/practitioners`

Keep that tab open. Edit + save + publish in the CMS tab â†’ swipe back to the live tab â†’ pull to refresh â†’ see your change in seconds.

#### Mobile workflow

The Apple tab switcher (long-press the tab icon at the bottom of Safari) makes flipping between CMS and live page instant. Two-tab workflow > side-by-side preview on a 6-inch screen.

### 16.24 Quick Photo Editor â€” replace any hero image in 2 taps

New **Quick Photos** item in the CMS sidebar (camera icon). One page showing every hero / portrait / featured photo across your site as thumbnails.

#### What it covers

- Every singleton page hero (Homepage, About, Community, Reset Room, Testimonials, Practitioners, Reset Letters, Decoder, Experiences landing)
- Every Programme hero
- Every Experience event hero
- Every Practitioner portrait
- Every Testimonial photo
- Every Page Builder page hero

If a hero is set, you see the thumbnail. If it's empty, you see "No image set."

#### How to swap a photo

1. CMS â†’ sidebar â†’ **Quick Photos**
2. Find the thumbnail you want to replace
3. Tap **Replace** (or **Upload** if it's empty)
4. Pick a photo from your phone
5. ~3-second upload â†’ thumbnail updates in place
6. Open the entry (tap the entry name) and tap **Publish** to push the new photo live

That's 4 taps total (5 if you count Publish) vs ~10 taps the old way.

#### Limitations

- Quick Photos only shows the **main hero/portrait** field for each entry. If a page has multiple image fields (like Homepage has 4), they all appear as separate rows. But specialised fields (like a programme's "alternate image for retreats listing") aren't shown â€” for those, open the entry the normal way.
- After replace, the change is a **draft**. You still need to open the entry and tap Publish to make it live (the new safety net from 16.22 applies here too).

### 16.25 iOS Shortcut for fastest photo uploads

The fastest possible mobile upload workflow: take a photo â†’ tap Share â†’ tap **Upload to ALW CMS** â†’ done. ~5 seconds end-to-end.

Setup instructions for this live in `Docs/IOS_SHORTCUT_UPLOAD.md` â€” Sameer will walk you through it once. After the one-time setup, every future upload is a one-tap operation from the iPhone share sheet.

This is a pure **upload accelerator** â€” it lands the photo in your Media Library. To then attach it to a specific page, use **Quick Photos** (16.24) or the normal edit-the-entry flow.

### 16.26 Tap the image, not the field â€” the hidden Replace shortcut

When you're inside an entry's edit form (like editing the Homepage) and want to swap a photo that's already set:

âŒ **Don't** tap the field name or label.
âœ… **DO** tap the image thumbnail itself. A modal opens with a **Replace media** button â€” one tap, pick new photo, done.

Saves 2 taps every time.

### 16.28 Customer accounts â€” one login for everything

Every customer who places an order automatically gets an account on the site. They use it to log in, see their order history, request returns, and access any course they buy. **The same login works for the shop, the Reset Room, and any course or experience.** One email, one password, everything.

**How accounts get created**

- A new customer places their first order (any payment method).
- The site creates a user record silently with their email.
- The customer receives a "Welcome â€” set your password" email with a one-time link.
- They click the link â†’ choose a password â†’ land on `/account` already signed in.

**Returning customers**

- They click the **Login** link in the top nav.
- Sign in with email + password â†’ land on `/account`.
- See every order, click any to request a return, or jump straight to Reset Room / REGULATED if they have access.

**Forgot password?**

- On the sign-in page â†’ "Forgot your password?" â†’ enter email â†’ get a fresh reset link.

**Where to manage users**

- Strapi â†’ Users (top of left sidebar, under Content Manager).
- Each user has email, name, role, and the flags that grant Reset Room or REGULATED access.

### 16.29 Order lifecycle emails â€” automatic on every status change

Every order moves through statuses (paid â†’ shipped â†’ completed, or cancelled, or refunded). The system emails the customer automatically on every transition â€” you don't write any of these emails yourself.

**Full playbook** for what each status does, what the customer sees, and what to fill in BEFORE saving lives in `Docs/ALW_Order_Playbook_For_Anna.docx`. Send Sameer for the file or open it in Word â€” it's the most important doc for day-to-day order operations.

**Quick reference**

| Status change | Customer email | What you fill in first |
|---|---|---|
| â†’ shipped | "Your order is on its way" with tracking link | tracking_number, tracking_url, shipping_carrier |
| â†’ completed | "Hope you are enjoying your order" + review request | nothing |
| â†’ cancelled | "Your order has been cancelled" + reason | cancellation_reason |
| â†’ refunded | "Your refund has been processed" + amount | refund_amount (or leave blank for full refund) |

**Editing email wording**

Every email's subject + body is in Strapi â†’ **Email Template** collection. 10 rows, one per email. You edit subject + intro + outro + button label. Merge tags like `{{order_number}}`, `{{customer_name}}`, `{{tracking_url}}` get filled in at send time. Full list of merge tags is in the Order Playbook.

### 16.30 Auto-refund via Stripe â€” change status, money goes back

The most important automation: **changing an order's status to `refunded` fires the Stripe refund automatically.** You don't open the Stripe dashboard. The money returns to the customer's card within minutes.

**Full refund**: leave `refund_amount` blank â†’ status â†’ `refunded` â†’ save. Refunds the order total.

**Partial refund** (customer keeps Â£40 of Â£100, refund Â£60): fill `refund_amount = 60.00` â†’ status â†’ `refunded` â†’ save.

**Bank transfer refunds**: status change still fires the email but YOU send the money back via your bank (Stripe was never involved).

**Safety net**: once an order has `stripe_refund_id` stamped, the system blocks double-refunds. If Stripe rejects the call (card expired, payment too old), you get an admin email with the error so you can handle it manually.

### 16.31 Returns â€” customer-initiated from their account

Customers can request returns themselves from `/account` â†’ click "Request a return" next to any eligible order. They pick which items, the reason, optional notes.

**What you do when a return comes in**

1. You get a "[Return requested]" admin email.
2. Open Strapi â†’ **Shop Â· Return Request** â†’ click the new entry.
3. Fill `notes` with shipping instructions for the customer (where to send it, who pays postage).
4. Status â†’ `approved` â†’ save. Customer gets the "Your return is approved â€” here's how to ship it back" email with your notes.
5. When items arrive: optional status â†’ `received`.
6. Fill `refund_amount` (you may keep an amount for return shipping) â†’ status â†’ `refunded` â†’ save.
7. Stripe refund fires automatically, customer gets the refund email, parent order flips to `refunded` too.

Full step-by-step lives in the Order Playbook.

### 16.32 Calendly bookings â€” paste a link, customer books without leaving your site

You can put any Calendly event-type URL into the booking field on programmes, experiences, or coaching sessions. When the customer clicks the "Book" button, Calendly opens **as a popup right on your page** â€” they pick a time, confirm, and Calendly emails them. They never leave annalouwellness.com.

**Steps**

1. Log in to Calendly, create your event types (Discovery Call, Founder Reset Session, Speaking Enquiry, etc.).
2. Copy each event type's URL. Looks like `https://calendly.com/anna-annalouoflondon/discovery-call`.
3. In Strapi, paste the URL into:
   - **Programme** entries â†’ `ctaUrl` field (bottom CTA on the programme page)
   - **Experience** entries (workshops/retreats) â†’ `booking_url` field
   - **Coaching Session** entries â†’ `booking_url` field
4. Save. Done â€” the button on the live site now opens Calendly as a popup.

**It also still works for non-Calendly URLs.** Stripe checkout links, internal pages like `/the-work/regulated`, or any external URL â€” paste them in the same field and they open the normal way (new tab or in-page). The system only triggers the popup when it detects a Calendly URL.

### 16.33 What's coming next

The manual is now substantially complete for v1.4. Possible additions based on what comes up in real use:
- Screenshots inside each section.
- A 5-minute video walkthrough of the most-used edits.
- A printable 1-page emergency cheatsheet for the launch day.

Tell Sameer if any of those would help.

---

## 17. Recent additions (mid-June 2026)

A summary of the new features landed on 12â€“16 June. Each is also covered above where it touches an existing section.

### 17.1 Site URLs lookup (sidebar)

A new sidebar item called **Site URLs**. Click it and you'll see every page on the site, grouped by section (Top-level pages, Work with Anna, Experiences, Community, Editorial, Shop), with a Copy button next to each URL.

Use this when:
- You're editing **Navigation** and need to add an item â€” copy the path from here instead of typing it.
- You're writing a Mailchimp email and need the full URL of a programme or article.
- You're posting to social and want to link a specific page.

There are two Copy buttons per row:
- **Copy path** gives you `/the-work/signal` â€” what Navigation expects.
- **Copy full** gives you `https://staging.annalouwellness.com/the-work/signal` â€” what you want for emails and social.

There's also a search box at the top â€” type any word from a page name (e.g. "reset") to filter.

### 17.2 Bulk fill missing SEO (sidebar â†’ SEO & AI Files)

The **SEO & AI Files** page now has a panel at the top called **Bulk fill missing SEO**.

What it does: in one click, walks every Article, Programme, Experience, Coaching Session, Generic Page, and Page Builder entry and writes an SEO title + SEO description for any entry where both fields are empty.

Click **Run bulk SEO backfill**. The panel shows live progress (processed / filled / skipped / errors). Takes around 1 minute per 60 entries.

**Never overwrites entries you've already edited.** If you've written or edited an SEO title or description, the script leaves it alone.

You can run it again whenever you add a batch of new articles â€” it'll only touch the new empties.

### 17.3 Searchable URL picker on Upsells

The **Upsells** field now appears on almost every page entry (Homepage, About, Community, Reset Letters, every programme, every experience, every article, etc.). Each upsell card has:
- **Label** â€” what shows on the card
- **Link** â€” where it takes people. This is now a **searchable dropdown** of every URL on the site. Click it, start typing a page name, click to set. Or paste an external URL like a Calendly link if you want.
- **Eyebrow** â€” small uppercase tag like "Next step" or "Continue"
- **Blurb** â€” one-line description
- **Image** â€” optional thumbnail

Add up to 3 cards per page. Leave the field empty to hide the upsell block entirely.

The cards render at the bottom of the page as a "Where next Â· Continue exploring" section.

### 17.4 Practitioner enquiry form (/practitioners)

A new "Apply to be listed" CTA on the Practitioners page. When a wellness professional fills it in:
1. They become a Mailchimp contact tagged "Practitioner Enquiry".
2. You receive an email with their details (name, email, phone, practice, message).
3. The Customer Journey wired to "Practitioner Enquiry" fires (if you've set one up â€” see Â§8).

The email template Anna receives lives in **Email Templates â†’ admin_practitioner_enquiry**. Edit the subject or body there if you want.

### 17.5 Quick Photo Editor (sidebar â†’ Quick Photos)

This page lists every hero/portrait image across the site as a thumbnail with a **Replace** button â€” you can swap a photo without navigating into the entry. After uploading, open the entry the normal way and click **Publish** to push the change live.

Previously this page showed "Coming soon". As of 16 Jun it works.

### 17.6 Event cards with hero images (Retreats / Workshops / etc.)

The "Upcoming dates" section on /experiences/retreats, /experiences/workshops etc. now leads with the event's hero image. To make a card look its best:
- Upload a landscape JPG to the event's `hero_image` field (1600Ã—1000px+).
- Fill in `name`, `date`, `location`, `price_label`, `description`, and `booking_url`.

If you leave hero_image blank the card shows a placeholder. The date appears as a coloured pill overlaid on the image.

### 17.7 FAQ added to 6 more pages

The FAQ system now supports per-page Q&A on these pages in addition to the existing 18:
- /practitioners
- /the-work/regulated
- /reset-stories, /life, /love-and-relationships, /work-and-money (the four editorial section landings)

To add FAQs: open **FAQ Â· Per Page** â†’ +Create â†’ set `page` to the new option from the dropdown â†’ write question + answer â†’ Save & Publish.

### 17.8 Field help text everywhere

72 fields across 38 collections now have plain-English help text shown beneath the input. Look out for:
- **SEO title / SEO description** â€” examples of what to write, with a note that they auto-fill on Save.
- **Slug** â€” explanation that lowercase + hyphens-not-spaces is required, with auto-fill from name.
- **Hero image** â€” recommended dimensions (e.g. 1600Ã—1000px landscape).
- **Booking URL** â€” note that Calendly links open as a popup, others open normally.
- **mailchimpTag** â€” must match exactly the trigger tag on the Customer Journey.
- **Kicker / eyebrow** â€” keep to 1â€“3 uppercase words.

### 17.9 Sidebar collection renames (Experiences)

Two collections got clearer names to avoid confusion:
- **Experiences · Event** â†’ **Experiences · Event Bookings** â€” for specific events with dates (Align & Amplify, scheduled retreats, named workshops).
- **Experiences · Sub-page** â†’ **Experiences · Category Pages** â€” for the 4 main landing pages (Retreats, Workshops, Corporate Wellbeing, Speaking).

Description text on each cross-references the other, so when you open one you know where to find the other if it's not what you wanted.

### 17.10 Site-wide font bump

Everything on the public site is now ~10% bigger after Anna's "I can't read the small text" feedback. Top nav, body copy, footer, kickers, eyebrows â€” all proportionally larger. No colour or layout changes, just size.

### 17.11 Decoder quiz popup on homepage

10 seconds after a visitor lands on the homepage, a small modal appears promoting the Nervous System Decoder quiz with a CTA. Dismissible (X / Esc / click outside) and won't reappear for 7 days once closed. Headline/body/timing are constants in code â€” tell Sameer if you want them moved to CMS-editable fields.

---

*End of manual. Print this, bookmark it, or just keep it open in a browser tab. Updates land in `Docs/ANNA_USER_MANUAL.docx` â€” Sameer keeps the master version.*

*Anna x*
