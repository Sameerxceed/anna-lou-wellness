# Phase 2 — Reset Room Membership Build Plan (simplified)

Source: `ALW_RESET_ROOM_BUILD_FINAL_Sameer.docx` + Anna's simplification email (15 May 2026)

**Final tech stack (decided 15 May):**
- Stripe (£25/mo subscription billing)
- Strapi (`reset-room-member` role + gated pages)
- **YouTube unlisted** for ALL video and audio content (sessions, vault, replays, monthly call replay)
- Zoom (monthly live Reset Call)
- Flodesk (member emails — triggered direct from Stripe webhook, no Zapier)

**Cut from earlier scope:** Hello Audio (private podcast), Bunny.net Stream (video hosting), Resend (we'll use Flodesk for everything).

**Zero additional monthly cost beyond what Anna already pays.**

---

## Build phases (in order)

### Phase 2A — Foundation [DONE]
- ✅ Strapi user model + `reset-room-member` role
- ✅ Strapi internal API `/api/reset-room/grant|revoke|cancel-at-period-end`
- ✅ Hourly cron to revoke expired access
- ✅ Next.js auth (login, logout, forgot-password)
- ✅ Edge middleware route gate
- ✅ Login page, account page, replays page shell
- ✅ Dashboard + vault gated with session check

### Phase 2B — Stripe checkout + webhooks [needs Stripe keys]
- [ ] Stripe £25/mo recurring product "Reset Room Membership"
- [ ] `/community/reset-room` → "Join the Reset Room" button → Next.js API route → Stripe Checkout
- [ ] Webhook `/api/webhooks/stripe`:
  - `checkout.session.completed` → call Strapi `/api/reset-room/grant` → assigns role + stores Stripe IDs
  - `customer.subscription.updated` → sync subscription status
  - `customer.subscription.deleted` → call Strapi `/api/reset-room/cancel-at-period-end` → schedules role removal
- [ ] Account page "Manage subscription" → Stripe customer portal link
- [ ] **Time:** ~1.5 days.

### Phase 2C — Flodesk welcome wiring [needs Flodesk segment]
- [ ] Flodesk segment: "Reset Room Members"
- [ ] Stripe webhook (after grant) → push subscriber to Flodesk segment via existing dual-push pattern
- [ ] Anna builds the welcome workflow in Flodesk (4 emails per the automations doc, segment-triggered)
- [ ] **Time:** ~0.5 day.

### Phase 2D — Vault + Sessions content (YouTube embeds)
- [ ] Strapi content type `vault-journey`: title, slug, length, description, **youtubeId** (string), coverImage, releaseDate, themes, order
- [ ] Strapi content type `reset-session`: same shape (for Pillar 1 bi-weekly sessions)
- [ ] Strapi content type `workshop-replay`: same shape (for replays page)
- [ ] Vault list page: pulls from Strapi
- [ ] Vault detail page: YouTube unlisted iframe embed + transcript
- [ ] Sessions list page (new — replaces the "private podcast" pillar)
- [ ] Replays list page: pulls from Strapi (currently empty placeholder)
- [ ] Pre-seed 7 founding vault journeys + reset session structure (placeholder rows; Anna fills YouTube IDs as videos go up)
- [ ] **Time:** ~1 day code, then content from Anna.

### Phase 2E — Dashboard polish
- [ ] Next Reset Call card (Block 2 from doc): brand pink bg, date dynamic, .ics calendar download, Zoom link (only live ±30min)
- [ ] "Where to start" auto-hides after 30 days (already wired in 2A)
- [ ] Update three pillar cards to reflect YouTube-based delivery
- [ ] **Time:** ~0.5 day.

---

## What Anna needs to set up (in parallel)

| Item | Needed by |
|---|---|
| Stripe account: £25/mo product + test mode keys + webhook secret | Phase 2B |
| Flodesk: "Reset Room Members" segment + welcome workflow | Phase 2C |
| Zoom: recurring monthly Reset Call meeting link | Phase 2E |
| YouTube: unlisted videos uploaded for founding 7 vault + first sessions + welcome video + orientation tour video | Phase 2D |

---

## Build order with checkpoints

```
✅ Day 1     Phase 2A Foundation                  → Tested manually with Strapi-created user
   Day 2-3   Phase 2B Stripe + webhooks           → Test payment end-to-end
   Day 3     Phase 2C Flodesk push from webhook   → Welcome email fires
   Day 4-5   Phase 2D Vault + Sessions + Replays  → Content shells ready, Anna populates YouTube IDs
   Day 5     Phase 2E Dashboard polish            → Full member experience
   Day 6     Soft launch — Anna self-tests with real card; bug fixes
```

**Total revised: ~5 days code + Anna's content uploads.**

---

## What's NOT in Phase 2

- Multi-tier membership
- Annual billing option
- Community forum / chat
- Mobile app
- Affiliate / referral
- Coupon codes
- Pause subscription
- Gift memberships

If Anna wants any of these later → Phase 3, scoped separately.
