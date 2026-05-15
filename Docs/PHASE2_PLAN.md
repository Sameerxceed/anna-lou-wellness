# Phase 2 — Reset Room Membership Build Plan

Source: `ALW_RESET_ROOM_BUILD_FINAL_Sameer.docx` (13 May 2026)

---

## Pre-flight decisions (need Anna to confirm before kicking off integrations)

| # | Decision | Why it matters | Default if no answer |
|---|---|---|---|
| 1 | Hello Audio vs Memberful Podcasts vs Supercast | Private podcast RSS per member | **Hello Audio** (doc recommends, $19/mo, Stripe one-click) |
| 2 | Resend vs Flodesk for Reset Room emails | Reset Room doc says Resend, automations doc says Flodesk — conflict | **Flodesk** (we already wired it for Reset Letters; reuse same integration) |
| 3 | Auth: NextAuth + Strapi as user store, OR Strapi JWT only | NextAuth gives cleaner Next.js DX; Strapi JWT is fewer moving parts | **Strapi JWT direct** (simpler, one source of truth) |

If no answer in 48h, proceed with defaults above.

---

## What Anna needs to set up (parallel to dev work)

She does these in her own time — doesn't block our build until the specific phase that needs them:

| Account | Needed by | Status |
|---|---|---|
| Stripe (live + test) — £25/mo Reset Room product | Phase 2B | ⏳ |
| Hello Audio (Growth plan, $19/mo) — API key | Phase 2C | ⏳ |
| Bunny.net Stream — library + access key | Phase 2D | ⏳ |
| Zoom recurring meeting — 1st Thursday 7.30pm UK | Phase 2F (cosmetic) | ⏳ |
| Founding 7 vault recordings (audio + video + cover art) | Phase 2D (content) | ⏳ |
| 90s welcome video + 5-min orientation tour video | Phase 2A (later) | ⏳ |

---

## Build phases (in order)

### Phase 2A — Foundation [~1 day, no Anna dependency]
- [ ] Strapi user content type extended with `resetRoomMember` role + member fields (memberId, podcastRssUrl, memberSince, stripeCustomerId, stripeSubscriptionId, subscriptionStatus, accessUntil)
- [ ] Auth: Strapi `/api/auth/local` for login, JWT stored in httpOnly cookie
- [ ] Next.js middleware: protect `/community/reset-room/dashboard|vault|replays|account` — redirect non-members to `/community/reset-room`
- [ ] Empty portal page shells:
  - `/community/reset-room/dashboard`
  - `/community/reset-room/vault`
  - `/community/reset-room/vault/[slug]`
  - `/community/reset-room/replays`
  - `/community/reset-room/account`
- [ ] Login page `/login` (Reset Room members only — no public registration; only Stripe webhook creates accounts)

**Deliverable:** Anna can manually create a test member in Strapi admin → log in → see empty portal pages → non-logged-in users get redirected.

### Phase 2B — Stripe checkout + webhooks [~1.5 days, needs Stripe keys]
- [ ] Stripe product: "Reset Room Membership" £25.00/month recurring
- [ ] `/community/reset-room` → "Join the Reset Room" button → Next.js API route → Stripe Checkout Session
- [ ] Webhook endpoint `/api/webhooks/stripe`:
  - `checkout.session.completed` → upsert Strapi user, set `resetRoomMember` role, store stripeCustomerId
  - `customer.subscription.updated` → sync `subscriptionStatus`
  - `customer.subscription.deleted` → schedule role removal at `current_period_end` (set `accessUntil`)
- [ ] Cron in Strapi: hourly check for `accessUntil < now` → revoke role
- [ ] Account page: "Manage subscription" → Stripe customer portal link
- [ ] Stripe success URL → `/community/reset-room/dashboard?welcome=1`

**Deliverable:** Anna pays £25 via Stripe test card → lands on dashboard logged in → can cancel via Stripe portal → access revoked at period end.

### Phase 2C — Hello Audio integration [~0.5 day, needs HA API key]
- [ ] Strapi service: `createHelloAudioFeed(email, name)` → POST to HA API → returns RSS URL
- [ ] Hook into Stripe webhook: after role grant → call HA → store `podcastRssUrl` on user
- [ ] Dashboard "Reset Room Sessions" card surfaces: Apple/Spotify/Overcast subscribe buttons (deep-link the RSS URL) + copy-to-clipboard
- [ ] Cancel webhook → call HA API to deactivate feed

**Deliverable:** New paid subscriber gets a working private podcast RSS in their welcome email + dashboard.

### Phase 2D — Vault content [~1 day code + Anna's recordings]
- [ ] Strapi content type `vault-journey`: title, slug, length, description, audioUrl (Bunny.net), videoUrl (Bunny.net), coverImage, releaseDate, themes (tags), order
- [ ] Vault list page: grid of all journeys, "New journey lands [date]" banner
- [ ] Vault detail page `/vault/[slug]`: Bunny.net video embed + audio fallback player + transcript
- [ ] Pre-seed 7 founding journeys (placeholder rows; Anna fills audio/video URLs as recordings land)

**Deliverable:** Anna uploads 7 audio + 7 video files to Bunny.net, pastes URLs into Strapi, vault is live.

### Phase 2E — Reset Room welcome emails [~0.5 day]
- [ ] Flodesk segment: "Reset Room Members"
- [ ] Stripe webhook (post role grant) → push member to Flodesk segment with merge fields (firstName, rssUrl, nextCallDate, portalUrl)
- [ ] Flodesk workflow: 4 emails wired (6.1 immediate, 6.2 +3d, 6.3 +7d, 6.4 monthly on 1st)
- [ ] (Anna builds the actual email design + copy inside Flodesk per the doc)

**Deliverable:** New member receives Email 6.1 within minutes of payment.

### Phase 2F — Dashboard polish [~0.5 day]
- [ ] Next Reset Call card (Block 2 from doc): brand pink bg, date dynamic, .ics calendar download, Zoom link (only live ±30min)
- [ ] "Where to start" block (auto-hides after 30 days member age)
- [ ] Workshop replays page (gated under same role)
- [ ] Account settings: change password, email, name

**Deliverable:** Dashboard matches the spec in Section 5 of the build doc.

---

## Build order with checkpoints

```
Day 1     2A Foundation                      → Sameer test login
Day 2-3   2B Stripe + webhooks               → Test payment end-to-end
Day 4     2C Hello Audio                     → Real RSS feed delivered
Day 4-5   2D Vault                           → Empty shells ready for Anna content
Day 5     2E Flodesk email wiring            → Welcome email fires
Day 6     2F Dashboard polish                → Full member experience
Day 7     Soft launch — Anna self-tests with real card; bug fixes
```

---

## Cost reality check (for Anna, ongoing)

| Tool | Cost |
|---|---|
| Hello Audio (Growth) | $19/mo (~£15) |
| Bunny.net Stream | £5–15/mo at expected volume |
| Stripe | 1.5% + 20p per transaction (UK) |
| Flodesk | already subscribed |
| Zoom | already subscribed |
| **Total new monthly cost** | **~£25–40/mo + Stripe fees** |

Per member at £25/mo: net ~£24 after Stripe fees. Break-even on infra at ~2 paying members.

---

## What's NOT in Phase 2

To keep scope tight, the following are explicitly out and can be Phase 3:

- Multi-tier membership (free vs paid Reset Room — currently just one £25 tier)
- Annual billing option (£250/year instead of £25/mo)
- Community forum / chat between members
- Mobile app
- Affiliate/referral system
- Coupon codes
- Pause subscription feature
- Gift memberships

If Anna wants any of these later, scope separately.
