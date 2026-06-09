# Daily Postgres backups in Coolify — the 15-minute setup

Layer 2 of the edit-safety stack. Layer 1 (`draftAndPublish: true` on
editorial content) covers individual mistakes. This covers catastrophic
ones — accidentally published bad content + nobody noticed for a day +
the draft history is gone.

The cost is ~15 minutes of clicking. Do this once and forget it.

## Setup

1. **Coolify → Servers → your server → Backups** *(left sidebar of the
   server detail page; in Coolify v4 it's often under the "Storages" or
   "Backups" tab)*. If you don't see Backups at the server level, jump
   to the next step — Coolify v4 also has backups configured per-database.

2. **Find your Strapi Postgres database** in Coolify. It was created when
   Strapi was first deployed. It's usually under:
   - **Projects → your project → the Postgres service** (often named
     something like `postgres-anna-lou-cms` or just `postgres`)
   - OR under **Servers → your server → Databases** depending on how
     Coolify was set up

3. Inside the Postgres service page, find the **Backups** tab.

4. **Enable scheduled backup** with these settings:
   - **Frequency**: Daily
   - **Time**: 03:00 UTC *(low traffic hour in IST and UK)*
   - **Retention**: 7 backups (one week of rolling history)
   - **Destination**: pick one:
     - **Local** (simplest — stores on the Coolify host disk). Free,
       but if the whole host dies you lose the backup too.
     - **S3** or **Cloudflare R2** (off-host — strongly recommended for
       launch). Costs ~£1/month for ALW's data size.

5. **Save** and run a manual backup once to confirm it works.

## Verifying the backup

In the same Backups tab, you should see the manual backup listed.
Tap into it to confirm:
- Size is reasonable (Strapi DB for ALW is probably 50-200 MB
  currently — small)
- Status is "Success"

## When something goes wrong

If Anna ever publishes a catastrophic mistake AND nobody catches it
within 24 hours (so the draft history is gone):

1. Coolify → Postgres service → **Backups** tab
2. Find the most recent backup from BEFORE the mistake
3. Click **Restore** (or **Download** + manual restore — depends on
   Coolify version)
4. Pick which backup to restore from
5. Coolify shuts down Strapi briefly (~30 seconds), restores the DB,
   restarts Strapi
6. **Anna loses any content edits made since that backup** — typically
   one day's work. Worth it to recover from real damage.

## What's NOT covered by the database backup

- The `/uploads` folder (image binaries). Already handled by the
  Coolify Volume Mount we set up earlier (`cms-uploads`).
- The Strapi admin user accounts. Stored in the DB, so they ARE
  covered.
- API tokens. Stored in the DB, covered.
- Environment variables (API keys, secrets). NOT in the DB — these
  live in Coolify's own config. Already backed up if Coolify itself is
  backed up; otherwise rebuild manually from your password manager.

## Going one level further (optional)

For complete launch-day insurance, also enable a backup of the
**Coolify host's `/var/lib/docker/volumes` folder** — that contains
the `cms-uploads` volume. Either:
- Use Coolify's built-in volume backup (if available in your version)
- Or set up an `rsync` cron job that pushes the volume to S3/R2 nightly

For ALW's scale this is overkill — the volume mount is on the same
host as the DB, so both die or survive together. Restore plan if the
whole host dies: restore Postgres backup + bulk re-upload media using
`ops/restore-uploads.js` (the script we built earlier).
