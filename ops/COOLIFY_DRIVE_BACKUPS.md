# Daily backups to Anna's Google Drive via rclone

Supersedes the earlier `COOLIFY_DB_BACKUPS.md` runbook which assumed
Coolify's built-in Local backup destination was available. In this
Coolify version only S3-compatible destinations are offered for
scheduled backups, so we run a host-level cron script instead that
pushes to Drive via rclone, reusing the Drive Bridge service account.

Backs up two things daily at 03:00 UTC into Anna's "CMS Backups"
Drive folder:

- `cms-db-<timestamp>.sql.gz` — Postgres custom-format dump, gzipped.
- `cms-code-<timestamp>.bundle` — git bundle of full repo history
  (so Anna has an independent copy of the code, not dependent on
  Sameer's GitHub account continuing to exist).

Retention is 7 rolling days. Older files auto-deleted.

## Prerequisites — one-time setup from Anna

Anna needs to do this ONCE before the automation can run:

1. Create a folder called `CMS Backups` at the root of her Google Drive.
2. Share it with the Drive Bridge service account email as **Editor**.
   The SA email is in the `client_email` field of the `DRIVE_BRIDGE_SA_JSON`
   environment variable in Coolify. Looks like
   `something@something.iam.gserviceaccount.com`.
3. Open the folder in Drive and copy the folder ID from the URL
   (the long alphanumeric string after `/folders/`).
4. Send the folder ID to Sameer so he can finish the rclone config.

## Install on the VPS

All of these run as root on the Coolify host (not in a container). Use
Coolify → Servers → your server → **Terminal** tab, which gives you a
shell on the host directly.

### 1. Install rclone

```bash
curl https://rclone.org/install.sh | bash
rclone version    # confirm it's installed
```

### 2. Drop the SA JSON on disk

Grab the SA JSON from Coolify's env vars (Shared Variables or the CMS
app's Environment Variables, look for `DRIVE_BRIDGE_SA_JSON`). Copy
the full JSON value, then on the VPS:

```bash
mkdir -p /opt
nano /opt/drive-sa.json
# paste the full JSON. Save: Ctrl-O, Enter, Ctrl-X
chmod 600 /opt/drive-sa.json
```

### 3. Configure rclone

```bash
mkdir -p /root/.config/rclone
nano /root/.config/rclone/rclone.conf
```

Paste (replacing `<ANNA_CMS_BACKUPS_FOLDER_ID>` with the ID Anna sent):

```ini
[alw-drive]
type = drive
scope = drive
service_account_file = /opt/drive-sa.json
root_folder_id = <ANNA_CMS_BACKUPS_FOLDER_ID>
```

### 4. Verify rclone can see the folder

```bash
rclone lsd alw-drive:    # should list the folder contents (empty initially — no error)
rclone touch alw-drive:test.txt && rclone delete alw-drive:test.txt
# the second line writes + deletes a tiny file to confirm write perms
```

If step 4 errors with "insufficient permissions" or similar, Anna
hasn't shared the folder with the SA email yet (or shared as Viewer
instead of Editor). Fix on her side and retry.

### 5. Install the backup script

Copy `ops/cms-backup.sh` from this repo onto the VPS. Easiest path:

```bash
curl -o /opt/cms-backup.sh https://raw.githubusercontent.com/Sameerxceed/anna-lou-wellness/main/ops/cms-backup.sh
chmod +x /opt/cms-backup.sh
```

### 6. Run it once manually

```bash
/opt/cms-backup.sh
```

Watch the output — should log DB dump size, code bundle size, upload
success. Takes 30-90 seconds depending on repo size.

Confirm both files appear in Anna's `CMS Backups` Drive folder.

### 7. Add to cron

```bash
crontab -e
```

Add this line:

```cron
0 3 * * * /opt/cms-backup.sh >> /var/log/cms-backup.log 2>&1
```

Save. This runs the script daily at 03:00 UTC (08:30 IST / 03:00 UK
autumn / 04:00 UK summer — low traffic in all three timezones).

### 8. Add log rotation (so /var/log doesn't fill up)

```bash
nano /etc/logrotate.d/cms-backup
```

Paste:

```
/var/log/cms-backup.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
```

Done. The log is capped at ~4 weeks of history.

## Verifying the backup is running

Weekly spot-check:

- Open Anna's `CMS Backups` folder in Drive. Should see one DB file +
  one code bundle per day for the last 7 days, nothing older.
- `tail -50 /var/log/cms-backup.log` on the VPS — should show
  `=== Backup run OK ===` lines dated recent 03:00 UTC entries.

If a day is missing, cron didn't run or the script errored. Check the
log for the error, and `cat /var/log/syslog | grep CRON` for cron
history.

## Restoring from a backup

### Database restore

If Anna published a catastrophic mistake AND nobody caught it within
24 hours AND draft history is gone, we restore from the most recent
backup from BEFORE the mistake.

1. Download the appropriate `cms-db-<timestamp>.sql.gz` from Anna's
   Drive to the VPS:
   ```bash
   rclone copy alw-drive:cms-db-2026-10-29T03-00-00.sql.gz /tmp/
   ```
2. Decompress + copy into the Postgres container:
   ```bash
   gunzip /tmp/cms-db-2026-10-29T03-00-00.sql.gz
   PG_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^postgresql-database-' | head -n1)
   docker cp /tmp/cms-db-2026-10-29T03-00-00.sql "$PG_CONTAINER:/tmp/restore.sql"
   ```
3. Stop the CMS so no writes land during restore:
   ```bash
   # Via Coolify UI: Stop button on the CMS app.
   ```
4. Restore (DESTRUCTIVE — overwrites current state):
   ```bash
   PGUSER=$(docker exec "$PG_CONTAINER" sh -c 'printf %s "$POSTGRES_USER"')
   PGDB=$(docker exec "$PG_CONTAINER" sh -c 'printf %s "$POSTGRES_DB"')
   docker exec "$PG_CONTAINER" pg_restore -U "$PGUSER" -d "$PGDB" \
     --clean --if-exists /tmp/restore.sql
   ```
5. Restart CMS via Coolify UI.
6. Anna loses any edits made since the backup timestamp — typically
   up to one day. Worth it to recover from real damage.

### Code restore (worst-case: GitHub is gone or inaccessible)

The `.bundle` files contain the full git history, so a cold restore
from a bundle gets you a working repo clone with all branches + tags.

1. Download the latest bundle from Anna's Drive to your local machine.
2. Clone from it:
   ```bash
   git clone cms-code-2026-10-29T03-00-00.bundle anna-lou-wellness
   cd anna-lou-wellness
   git remote remove origin
   git remote add origin <new-remote-url>
   git push --all origin
   git push --tags origin
   ```
3. Point Coolify's Source at the new remote URL + reconnect webhooks.

## What's covered vs not covered

Covered:
- All CMS content (articles, products, pages, orders, members, FAQs)
- Full repo history including unreleased branches
- Admin user accounts and API tokens (stored in the DB)

Not covered:
- `/uploads` folder (image binaries). Already protected by the Coolify
  Volume Mount on `cms-uploads`. For true catastrophe insurance you'd
  also want these on Drive — add an extra `rclone copy` of the volume
  path to the backup script if you want to extend. Not done by default
  because the volume is ~500MB-few GB and would eat Drive quota faster.
- Production secrets (API keys etc). Those live in Coolify's own
  config, not the DB. If Coolify itself dies, re-populate from your
  password manager.
- Third-party data (Mailchimp subscribers, Stripe records). Those are
  backed up by Mailchimp and Stripe themselves.
