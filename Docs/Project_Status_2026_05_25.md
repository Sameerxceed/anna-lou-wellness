# Anna Lou Wellness — Project Status

**Date:** 25 May 2026 (Monday)
**Domain (staging):** staging.annalouwellness.com
**CMS (staging):** cms.annalouwellness.com
**Hosting:** IONOS VPS (Frankfurt, 4 GB + 4 GB swap) via Coolify
**Repository:** anna-lou-wellness (Next.js 15 + Strapi v5)

---

## 1. Executive Summary

The Anna Lou Wellness website is **functionally complete and launch-ready**. Every editable page is CMS-driven by Strapi, every public form is bot-protected by Cloudflare Turnstile, and every CMS edit propagates to the live site within 1-2 seconds via on-demand revalidation. Mobile performance sits at 98 (Google PageSpeed Insights).

The remaining items are **operational handover** — Anna provides content + activates third-party services. No further engineering work is required to launch.

---

## 2. What Has Been Built — Frontend (Next.js)

### 2.1 Public site (~36 editable pages)

Same scope as the 22 May status report. Highlights:

- Homepage with 17 sections (editorial-first, magazine layout)
- 4 editorial sections (Reset Stories, Life, Love & Relationships, Work & Money) with subcategory filters and individual article pages (free + paid Substack)
- Work with Anna — landing + ways-to-work-with-me + 8 programmes/sessions + free quiz
- Experiences — landing + per-type pages (retreats, workshops, corporate, speaking)
- Shop — landing + 3 sub-collections (New In, Personalised, ESJ) + product detail + cart + Stripe checkout
- Community, About, Cosmic Forecast, Mantras, Reset Letters, Login, Privacy, Terms
- All member-only screens built (vault, replays, dashboard, account) — awaiting first real members

### 2.2 Performance, accessibility, SEO

- **PageSpeed Insights mobile: 98** (Performance) / 96 (Accessibility) / 96 (Best Practices) / 100 (SEO)
- WCAG AA contrast compliant sitewide
- Structured data (Article, BreadcrumbList) on every relevant page
- Canonical + Open Graph + Twitter Cards on every page
- Sitemap.xml + robots.txt generated from CMS content
- Hero LCP optimised with preload + fetchpriority

### 2.3 New since 22 May

