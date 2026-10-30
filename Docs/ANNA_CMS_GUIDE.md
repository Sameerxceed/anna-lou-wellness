# How to edit your website on iPhone

A quick guide for editing Anna Lou Wellness via Strapi CMS.

---

## 🔑 Logging in

1. Open Safari (works best) → go to **`cms.annalouwellness.com/admin`**
2. Bookmark it. Tap → Share → Add to Home Screen → install as an app icon.
3. Log in with your email + password.

---

## 📝 Where to edit each part of the site

The left sidebar shows two main sections.

### "Single Types" — pages that exist exactly once

| Single Type | Edits |
|---|---|
| **Homepage** | All sections on the homepage |
| **About Page** | Your bio, story, press logos, certifications |
| **Reset Room Page** | The Reset Room landing page (3 pillars, pricing, etc.) |
| **Reset Letters Page** | The /reset-letters holding page (Substack signup) |
| **Decoder Page** | The free Nervous System Decoder lead magnet page |
| **Site Settings** | Footer info, contact email, social links, logos |

### "Collection Types" — pages with multiple entries

| Collection | What's inside |
|---|---|
| **Programme** | All your coaching offers (The Reset, Signal, Founder Reset, etc.) — 9 entries |
| **Experience Page** | Workshops, Retreats, Corporate, Speaking — 4 entries |
| **Community Event Page** | Returning Circle, Events — 2 entries |
| **Page (generic)** | Smaller pages like Press, Partnerships, Mantras, etc. — 13 entries |
| **Article** | All your editorial articles (Reset Stories, Life, Love, Work) |
| **Article Category** | Categories for your articles |

---

## ✏️ Editing a field — the basics

Every field has a **little help text under the label** telling you what it does. Read it before editing.

### Text fields
- **Single-line:** for titles, button labels, short bits
- **Multi-line (textarea):** for body paragraphs. **To create multiple paragraphs, leave a BLANK LINE between them.**
- **Lists (bullet points):** one item per line — each line becomes a separate bullet

### Image fields
- Tap the field → upload from your camera roll
- Images automatically resize to 2400px wide max
- Photos from your iPhone get auto-rotated correctly
- Anything you upload becomes web-friendly file size (~500KB)

### URL fields
- Internal links: start with `/` (e.g. `/the-work`)
- External links: full URL (e.g. `https://...`)
- Anchor links: start with `#` (e.g. `#enquire`)

---

## 💾 Saving — one click

Tap the **Save** button (top right). That's it. No separate "Publish" step.

The change goes live on the site within seconds. Refresh `staging.annalouwellness.com` (or pull down to refresh in Safari) to see your edit.

---

## 🎨 Brand colours (hex codes)

When you see an `accentColour` or `kickerColour` field, use one of these:

| Colour | Hex | Used for |
|---|---|---|
| Plum | `#6E3A5A` | Primary brand colour |
| Pink | `#F280AA` | The Work / pink accents |
| Blue | `#7BAFDD` | Experiences / blue accents |
| Gold | `#FAA21B` | Life / yellow accents |
| Mint | `#5DCAA5` | Community / mint accents |
| Light Gold | `#FFD07A` | Highlights |
| Red | `#EE312F` | Bold accents |

---

## 🚨 Common gotchas

### "I edited but nothing changed on the live site"
- Did you click **Save** (top right)?
- Are you looking at the right URL? (staging.annalouwellness.com)
- Try a hard refresh — pull down further than usual in Safari, or close + reopen Safari

### "I can't find the page I want to edit"
- It might be in a different collection. Check **Collection Types** first.
- Some pages are intentionally not CMS-managed (Login, Cart, Checkout, Account) — these are functional, not editorial.
- Sub-pages like `/the-work/sessions/founder-reset` are under **Programme** collection (slug `founder-reset`).
- Sub-pages like `/experiences/workshops` are under **Experience Page** collection (slug `workshops`).

### "The slug field — what do I put?"
- Don't change it once an entry is created — it's the URL of the page.
- Slugs use hyphens, no spaces. e.g. `the-reset`, not `The Reset`.

### "I deleted something by accident"
- Strapi keeps a version history. Tap the 3-dot menu on the entry → can restore.
- If a whole entry is deleted, on Strapi restart the seed script will recreate it with the original content (one of the safety nets we built).

