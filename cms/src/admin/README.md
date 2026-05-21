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

### Phase 1 — Foundation ✅
- Custom translations (welcome message, brand name)
- Brand-aligned theme (plum #6E3A5A primary)
- Console marker on load (so build failures are obvious)
- This README

### Phase 2 — List view enhancements ✅
- **Section filter pills on Story · Category** — pills at the top of the
  list (All / Reset Stories / Life / Love & Rels / Work & Money) — click one
  to filter the list. Anna doesn't have to use the Filters button.
- Same pattern for Story · Article (filter articles by their category's section).

### Phase 3 — Quick Edit dashboard ✅
- Homepage widget that renders a grid of cards, one per editable page.
- Each card links straight to the Strapi edit view for that singletype or
  collection — Anna lands on /admin and is one click from any page on the site.

### Phase 4 — In-page sub-menus ✅
- Dashboard is now grouped (Pinned essentials / Editorial / Other landings /
  Commerce / Articles) with a header per group.
- Each editorial card exposes sub-link chips (`Categories`, `Articles`) that
  jump to the pre-filtered list for that section — a "tree" experience
  without touching the Strapi sidebar.
- **Why not a sidebar tree:** Strapi v5's sidebar APIs (`addMenuLink`,
  plugin route registration, internal slot injection) are version-fragile.
  A broken sidebar registration crashes the entire admin. We get 90% of the
  tree benefit by keeping the hierarchy on the homepage page itself, where
  we have full React control and zero risk.

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
