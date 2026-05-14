# ANNA LOU OF LONDON
## E-Commerce Website Rebuild Proposal

**annalouoflondon.com**

---

Prepared by: Xceed Imagination
Date: 25 April 2026
Version: 1.0

---

## Table of Contents

1. Executive Summary
2. Current State Assessment
3. Current Limitations & Issues
4. What We Are Proposing
5. Feature List
6. Technology Stack
7. Migration & SEO Protection Plan
8. Delivery Timeline
9. Investment Summary
10. What Is Explicitly Included
11. Next Steps

---

## 1. Executive Summary

Anna Lou of London is a 20-year-old personalised jewellery brand with a heritage that includes Harrods, Selfridges, QVC Japan, Disney, Hello Kitty, and Ray-Ban licensing. The current website (annalouoflondon.com) is hosted on Shopify Basic at GBP 60/month (GBP 720/year).

Despite a strong brand and product range, the site has experienced a **~70% decline in organic traffic** due to a combination of technical SEO neglect, outdated content, and a homepage that prioritises brand storytelling over product discovery and purchase conversion.

This proposal outlines a complete rebuild of the e-commerce frontend using the same proven ReactJS + Strapi technology stack being used for annalouwellness.com. Both sites will share a single CMS backend, eliminating Shopify fees entirely and giving Anna full control over design, SEO, speed, and the customer journey.

The rebuild leverages Xceed's existing e-commerce system (built and proven for Ardea Gardens), which includes full product management, cart, checkout, Stripe payments, order management, shipping, tax, coupons, reviews, and customer profiles — all ready to deploy.

---

## 2. Current State Assessment

| Aspect | Current State |
|---|---|
| Platform | Shopify Basic (GBP 60/month) |
| Theme | Expression v5.4.11 (premium) |
| Domain age | ~20 years |
| Historical revenue | ~GBP 1M/year online |
| Current traffic | Down ~70% from peak |
| Products | 40+ personalised jewellery items (GBP 25 – GBP 1,500) |
| Categories | 20+ (Name necklaces, Birthstone, Engraved, Solid Gold, Kids, Gifts, etc.) |
| Payment processing | Shopify Payments |
| Email marketing | Flodesk (deliverability issues) |
| Reviews | Trustpilot integration |
| AI assistant | AskAnna (planned) |

---

## 3. Current Limitations & Issues

### 3.1 Homepage Does Not Sell

The current homepage functions as a **brand/lifestyle page** rather than a **shop homepage**. It features Instagram-style imagery, review carousels, and brand storytelling — but does not surface products, collections, or clear purchase pathways above the fold.

A buyer with purchase intent lands, sees no products, reads some content, clicks around, and leaves. This is the single biggest conversion issue on the site.

**What an e-commerce homepage should do:** Get people to products fast. Hero banner with shop CTA, top category tiles, bestsellers row, new arrivals, gift guides by price — every section above the fold should lead to a product or collection.

### 3.2 Broken Links & 404 Errors

Over 20 years, hundreds of products have been created and removed. Each deleted product URL is now a 404 error. Old press articles from Harrods, Selfridges, Disney, and media outlets link to these dead pages. Google sees dead links and downgrades domain trust.

- **About page** — returning 404 (confirmed)
- **Unknown number of product 404s** — requires Screaming Frog audit (estimated 50-200+)
- **Redirect chains** — old redirects pointing to other redirects, diluting SEO value

### 3.3 No Schema Markup

The site has minimal structured data. Google and AI tools (ChatGPT, Perplexity, Gemini, Claude) cannot properly understand:
- What products are available (Product schema missing/incomplete)
- FAQs (no FAQ schema)
- Brand information (Organization schema incomplete)
- Blog articles (no Article schema)

Without schema, the site is invisible to AI-driven search and misses rich results in Google (star ratings, prices, FAQ dropdowns).

### 3.4 Script Bloat & Poor Performance

The site loads **15+ third-party scripts** before any content renders:
- Trustpilot widget
- Lucky Orange analytics
- Facebook Pixel
- TikTok Pixel
- Google Analytics
- Hulk Form Builder
- hCaptcha
- Web Pixels Manager
- Multiple font families (EB Garamond, Nobel, Lato)
- Globo Mega Menu JS

