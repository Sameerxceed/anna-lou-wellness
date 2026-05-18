# Stripe Integration — Build Notes

**Status:** Plumbing built 18 May 2026, refactored same day. **Not live yet — Anna must enter prices in Strapi + you must register the webhook before anything works.**

## Architecture principle

**Strapi is the source of truth. Stripe is JUST a payment gateway.**

- All products, prices, recurring/one-off flags, Mailchimp tag names, and "grants Reset Room access" flags live in Strapi.
- Anna manages everything from the CMS admin (iPhone-friendly).
- Stripe sees an inline price built at request time. No products created in Stripe. No price IDs stored in env vars.
- Webhook reads metadata `{ strapi_type, strapi_id }` from the event → re-fetches the Strapi record → applies the current tag/role rules.

If Anna changes a price or tag in Strapi, the next checkout uses the new value immediately — no developer touch, no redeploy.

---

## What's wired

### Code (committed)

- `web/src/lib/stripe.ts` — Stripe SDK init (just the SDK, no business logic)
- `web/src/lib/strapi-purchasable.ts` — Fetches and normalizes any purchasable Strapi record
- `web/src/lib/mailchimp.ts` — Reusable Mailchimp helpers (`subscribeAndTag`, `removeTag`)
- `web/src/lib/strapi-admin.ts` — Strapi user/role management via admin API token
- `web/app/api/stripe/checkout/route.ts` — Builds Stripe Checkout sessions from Strapi
- `web/app/api/stripe/webhook/route.ts` — Signature-verified handler; metadata-driven Strapi lookup

### Strapi schemas updated

These fields now exist on every "purchasable" content type:

| Field | Type | Purpose |
|---|---|---|
| `pricePence` | integer | Price in pence. £25 = 2500. 0 = "by enquiry". |
| `currency` | string | ISO code, lowercase. Default `gbp`. |
| `isRecurring` | boolean | Tick for subscription, unchecked for one-off. |
| `recurringInterval` | enum | `month` or `year` (only used when `isRecurring`). |
| `mailchimpTag` | string | Tag attached on successful payment. Must match Mailchimp tag name EXACTLY. |
| `grantsResetRoomAccess` | boolean | Tick ONLY for the Reset Room membership — promotes user to `reset-room-member` role. |

Applied to: `Membership` (singleType — Reset Room), `Programme` (collection), `Experience Page` (collection).

### Env vars set in Coolify (Next.js)
- ✅ `STRIPE_SECRET_KEY` (test mode `sk_test_...`)
- ✅ `STRIPE_PUBLISHABLE_KEY` (test mode `pk_test_...`)
- ⏳ `STRIPE_WEBHOOK_SECRET` (set after step 2 below)
- ⏳ `STRAPI_ADMIN_API_TOKEN` (Strapi admin → Settings → API Tokens → Create token, full-access)

**No `STRIPE_PRICE_*` env vars exist.** Prices live in Strapi.

---

## Setup steps (do in this order)

### 1. Anna enters the Reset Room price in Strapi

Strapi admin → **Single Types → Membership (Reset Room)**:

- `pricePence`: `2500` (= £25.00)
- `currency`: `gbp` (already default)
- `isRecurring`: ✅ ON
- `recurringInterval`: `month`
- `mailchimpTag`: `Reset Room Members` (must match the Mailchimp tag exactly)
- `grantsResetRoomAccess`: ✅ ON

Save. Done. No Stripe dashboard action needed for the Reset Room.

For programmes (The Reset, Signal, etc.) — Anna opens each Programme entry and fills the same fields. `isRecurring` stays OFF, `grantsResetRoomAccess` stays OFF, `mailchimpTag` is one of the names from `MAILCHIMP_BUILD_SPEC.md`.

### 2. Register webhook endpoint in Stripe

Stripe Dashboard (Test mode) → **Developers → Webhooks → Add endpoint**:

- Endpoint URL: `https://staging.annalouwellness.com/api/stripe/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Click "Add endpoint" → click **"Reveal signing secret"** → copy
- Paste into Coolify env: `STRIPE_WEBHOOK_SECRET = whsec_...`

### 3. Create Strapi admin API token

Strapi admin → **Settings → API Tokens → Create new API Token**:

- Name: `nextjs-stripe-webhook`
- Token duration: Unlimited
- Token type: **Full access**
- Save → copy the token (only shown once)
- Paste into Coolify env: `STRAPI_ADMIN_API_TOKEN = <token>`

### 4. Redeploy Strapi (schema changes), then Next.js

Schema changes need a Strapi rebuild. Use the established OOM-safe recipe:
1. IONOS → Restart VPS
2. Coolify → Next.js → Stop
3. Coolify → Strapi → Redeploy
4. After `Rolling update completed`, Coolify → Next.js → Redeploy (picks up code + env + the new `stripe` npm dep)

### 5. End-to-end test (Test mode)

1. (For now) Use a temporary test page that posts to `/api/stripe/checkout` — UI button comes after first successful test
2. Body: `{ "strapi_type": "membership" }`
3. Get back `{ url }` → open in browser
4. Use Stripe test card: `4242 4242 4242 4242`, any future date, any CVC
5. After redirect, check:
   - Stripe Dashboard → Subscriptions → new sub appears
   - Mailchimp Audience → new contact with `Reset Room Members` tag
   - Strapi admin → Users → new user created with `reset-room-member` role
   - User receives password-reset email from Strapi
6. Cancel the subscription in Stripe Dashboard → check Strapi user role reverts to `authenticated` + tag goes inactive in Mailchimp

---

## Architecture: end-to-end flow

### Buying a subscription (Reset Room)

```
User on /community/reset-room clicks "Subscribe £25/month"
  → POST /api/stripe/checkout { strapi_type: 'membership' }
  → Backend fetches Membership from Strapi
  → Builds inline price_data: { currency: 'gbp', unit_amount: 2500, recurring: { interval: 'month' } }
  → Creates Checkout Session with mode='subscription' and metadata { strapi_type, strapi_id }
  → Returns { url: session.url }
  → Frontend redirects user to Stripe Checkout
  → User pays (4242 4242 4242 4242 in test mode)
  → Stripe redirects to /community/reset-room/dashboard?session_id=...
  → IN PARALLEL: Stripe fires webhook to /api/stripe/webhook
    → Verify signature
    → Read { strapi_type, strapi_id } from metadata
    → Re-fetch Strapi record (current source of truth for tag + role)
    → Tag in Mailchimp: 'Reset Room Members' (triggers Customer Journey 6)
    → grantsResetRoomAccess === true → create/update Strapi user + assign role
    → Send password-reset email so user can set their own password
```

### Buying a one-off programme (e.g. The Reset)

```
User on /the-work/the-reset clicks "Book £1,500"
  → POST /api/stripe/checkout { strapi_type: 'programme', strapi_id: 'the-reset' }
  → Same flow but mode='payment' (one-off)
  → Webhook attaches tag (e.g. 'The Reset (6-week)')
  → grantsResetRoomAccess === false → no Strapi role change
  → Mailchimp Customer Journey 7 starts
```

### Why webhook lives on Next.js (not Strapi)

- Same dual-push pattern as Mailchimp Reset Letters signup
- Next.js handles all third-party HTTPS endpoints; Strapi only exposes admin API
- Keeps Strapi bundle lean (avoid OOM on 4GB VPS)

---

## Frontend wiring (TODO)

The checkout endpoint exists but no UI buttons call it yet. Plan:

1. **Reset Room page** (`web/app/community/reset-room/page.tsx`)
   - Read Membership from Strapi (price + recurring info)
   - Show "Subscribe £25/month" button
   - On click: POST to `/api/stripe/checkout { strapi_type: 'membership' }` → `window.location = response.url`

2. **Programme pages** (`web/app/the-work/[slug]/page.tsx` etc.)
   - Read Programme from Strapi
   - If `pricePence > 0`: show "Book £X" button → POST `{ strapi_type: 'programme', strapi_id: slug }`
   - If `pricePence === 0`: keep the existing "Book a discovery call" CTA

Wire after first successful end-to-end test.

---

## Pending Anna decisions / inputs

- Set `pricePence` and `mailchimpTag` on each programme she wants to sell
- Decide whether some programmes are payment plans (Stripe supports — needs schema extension if so)
- Default from-email in Mailchimp is `anna@annalouoflondon.com` — may want `hello@annalouwellness.com`

---

## Tag-to-Customer-Journey map (for Anna's reference)

The mailchimpTag value Anna sets on each Strapi record must match a tag name in Mailchimp exactly. These map to Customer Journeys in `MAILCHIMP_BUILD_SPEC.md`:

| Where set in Strapi | mailchimpTag | Mailchimp Journey |
|---|---|---|
| Membership (singleType) | `Reset Room Members` | Journey 6 |
| Programme "The Reset" | `The Reset (6-week)` | Journey 7 |
| Programme "Signal" | `Signal (12-week)` | Journey 8 |
| Programme "Signal & Build" | `Signal & Build (founders)` | Journey 9 |
| Programme "One Day Intensive" | `One Day Intensive` | Journey 10 |
| Programme "Signal Collective" | `Signal Collective` | Journey 11 |
| Programme Reset Sessions (any variant) | `Reset Session (90-min)` | Journey 12 |
| Experience Page workshops/retreats | `Workshop Buyers` | Journey 3 |
