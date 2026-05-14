# Anna Lou Wellness — Build Summary, 14 May 2026

Reply to Anna's email of 13 May (final docs delivery: layouts, Reset Room, services, email automations).

---

## What's live on staging today

**URL:** https://staging.annalouwellness.com

### 1. Reset Letters dual-push subscribe (live + tested)
- Sign-up form on `/reset-letters` now pushes simultaneously to **Substack** + **Flodesk**.
- Auto-routes to correct Flodesk segment based on launch date:
  - Before 22 June 2026 OR before 500-subscriber cap → **Founding Members** (Sequence 1A)
  - After cap or launch date → **Standard Subscribers** (Sequence 1B)
- Tested end-to-end: subscriber created, segment attached, Founding Members count now shows 1.
- Substack still handles actual newsletter delivery; Flodesk handles welcome + nurture sequences.

### 2. Paywall display for paid Substack articles
- Free articles → full content on website.
- Paid articles → preview (first ~4 paragraphs / 180 words) + "Subscribe on Substack →" CTA.
- "Read on Substack →" link shows on article meta when canonical Substack URL is present.

### 3. Substack RSS auto-sync (Strapi cron, hourly)
- Anna writes once on Substack → article appears on website within ~1 hour.
- Detects free vs paid (paywall markers + truncated body).
- Maps Substack section → Strapi category slug.
- Result: website is canonical, Google ranks it, traffic flows to shop/coaching.

### 4. Homepage stock images
- Hero block, featured story card, 3-card grid all now render real Unsplash photos.
- Hash-based deterministic selection per article slug (each card gets a different image, consistent across reloads).
- Falls back to article's `heroImage` field if Anna uploads a real photo in Strapi.

### 5. Brand logo pack
Location: `web/public/brand/` (10 SVG files)
- Wide wordmark (nav, email headers)
- Square / stacked / cream-bg / email-signature variants
- White-on-dark version
- AL initials mark for tiny placements
- Favicon, Apple touch icon, OG share image
- All match the live wordmark style: serif caps, letter-spaced, no crown (per Anna's decision)
- Nav now renders the wide wordmark SVG instead of plain text

### 6. New pages built from layouts doc
- **Reset Room landing** (`/community/reset-room`) — ooomies-inspired 3-pillar design in brand colours
- **Quiz** (`/the-work/quiz`) — interactive 5-question quiz, routes to right programme
- **Programme pages** — The Reset, Signal, Signal & Build, One Day (shared template, brand-coloured per offer)
- **Reset Sessions** sub-pages — Founder Reset, Dating Reset, Nervous System Reset (£200 each)
- **Signal Collective** mastermind page
- **Recovery Coaching** standalone page
- **Decoder lead magnet** page with email capture
- **All enquiry forms built** — Returning Circle, Corporate, Speaking, One Day, Signal Collective (8 form endpoints; only Reset Letters wired to live API so far)

### 7. Cleanup
- Removed all retired products from Strapi: Sparkle Mastery, Crystal Clear Business Vortex, Crystal Wellbeing Teens, Children's Crystal Parties, Level Up & Sparkle Corporate, FREE Crystal Healing.
- Removed kids/teens content where flagged in the docs.

---

## What's pending — Anna's side

### Flodesk email content + design
- **1A Founding Welcome** workflow created (trigger + segment wired) — needs email design + B.1A copy paste.
- **1B Standard Welcome** through **B.17** — 16 more sequences to build.
- Copy is ready in `ALW_EMAIL_AUTOMATIONS_FINAL_Sameer.docx`.
- Full build spec at `Docs/FLODESK_BUILD_SPEC.md` — covers all 12 sequences (23 emails total), segment names, delays, subject lines.
- **Sameer offer:** can set up the 12 workflow shells (trigger + segment + placeholder emails + delays). Anna then just pastes content + designs into each placeholder.

### Real photos to replace stock
- Stock images are placeholders. As Anna delivers portraits, studio shots, Hampton boat photos, etc., we'll swap them in via Strapi's hero image field per article.

### Bank details for checkout
- Currently XXXX placeholders. Need real account details before live launch.

---

## What's pending — Phase 2 (dev)

These are queued for after Anna confirms the build:

- **Stripe integration** — checkout for Reset Room (£25/mo), The Reset (£1,500), Signal (£3,000), Signal & Build (£3,000), One Day, Reset Sessions (£200), Signal Collective.
- **Stripe webhooks** → auto-add buyers to relevant Flodesk segments (Reset Room Members, The Reset, Signal, etc.) so sequences 6-12 auto-fire.
- **Reset Room member gating** — Strapi `reset-room-member` role + login flow.
- **Hello Audio** — private podcast hosting for Reset Room members.
- **Bunny.net** — video hosting for vault content.
- **Calendly webhook** for Discovery Call booked → adds to Flodesk segment for sequence 4.
- **Form-to-Flodesk routes** — Decoder, Returning Circle RSVP, etc. (5 more API routes mirroring the Reset Letters pattern).

---

## Documents created today

| File | Purpose |
|---|---|
| `Docs/FLODESK_BUILD_SPEC.md` | Workflow build spec for all 12 sequences |
| `Docs/TODAY_SUMMARY_14_MAY_2026.md` | This summary |
| `web/public/brand/` | 10 logo SVG files |

---

## Commits today (chronological)

- `5eacdf2` Paywall: free preview + Substack subscribe CTA for paid articles
- `5c637e9` Wire dual-push Reset Letters subscribe (Substack + Flodesk fan-out)
- `ca4be71` Fix Flodesk: 2-step subscribe (create subscriber, then POST to /segments)
- `58d81b0` Flodesk: User-Agent header + send segments in both calls (belt-and-suspenders)
- `9873543` Homepage stock images + brand logo pack
- `f4003d8` Fix homepage build: stockCategoryForSection helper for type safety

---

## Suggested next steps

1. **Anna:** Send portrait + brand photos so we can replace stock images.
2. **Anna:** Send real bank details for checkout placeholders.
3. **Anna:** Build the 1A welcome email in Flodesk (workflow shell ready).
4. **Sameer:** Build remaining 11 Flodesk workflow shells (~2 hours, mechanical).
5. **Together:** Confirm scope/timing for Phase 2 (Stripe + Reset Room login + Hello Audio).