This kills Core Web Vitals (page speed), which is a direct Google ranking factor since the March 2026 update.

### 3.5 No Google Merchant Centre

Google Merchant Centre provides **free product listings** that appear as a product grid above organic search results. For jewellery stores, this drives 20-30% of total Google traffic. Anna's store has never been connected. This is the single biggest missed traffic opportunity.

### 3.6 AI Crawlers Blocked/Not Allowed

The robots.txt does not explicitly allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended). As AI-referred traffic grew 7x for Shopify stores last year — and converts at 23x the rate of organic — this is increasingly critical.

### 3.7 Dead Blog & Thin Product Descriptions

Google's 2025-26 core updates aggressively penalise sites with stale content. The blog has not been updated in months. Product descriptions are thin. This signals an abandoned site to Google's algorithms.

### 3.8 No Google Business Profile

Despite being a real London-based business with 20+ years of trading history, there is no verified Google Business Profile. This means no knowledge panel on branded searches, no reviews in Google, and a missed local SEO signal.

### 3.9 Email Deliverability Issues

Flodesk newsletters have flatlined open rates. Likely causes: missing SPF/DKIM/DMARC records, Gmail Promotions tab, uncleaned subscriber list with dormant contacts dragging deliverability scores. The rebuild will replace Flodesk entirely with Resend — a modern email service with proper authentication configured from day one, at no monthly cost (free up to 3,000 emails/month).

### 3.10 Ongoing Shopify Costs

GBP 60/month (GBP 720/year) for Shopify Basic, when the same functionality can be delivered on the existing Strapi + Railway infrastructure at ~GBP 5-10/month shared with the wellness site.

---

## 4. What We Are Proposing

### Full E-Commerce Rebuild

A complete rebuild of annalouoflondon.com as a **product-first, SEO-optimised e-commerce site** using the same technology stack as annalouwellness.com — sharing a single Strapi CMS backend.

### Shared CMS Backend

Anna manages **both sites from one admin panel**:
- Wellness site content (blog, coaching, workshops, media)
- Jewellery site content (products, collections, orders, customers)
- One login, one dashboard, one place to manage everything

### Product-First Homepage

Every section above the fold leads to products:
1. **Hero banner** — strong product image + shop CTA (not a mood shot)
2. **Top categories grid** — 4-6 collection tiles (Necklaces, Bracelets, Earrings, Engraved, Gifts, Solid Gold)
3. **Bestsellers row** — 4-8 products with price and quick-view
4. **New Arrivals row** — fresh products signalling an active store
5. **Gift guide by price** — "Under GBP 50 / Under GBP 100 / Luxury"
6. **Trust bar** — Trustpilot score, free delivery, handmade in London, 20 years
7. **One testimonial** — single strong quote, not a carousel
8. **Blog teaser** — 2-3 cards, below the fold

### Built-In SEO Infrastructure

- Full Product schema (JSON-LD) on every product page
- FAQ schema on FAQ and relevant product pages
- Article schema on all blog posts
- Organization schema site-wide
- Auto-generated sitemap.xml
- Clean robots.txt with AI crawler allowlisting
- /llms.txt for AI discoverability
- Open Graph + Twitter Cards for social sharing
- Optimised meta titles and descriptions
- Canonical URLs (no duplicate content issues)
- WebP images with lazy loading
- No script bloat — only essential scripts

### Personalisation System

Custom fields on product pages for Anna's personalised jewellery:
- Name/text input for engraving
- Font selection
- Metal choice (Sterling Silver, 9ct Gold, 18ct Gold)
- Birthstone picker
- Size selection (ring size, bracelet length)
- Gift message

### Stripe Checkout

Secure, PCI-compliant payment processing:
- Stripe Checkout Sessions (hosted by Stripe)
- UK VAT handled automatically
- Order confirmation emails
- Refund processing via Stripe Dashboard
- 1.4% + 20p per transaction (no monthly fee)

### Google Merchant Centre Feed

Auto-generated product feed at `/api/products.json` for Google Merchant Centre free listings — the single fastest traffic recovery lever for jewellery stores.

