# Stripe Integration — Build Notes

**Status:** Plumbing built 18 May 2026. **Not live yet — Anna must create products + you must register the webhook before anything works.**

## What's wired

### Code (committed)
- `web/src/lib/stripe.ts` — Stripe SDK init + price-ID → tag/role map
- `web/src/lib/mailchimp.ts` — Reusable Mailchimp helpers (`subscribeAndTag`, `removeTag`)
- `web/src/lib/strapi-admin.ts` — Strapi user/role management via admin API token
- `web/app/api/stripe/checkout/route.ts` — Creates Checkout Sessions
- `web/app/api/stripe/webhook/route.ts` — Handles Stripe events with signature verification

### Env vars set in Coolify (Next.js)
- ✅ `STRIPE_SECRET_KEY` (test mode `sk_test_...`)
- ✅ `STRIPE_PUBLISHABLE_KEY` (test mode `pk_test_...`)
- ⏳ `STRIPE_WEBHOOK_SECRET` (set after step 2 below)
- ⏳ `STRIPE_PRICE_RESET_ROOM` (set after step 1 below)
- ⏳ Other product price IDs as products are created
- ⏳ `STRAPI_ADMIN_API_TOKEN` (Strapi admin → Settings → API Tokens → Create token, full-access)

---

## Setup steps (do in this order)

### 1. Anna creates products in Stripe (Test mode)

Stripe Dashboard → **Product catalog → Add product**

For Reset Room (the first one we need):
- Name: `The Reset Room`
- Description: Monthly membership — Reset Room access
- Price: **£25.00 GBP, recurring monthly**
- Click Save → grab the **Price ID** (starts with `price_...`)

Paste that price ID into Coolify env:
- `STRIPE_PRICE_RESET_ROOM = price_XXXXXXX`

Repeat for each programme as Anna decides pricing (The Reset, Signal, Workshops, etc.) — each gets its own `STRIPE_PRICE_*` env var.

### 2. Register webhook endpoint in Stripe

Stripe Dashboard (Test mode) → **Developers → Webhooks → Add endpoint**

- Endpoint URL: `https://staging.annalouwellness.com/api/stripe/webhook`
- Events to listen for (click "+ Select events"):
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Click "Add endpoint"
- On the next screen, click **"Reveal signing secret"** — copy it
- Paste into Coolify env:
  - `STRIPE_WEBHOOK_SECRET = whsec_XXXXX`

### 3. Create Strapi admin API token

Strapi admin (`cms.annalouwellness.com/admin`) → **Settings → API Tokens → Create new API Token**

- Name: `nextjs-stripe-webhook`
- Token duration: Unlimited
- Token type: **Full access**
- Click Save → copy the token (only shown once)
- Paste into Coolify env:
  - `STRAPI_ADMIN_API_TOKEN = <token>`

### 4. Redeploy Next.js

Coolify → Next.js → Redeploy. This picks up:
- New code (Stripe routes)
- New env vars
- New `stripe` npm dependency (auto-installed on build)

### 5. Test end-to-end (Test mode)

1. Open `https://staging.annalouwellness.com/community/reset-room`
2. Click subscribe (once UI button is wired — see "Frontend wiring" below)
3. On Stripe Checkout, use test card: `4242 4242 4242 4242`, any future date, any CVC
4. After redirect, check:
   - Stripe Dashboard → Subscriptions → new sub appears
   - Mailchimp Audience → new contact with `Reset Room Members` tag
   - Strapi admin → Users → new user created with `reset-room-member` role
   - User should receive password-reset email from Strapi
5. Cancel the subscription in Stripe Dashboard → check Strapi user role reverts to `authenticated`

---

## Architecture

### Flow: Reset Room signup

```
User clicks "Subscribe" on /community/reset-room
  → POST /api/stripe/checkout { product: 'reset-room', email? }
  → Returns { url: stripe.checkout.session.url }
  → Frontend redirects to Stripe Checkout
  → User pays
  → Stripe redirects to /community/reset-room/dashboard?session_id=...
  → IN PARALLEL: Stripe fires webhook to /api/stripe/webhook
    → Webhook: verify signature
    → Get email + price ID from event
    → Look up product config in stripe.ts
    → IF grantRole=true:
       - Create or update Strapi user
       - Assign role: reset-room-member
       - Send password-reset email (so user can set their own password)
    → Tag in Mailchimp: 'Reset Room Members' (triggers Customer Journey 6)
```

### Flow: One-off purchase (Workshop, The Reset, etc.)

```
User clicks "Book" on /experiences/workshops (or similar)
  → POST /api/stripe/checkout { product: 'workshop', email? }
  → Stripe Checkout (one-off payment, not subscription)
  → On success: Stripe fires checkout.session.completed
  → Webhook tags user in Mailchimp (no Strapi role grant for one-offs)
```

### Why webhook lives on Next.js (not Strapi)

- Same dual-push pattern as Mailchimp Reset Letters signup
- Next.js handles all third-party HTTPS endpoints; Strapi only exposes admin API
- Keeps Strapi bundle lean (avoid OOM on 4GB VPS)

---

## Frontend wiring (TODO)

The checkout endpoint exists but no UI button calls it yet. Two locations to wire:

1. **Reset Room page** (`web/app/community/reset-room/page.tsx`)
   - Add a "Subscribe — £25/month" button
   - On click: POST to `/api/stripe/checkout` with `{ product: 'reset-room', email: session?.user?.email }`
   - Redirect `window.location = response.url`

2. **Per-programme pages** (eventually, as Anna confirms pricing)
   - Same pattern with different `product` keys

Recommend: wait until Anna creates the Reset Room product + we have the price ID before building UI. Easier to test with a real product.

---

## Pending Anna decisions

- Pricing for the 7 other programmes (The Reset, Signal, etc.)
- Whether programmes are one-off payments OR payment plans (e.g. 3 installments)
- Workshop pricing — flat fee or tiered (£15 access / £200 in-person)?
- Refund policy (Stripe supports refunds; we don't need a UI for it now)

---

## Tag-to-Customer-Journey map (for Anna's reference)

Stripe webhook attaches these Mailchimp tags. Each tag triggers the matching Customer Journey in `MAILCHIMP_BUILD_SPEC.md`.

| Stripe price env var | Mailchimp tag | Mailchimp Journey |
|---|---|---|
| `STRIPE_PRICE_RESET_ROOM` | `Reset Room Members` | Journey 6 |
| `STRIPE_PRICE_THE_RESET` | `The Reset (6-week)` | Journey 7 |
| `STRIPE_PRICE_SIGNAL` | `Signal (12-week)` | Journey 8 |
| `STRIPE_PRICE_SIGNAL_BUILD` | `Signal & Build (founders)` | Journey 9 |
| `STRIPE_PRICE_ONE_DAY` | `One Day Intensive` | Journey 10 |
| `STRIPE_PRICE_SIGNAL_COLLECTIVE` | `Signal Collective` | Journey 11 |
| `STRIPE_PRICE_RESET_SESSION` | `Reset Session (90-min)` | Journey 12 |
| `STRIPE_PRICE_WORKSHOP` | `Workshop Buyers` | Journey 3 |
