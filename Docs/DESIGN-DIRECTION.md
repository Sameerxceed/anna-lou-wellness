# Anna Lou Wellness — Frontend Design Direction

## Brand Foundation (from Brand Guidelines v1.0)

```
Logo:     Crown 'a' wordmark — "Anna Lou WELLNESS" + "Beautifully Whole"
Fonts:    Nobel Light (headings) · Garamond (editorial) · Proxima Nova (UI/CTAs)
Primary:  Brand Black #231F20 · Red #EE312F · Amber #FAA21B
          Blue #7BAFDD · Pink #F280AA · Green #5DCAA5 · Gold #FFD07A
Tints:    Blush #FFDCDE · Cream #FFF0D2 · Lavender #E9EBF6
          Soft Pink #FCE8EF · Mint #E1F5EE
Neutrals: Warm Neutral #F5F3EF · Warm Cream #D5D0C8
          Mid Grey #8C8880 · Dark Grey #3D3D3A · Brand Black #231F20
```

---

## Design Principles

1. **Adaptive, not uniform** — Each section has its own visual rhythm while staying brand-cohesive
2. **Warm neutral foundation** — #F5F3EF as the default canvas, not pure white
3. **Colour as category signal** — Each major section gets a primary colour accent:
   - Blog/Reset Stories → Red #EE312F
   - Lifestyle → Green #5DCAA5
   - Coaching → Blue #7BAFDD
   - Workshops → Amber #FAA21B
   - Shop → Gold #FFD07A
   - Media → Pink #F280AA
   - Community → Lavender tint
4. **Crown pattern as texture** — Crown 'a' repetition patterns used subtly for section dividers, hover states, and decorative backgrounds
5. **Typography hierarchy** — Nobel Light for impact headings, Garamond italic for editorial/emotional text, Proxima Nova for navigation/CTAs/prices
6. **Sentence case always** — Per brand guidelines, never ALL CAPS in body

---

## Page-by-Page Layout Ideas

### HOMEPAGE
**Approach:** Immersive entry point → three pathways → social proof → content preview → newsletter

```
┌──────────────────────────────────────────────────────────────┐
│                     FULL-SCREEN HERO                         │
│         Background: moody image/video of Anna                │
│                                                              │
│              Nobel Light, 6rem, letter-spaced                │
│              "Beautifully Whole"                             │
│                                                              │
│         Garamond italic, 1.4rem, soft white                  │
│    "Coaching, healing, and transformation for women          │
│     ready to come back to themselves."                       │
│                                                              │
│    [Work With Me]   [Shop]   [Reset Stories]                 │
│         Proxima Nova, outlined buttons, rounded              │
│                                                              │
│              ↓ scroll indicator                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  THREE PATHWAYS — equal-width cards with hover lift          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Image   │  │  Image   │  │  Image   │                   │
│  │          │  │          │  │          │                   │
│  │ COACHING │  │   SHOP   │  │  STORIES │                   │
│  │ "Start   │  │ "Symbolic│  │ "Read the│                   │
│  │  your    │  │  pieces  │  │  Reset   │                   │
│  │  reset"  │  │  for     │  │  Stories"│                   │
│  │          │  │  your    │  │          │                   │
│  │ [Explore]│  │ journey" │  │ [Read]   │                   │
│  └──────────┘  │ [Browse] │  └──────────┘                   │
│                └──────────┘                                  │
│  Background: Warm Neutral #F5F3EF                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  TESTIMONIALS — rotating or stacked                          │
│  Background: Brand Black #231F20                             │
│  Text: Garamond italic, large, cream/gold                    │
│                                                              │
│       "Anna helped me come back to myself when               │
│        I didn't know who I was anymore."                     │
│                — Sarah, London                               │
│                                                              │
│  Crown pattern as subtle overlay texture                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  PRESS & CREDENTIALS STRIP                                   │
│  Logos: ICF · CPD · TRE · Harrods · Selfridges · H.Nichols  │
│  Background: White, logos in grey, horizontal scroll on mob  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  LATEST FROM RESET STORIES — 3 article cards                 │
│  Cup of Jo-style editorial cards:                            │
│  Large image, category label, Garamond title, excerpt        │
│  Background: Cream #FFF0D2 tint                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  SHOP PREVIEW — 4 product cards in a row                     │
│  Emotional Support Jewellery focus                           │
│  Warm neutral bg, product image, name, price                 │
│  "Friday ESJ drops" label                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  SUBSTACK / NEWSLETTER CTA                                   │
│  Background: Brand Red #EE312F                               │
│  "Reset Letters — delivered to your inbox"                   │
│  Garamond italic: "Sunday Reset · Wed Signal · Friday ESJ"  │
│  [email input] [Subscribe] — white on red                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  FOOTER                                                      │
│  Background: Brand Black #231F20                             │
│  Crown 'a' monogram, 3-column links, social icons            │
│  "Beautifully Whole" in Nobel Light, rotated side element    │
└──────────────────────────────────────────────────────────────┘
```