### AskAnna AI Assistant (Claude API)

A custom AI chat widget built with Claude API, embedded on the site as a floating assistant:
- Trained on Anna's full product catalogue, brand voice, 25 years of jewellery expertise, FAQs, and sizing guides
- Pulls live product data from Strapi so recommendations are always current
- Answers customer questions: "Help me choose a gift", "What metals do you use?", "Can you engrave this?"
- Logs all conversations to Strapi for Anna to review — a goldmine of customer insight and future FAQ content
- Estimated API cost: ~GBP 5-15/month depending on traffic volume

### AI Content Assistant

Built into the Strapi admin panel, giving Anna AI-powered content tools:
- **Generate product description** — writes compelling product copy in Anna's brand voice from basic product details
- **Generate blog draft** — creates a structured blog post outline from a topic or keyword
- **Generate meta title & description** — SEO-optimised meta tags for any page
- All powered by Claude API, all editable before publishing

### Automated SEO Monitor

A weekly automated health check that scans the entire site for:
- New 404 errors and broken links
- Missing meta titles or descriptions
- Schema markup errors
- Image alt text gaps
- Sends a simple email report to Anna every Monday — no manual effort required

### Email Deliverability Fix

Flodesk retained for all emails — order confirmations, newsletters, and marketing campaigns:
- SPF/DKIM/DMARC properly configured during DNS migration to fix current deliverability issues
- No platform change needed — Anna continues using the tool she already knows
- Deliverability fix is a one-time DNS setup included in the domain migration

---

## 5. Feature List

### 5.1 Homepage

| # | Feature | Description |
|---|---|---|
| 1 | Hero Banner | Product-focused hero with shop CTA and seasonal messaging |
| 2 | Category Grid | 4-6 collection tiles linking to shop categories |
| 3 | Bestsellers Row | Top-selling products with price, image, quick-view |
| 4 | New Arrivals | Latest products carousel |
| 5 | Gift Guide | Price-band gift suggestions (Under GBP 50/100/Luxury) |
| 6 | Trust Bar | Trustpilot, free delivery, heritage, handmade credentials |
| 7 | Testimonial | Featured customer testimonial |
| 8 | Blog Teaser | 2-3 latest blog post cards |
| 9 | AskAnna CTA | Link to AI assistant / help |

### 5.2 Shop & Products

| # | Feature | Description |
|---|---|---|
| 10 | Shop Landing | All products with category filtering and sorting |
| 11 | Collection Pages | Dedicated pages per collection (Necklaces, Bracelets, etc.) with intro text |
| 12 | Product Detail Page | Images, description, variants, personalisation fields, add to cart |
| 13 | Product Variants | Metal type, size, style with independent pricing and stock |
| 14 | Personalisation Fields | Name input, font picker, engraving text, birthstone, gift message |
| 15 | Related Products | 3-4 related items on every product page |
| 16 | Product Reviews | Customer ratings and reviews per product |
| 17 | Search | Site-wide product and content search |
| 18 | Wishlist | Save products for later (session-based) |

### 5.3 Cart & Checkout

| # | Feature | Description |
|---|---|---|
| 19 | Shopping Cart | Add/remove items, update quantities, persistent across pages |
| 20 | Stripe Checkout | Secure hosted checkout via Stripe |
| 21 | Order Confirmation | Confirmation page + email to customer |
| 22 | Shipping Options | Flat rate, free above GBP 45 threshold |
| 23 | Coupon System | Percentage, fixed amount, and free shipping coupons |
| 24 | Gift Wrapping | Optional gift wrap add-on at checkout |

### 5.4 Order & Customer Management

| # | Feature | Description |
|---|---|---|
| 25 | Order Dashboard | View and manage orders in Strapi admin |
| 26 | Order Status Tracking | Pending, Paid, Shipped, Delivered, Cancelled statuses |
| 27 | Customer Profiles | Customer records with addresses and order history |
| 28 | Return Requests | Customer return workflow with reason tracking |
| 29 | Admin Email Notifications | New order alerts to Anna |
| 30 | Stripe Dashboard | Refunds, disputes, and payment management |

### 5.5 Content & SEO

