#!/bin/bash
# Daily CMS backup → Cloudflare R2 (Anna's own account).
#
# Runs from the Coolify VPS (host, not container). Uses rclone with an
# S3-compatible remote pointing at R2. See ops/R2_BACKUPS.md for the
# install + restore procedure.
#
# Writes TWO artefacts per day to the configured R2 bucket:
#   cms-db-<timestamp>.sql.gz   — Postgres custom-format dump, gzipped.
#                                 Covers every CMS record.
#   uploads/                    — incremental sync of the media volume.
#                                 Covers every image, video, PDF Anna
#                                 has ever uploaded.
#
# pg_dump is DB-only — it does NOT include the uploads volume, which is
# a separate persistent disk. Anna flagged this gap 3 Nov. The two
# artefacts together are the true "lose nothing on VPS death" recovery
# set.
#
# DB rotation: files older than $DB_RETENTION_DAYS days deleted.
# Uploads: mirror sync, matches current volume state. R2 object
# versioning (enable on the bucket) keeps previous versions for
# 30 days as a safety net against accidental delete.

set -euo pipefail

# ─── Config ───────────────────────────────────────────────────────────
TIMESTAMP=$(date -u +%Y-%m-%dT%H-%M-%S)
WORK_DIR=/tmp/cms-backup
DB_RETENTION_DAYS=7

# rclone remote name. Configured in /root/.config/rclone/rclone.conf
# as an s3 remote with R2's endpoint — see ops/R2_BACKUPS.md.
R2_REMOTE="alw-r2"
R2_DB_PATH="${R2_REMOTE}:anna-lou-wellness-backups/db"
R2_UPLOADS_PATH="${R2_REMOTE}:anna-lou-wellness-backups/uploads"

# Media volume path on the host. Coolify's cms-uploads named volume.
# Default location is /var/lib/docker/volumes/<project-uuid>-cms-uploads/_data
# Discovered dynamically below so we don't hardcode the project UUID.
VOLUME_NAME_PATTERN='cms-uploads'

mkdir -p "$WORK_DIR"
echo "[$(date -u)] === Backup run start ==="

# ─── Database dump ────────────────────────────────────────────────────
echo "[$(date -u)] Locating Postgres container..."
PG_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^postgresql-database-' | head -n1 || true)
if [ -z "$PG_CONTAINER" ]; then
  echo "[$(date -u)] ERROR: no running Postgres container found. docker ps output:"
  docker ps --format '  {{.Names}}'
  exit 1
fi
echo "[$(date -u)] Using container: $PG_CONTAINER"

PGUSER=$(docker exec "$PG_CONTAINER" sh -c 'printf %s "$POSTGRES_USER"')
PGDB=$(docker exec "$PG_CONTAINER" sh -c 'printf %s "$POSTGRES_DB"')

DB_FILE="$WORK_DIR/cms-db-${TIMESTAMP}.sql.gz"
echo "[$(date -u)] Dumping database '$PGDB' as user '$PGUSER'..."
docker exec "$PG_CONTAINER" pg_dump -U "$PGUSER" -d "$PGDB" --format=custom \
  | gzip > "$DB_FILE"
DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
echo "[$(date -u)] DB dump: $(basename "$DB_FILE") ($DB_SIZE)"

# ─── Upload DB to R2 ──────────────────────────────────────────────────
echo "[$(date -u)] Uploading DB dump to R2..."
rclone copy "$DB_FILE" "$R2_DB_PATH/" --no-traverse
echo "[$(date -u)] DB upload complete."
rm -f "$DB_FILE"

# ─── Media volume sync ────────────────────────────────────────────────
echo "[$(date -u)] Locating media volume..."
VOLUME_PATH=$(docker volume ls --format '{{.Name}}' | grep -E "$VOLUME_NAME_PATTERN" | head -n1)
if [ -z "$VOLUME_PATH" ]; then
  echo "[$(date -u)] WARNING: no media volume matching '$VOLUME_NAME_PATTERN' — skipping media sync. DB backup already saved." >&2
else
  # Resolve the volume to its host filesystem path.
  VOLUME_MOUNTPOINT=$(docker volume inspect "$VOLUME_PATH" --format '{{.Mountpoint}}')
  if [ -z "$VOLUME_MOUNTPOINT" ] || [ ! -d "$VOLUME_MOUNTPOINT" ]; then
    echo "[$(date -u)] WARNING: volume '$VOLUME_PATH' mountpoint not readable — skipping media sync." >&2
  else
    MEDIA_SIZE=$(du -sh "$VOLUME_MOUNTPOINT" | cut -f1)
    echo "[$(date -u)] Syncing media volume from $VOLUME_MOUNTPOINT ($MEDIA_SIZE) to R2..."
    # --fast-list: fewer S3 list calls. --checksum: compare hashes for
    # changed-file detection (so we only re-upload what actually changed).
    rclone sync "$VOLUME_MOUNTPOINT/" "$R2_UPLOADS_PATH/" \
      --fast-list \
      --checksum \
      --transfers 4
    echo "[$(date -u)] Media sync complete."
  fi
fi

# ─── DB retention: delete > 7 days ────────────────────────────────────
echo "[$(date -u)] Rotating DB backups older than ${DB_RETENTION_DAYS}d..."
rclone delete "$R2_DB_PATH/" --min-age "${DB_RETENTION_DAYS}d"

echo "[$(date -u)] === Backup run OK ==="
