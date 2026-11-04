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

### Who owns what — post-handover (6 Nov 2026)

Updated after the admin handover. You now have direct access to everything you need to run the site, with Sameer kept as a second admin for support.

| Thing | Owned by | Notes |
|---|---|---|
| Website code (GitHub repo) | Sameer / Xceed account; **you have admin collaborator access** | github.com/Sameerxceed/anna-lou-wellness. You can clone, push, manage webhooks, invite other developers. Repo transfer parked per your preference — collaborator access is enough. |
| Hosting panel (Coolify) | **You have admin access** (shared with Sameer) | Admin login at Anna@annalouoflondon.com. You can read env variables, trigger redeploys, restart containers, invite others. Sameer remains as admin for support. |
| VPS server (IONOS) | **You** | Billed on your IONOS account. Server at 217.160.147.201. Sameer has SSH access to administer it. |
| Postgres database | **You** | Lives on your VPS. Hosts all CMS content, orders, members. See "Backups" below. |
| Production secrets (Stripe keys, Mailchimp key, Drive bridge, Anthropic, Resend) | **You can now read them** via Coolify admin | Stored as environment variables inside Coolify under each app's "Environment Variables" tab. You can read, copy, or (carefully) edit them. |
| Strapi CMS admin | **You are Super Admin** | You can create API tokens, change role permissions, create collections. The full set of settings is available to you. |
| Domain name (annalouwellness.com) | You | Registered in your name with your registrar. DNS points at the IONOS VPS. |
| Stripe merchant account | You | Payments land in your bank. Sameer has API-key access to charge cards; funds are yours. |
| Mailchimp account | You | Your login, your audience (`8bcbe7b0d1`), your billing. |
| Google Drive bridge folder + service account | You | Lives in your Google Workspace / GCP project. Sameer's bridge code reads from it on a 10-minute cron. |
| Google Analytics 4 + Search Console | You | Your Google account, verified via DNS TXT record on the domain. |
| Resend email account | Shared / check | Confirm with Sameer which account owns the API key — likely his, worth moving to yours. |
| Anthropic API key (AskAnna + auto-SEO) | Sameer / Xceed | Billed on Xceed's Anthropic account. Low monthly cost (~£5-10). |
| Cloudflare R2 (backup storage) | **You** (pending setup) | Daily database backups will land here. Free tier covers ALW's size easily. See "Backups" below for the setup task. |

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
- Cloudflare: https://dash.cloudflare.com — once set up, this will hold your R2 bucket of daily database backups. See "Backups" below.
- Domain registrar: wherever you registered annalouwellness.com (check your records).

**Sameer / Xceed — you don't need these day-to-day:**

- GitHub repo: https://github.com/Sameerxceed/anna-lou-wellness (private, Sameer's account).
- Coolify hosting panel: http://217.160.147.201:8000 (direct IP, not HTTPS — admin only).
- Anthropic console: https://console.anthropic.com (Xceed account).

**Where credentials live:** Passwords for all of the above should go in your password manager (1Password, Bitwarden, Dashlane, or similar — not in this document, not in email, and not on paper). If you don't have one, 1Password at £3/month is the standard choice. Share the CMS admin login + any service you'd want a backup person to access via the password manager's sharing feature, not by sending passwords in a message.

### Backups

**Current state (honest, as of 30 Oct 2026):**

- **Content drafts (Layer 1):** All editorial content types have draft/publish turned on. If you accidentally publish something wrong, the previous draft is kept, and you can revert in the CMS Save/Publish history. This covers ~98% of edit-mistake scenarios.
- **Media uploads:** Images sit on a persistent disk volume mounted into the CMS container. Container restarts, redeploys, and code updates no longer wipe them (bug we fixed in June 2026).
- **Daily database backup:** NOT YET configured. If a catastrophic data loss event hit the VPS today, we'd lose everything added since the last manual snapshot.

**The plan — waiting on you for one setup task:**

We're using Cloudflare R2 as the backup destination. R2 is Cloudflare's S3-compatible storage, with a 10GB free tier that comfortably fits ALW's database size (currently well under 1GB). This is the same pattern we use on other agency projects — proven in production since August 2026.

**Why R2 and not just the Google Drive bridge:** we considered reusing Anna's Google Drive via the Drive Bridge service account, but Google Drive isn't S3-compatible and would need a custom script running on the VPS (fragile, no 1-click restore). R2 is Coolify-native (or usable via standard `aws` CLI), battle-tested, and the backup belongs in storage owned by you.

**What we need from you (5 min):**