| # | Feature | Description |
|---|---|---|
| 31 | Blog | Filterable blog with categories and search |
| 32 | FAQ Page | Structured FAQ with JSON-LD schema |
| 33 | About Page | Brand story, heritage, Anna's journey |
| 34 | Contact Page | Contact form with enquiry routing |
| 35 | Delivery & Returns | Shipping info, returns policy |
| 36 | Ring Size Guide | Sizing guide page |
| 37 | Care Guide | Jewellery care instructions |
| 38 | Sustainability | Brand sustainability statement |
| 39 | Google Merchant Feed | Auto-generated JSON product feed |
| 40 | /llms.txt | AI discoverability file |
| 41 | Full Schema Markup | Product, FAQ, Article, Organization JSON-LD |
| 42 | Sitemap & Robots.txt | Auto-generated, AI-crawler friendly |

### 5.6 AI-Powered Features (Claude API)

| # | Feature | Description |
|---|---|---|
| 43 | AskAnna AI Chat Widget | Floating chat assistant powered by Claude API, trained on product catalogue, brand voice, 25-year heritage, FAQs, and sizing guides. Pulls live product data from Strapi. Logs conversations for Anna to review. |
| 44 | Content Assistant | In-CMS buttons: "Generate product description", "Generate blog draft from topic", "Generate meta title & description" — all in Anna's brand voice |
| 45 | Auto SEO Monitor | Weekly automated check for 404s, broken links, missing meta tags, schema errors. Email report sent to Anna automatically |
| 46 | Social Auto-Post | When a new product or blog post is published in Strapi, auto-post to Instagram/Facebook via Meta API |

### 5.7 Cross-Cutting

| # | Feature | Description |
|---|---|---|
| 47 | Mobile-First Responsive | Full mobile optimisation |
| 48 | Sticky Header | Elegant header with cart icon and item count |
| 49 | Footer | Links, social icons, cross-link to wellness site |
| 50 | Cookie Consent | GDPR-compliant cookie banner |
| 51 | Google Analytics | Full analytics integration |
| 52 | 301 Redirect Map | All old Shopify URLs redirected to new structure |
| 53 | Cross-Link Ecosystem | Bi-directional links between wellness and jewellery sites |
| 54 | Brand Styling | Anna Lou of London brand identity, typography, colours |

---

## 6. Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js (React) | Fast, SEO-friendly, component-driven |
| CMS | Strapi 5 (Headless) | Shared with wellness site — one admin panel |
| Styling | Tailwind CSS | Rapid theming with brand palette |
| Database | PostgreSQL | Production-grade, shared with wellness site |
| Payments | Stripe | Secure checkout, 1.4% + 20p per txn, no monthly fee |
| Hosting | Vercel + Railway | Auto-deploy, CDN, shared infrastructure |
| Email | Flodesk (existing) | Newsletters, order emails, marketing campaigns |
| AI | Claude API | AskAnna chat widget, content assistant, SEO monitoring |
| Images | Cloudinary | Optimised image delivery, WebP auto-conversion |

### Why Not Stay on Shopify?

| Criteria | Shopify Basic | ReactJS + Strapi |
|---|---|---|
| Monthly cost | GBP 60 | ~GBP 5-10 (shared with wellness site) |
| Annual cost | GBP 720 | ~GBP 100-150 |
| Homepage control | Theme customiser (limited) | Fully custom — product-first layout |
| SEO control | Limited (Liquid templates) | Full control — schema, speed, structure |
| Script bloat | 15+ third-party scripts | Only essential scripts |
| Schema markup | Basic/manual | Automated JSON-LD on every page |
| AI discoverability | Not supported | /llms.txt, AI crawler allowlisting |
| Google Merchant feed | Via app | Native JSON endpoint |
| CMS integration | Separate system | Shared with wellness site |
| Design flexibility | Theme-constrained | Fully custom per section |
| Page speed | Heavy (accumulated apps) | Optimised, minimal JS |
| Transaction fees | 2% + Shopify Payments | 1.4% + 20p (Stripe only) |

---

## 7. Migration & SEO Protection Plan

The site has **20 years of backlinks** from press coverage (Harrods, Selfridges, Disney, media). Protecting this link equity during migration is critical.