---

### BLOG — Reset Stories (Cup of Jo Model)
**Approach:** Magazine-style editorial feed, category tabs, sidebar with newsletter + ESJ

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: "Reset Stories" in Nobel Light + red accent bar     │
│  Category tabs: All · Reset Stories · Style & Food · Travel  │
│  Tab style: Proxima Nova, underline active, horizontal scroll│
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┬───────────┐
│  FEATURED POST — large hero card                 │ SIDEBAR   │
│  Full-width image, category label (red),         │           │
│  Garamond title (2rem), excerpt, author, date    │ Newsletter│
│                                                  │ sign-up   │
├──────────┬───────────┬───────────────────────────│ (Substack)│
│ Post 2   │ Post 3    │ Post 4                    │           │
│ Image    │ Image     │ Image                     │ ────────  │
│ Category │ Category  │ Category                  │           │
│ Title    │ Title     │ Title                     │ Editor's  │
│ Excerpt  │ Excerpt   │ Excerpt                   │ Picks     │
├──────────┴───────────┴───────────────────────────│           │
│ [AD PLACEMENT — subtle, labelled "Partner"]      │ ────────  │
├──────────┬───────────┬───────────────────────────│           │
│ Post 5   │ Post 6    │ Post 7                    │ ESJ       │
│ ...      │ ...       │ ...                       │ Friday    │
│          │           │                           │ Drop      │
└──────────┴───────────┴───────────────────────────┴───────────┘
```

**Blog Post Page:**
- Large featured image (full-width or 80% width)
- Garamond body text, 1.2rem, generous line-height (1.9)
- Pull quotes in Nobel Light, oversized, with red left border
- Inline product links → shop (ESJ, crystals)
- Inline coaching CTA → relevant coaching category
- Related posts at bottom (3 cards)
- Comments section (logged-in users, admin-moderated)
- Social sharing buttons

---

### LIFESTYLE
**Approach:** Similar to blog but with a wellness/educational tone. Green accent.

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: "Lifestyle" in Nobel Light + green accent bar       │
│  Sub-tabs: Spiritual Hygiene · Decluttering · Educational    │
│            · Emotional Support Jewellery                     │
└──────────────────────────────────────────────────────────────┘

│  Same grid as blog but:                                      │
│  - Green #5DCAA5 category labels instead of red              │
│  - Paid content marked with gold "£15" badge                 │
│  - Crystal guide, deep-dives have lock icon if paid          │
│  - ESJ section has inline shop links                         │
└──────────────────────────────────────────────────────────────┘
```

---

### COACHING — Conversion-Led Category Pages
**Approach:** Hub page with 5 categories + quiz CTA, then each category is an immersive long-form page (chriscorsini.com style)

**Coaching Hub:**
```
┌──────────────────────────────────────────────────────────────┐
│  HERO: "Which coaching is right for you?"                    │
│  Background: Blue tint #E9EBF6                               │
│  Nobel Light heading, Garamond subtitle                      │
│  [Take the Quiz] — primary CTA, Red button                  │
│  [Book a Free Discovery Call] — outlined                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  5 COACHING CATEGORIES — cards with image, icon, title       │
│                                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │Trauma│  │Dating│  │Spirit│  │Heart-│  │Health│          │
│  │Release│  │Coach │  │ual   │  │Led   │  │Coach │          │
│  │      │  │      │  │Coach │  │Biz   │  │      │          │
│  │ →    │  │ →    │  │ →    │  │ →    │  │ →    │          │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘          │
│                                                              │
│  Each card: moody image, category name, short description    │
│  Hover: lift + blue accent border                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  CLIENT TESTIMONIALS — large Garamond italic quotes          │
│  Carousel or stacked, with client name and context           │
└──────────────────────────────────────────────────────────────┘
```

