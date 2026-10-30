#!/bin/bash
# install-backups.sh — one-shot installer for the CMS daily backup pipeline.
#
# Usage (on the Coolify VPS host, as root):
#   curl -sSL https://raw.githubusercontent.com/Sameerxceed/anna-lou-wellness/main/ops/install-backups.sh \
#     | sudo FOLDER_ID=<anna_cms_backups_folder_id> bash
#
# What it does:
#   1. Installs rclone (skips if already present).
#   2. Extracts DRIVE_BRIDGE_SA_JSON from the running CMS container into
#      /opt/drive-sa.json (so you don't have to paste the SA key by hand).
#   3. Writes /root/.config/rclone/rclone.conf pointing at Anna's folder.
#   4. Verifies rclone can list + write to the Drive folder.
#   5. Downloads cms-backup.sh (the actual nightly script).
#   6. Runs ONE backup immediately so there's a snapshot in hand tonight.
#   7. Adds the daily cron entry (03:00 UTC).
#   8. Installs logrotate rules so /var/log/cms-backup.log doesn't grow forever.
#
# Idempotent — safe to re-run. Won't duplicate the cron entry; won't
# overwrite SA JSON if already present.

set -euo pipefail

if [ -z "${FOLDER_ID:-}" ]; then
  echo "ERROR: pass FOLDER_ID=<drive-folder-id> as env var"
  exit 1
fi

echo "=== Step 1/8: Install rclone ==="
if ! command -v rclone >/dev/null 2>&1; then
  curl -sSL https://rclone.org/install.sh | bash
else
  echo "rclone already installed: $(rclone version | head -n1)"
fi

echo
echo "=== Step 2/8: Extract SA JSON from CMS container ==="
mkdir -p /opt
if [ -f /opt/drive-sa.json ] && [ -s /opt/drive-sa.json ]; then
  echo "/opt/drive-sa.json already exists, leaving it alone"
else
  SA_CONTAINER=""
  for c in $(docker ps --format '{{.Names}}'); do
    if docker exec "$c" printenv DRIVE_BRIDGE_SA_JSON >/dev/null 2>&1; then
      SA_CONTAINER="$c"
      break
    fi
  done
  if [ -z "$SA_CONTAINER" ]; then
    echo "ERROR: no running container has DRIVE_BRIDGE_SA_JSON env var."
    echo "Make sure the CMS app is running (docker ps). Aborting."
    exit 1
  fi
  echo "Found SA env in container: $SA_CONTAINER"
  docker exec "$SA_CONTAINER" printenv DRIVE_BRIDGE_SA_JSON > /opt/drive-sa.json
  chmod 600 /opt/drive-sa.json
  # Sanity check it looks like JSON.
  if ! head -c 1 /opt/drive-sa.json | grep -q '{'; then
    echo "ERROR: extracted SA JSON doesn't look like JSON. First bytes:"
    head -c 80 /opt/drive-sa.json
    exit 1
  fi
  echo "Wrote /opt/drive-sa.json ($(wc -c < /opt/drive-sa.json) bytes)"
fi

echo
echo "=== Step 3/8: Write rclone config ==="
mkdir -p /root/.config/rclone
cat > /root/.config/rclone/rclone.conf <<EOF
[alw-drive]
type = drive
scope = drive
service_account_file = /opt/drive-sa.json
root_folder_id = ${FOLDER_ID}
EOF
echo "Wrote /root/.config/rclone/rclone.conf"

echo
echo "=== Step 4/8: Verify rclone can see Drive folder ==="
if rclone touch alw-drive:connectivity-test.txt && rclone delete alw-drive:connectivity-test.txt; then
  echo "RCLONE OK (verified read + write to folder)"
else
  echo "ERROR: rclone can't write to the folder."
  echo "Most likely cause: the folder isn't shared with the SA email as Editor."
  echo "SA email is:"
  grep -o '"client_email"[^,]*' /opt/drive-sa.json
  exit 1
fi

echo
echo "=== Step 5/8: Install backup script ==="
curl -sSL -o /opt/cms-backup.sh https://raw.githubusercontent.com/Sameerxceed/anna-lou-wellness/main/ops/cms-backup.sh
chmod +x /opt/cms-backup.sh
echo "Installed /opt/cms-backup.sh"

echo
echo "=== Step 6/8: Run first backup now ==="
/opt/cms-backup.sh
echo "First backup complete. Check Anna's CMS Backups folder in Drive for 2 new files."

echo
echo "=== Step 7/8: Add daily cron entry ==="
CRON_LINE="0 3 * * * /opt/cms-backup.sh >> /var/log/cms-backup.log 2>&1"
if crontab -l 2>/dev/null | grep -Fq "/opt/cms-backup.sh"; then
  echo "Cron entry already present, skipping"
else
  (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
  echo "Added: $CRON_LINE"
fi

echo
echo "=== Step 8/8: Log rotation ==="
cat > /etc/logrotate.d/cms-backup <<'EOF'
/var/log/cms-backup.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
EOF
echo "Installed /etc/logrotate.d/cms-backup"

echo
echo "========================================"
echo "DONE. Daily backups will run at 03:00 UTC."
echo "Log: /var/log/cms-backup.log"
echo "Run again manually anytime: /opt/cms-backup.sh"
echo "========================================"