### 7.1 Pre-Migration

1. Full Screaming Frog crawl of current site — export all URLs
2. Export all products, collections, images from Shopify
3. Map every old URL to new URL structure
4. Identify and document all existing backlinks (GSC + Ahrefs)
5. Baseline all metrics: GSC clicks/impressions, GA4 sessions, revenue

### 7.2 URL Redirect Strategy

Every Shopify URL will 301 redirect to its new equivalent:

| Old Shopify URL | New URL |
|---|---|
| /products/gold-initial-necklace | /shop/gold-initial-necklace |
| /collections/necklaces | /shop?category=necklaces |
| /collections/all | /shop |
| /blogs/news/post-title | /blog/post-title |
| /pages/about | /about |
| /pages/faq | /faq |
| /pages/contact | /contact |

- No URL will be left without a redirect
- No bulk redirects to homepage (Google penalises this)
- Redirect map tested before DNS switch

### 7.3 Post-Migration

1. Submit new sitemap to Google Search Console
2. Submit to Bing Webmaster Tools
3. Request indexing for top 20 pages
4. Monitor GSC for crawl errors daily for 2 weeks
5. Verify all redirects working in production

---

## 8. Delivery Timeline

This project runs in parallel with the annalouwellness.com build, sharing components and CMS infrastructure.

### Week 1 — Setup & Data Migration

- Strapi content types for jewellery products (extend existing e-commerce schema)
- Product data migration from Shopify (40+ products with images, variants, descriptions)
- Collection/category setup
- Brand identity implementation (logo, colours, typography)
- URL redirect map preparation

### Week 2 — Core Pages & Shop

- Homepage (product-first layout)
- Shop listing page with filtering and sorting
- Product detail pages with personalisation fields
- Collection pages
- Cart integration (reuse existing cart system)

### Week 3 — Checkout, Content, AI & SEO

- Stripe Checkout integration
- Order management in Strapi
- Blog, FAQ, About, Contact, Delivery, Care Guide pages
- AskAnna AI chat widget (Claude API integration)
- AI content assistant in Strapi admin (product descriptions, blog drafts, meta tags)
- Full schema markup implementation (Product, FAQ, Article, Organization)
- Google Merchant Centre JSON feed
- /llms.txt and AI crawler configuration
- Meta titles and descriptions for all pages
- Flodesk email deliverability fix (SPF/DKIM/DMARC during DNS migration)

### Week 4 — Testing, Migration & Launch

- Automated SEO monitor setup (weekly health check + email reports)
- Social auto-post integration (Instagram/Facebook on new content)
- Cross-device and cross-browser testing
- 301 redirect implementation and testing
- Performance optimisation
- Google Search Console and Analytics setup
- DNS switch from Shopify to new hosting
- Post-launch monitoring (crawl errors, redirect verification)
- Shopify cancellation (after confirming everything works)

---

## 9. Investment Summary

| | |
|---|---|
| **Total Investment** | **GBP 1,000** |
| **Delivery** | 4 weeks (parallel with wellness site build) |
| **Payment Term 1** | GBP 600 — due within 1 month of project kick-off |
| **Payment Term 2** | GBP 400 — due 3 months after project kick-off |

### Annual Cost Savings

| | Current (Shopify) | New (Shared Infrastructure) |
|---|---|---|
| Hosting/Platform | GBP 720/year | GBP 0 (shared with wellness site) |
| Transaction fees | 2% + Shopify Payments | 1.4% + 20p (Stripe) |
| **Annual saving** | | **~GBP 600+/year** |

The rebuild pays for itself within the first year through Shopify fee savings alone.

### Development Dependencies

- All product data, images, and descriptions provided or exported from Shopify
- Brand assets (logo files, fonts, product photography) provided at kick-off
- Stripe account credentials provided
- Domain access (DNS) for migration
- Clear sign-off at each weekly milestone
- 15 days post-launch support for bugs/fixes included
- If project not closed in agreed timeframe due to client-side delays, GBP 100/fortnight will be charged

### Ongoing Costs (Borne by Client)

