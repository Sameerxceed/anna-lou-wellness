# Phase 2A — Foundation (done)

## What's now wired

### Strapi side
- **User schema extended** ([cms/src/extensions/users-permissions/content-types/user/schema.json](cms/src/extensions/users-permissions/content-types/user/schema.json)) with:
  `firstName, lastName, stripeCustomerId, stripeSubscriptionId, subscriptionStatus, memberSince, accessUntil, podcastRssUrl, helloAudioSubscriberId`
- **`reset-room-member` role** auto-created on Strapi boot ([cms/src/index.js](cms/src/index.js)). Granted: read own customer record, find/findOne on vault journeys.
- **Internal API** `/api/reset-room/grant|revoke|cancel-at-period-end|update-podcast-url` ([cms/src/api/reset-room-member-action/](cms/src/api/reset-room-member-action/)). All require header `x-reset-room-secret: <RESET_ROOM_ADMIN_SECRET env>`. Stripe webhook in Phase 2B will call these.
- **Hourly cron** ([cms/config/tasks/reset-room-access-revoke.js](cms/config/tasks/reset-room-access-revoke.js)) downgrades any member whose `accessUntil` has passed.

### Next.js side
- **Auth library** [web/src/lib/auth.ts](web/src/lib/auth.ts): `getSession()`, `loginWithStrapi()`, `requestPasswordReset()`. Returns `{ user, isMember }` with `isMember = role.type === 'reset-room-member'`.
- **API routes**:
  - `POST /api/auth/login` → calls Strapi `/api/auth/local`, sets httpOnly `rr_session` cookie
  - `POST /api/auth/logout` → clears cookie
  - `POST /api/auth/forgot-password` → triggers Strapi reset email
- **Edge middleware** [web/middleware.ts](web/middleware.ts) — cookie presence check on protected prefixes, redirects to `/login?next=…` if missing.
- **Login page** at [`/login`](web/app/login) — handles sign-in + forgot-password flow, branded.
- **Replays page** at [`/community/reset-room/replays`](web/app/community/reset-room/replays/page.tsx) — gated, empty state for now.
- **Account page** at [`/community/reset-room/account`](web/app/community/reset-room/account/page.tsx) — shows member details + sign-out + (disabled) Manage Subscription button placeholder for Phase 2B.
- **Dashboard rewired** [web/app/community/reset-room/dashboard/page.tsx](web/app/community/reset-room/dashboard/page.tsx) — uses real session, greets by first name, "Where to start" auto-hides after 30 days, footer links updated.
- **Vault list + detail** gated with same `getSession + isMember` pattern.

## How to test manually (after Strapi rebuild)

1. In Strapi admin → Settings → Users & Permissions Plugin → Roles → confirm `Reset Room Member` role exists
2. In Strapi admin → Content Manager → User → Create new user, set role to `Reset Room Member`, fill firstName + email + password, save
3. On staging, visit `/login`, sign in with that user's email + password
4. Should land on `/community/reset-room/dashboard` with their first name shown
5. Visit `/community/reset-room/vault`, `/replays`, `/account` — all should load
6. Sign out from account page → revisit any protected route → redirected to `/login`
7. Change that user's role back to `Authenticated` in Strapi admin → log in again → should redirect to public Reset Room landing

## What's NOT yet wired

- ❌ No Stripe checkout. Members are manually created in Strapi admin for now.
- ❌ No Hello Audio RSS — `podcastRssUrl` field exists but nothing populates it
- ❌ No welcome emails firing on signup
- ❌ Vault content is hardcoded list (7 founding pieces) — not yet a Strapi content type
- ❌ Bunny.net video embeds not wired (vault detail page still placeholder)

## Required env vars

### Strapi (Coolify)
- `RESET_ROOM_ADMIN_SECRET` — random 32+ char string. Used by Stripe webhook handler (Phase 2B) to call the internal grant/revoke endpoints.

### Next.js (Coolify)
- (Existing) `STRAPI_URL` — points to Strapi instance. No new env needed for 2A.

## Next: Phase 2B

Stripe checkout + webhook → grant/revoke role automatically. Need from Anna:
- Stripe test mode keys
- Stripe product "Reset Room Membership" £25/month created
- Webhook endpoint URL set to `https://staging.annalouwellness.com/api/webhooks/stripe`
