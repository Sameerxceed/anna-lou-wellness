# Daily backups to Cloudflare R2

Supersedes `ops/COOLIFY_DRIVE_BACKUPS.md` (the earlier Drive-via-rclone
plan, abandoned because Drive isn't S3-compatible and required a custom
script path we didn't want to maintain long-term). R2 is Cloudflare's
S3-compatible object store. 10 GB free tier covers ALW comfortably.
Bucket + keys owned by Anna, not Xceed.

What runs: `ops/cms-backup.sh` as a nightly cron on the VPS host.
Produces two artefacts in the R2 bucket per run:

- `db/cms-db-<timestamp>.sql.gz` — Postgres custom-format dump, gzipped.
  7-day rolling retention. Covers every CMS record (articles, products,
  orders, members, FAQs, settings).
- `uploads/…` — incremental rclone sync of the media volume. Mirror
  layout. Covers every uploaded image / video / PDF. R2 object
  versioning (enable on bucket) provides 30-day accidental-delete
  safety net.

## Prerequisites (one-time)

### Anna

1. Cloudflare account at https://dash.cloudflare.com/sign-up. Free.
2. Enable R2 Object Storage. Requires a credit card for anti-abuse
   (Cloudflare's policy) even on free tier; no charges within ALW's
   usage envelope.
3. Create bucket `anna-lou-wellness-backups`. Region: Eastern Europe
   (EEUR) or Western Europe (WEUR).
4. Enable object versioning on the bucket (Bucket → Settings →
   Object Versioning → Enable). Retention 30 days.
5. Create R2 API Token: R2 → Manage R2 API Tokens → Create. Permissions:
   **Object Read & Write**, scoped to `anna-lou-wellness-backups`. No
   expiry.
6. Send to Sameer (via password-manager share, not email):
   - **Account ID** (R2 overview page)
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint URL** (looks like `https://<account-id>.r2.cloudflarestorage.com`)

### Sameer (VPS install)

On the IONOS VPS (SSH via `ssh root@217.160.147.201`, port 22 open as of
30 Oct), as root:

```bash
# Install rclone (skip if already present).
command -v rclone >/dev/null || curl -sSL https://rclone.org/install.sh | bash

# Configure rclone for R2 as an S3-compatible remote.
mkdir -p /root/.config/rclone
cat > /root/.config/rclone/rclone.conf <<EOF
[alw-r2]
type = s3
provider = Cloudflare
access_key_id = <ACCESS_KEY_ID>
secret_access_key = <SECRET_ACCESS_KEY>
endpoint = https://<ACCOUNT_ID>.r2.cloudflarestorage.com
acl = private
EOF
chmod 600 /root/.config/rclone/rclone.conf

# Verify read+write access to the bucket.
rclone touch alw-r2:anna-lou-wellness-backups/test.txt \
  && rclone delete alw-r2:anna-lou-wellness-backups/test.txt \
  && echo "R2 OK"

# Install the backup script.
curl -sSL -o /opt/cms-backup.sh \
  https://raw.githubusercontent.com/Sameerxceed/anna-lou-wellness/main/ops/cms-backup.sh
chmod +x /opt/cms-backup.sh

# First run (manual, foreground, to catch any errors).
/opt/cms-backup.sh

# Add daily cron.
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/cms-backup.sh >> /var/log/cms-backup.log 2>&1") | crontab -

# Log rotation.
cat > /etc/logrotate.d/cms-backup <<'EOF'
/var/log/cms-backup.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
EOF
```

After the manual run completes, verify in the Cloudflare R2 dashboard:
one file under `db/`, one folder tree under `uploads/`.

## Verifying it's running

Spot-check weekly:

- R2 dashboard → bucket → `db/` prefix: should show one new file per day
  for the last 7 days, nothing older.
- `tail -50 /var/log/cms-backup.log` on the VPS: `=== Backup run OK ===`
  entries dated recent 03:00 UTC runs.

## Restoring

### Database

If the CMS loses data catastrophically:

```bash
# Download the chosen dump.
rclone copy alw-r2:anna-lou-wellness-backups/db/cms-db-<timestamp>.sql.gz /tmp/

# Decompress and copy into the Postgres container.
gunzip /tmp/cms-db-<timestamp>.sql.gz
PG_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^postgresql-database-' | head -n1)
docker cp /tmp/cms-db-<timestamp>.sql "$PG_CONTAINER:/tmp/restore.sql"

# Stop the CMS app in Coolify first (UI → Stop button). This prevents
# in-flight writes during restore.

# Restore (DESTRUCTIVE — overwrites current DB).
PGUSER=$(docker exec "$PG_CONTAINER" sh -c 'printf %s "$POSTGRES_USER"')
PGDB=$(docker exec "$PG_CONTAINER" sh -c 'printf %s "$POSTGRES_DB"')
docker exec "$PG_CONTAINER" pg_restore -U "$PGUSER" -d "$PGDB" \
  --clean --if-exists /tmp/restore.sql

# Start CMS in Coolify UI. Anna loses any edits made since the dump
# (daily 03:00 UTC); typically up to 24h of work.
```

### Media volume

If the uploads volume is lost but the container isn't:

```bash
# Find the volume path.
VOLUME_NAME=$(docker volume ls --format '{{.Name}}' | grep cms-uploads | head -n1)
VOLUME_PATH=$(docker volume inspect "$VOLUME_NAME" --format '{{.Mountpoint}}')

# Restore from R2.
rclone sync alw-r2:anna-lou-wellness-backups/uploads/ "$VOLUME_PATH/" \
  --fast-list --transfers 4
```

If the whole VPS is lost: provision a new VPS, install Coolify, recreate
the apps from the GitHub repo, then run the DB restore + media restore
above against the fresh containers. ~1-2 hours of work for a competent
developer.

## What this covers vs doesn't

Covers:
- Every CMS record (via DB dump).
- Every uploaded media file (via volume sync).
- Admin user accounts and API tokens (stored in the DB, so in the DB
  dump).

Doesn't cover:
- Production secrets (Stripe / Mailchimp / Resend / Anthropic / SA keys).
  These live in Coolify env vars, not the DB. If Coolify itself is lost,
  rebuild from Anna's password manager + from the respective dashboards
  (regenerate keys). Document the key sources in Anna's password manager.
- Third-party service data (Mailchimp subscribers, Stripe customers).
  Those live with Mailchimp and Stripe and are backed up by them.