| Service | Monthly Cost |
|---|---|
| Vercel (hosting) | GBP 0 (shared with wellness site) |
| Railway (CMS + DB) | ~GBP 5-10 (shared with wellness site) |
| Stripe | 1.4% + 20p per transaction |
| Claude API (AskAnna + content tools) | ~GBP 5-15 (usage-based) |
| Domain | ~GBP 15/year |
| **Total estimated** | **~GBP 10-25/month** |

---

## 10. What Is Explicitly Included

Everything in Section 5 (Features 1-54) is included in the GBP 1,000 investment:

- Full e-commerce website rebuild with product-first homepage
- 40+ product migration from Shopify with images and descriptions
- Product variant system (metal, size, style) with independent pricing and stock
- Personalisation fields (name input, font picker, engraving, birthstone, gift message)
- Shopping cart with Stripe Checkout integration
- Order management in Strapi admin
- Coupon/discount system
- Shipping calculation (flat rate + free above threshold)
- Customer profiles with order history
- Return request workflow
- Product reviews system
- Blog with categories and filtering
- FAQ page with schema markup
- About, Contact, Delivery, Returns, Care Guide, Sustainability pages
- Full SEO infrastructure (schema markup, sitemap, robots.txt, meta tags, Open Graph)
- Google Merchant Centre product feed
- /llms.txt for AI discoverability
- AI crawler allowlisting (GPTBot, ClaudeBot, PerplexityBot)
- 301 redirect map for all old Shopify URLs
- AskAnna AI chat widget (Claude API) — trained on products, brand voice, FAQs, sizing guides
- AI content assistant in CMS — generate product descriptions, blog drafts, meta tags in brand voice
- Automated weekly SEO health monitor with email reports
- Social auto-post on new product/blog publish (Instagram/Facebook)
- Email deliverability fix — Flodesk retained, SPF/DKIM/DMARC configured during DNS migration
- Mobile-first responsive design
- Google Analytics integration
- GDPR cookie consent
- Cross-linking with annalouwellness.com
- 15 days post-launch bug support
- CMS training (shared admin with wellness site)

### Additional Services (Available on Request)

The following items require manual effort or external account setup and can be arranged separately:

| Service | Effort | Notes |
|---|---|---|
| Google Merchant Centre account setup | One-time, ~1 hour | Account creation + verification. Product feed is already built into the site. |
| Google Business Profile setup | One-time, ~2 hours | Requires Google video verification. Adds knowledge panel to branded searches. |
| Backlink audit & outreach plan | One-time, ~3 hours | Export existing backlinks, identify unlinked brand mentions, create prioritised outreach list for Anna. |
| Social media strategy & management | Ongoing | Content calendar, posting schedule, engagement. Separate retainer. |

---

## 11. SEO Playbook Coverage

The current Technical SEO Revival Playbook (25 tasks) is largely addressed by this rebuild. Below is a task-by-task mapping showing what is covered, what is improved, and what remains.