**Single Coaching Category Page (e.g., /coaching/trauma-release):**
**This is the chriscorsini.com-style immersive page**
```
┌──────────────────────────────────────────────────────────────┐
│  IMMERSIVE HERO — dark background, moody image               │
│  Nobel Light title: "Trauma Release"                         │
│  Garamond italic: emotional opening line                     │
│  [Book a Session]                                            │
└──────────────────────────────────────────────────────────────┘
│                                                              │
│  STORY SECTION — Garamond body, editorial feel               │
│  "You've been holding everything. The anxiety,               │
│   the hypervigilance, the feeling that your body             │
│   never quite settles..."                                    │
│                                                              │
│  (This reads like an editorial piece, not a service listing) │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  WHAT'S INCLUDED — icon + text grid                          │
│  TRE · Flash EMDR · Brainspotting · IFS                     │
│  Clean, scannable, Proxima Nova labels                       │
├──────────────────────────────────────────────────────────────┤
│  TESTIMONIAL — woven in mid-page                             │
│  Large Garamond italic quote, client photo optional          │
├──────────────────────────────────────────────────────────────┤
│  PRICING — clean, clear                                      │
│  Session types, prices visible                               │
│  [Book 1:1 Session] — Red button                             │
│  [Book Free Discovery Call] — outlined                       │
│  Calendly embed below                                        │
├──────────────────────────────────────────────────────────────┤
│  RELATED CONTENT — "You might also read..."                  │
│  Blog posts + ESJ products linked contextually               │
└──────────────────────────────────────────────────────────────┘
```

---

### WORKSHOPS
**Approach:** Filterable grid with clear pricing (£200 full / £15 summary)

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: "Workshops" + Amber accent bar                      │
│  Filter: All · Upcoming · Past · Corporate · Speaking        │
└──────────────────────────────────────────────────────────────┘

│  WORKSHOP CARDS — grid of 3                                  │
│  ┌────────────────────┐                                      │
│  │     [Image]        │                                      │
│  │                    │                                      │
│  │  Workshop Title    │  Nobel Light                         │
│  │  Date · Time       │  Proxima Nova, small                 │
│  │  Brief description │  Garamond                            │
│  │                    │                                      │
│  │  £200 Full         │  Amber badge                         │
│  │  £15 Summary       │  Outlined badge                      │
│  │                    │                                      │
│  │  [Book Now]        │  Amber button                        │
│  └────────────────────┘                                      │
└──────────────────────────────────────────────────────────────┘
```

---

### SHOP — Anna Lou of London
**Approach:** Clean, elevated product grid (Rose Inc aesthetic). Gold accent.

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: "Shop" + story-led intro line                       │
│  "Every piece carries meaning. Every purchase is a reset."   │
│  Category tabs: All · Crystals · Crystal Jewellery · ESJ     │
│                 · Digital · Gifts                             │
└──────────────────────────────────────────────────────────────┘

│  PRODUCT GRID — 3 or 4 columns                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ [Image] │  │ [Image] │  │ [Image] │  │ [Image] │        │
│  │         │  │         │  │         │  │         │        │
│  │ Name    │  │ Name    │  │ Name    │  │ Name    │        │
│  │ £45.00  │  │ £28.00  │  │ £15.00  │  │ £65.00  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                              │
│  Product cards: clean white bg, subtle shadow on hover,      │
│  Garamond product name, Proxima Nova price                   │
│  Warm neutral page background                                │
└──────────────────────────────────────────────────────────────┘
```

**Product Detail Page:**
- Large image gallery (lightbox)
- Story-connected description in Garamond ("Moonstone — come back to self")
- Meaning/symbolism section
- [Add to Cart] — Gold button
- Related products
- "This piece pairs with..." → coaching or blog link

---

