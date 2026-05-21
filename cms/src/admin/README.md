# Strapi Admin Customizations

This directory contains custom code that runs inside the Strapi admin panel
(at `cms.annalouwellness.com/admin`). None of it is visible to the public
site — these are CMS editor UX improvements only.

## Why these exist

The Strapi default admin is generic. Non-technical clients (like Anna) get
confused by:

- Hardcoded "Content Manager" jargon
- Flat alphabetical sidebar with 39 content types
- "Last edited entries" widget showing meaningless titles
- List views with all entries mixed regardless of section
- Generic theme that doesn't match the brand they see on the site

This folder is where we make those better — one customization at a time.

## Files

| File | What it does |
|---|---|
| `app.tsx` | Main entry. Registers config (translations, theme, branding) and bootstrap (Content Manager injections). |
| `extensions/` | (Future) React components for list-view injections, custom dashboard widgets, etc. |
| `README.md` | This file. |

## Roadmap

In rough priority order. Each step is independently deployable.

### Phase 1 — Foundation (current) ✅
- Custom translations (welcome message, brand name)
- Brand-aligned theme (plum #6E3A5A primary)
- Console marker on load (so build failures are obvious)
- This README

### Phase 2 — List view enhancements ⏳
- **Section filter pills on Story · Category** — pills at the top of the
  list (All / Reset Stories / Life / Love & Rels / Work & Money) — click one
  to filter the list. Anna doesn't have to use the Filters button.
- Same pattern for Story · Article (filter articles by their category's section).

### Phase 3 — Custom dashboard ⏳
- Replace the generic "Hello Anna" home page with a dashboard of:
  - Quick links to the 6 menu-section landings (Edit Reset Stories ...)
  - "Recent orders" widget
  - "Today's drafts" widget
  - "Things waiting on you" widget (e.g. unactivated Mailchimp journeys)

### Phase 4 — Sidebar tree ⏳
- Windows-Explorer-style expandable sidebar:
  - Top-level: each main menu section (Reset Stories ▾ / Life ▾ / Shop ▾)
  - Expand: shows that section's landing page, sub-pages, category collection
- Hides the flat "Content Manager → 30 collections" overwhelm

### Phase 5 — Inline preview edit ⏳
- When Anna clicks Preview, the iframe renders the page with edit overlays —
  click a heading, edit it inline, save back to Strapi without leaving the
  page view.

## Patterns this contributes to the Xceed CMS template

Every customization here is generic enough to lift into the Xceed CMS
foundation repo. Anna's branding (the hex codes, the section names) is
the only client-specific config — and that should eventually move to an
env var / client-config import so this folder is purely framework code.

When adding a new customization:
1. Write it generic-first (parameterise client-specific bits)
2. Document the pattern in the file's header comment with `Xceed pattern: ...`
3. Note any Strapi v5 API quirks for future framework work