---

## 📱 iPhone-specific tips

- **Rotate to landscape** for editing long body text — easier to type and review
- **Long-press on the URL bar** in Safari for quick paste of links
- **Use voice dictation** for body paragraphs — much faster than thumb-typing
- **Set up Safari Reader Mode** to preview how your edits look without distractions

---

## ❓ When in doubt

- Email or message Sameer with a screenshot — he'll tell you exactly what to click.
- Don't delete content types or roles in Settings — those are infrastructure.
- Don't edit anything in **Settings** unless instructed — that's the dev side.

---

## What's NOT in the CMS (intentional)

These stay code-managed because they rarely change or are functional:

- Navigation menu items (sidebar / header links)
- Cart, Checkout, Login, Account pages
- Quiz logic (questions and routing — copy intro is CMS though)
- 404 page
- Terms / Privacy long-form text (titles are CMS, body is fixed legal)

Ask Sameer if you want any of these moved into the CMS.

---

## 🚀 How changes go live

**CMS edits (titles, body, images, FAQs, pricing, products, articles — anything you edit in the admin):**
Live on the public site in 1-2 seconds after you hit Save or Publish. No action needed from Sameer. The site refreshes itself via a hook on every save.

**Code changes (new features, bug fixes, redirects, bridge updates — anything in the codebase):**
Sameer pushes the change to GitHub and the hosting platform (Coolify) picks it up automatically. CMS redeploys in about 2 minutes; the main site in about 4 minutes. During that window the site is still live and serving the previous version — there is no downtime for visitors.

### What is Coolify?

Coolify is the hosting panel that runs the CMS and the main site on a VPS. Think of it as the control room for the infrastructure — it holds the running copies of both apps, the Postgres database, and all the environment secrets (Stripe keys, Mailchimp key, Drive bridge service account, etc.).

**You don't need Coolify for anything in your day-to-day.** Everything editorial happens in the CMS. Coolify only matters when:
- Sameer is shipping a code change (he handles it)
- Something has broken and needs a container restart (Sameer handles it)
- The CMS or site is unresponsive and you want to flag it ("the site is slow / showing an error")

### If something looks broken

1. Hard-refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows) — rules out a stale browser cache.
2. Open an incognito window and try the same URL — rules out your login state or cookies.
3. Try on your phone on cellular (not Wi-Fi) — rules out your home network.
4. If it's still broken, send Sameer a screenshot with the URL in the address bar visible, and a one-line note of what you were trying to do.

### Who owns what

Being transparent so there are no surprises later. The full ownership picture today:

| Thing | Owned by | Notes |
|---|---|---|
| Website code (GitHub repo) | Sameer / Xceed | github.com/Sameerxceed/anna-lou-wellness. Your GitHub account would need to be added as a collaborator to see or edit it. |
| Hosting panel (Coolify) | Sameer / Xceed | Admin login is Sameer's. Runs on your IONOS VPS. |
| VPS server (IONOS) | **You** | Billed on your IONOS account. Server at 217.160.147.201. Sameer has SSH access to administer it. |
| Postgres database | **You** | Lives on your VPS. Hosts all CMS content, orders, members. See "Backups" below. |
| Production secrets (Stripe keys, Mailchimp key, Drive bridge, Anthropic, Resend) | Sameer / Xceed | Stored as environment variables inside Coolify. Only Coolify admin can read them. |
| Domain name (annalouwellness.com) | You | Registered in your name with your registrar. DNS points at the IONOS VPS. |
| Stripe merchant account | You | Payments land in your bank. Sameer has API-key access to charge cards; funds are yours. |
| Mailchimp account | You | Your login, your audience (`8bcbe7b0d1`), your billing. |
| Google Drive bridge folder + service account | You | Lives in your Google Workspace / GCP project. Sameer's bridge code reads from it on a 10-minute cron. |
| Google Analytics 4 + Search Console | You | Your Google account, verified via DNS TXT record on the domain. |
| Resend email account | Shared / check | Confirm with Sameer which account owns the API key — likely his, worth moving to yours. |
| Anthropic API key (AskAnna + auto-SEO) | Sameer / Xceed | Billed on Xceed's Anthropic account. Low monthly cost (~£5-10). |

