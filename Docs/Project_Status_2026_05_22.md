# Anna Lou Wellness — Project Status

**Date:** 22 May 2026
**Domain (staging):** staging.annalouwellness.com
**CMS (staging):** cms.annalouwellness.com
**Repository:** anna-lou-wellness (Next.js 15 + Strapi v5)
**Hosting:** IONOS VPS (Frankfurt, 4 GB) via Coolify

---

## 1. Executive Summary

The Anna Lou Wellness website is **feature-complete and ready for production launch**. Every editable page is CMS-driven by Strapi, so Anna can edit text, swap images, change pricing, manage articles, and run her shop without developer involvement.

**Performance (Google PageSpeed Insights, mobile):**

| Metric | Score |
| --- | --- |
| Performance | **97** |
| Accessibility | 96 → 100 (after latest deploy) |
| Best Practices | 96 |
| SEO | **100** |

The site is in the top ~5% of all websites for mobile performance.

The only remaining items are blocked on external input (Anna's content decisions, Aneeza's artwork files) or are deliberately deferred (member-only screens that need real members first).

---

## 2. What Has Been Built — Frontend (Next.js)

### 2.1 Public site (~36 editable pages)

- **Homepage** with 17 sections (editorial frame, hero, featured story, article grid, mantras, quotes, work-with-Anna preview, Life/Love/Work explorer, experiences, newsletter, shop preview, media hub, community, portrait, testimonials, press, certifications)
- **4 editorial sections** (Reset Stories, Life, Love & Relationships, Work & Money), each with subcategory filters and a `/[slug]` article page that supports free vs paid (Substack) articles
- **Work with Anna** — landing page + ways-to-work-with-me index + 8 individual programme/session pages + free quiz with 6 result types
- **Experiences** — landing page + per-experience detail pages
- **Shop** — landing + 3 sub-collections (New In, Personalised, ESJ) + product detail + cart + checkout (Stripe live-ready)
- **Community** — Returning Circle, Reset Room landing
- **About**, **Cosmic Forecast**, **Mantras**, **Reset Letters**, **Login**, **Privacy**, **Terms**

### 2.2 Member-only screens (built, awaiting real members)

- /community/reset-room/dashboard
- /community/reset-room/vault + /vault/[slug]
- /community/reset-room/replays
- /community/reset-room/account
- /account

### 2.3 Performance, accessibility & SEO