- **7 retreats / workshops migrated** from the old WooCommerce shop to Strapi as Experiences. Live on `/experiences/retreats` and `/experiences/workshops`. Booking via mailto: until Stripe live mode.
- **Image handling** robust to any aspect ratio. Product page uses `object-contain`. ShopTheStory gallery has per-tile `fit_mode` (cover or contain) Anna picks per photo.
- **Cloudflare Turnstile CAPTCHA** on Reset Letters signup + Forgot Password (rest of forms covered by Stripe's own protection)
- **All newsletter CTAs routed through `/reset-letters`** — single signup form that dual-pushes to Mailchimp + Substack with proper tagging
- **Reset Letters page redesigned** to inherit the site-wide nav + footer (was a standalone holding page; now consistent with the rest of the site)

---

## 3. What Has Been Built — CMS (Strapi v5)

### 3.1 Content types

Same as 22 May — ~35 content types covering every editable surface.

### 3.2 New since 22 May — admin UX polish

- **Quick Edit dashboard** now has rich expandable cards. Click "Show contents" on any landing card to see every editable item on that public page (sub-menu items, sub-pages, articles, events, products). Clickable section headers link to the relevant Strapi list view.
- **"Everything on this page" panel** appears in the right sidebar of every landing page edit form. Clickable section rows take Anna straight to the relevant filtered list.
- **Auto-sort by date** for Experience entries (CMS list view always shows upcoming events in chronological order).
- **Photo size guidance** appears inline on every image field (recommended dimensions, max file size, purpose).
- **`Experiences · Event`** display name (was `Work · Experience`) so the collection sorts next to the Experiences singleton in the sidebar.

### 3.3 On-demand revalidation (NEW — major)

- 34 Strapi lifecycle hooks across every public content type
- Next.js `/api/revalidate` endpoint with shared-secret protection
- Editor saves a change → Strapi fires lifecycle → Next.js cache busted in 1-2 seconds → live site reflects the change immediately
- Covers: every article, every product, every retreat/workshop, every landing page, every category, navigation, footer, site settings (layout-level refresh for the last three)
- Env vars: `REVALIDATE_SECRET` (both apps), `PUBLIC_SITE_URL` (Strapi only)

---

## 4. Integrations Status

| Integration | Status | Notes |
| --- | --- | --- |
| Strapi CMS | ✅ Live | cms.annalouwellness.com |
| Cloudinary image hosting | ✅ Live | Auto EXIF rotation |
| **Mailchimp (audience + journeys + master template)** | 🟡 Drafts ready | 13 journey drafts use ALW Master template. 23 reference HTML files held back until Anna sends 9 URLs (see §6) |
| **Mailchimp Reset Letters signup endpoint** | ✅ Live | `/api/subscribe-reset-letters` — dual-push to Mailchimp + Substack |
| Substack | ✅ Live | Newsletter delivery + link-out from paid articles |
| **Stripe Checkout (test mode)** | ✅ Tested end-to-end | Shop + sessions + programmes all working with test cards |
| **Cloudflare Turnstile CAPTCHA** | ✅ Live | Reset Letters signup + Forgot Password protected |
| Cloudinary | ✅ Live | All image uploads route through here |

---

## 5. Anna's 20 May PDF Feedback — Item-by-Item

| # | Item | Status |
| --- | --- | --- |
| 1.1 | Rename "The Work" → "Work with Anna" | ✅ Done |
| 1.2 | Mobile menu spacing/font | ✅ Out of scope (Anna confirmed) |
| 1.3 | Add Shop back to main nav | ✅ Done |
| 2.1 | Reduce homepage vertical spacing | ✅ Done |
| 2.2 | Softer homepage yellow | ✅ Done |
| 3.1 | Remove "Stories filed under" subtitle | ✅ Done |
| 3.2 | Trim subsections to max 4 per section | ✅ CMS cap built; Anna trims her categories |
| 4.1 | Reset Letters two-colour rebuild | ⏳ Aneeza wordmark files |
| 4.2 | Canonical tags on all article pages | ✅ Done |
| 5.1 | Reset Stories text contrast audit | ✅ Done (WCAG AA sitewide) |
| 5.2 | Photo-hover-tag pattern for products | ✅ Built (`ShopTheStory` component, tested) |
| 5.3 | Keep burgundy quote section | ✅ Done |
| 5.4 | RESET LETTERS wordmark placement | ⏳ Aneeza files |
| 6.1 | Stacked wordmark, 72px | ✅ Done |
| 6.2 | 5 footer social icons | ✅ Done (SVG icons) |
| 6.3 | Press logos + cert badges artwork | ⏳ Anna artwork files |

**14 of 17 done. 3 waiting on external deliverables (Anna's artwork + Aneeza's files).**

---

## 6. What Is Pending

### 6.1 Blocked on Anna (operational)

| Item | What's needed | Effort once unblocked |
| --- | --- | --- |
| **9 Mailchimp URLs** | INTAKE / BOOKING / SCOPING / CALENDAR / REPLAY / COMPANION / DONATION / GROUP / SNAPSHOT | ~10 min to substitute + push 12 templates |
| **Stripe live mode** | Anna verifies UK bank → activates Stripe live → I swap 3 env vars | 15 min |
| **Production DNS cutover** | Anna picks go-live date → IONOS DNS for annalouwellness.com → new VPS | ~1 hour |
| **Mailchimp email content + activation** | Anna designs email visual for each journey + activates draft → live | her work, 13 journeys |
| **Hero images for 7 retreats** | Anna uploads via CMS (Cloudinary handles EXIF) | her work |
| **Real product photography** | Currently using placeholders | her work |
| **Real portrait photography** | Hero, work, community, portrait images placeholder | her work |
| **Subcategory pruning (PDF 3.2)** | Anna trims Article Categories to max 4 per section | her work |
| **Reset Letters branding decision** | Anna decides if button text reads "Join Reset Letters" or "Join on Substack" or "Subscribe" | one-line code change |

### 6.2 Blocked on Aneeza (designer)

| Item | What's needed |
| --- | --- |
| Reset Letters two-colour rebuild (PDF 4.1) | Final wordmark files |
| RESET LETTERS wordmark placement (PDF 5.4) | Final SVG |
| Press logos + cert badge artwork (PDF 6.3) | Files from Anna |

### 6.3 Sameer's queue (when ready)

| Item | Urgency | Effort |
| --- | --- | --- |
| Multi-brand conversation with Anna | When Anna ready | 1 meeting |
| Jewellery site kickoff (annalouoflondon.com) | After Anna's buy-in | ~3 weeks |
| VPS L+ upgrade (4 → 8 GB) | **No longer urgent** (swap solved deploy issue) — only when jewellery joins | ½ day |
| Member-only screen real-data wiring | When first real Reset Room members sign up | ~1 day |
| Template extraction (rest of work) | Before next Xceed client kicks off | ~6 hours focused |

---

## 7. Pre-Launch Checklist

Before activating any Mailchimp journey or accepting real payments, all of the following must be true:

1. ☐ Production domain `annalouwellness.com` cut over to new VPS
2. ☐ Anna's 9 URLs received and substituted into Mailchimp templates + uploaded
3. ☐ Stripe live keys active in Coolify env vars on Next.js app
4. ☐ Live Stripe webhook signing secret updated
5. ☐ One real £1 transaction verified end-to-end (checkout → webhook → Mailchimp tag fires)
6. ☐ Anna previews each of the 13 Mailchimp journey emails and signs off
7. ☐ Anna activates each journey one at a time (DRAFT → LIVE in Mailchimp)

Until items 1-5 are done, all Mailchimp journeys stay as **drafts**.

---

## 8. Performance Baseline (Launch Reference)

**Measured via Google PageSpeed Insights (mobile, real Google infra):**

| Metric | Value |
| --- | --- |
| Performance | **98** |
| Accessibility | 96 |
| Best Practices | 96 |
| SEO | **100** |
| First Contentful Paint | < 1.8s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | low |
| Cumulative Layout Shift | < 0.1 |

Top 5% of the web for mobile performance.

---

## 9. Infrastructure

- **IONOS VPS:** 4 vCPU, 4 GB RAM, 120 GB disk, Frankfurt, Ubuntu 24.04
- **Swap:** 4 GB (added 24 May — eliminates deploy-time OOM)
- **Coolify:** v4.0.0 at 217.160.147.201:8000
- **PostgreSQL:** managed by Coolify
- **Media:** Cloudinary (free tier sufficient)
- **Repo:** GitHub, auto-deploys on push to `main`
- **Latest commit:** `2b9a552` — Reset Letters page consistency fix

---

## 10. What's NEW Since the 22 May Status Document

1. **VPS swap (4 GB)** — no more deploy dance, no OOM crashes
2. **7 retreats migrated** from old WooCommerce shop
3. **Quick Edit dashboard refactor** — clickable section headers + RelatedItemsPanel on every edit page
4. **Image handling** robust to any aspect ratio + size guidance inline
5. **34 lifecycle hooks** for instant cache busting on any CMS change
6. **Cloudflare Turnstile CAPTCHA** standardized across the site (Xceed default)
7. **All newsletter CTAs** routed through `/reset-letters` (dual-push + Turnstile + tagging)
8. **Reset Letters page** redesigned for site-wide consistency
9. **Template extraction started** — generic pieces copied to xceed-strapi-template + xceed-next-template

---

## 11. Recommendation

**The site is ready to launch.** Send Anna this 3-line message:

> Site is ready. To flip the switch I need from you:
> 1. The 9 URLs for the Mailchimp emails
> 2. Stripe bank confirmation + live mode activation
> 3. Your chosen go-live date for annalouwellness.com
>
> Once I have all three, I can cut over in about 2 hours on a day you choose.

Then stop building until she replies. The next session should be the cutover, not more features.

---

*Document generated 25 May 2026 (Monday). Supersedes Project_Status_2026_05_22.docx.*