### Logins & links — the full inventory

Day-to-day you only need the first one. The rest are listed so you (or a future developer) know where everything lives.

**Yours — bookmark these:**

- CMS admin: https://cms.annalouwellness.com/admin — your editorial home.
- Live site: https://annalouwellness.com
- Stripe dashboard: https://dashboard.stripe.com — payments, refunds, customer records.
- Mailchimp: https://login.mailchimp.com — audience, journeys, campaign history.
- Google Analytics: https://analytics.google.com — traffic, conversions.
- Google Search Console: https://search.google.com/search-console — SEO health, indexed pages, click data.
- IONOS: https://my.ionos.com — your VPS billing + server management panel.
- Google Drive bridge folder: your "ALW CMS Bridge" folder in your Google Drive.
- Domain registrar: wherever you registered annalouwellness.com (check your records).

**Sameer / Xceed — you don't need these day-to-day:**

- GitHub repo: https://github.com/Sameerxceed/anna-lou-wellness (private, Sameer's account).
- Coolify hosting panel: http://217.160.147.201:8000 (direct IP, not HTTPS — admin only).
- Anthropic console: https://console.anthropic.com (Xceed account).

**Where credentials live:** Passwords for all of the above should go in your password manager (1Password, Bitwarden, Dashlane, or similar — not in this document, not in email, and not on paper). If you don't have one, 1Password at £3/month is the standard choice. Share the CMS admin login + any service you'd want a backup person to access via the password manager's sharing feature, not by sending passwords in a message.

### Backups

**Current state (honest):**

- **Content drafts (Layer 1):** All editorial content types have draft/publish turned on. If you accidentally publish something wrong, the previous draft is kept, and you can revert in the CMS Save/Publish history. This covers ~98% of edit-mistake scenarios.
- **Media uploads:** Images sit on a persistent disk volume mounted into the CMS container. Container restarts, redeploys, and code updates no longer wipe them (bug we fixed in June 2026).
- **Daily database backup:** NOT currently configured. If a catastrophic data loss event hit the VPS today, we'd lose everything added since the last manual snapshot.

**What's being set up now (29 Oct 2026):** Sameer is enabling Coolify's built-in daily Postgres backup — 03:00 UTC, 7-day rolling history. Once configured, backups land in Coolify and can be restored with 1 click. See `ops/COOLIFY_DB_BACKUPS.md` in the codebase for the full runbook. This section will be updated once the backup is confirmed running and verified.

**What a backup does and doesn't cover:**

- Covers: all CMS content, orders, products, members, FAQs, article bodies, images stored on the volume.
- Doesn't cover: production secrets (those live in Coolify's own config, not the database) and third-party service data (Mailchimp subscribers, Stripe customers — those are backed up by Mailchimp and Stripe themselves).

### What this means in practice

**Day-to-day:** nothing changes. You edit in the CMS, Sameer ships code, everything just works.

**If you ever want to transfer ownership** (bringing in a new developer, consolidating under your own org, wind-down scenario) — the work splits roughly like this. Shorter than most agency projects because the VPS, domain, Stripe, Mailchimp and GA/GSC are already in your name:

- GitHub repo transfer: 1 hour. Transfer repo to your own GitHub account or org, re-add Sameer as collaborator if he's still involved. Webhooks and deploy config re-point automatically.
- Coolify admin: 15 min. Create a Coolify admin user for you (or your new developer); Sameer stays as admin or steps down.
- Secrets rotation: half a day. New Stripe/Mailchimp/Anthropic/Resend keys issued, old ones revoked. Only needed if Sameer / Xceed is stepping away entirely.
- Documentation + handover call: half a day. Walk through the ops runbook with you or your new developer.

Total: roughly 1-1.5 days of work, cost quotable at the time. Much lighter than a typical agency handover because the infrastructure is already yours.

**If something urgent happens and Sameer is unreachable:** today you'd be stuck for Coolify-level operations (redeploy, restart container, read logs) until he resurfaces. The cheapest insurance is a second person with Coolify admin credentials in a locked vault — easiest options are (a) you learn to use Coolify yourself for Restart/Redeploy only, or (b) a second developer at Xceed is given admin as a backup. Ask Sameer to set this up before launch-sensitive periods (big campaigns, press pushes, etc.).