### MEDIA
**Approach:** Hub layout, two sections — YouTube + Podcast/Substack. Pink accent.

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: "Media" + Pink accent bar                           │
│  Tabs: YouTube · Podcast & Substack                          │
└──────────────────────────────────────────────────────────────┘

│  YOUTUBE TAB:                                                │
│  ┌──────────────────────────────┐                            │
│  │  FEATURED VIDEO (embed)      │  Latest episode of         │
│  │  "The Reset with Anna"       │  "The Reset with Anna"     │
│  └──────────────────────────────┘                            │
│                                                              │
│  PLAYLISTS — horizontal scrollable cards                     │
│  Reset Talks · Jewellery with Meaning · Come Back to         │
│  Yourself · Houseboat Life                                   │
│                                                              │
│  PODCAST TAB:                                                │
│  Episode list with embedded player, show notes               │
│  Substack signup (free + paid tiers)                         │
│  Content schedule: Sun Reset · Wed Signal · Fri ESJ          │
└──────────────────────────────────────────────────────────────┘
```

---

### COMMUNITY
**Approach:** Warm, inviting, participation-driven. Lavender tint background.

```
┌──────────────────────────────────────────────────────────────┐
│  HERO: "Come back to yourself — together"                    │
│  Background: Lavender #E9EBF6                                │
│  Free vs Paid tier comparison                                │
│  [Join for Free]  [Crystal Clear Collective — £/month]       │
└──────────────────────────────────────────────────────────────┘

│  SECTIONS:                                                   │
│  The Returning Circle — weekly live, RSVP                    │
│  Resource Library — free + paid downloads                    │
│  Events Board — upcoming dates, calendar                     │
│  Member Space — directory + discussion (basic)               │
└──────────────────────────────────────────────────────────────┘
```

---

## Navigation Design

**Desktop:** Horizontal, 8 items + cart icon + login icon
```
[Crown Logo]  Blog  Lifestyle  Workshops  Coaching  Shop  Media  Community  About  [Cart] [Login]
```
- Proxima Nova, light weight, letter-spaced
- Transparent on hero pages, solid warm-neutral on scroll
- Active page: Red #EE312F underline
- Mobile: full-screen overlay with large Garamond links

**Footer:** 3-column on Brand Black #231F20
- Column 1: Explore (Blog, Coaching, Shop, Workshops)
- Column 2: Connect (Community, About, Contact, Media)
- Column 3: Contact info + social icons
- Bottom: Crown 'a' monogram + "Beautifully Whole" + copyright

---

## Colour-per-Section System

This creates visual wayfinding — users subconsciously know which section they're in:

| Section | Accent | Background Tint | Used For |
|---------|--------|-----------------|----------|
| Blog | Red #EE312F | Cream #FFF0D2 | Category labels, links, active states |
| Lifestyle | Green #5DCAA5 | Mint #E1F5EE | Category labels, paid content badges |
| Coaching | Blue #7BAFDD | Lavender #E9EBF6 | Quiz CTA, category borders |
| Workshops | Amber #FAA21B | Cream #FFF0D2 | Price badges, booking buttons |
| Shop | Gold #FFD07A | Warm Neutral #F5F3EF | Add to cart, price highlights |
| Media | Pink #F280AA | Soft Pink #FCE8EF | Play buttons, subscribe CTAs |
| Community | Lavender | Lavender #E9EBF6 | Join buttons, member badges |
| About | Brand Black | Warm Neutral | Neutral, editorial |

---

## Key Visual Patterns

1. **Hero sections** — Full-width, dark overlay on moody images, Nobel Light title, Garamond italic subtitle
2. **Content cards** — White/cream bg, subtle shadow on hover, lift animation, rounded corners (4px)
3. **CTAs** — Rounded (4px), Proxima Nova semi-bold, section-coloured or Red for primary
4. **Pull quotes** — Nobel Light, oversized (2-3rem), left border in section colour
5. **Section dividers** — Crown pattern strip or subtle coloured line
6. **Testimonials** — Dark background (#231F20), Garamond italic, cream/gold text
7. **Newsletter CTAs** — Bold section colour background (Red), white text, inline email form
8. **Paid content badges** — Gold #FFD07A pill with "£15" or "Members Only"