1. Sign up for a Cloudflare account at https://dash.cloudflare.com/sign-up using your business email. Free. No credit card required for the free tier.
2. In the dashboard, click **R2 Object Storage** in the left sidebar. On first use Cloudflare will ask you to enable R2 — accept. R2 does require a credit card on file even for free-tier usage (Cloudflare's anti-abuse policy); you won't be charged unless you exceed 10GB or do huge egress, neither of which applies here.
3. **Create a bucket** called `anna-lou-wellness-backups`. Default settings. Location hint: choose a region close to the UK (e.g. "Eastern Europe (EEUR)" or "Western Europe (WEUR)").
4. **Create an R2 API Token:** R2 → "Manage R2 API Tokens" → "Create API Token". Permissions: **Object Read & Write**, scoped to just the `anna-lou-wellness-backups` bucket. TTL: no expiry (or 1 year — your call).
5. Copy and send to Sameer (via a secure channel — password manager share, or encrypted email):
   - **Account ID** (shown on the R2 overview page)
   - **Access Key ID**
   - **Secret Access Key**
   - **Bucket name:** `anna-lou-wellness-backups`

Once Sameer has those, he wires a daily cron on the VPS (~30 min of work on his side) that produces **TWO artefacts** in the same R2 bucket:

1. **Database dump** (`cms-db-<timestamp>.sql.gz`) — `pg_dump` of Postgres, gzipped. Covers every CMS record: articles, products, orders, members, FAQs, settings.
2. **Media sync** (`uploads/`) — incremental sync of the persistent image volume. Covers every photograph, video, PDF you've uploaded.

Retention: 7 rolling days for DB dumps, mirror-style sync for media (matches current volume, previous versions kept via R2 object versioning).

**Thank you for catching this on 3 Nov** — earlier documentation incorrectly said the pg_dump covered images. pg_dump is database-only. Media lives on a separate disk volume, which is why it survives redeploys but is NOT in the SQL dump. Media needs its own sync. Both now run in the same nightly job.

**What a backup does and doesn't cover:**

- **Covers:** all CMS content (articles, orders, products, members, FAQs, article bodies), AND all uploaded media (images, videos, PDFs on the persistent volume).
- **Doesn't cover:** production secrets (those live in Coolify's own config, not the database — you can see them in Coolify env vars but they're not in the backup bucket) and third-party service data (Mailchimp subscribers, Stripe customers — those are backed up by Mailchimp and Stripe themselves on their side).

**Restoring from a backup** (if the worst happens): download the latest `.sql.gz` + the `uploads/` folder from R2. Restore the DB via `pg_restore` into the Postgres container (~5 min downtime). Copy the uploads back to the media volume (a few minutes depending on size). You lose any content edits made between the last backup (daily, 03:00 UTC) and the restore point. Full procedure in `ops/R2_BACKUPS.md` in the repo.

### What this means in practice — day to day

**For normal work:** nothing changes. You edit content in the CMS, images render, pages publish, orders flow through Stripe. Sameer continues to ship code changes via git push → auto-deploy.

**For the "something's broken on a Tuesday" scenario:** you now have the keys. You can:
- Log into Coolify yourself and hit **Redeploy** or **Restart** on either app.
- Read every production env variable (Stripe keys, Mailchimp key, etc.) in case you need to hand them to another developer in an emergency.
- Log into Strapi as Super Admin, change settings, generate new API tokens, manage other admin users.
- Clone the GitHub repo locally if you ever want to inspect or back up the code.

**For code-level emergencies** (new feature, bug fix, something only a developer can do): Sameer is still your first call. If he's unreachable, you can now hand the Coolify + GitHub + Strapi access to any other developer — they can be up and running in an hour, no gatekeeper needed.

### Shared responsibility — please read once

Now that you have admin access on Coolify, GitHub and Strapi, you can change almost anything on the site. That's the point of having the keys. It also means a few things to be aware of:

- **Every change is logged.** Coolify records who triggered a deploy or edited an env variable. GitHub records every commit's author and pusher. Strapi records who edited each content entry and who logged in when. If something breaks after a change, the activity log will show who made it. This isn't surveillance; it's just how shared-admin systems work. The audit trail protects both of us.
- **Routine actions are covered by the standard support retainer** — redeploys, restarts, CMS content editing, inviting another user, reading env variables. These are low-risk and expected.
- **Non-routine admin actions are NOT covered by the retainer** — editing or deleting environment variables, deleting Coolify resources (apps, databases, volumes), changing Strapi content-type schemas, altering role permissions, changing GitHub repo settings. If a change in any of these categories breaks something, diagnosing and fixing it falls outside standard support and will be billed hourly. Not a punishment — just reflects that these actions require rollback expertise and often take hours to diagnose.
- **If in doubt, send Sameer a one-line "I'm thinking of doing X" before doing it.** 30 seconds of his time beats hours of mine on a fix later.

### Touch at your peril — things to check first

**Safe, go ahead:**
- Editing any content in the CMS Content Manager (articles, products, settings, pages).
- Hitting **Redeploy** or **Restart** on either Coolify app.
- Reading environment variables (clicking the eye icon to view values).
- Inviting other users to Coolify or Strapi.
- Cloning the GitHub repo, reading code.
- Using the Drive Bridge (dropping JSON files into the inbox folder).

**Check with Sameer first:**
- **Editing an environment variable value** (Coolify → app → Environment Variables → Update). Old keys get overwritten; wrong value = broken deploy. Keep the old value in a scratch note before changing.
- **Deleting any Coolify resource** — Stop, Delete, Danger Zone actions on any app, database, or volume. Irreversible without a backup.
- **Content-Type Builder changes in Strapi** (Settings → Content-Type Builder). Adding or removing fields rewrites the database schema and can break the live site in ways that are hard to undo. Content Manager edits are safe; Content-Type Builder edits are not.
- **Deleting a collection in Strapi** (not deleting entries — deleting the whole collection/content type). Wipes the table.
- **Changing Strapi role permissions** (Settings → Users & Permissions → Roles). Can lock Anna, Sameer, or the Drive Bridge out of writing to things.
- **GitHub repo settings** (branch protection, webhooks, deploy keys, default branch). Can break auto-deploy.
- **Rotating any production API key** (Stripe, Mailchimp, Resend, Anthropic). Easy to issue a new key; forgetting to update Coolify breaks every payment or email until it's fixed.

The one-line "I'm thinking of doing X" message is always the right first move for anything in this second list.

### If Sameer is unreachable (new state)

You can now:
- Redeploy / restart either app yourself (Coolify).
- Hand Coolify + GitHub + Strapi access to any other developer in 2 minutes (invite via each system).
- Read every production credential so you're never blocked by "we don't have the keys".
- Restore from R2 backups (procedure in `ops/R2_BACKUPS.md`, your new developer can follow it).

Previously this was a "wait for Sameer" problem. It isn't any more.
