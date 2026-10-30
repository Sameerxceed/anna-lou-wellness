#!/bin/bash
# Daily CMS backup — Postgres database + website code bundle → Anna's Drive
#
# Runs from the Coolify VPS (host, not container). Uses the Drive Bridge
# service account for Drive auth. See ops/COOLIFY_DRIVE_BACKUPS.md for
# install + restore procedure.
#
# Writes two files per day into the configured Drive folder:
#   cms-db-<timestamp>.sql.gz     — Postgres custom-format dump, gzipped
#   cms-code-<timestamp>.bundle   — git bundle of full repo history
#
# Rotates by deleting files older than $RETENTION_DAYS in the target folder.

set -euo pipefail

# ─── Config ───────────────────────────────────────────────────────────
TIMESTAMP=$(date -u +%Y-%m-%dT%H-%M-%S)
WORK_DIR=/tmp/cms-backup
RETENTION_DAYS=7
REPO_DIR=/opt/anna-lou-wellness-mirror
GITHUB_REMOTE="https://github.com/Sameerxceed/anna-lou-wellness.git"
RCLONE_TARGET="alw-drive:"   # root_folder_id in rclone config decides WHERE in Drive

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

# ─── Code bundle ──────────────────────────────────────────────────────
# Keep a bare mirror on disk, update + bundle it. Cheaper than cloning
# fresh every day. Bare mirror size is similar to .git directory —
# roughly 50-200 MB for this repo.
if [ ! -d "$REPO_DIR" ]; then
  echo "[$(date -u)] First run: cloning mirror of $GITHUB_REMOTE..."
  git clone --mirror "$GITHUB_REMOTE" "$REPO_DIR"
fi
echo "[$(date -u)] Fetching latest refs..."
git -C "$REPO_DIR" fetch --all --prune --quiet

CODE_FILE="$WORK_DIR/cms-code-${TIMESTAMP}.bundle"
echo "[$(date -u)] Creating git bundle (--all, full history)..."
git -C "$REPO_DIR" bundle create "$CODE_FILE" --all --quiet
CODE_SIZE=$(du -h "$CODE_FILE" | cut -f1)
echo "[$(date -u)] Code bundle: $(basename "$CODE_FILE") ($CODE_SIZE)"

# ─── Upload to Drive ──────────────────────────────────────────────────
echo "[$(date -u)] Uploading to Drive..."
rclone copy "$DB_FILE"   "$RCLONE_TARGET" --no-traverse
rclone copy "$CODE_FILE" "$RCLONE_TARGET" --no-traverse
echo "[$(date -u)] Upload complete."

# ─── Local temp cleanup ───────────────────────────────────────────────
rm -f "$DB_FILE" "$CODE_FILE"

# ─── Remote retention: delete files older than $RETENTION_DAYS ───────
echo "[$(date -u)] Rotating remote: deleting files older than ${RETENTION_DAYS}d..."
rclone delete "$RCLONE_TARGET" --min-age "${RETENTION_DAYS}d"

echo "[$(date -u)] === Backup run OK ==="