| # | SEO Playbook Task | Status | How It Is Addressed |
|---|---|---|---|
| 1 | Baseline setup (GSC, GA4, Shopify exports) | Covered | GA4 integration included. GSC setup included. Historical Shopify data exported during migration. |
| 2 | Full technical audit (Screaming Frog) | Improved | Automated weekly SEO monitor replaces one-time audit with ongoing checks and email reports. |
| 3 | Submit sitemap, force re-crawl | Covered | Auto-generated sitemap.xml, submitted to GSC and Bing post-migration. |
| 4 | Fix every 404 error | Covered | 301 redirect map for all old Shopify URLs. No 404s on launch. |
| 5 | Install AskAnna AI assistant | Covered | Claude API chat widget built into the site — fully owned, no third-party dependency. |
| 6 | Make AskAnna discoverable to LLMs | Covered | /llms.txt, AI crawler allowlisting in robots.txt, Organization schema site-wide. |
| 7 | Google Merchant Centre free listings | Mostly Covered | Product feed JSON endpoint built into the site. Account creation is a one-time manual step (~1 hour, available as add-on). |
| 8 | Google Business Profile setup | Add-On | Listed as additional service (~2 hours). Requires Google video verification — cannot be automated. |
| 9 | FAQ schema markup | Covered | Full FAQ JSON-LD schema on FAQ page and relevant product pages, auto-generated from CMS content. |
| 10 | Product schema on top 30 products | Improved | Automated Product schema (JSON-LD) on ALL products, not just top 30. Includes price, availability, brand, images, reviews. |
| 11 | Publish FAQ batch 2 | Covered | FAQ page managed via CMS — Anna adds unlimited FAQs, schema auto-generated for each entry. |
| 12 | Site speed optimisation | Improved | Clean build from scratch — no script bloat, no legacy theme, no accumulated apps. Fast by design, not by patching. |
| 13 | Internal linking overhaul | Covered | Related products on every product page, collection cross-links, blog-to-product links — all built into page templates. |
| 14 | Meta titles and descriptions for top 50 pages | Improved | AI content assistant generates meta titles and descriptions. All pages have SEO fields in CMS. Covers every page, not just top 50. |
| 15 | Publish refreshed blog posts | Covered | Blog system with AI draft generation — Anna publishes content, AI helps write and optimise it. |
| 16 | Fix Shopify duplicate content | Not Applicable | Shopify's duplicate URL problem (collections + tags creating multiple URLs for same product) does not exist on the new build. Clean URL structure with proper canonicals from day one. |
| 17 | Publish new blog posts with full optimisation | Covered | Blog with full Article schema (JSON-LD), auto-generated meta tags, AI content assistant for drafting. |
| 18 | Allow AI crawlers and track AI traffic | Covered | robots.txt allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended. GA4 configured to track AI referral traffic. |
| 19 | Flodesk email deliverability fix | Covered | SPF/DKIM/DMARC properly configured during DNS migration. Flodesk retained — deliverability issues resolved at DNS level. |
| 20 | Backlink audit and outreach plan | Add-On | Listed as additional service (~3 hours). Creates prioritised outreach list. Actual outreach relies on Anna's existing press relationships. |
| 21 | Monthly technical health check | Improved | Automated weekly SEO monitor checks for 404s, broken links, missing meta, schema errors — with email reports. Better than monthly manual checks. |
| 22 | Monthly content publishing | Covered | Blog and CMS with AI content assistant makes ongoing publishing easy for Anna. |
| 23 | Monthly AskAnna conversation review | Covered | All AskAnna conversations logged in the admin dashboard for Anna to review — customer questions become future FAQ content. |
| 24 | Monthly AI citation audit | Not Covered | Manual effort — checking ChatGPT, Perplexity, Gemini, and Claude for brand mentions. A 30-minute monthly task Anna can do herself. |
| 25 | Monthly dashboard for Anna | Partially Covered | Automated SEO health report covers the technical side. Revenue and traffic reporting available via GA4 and Stripe dashboards. |

### Summary

| Status | Count | Details |
|---|---|---|
| Fully covered by the rebuild | 14 | Tasks 1, 3, 4, 5, 6, 9, 11, 13, 15, 17, 18, 19, 22, 23 |
| Improved beyond the original brief | 5 | Tasks 2, 10, 12, 14, 21 — automated, more comprehensive, or better by design |
| Available as add-on services | 3 | Tasks 7, 8, 20 — require manual account setup or outreach |
| Not applicable (problem eliminated) | 1 | Task 16 — Shopify duplicate content issue does not exist on new platform |
| Not covered (manual effort) | 1 | Task 24 — monthly AI citation checking across LLMs |
| Partially covered | 1 | Task 25 — technical reporting automated, business reporting via GA4/Stripe |

**22 out of 25 tasks are fully addressed or improved by the rebuild.** The remaining tasks are either one-time manual setup (available as add-on services) or lightweight monthly activities Anna can manage herself.

---

## 12. Next Steps

1. Review and approve this proposal
2. First payment of GBP 600 to confirm kick-off
3. Export product data and images from Shopify admin
4. Provide brand assets (logo files, product photography)
5. Provide Stripe account credentials
6. Provide domain registrar access (for DNS migration)
7. Development begins — runs parallel with wellness site build

---

*Prepared by Xceed Imagination*
*Rebuilding a 20-year jewellery brand for the next 20 years — faster, smarter, fully in your control.*
