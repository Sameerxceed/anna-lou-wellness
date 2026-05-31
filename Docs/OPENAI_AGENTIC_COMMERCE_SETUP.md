# OpenAI Agentic Commerce — Setup Runbook

Everything we've built, what's ready to flip on, and what's left to do once OpenAI approves Anna as a merchant.

> **Status at a glance**
> - ✅ Product feed in OpenAI's exact spec — live at `/ai-products.json` and `/ai-products.jsonl`
> - ✅ SFTP push automation — script written, ready to enable
> - ⏸️ In-ChatGPT checkout protocol — scoped, **not yet built** (recommend waiting for OpenAI's approval + sandbox access)

---

## Stage 1 — Apply as a merchant (Anna's task)

1. Go to **https://developers.openai.com/commerce**
2. Apply as a merchant (verifies the business — typically takes a few days)
3. Once approved, OpenAI issues:
   - **SFTP credentials:** host, username, and either a private key OR password
   - **(Eventually)** sandbox API keys for the checkout protocol
4. Send those credentials to Sameer **securely** — 1Password share, Bitwarden, or password-protected file. Do NOT email them in plain text.

---

## Stage 2 — Enable SFTP push (Sameer, ~10 min once creds arrive)

The product feed is already live and validated against the spec. What remains is the nightly push to OpenAI's SFTP server.

### A. Paste credentials into Coolify

In the **anna-lou-wellness web** application → **Environment Variables**, add:

| Key | Value | Required |
|---|---|---|
| `SFTP_HOST` | (from OpenAI) | ✅ |
| `SFTP_USER` | (from OpenAI) | ✅ |
| `SFTP_KEY_PATH` | absolute path to the mounted private key, e.g. `/run/secrets/openai_sftp_key` | ✅ (preferred) |
| `SFTP_PASSWORD` | (alternative to key) | ✅ (only if no key) |
| `SFTP_REMOTE_PATH` | usually `/` unless OpenAI specifies | optional |
| `FEED_URL` | `https://annalouwellness.com/ai-products.jsonl` | optional (this is the default) |

If using a private key (recommended), upload it as a Coolify **secret** and mount it at `/run/secrets/openai_sftp_key`.

### B. Set up the Scheduled Task

Coolify → application → **Scheduled Tasks** → **+ Add**:

| Field | Value |
|---|---|
| Name | `OpenAI feed push` |
| Command | `bash /app/ops/push-openai-feed.sh` |
| Frequency | `0 3 * * *` (daily at 03:00 UTC — off-peak) |
| Container | `web` (same container that has bash + curl + sftp) |

If the build image doesn't have `sftp` or `openssh-client`, add this line to the `web/Dockerfile` (just below the FROM):

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends openssh-client && rm -rf /var/lib/apt/lists/*
```

### C. Test manually before enabling the schedule

SSH into the running container (Coolify → Terminal) and run:

```bash
bash /app/ops/push-openai-feed.sh
```

You should see:
```
[push-openai-feed] Fetching https://annalouwellness.com/ai-products.jsonl ...
[push-openai-feed] Fetched N product rows.
[push-openai-feed] Uploading anna-lou-wellness-products-<ts>.jsonl.gz to ...
[push-openai-feed] Pushed N products to OpenAI.
```

If it errors out, the logs are explicit about which env var is missing or which step failed.

### D. Verify in OpenAI's merchant console

Once Anna's merchant console shows products ingested, you're done. Disable manual testing.

---

## Stage 3 — In-ChatGPT checkout protocol (NOT YET BUILT)

This is the optional but powerful next step: customers buy directly inside ChatGPT without ever leaving the chat. Today they get redirected to our site to complete checkout.

### What it requires

Per the [Agentic Commerce Protocol Checkout Spec](https://developers.openai.com/commerce/specs/checkout) and [Stripe's ACP integration guide](https://docs.stripe.com/agentic-commerce/protocol/specification), we'd need to implement:

| Endpoint | Method | Purpose |
|---|---|---|
| `/checkout_sessions` | POST | Create a session from `items[]` + buyer + shipping address. Return line items, totals, fulfilment options. |
| `/checkout_sessions/{id}` | GET | Retrieve session state |
| `/checkout_sessions/{id}` | PATCH | Update items / address / fulfilment selection |
| `/checkout_sessions/{id}/complete` | POST | Accept the delegated payment token from OpenAI (Stripe's Shared Payment Token model), charge, create order, return confirmation |
| `/checkout_sessions/{id}/cancel` | POST | Cancel the session |

Plus:
- Signed-request verification on every endpoint (OpenAI signs each call)
- Integration with Stripe's **Shared Payment Token** model (different from our current Stripe Checkout flow — payment intent comes pre-authorised from OpenAI)
- Real-time inventory check on session create (stop overselling)
- Order webhook back to OpenAI when the order ships/cancels

### Estimated effort

- **Endpoint scaffolds + happy path:** ~1 day
- **Signature verification + error handling + cancellation flow:** ~half day
- **Stripe Shared Payment Token integration + testing:** ~half day
- **Total:** ~2 days

### Why we haven't built it yet

Two reasons:

1. **No way to test it without OpenAI sandbox access.** OpenAI issues sandbox credentials only after merchant approval. Building blind and shipping to production tends to find gaps in the way real OpenAI calls hit our endpoints.
2. **`is_eligible_checkout = false` in our feed today.** Once we build and test the protocol, we flip this to `true` and add the conditionally-required `seller_privacy_policy` + `seller_tos` URLs to each product.

### Recommended timeline

1. Anna applies as merchant (Stage 1)
2. OpenAI approves + issues SFTP credentials
3. We enable SFTP push (Stage 2)
4. Products start appearing in ChatGPT shopping results (redirect to our site for purchase)
5. Anna sees the traffic + conversion impact for a few weeks
6. **Then** we build the checkout protocol if the volume justifies it — `~2 days` work, no rush

---

## What we built today (28 May 2026 → 31 May 2026)

- `web/app/ai-products.json/route.ts` — JSON envelope + product array in OpenAI spec
- `web/app/ai-products.jsonl/route.ts` — Newline-delimited variant for SFTP
- `web/src/lib/openai-product-feed.ts` — Single source of truth for the product shape
- `ops/push-openai-feed.sh` — SFTP push automation (this runbook)
- `web/app/llms.txt/route.ts` — Updated to link both feed variants
- `web/app/layout.tsx` — `<link rel="alternate">` autodiscovery
- `web/app/robots.ts` — Allowlist for the JSONL endpoint

---

## Useful links

- **OpenAI commerce home:** https://developers.openai.com/commerce
- **Product feed spec:** https://developers.openai.com/commerce/specs/file-upload/products
- **Feed delivery overview:** https://developers.openai.com/commerce/specs/file-upload/overview
- **Get Started guide:** https://developers.openai.com/commerce/guides/get-started
- **Checkout spec (for Stage 3):** https://developers.openai.com/commerce/specs/checkout
- **Stripe's ACP integration:** https://docs.stripe.com/agentic-commerce/protocol/specification