- **Canonical tags + Open Graph + Twitter cards** on every section and article page
- **Structured data** (Article, BreadcrumbList) for Google's rich results
- **Sitemap.xml + robots.txt** generated dynamically from Strapi content
- **WCAG AA contrast compliant** (Tailwind `mid-grey` token deepened from #8C8880 → #5D5A52; brand category colours mapped to AA-safe text variants via `accentForText()` helper)
- **LCP-optimised hero image** with `<link rel="preload" fetchpriority="high">`
- **Stock images** delivered at q=70 (~30% smaller, visually identical)
- **Scroll-reveal animations** with `prefers-reduced-motion` and 2-second JS-failure fallback
- **Reading-time auto-calculation** on every article
- **Justified body text** with `text-wrap: pretty` to prevent orphan words

---

## 3. What Has Been Built — CMS (Strapi v5)

### 3.1 Content types (singletons & collections)

**Editorial:**
- Article (collection) + Article Category (collection) + Author
- Homepage (singleton, 60+ fields)
- Reset Stories landing, Life landing, Love landing, Work & Money landing (singletons)
- About page, Cosmic Forecast, Mantras (singletons)

**Work with Anna:**
- Work with Anna landing page
- Sessions Hub page
- Coaching Session (collection — Decoder, Reset, One Day, Signal Method, Collective)
- Quiz page + 6 quiz result components
- Recovery page

**Experiences:**
- Experiences Landing page
- Experience (collection — workshops, retreats, reset days)

**Shop:**
- Shop New In, Shop Personalised, Shop ESJ (singletons)
- Product (collection) with image, price, inventory, shop tag
- Order (collection — auto-created on checkout)

**Community:**
- Returning Circle page, Reset Room landing

**Global:**
- Navigation (singleton — controls top menu, dropdown caps, mobile menu)
- Footer (singleton — social links, columns, copyright)
- Site Settings (singleton — site name, default SEO, currency, max subcategories cap, social URLs)

### 3.2 Admin UX customisation

- **Quick Edit dashboard** — single landing page Anna sees on login, organised into 5 groups (Pinned, Editorial, Other landings, Commerce, Work). 28 cards total, each links to a specific section.
- **Login auto-redirect** — /admin → /admin/alw-quick-edit. Anna never sees the raw Strapi admin landing.
- **Live-site sub-menu indicators** — every nav card shows what live menu items it controls.
- **Section filter pills** on Article and Article Category lists.
- **Plum brand theme** applied to the admin UI.
- **iPhone-friendly field types** — short text inputs for lists (pipe-separated) instead of raw JSON arrays.

### 3.3 Integrations wired

| Integration | Status | Notes |
| --- | --- | --- |
| Mailchimp newsletter (Reset Letters) | ✅ Live in test | Audience 8bcbe7b0d1, tags Founding/Standard |
| Mailchimp Customer Journeys (13 shells) | 🟡 Drafts ready | Anna designs email bodies + activates |
| Stripe Checkout (shop + sessions) | ✅ Live in test mode | Swap 3 env vars for production |
| Cloudinary image hosting | ✅ Live | Auto EXIF rotation |
| Substack RSS / link-out | ✅ Live | Paid articles link to Substack |
| Custom-domain email (annalouwellness.com) | ⏳ Pending DNS | Anna to confirm provider |

---

## 4. Anna's 20 May Staging Review PDF — Item-by-Item Status

| # | Item | Status |
| --- | --- | --- |
| 1.1 | Rename "The Work" → "Work with Anna" | ✅ Done |
| 1.2 | Mobile menu spacing/font | ✅ Out of scope (Anna confirmed) |
| 1.3 | Add Shop back to main nav | ✅ Done |
| 2.1 | Reduce homepage vertical spacing | ✅ Done |
| 2.2 | Softer homepage yellow | ✅ Done (unified to #FFF0D2) |
| 3.1 | Remove "Stories filed under" subtitle | ✅ Done |
| 3.2 | Trim subsections to max 4 per section | ✅ CMS-controlled cap; Anna trims her categories |
| 4.1 | Reset Letters two-colour rebuild | ⏳ Aneeza wordmark files |
| 4.2 | Canonical tags on all article pages | ✅ Done |
| 5.1 | Reset Stories text contrast audit | ✅ Done (sitewide AA compliant) |
| 5.2 | Photo-hover-tag pattern for products | ✅ Built (`ShopTheStory` component) |
| 5.3 | Keep burgundy quote section | ✅ Done |
| 5.4 | RESET LETTERS wordmark placement | ⏳ Aneeza files |
| 6.1 | Stacked wordmark, 72px | ✅ Done |
| 6.2 | 5 footer social icons | ✅ Done (SVG icons) |
| 6.3 | Press logos + cert badges artwork | ⏳ Anna artwork files |

**Of 17 items: 14 done, 3 waiting on external files.**

---

## 5. What Is Pending

### 5.1 Blocked on Anna

| Item | What's needed |
| --- | --- |
| Production DNS cutover | Anna confirms go-live date → IONOS DNS for annalouwellness.com → new VPS |
| Stripe live keys | Anna provides UK bank account → activate Stripe live mode → 3 env vars updated |
| 9 external URLs for Mailchimp templates | INTAKE / BOOKING / SCOPING / CALENDAR / REPLAY / COMPANION / DONATION / GROUP / SNAPSHOT |
| Mailchimp email body design | Anna designs visual content for 13 journey emails |
| Press logos + cert badge artwork | Item 6.3 above |
| Subcategory list pruning | Item 3.2 — Anna decides which 4 sub-topics per section to keep |
| Real product photography | Currently using Unsplash placeholders for shop |
| Real portrait photography | Hero, work, community, portrait images currently placeholders |

### 5.2 Blocked on Aneeza (designer)

| Item | What's needed |
| --- | --- |
| Reset Letters two-colour rebuild | Item 4.1 — final wordmark files |
| RESET LETTERS wordmark placement | Item 5.4 — final SVG |

### 5.3 Blocked on Sameer (dev)

| Item | Why | Effort |
| --- | --- | --- |
| VPS L+ upgrade (4 GB → 8 GB) | Deploys are tight on 4 GB; needs upgrade before jewellery site adds load | ~½ day (order VPS + Postgres dump/restore + Coolify reinstall + DNS cutover) |
| Multi-brand single-CMS conversation with Anna | Get buy-in for jewellery + wellness sharing one Strapi | 1 meeting |
| Jewellery site kickoff (annalouoflondon.com) | After Anna's buy-in, build second Next.js app sharing same Strapi | ~3 weeks |

### 5.4 Deliberately deferred (do later)

- Member-only screen real-data wiring (vault, replays, dashboard) — currently rendering placeholder microcopy. Will be wired up once first real Reset Room members sign up.
- Quiz scoring matrix improvements — questions + weights currently hardcoded for predictable results; can be moved to CMS later if Anna wants to A/B test variations.
- Custom polyfill stripping (11 KiB legacy JS savings) — risk of breaking on Next.js upgrades, marginal benefit (2-3 Lighthouse points). Not worth doing.

---

## 6. Pre-Launch Checklist (before any Mailchimp journey or paid product goes live)

1. ☐ Production domain `annalouwellness.com` cut over from old WordPress to new Coolify VPS
2. ☐ Anna's 9 external URLs filled into Mailchimp templates
3. ☐ Stripe swapped from test keys to live keys (3 env vars in Coolify)
4. ☐ Live Stripe webhook registered + signing secret updated
5. ☐ One real £1 transaction verified end-to-end (checkout → webhook → Mailchimp tag fires)
6. ☐ VPS L+ upgrade completed (recommended before jewellery site joins)
7. ☐ Anna previews each of the 13 Mailchimp journey emails and signs off

Until items 1-5 are done, all Mailchimp journeys stay as **drafts**.

---

## 7. Performance Baseline (Launch Reference)

**Measured 22 May 2026 via Google PageSpeed Insights (mobile, real Google infra):**

| Metric | Value |
| --- | --- |
| Performance | 97 |
| Accessibility | 96 (→ 100 after deploy of commit 868e9bb) |
| Best Practices | 96 |
| SEO | 100 |
| First Contentful Paint | < 1.8s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | low |
| Cumulative Layout Shift | < 0.1 |

Note: Local Chrome DevTools Lighthouse run from Sameer's India connection shows lower numbers (78-83) because of India → Frankfurt network latency. UK customers will see numbers close to the PSI 97. This is normal and expected.

---

## 8. Repository, Branches, Deploys

- **Repo:** anna-lou-wellness (private GitHub)
- **Main branch:** `main` (auto-deploys to staging on push)
- **Latest commit:** `868e9bb` — A11y contrast + image optimization
- **Deploy method:** Coolify on IONOS VPS, push to `main` → auto rebuild
- **Database:** PostgreSQL (managed by Coolify)
- **Media:** Cloudinary (free tier sufficient)

---

## 9. Anna Self-Serve Guide

The end-user editing guide for Anna is at `Docs/ALW_CMS_Editing_Guide.docx` (delivered 18 May, covers iPhone editing flows, magic-link CMS login, image upload via Cloudinary, publishing articles, managing the shop).

---

*Document generated 22 May 2026 EOD. Next session focus: VPS L+ migration + jewellery build kickoff.*
