#!/usr/bin/env bash
#
# push-openai-feed.sh — daily SFTP push of the OpenAI Agentic Commerce
# product feed.
#
# What this does:
#   1. Curl the live JSONL feed from our production site
#   2. Gzip it
#   3. SFTP it to OpenAI's ingestion server
#
# Why bash and not Node:
#   - No npm dependencies needed in our repo (project rule)
#   - sftp + curl + gzip are universal — work in any Coolify build image
#   - Easy to run from a cron job, CI runner, or manual shell
#
# Required environment variables (set in Coolify -> Scheduled Task -> Env,
# or in the system crontab that invokes this script):
#
#   FEED_URL              Public URL of our JSONL feed. Default:
#                         https://annalouwellness.com/ai-products.jsonl
#   SFTP_HOST             OpenAI's SFTP server (issued at merchant onboarding)
#   SFTP_USER             SFTP username (issued at merchant onboarding)
#   SFTP_KEY_PATH         Absolute path to the private key file OpenAI accepts
#                         OR set SFTP_PASSWORD instead (less preferred)
#   SFTP_REMOTE_PATH      Remote directory on OpenAI's SFTP. Default: /
#   SFTP_FILE_PREFIX      Prefix for the uploaded filename. Default:
#                         anna-lou-wellness-products
#
# Recommended Coolify schedule: daily at 03:00 UK time (one off-peak window)
#   Cron:   0 3 * * *
#
# Manual run:
#   FEED_URL=https://staging.annalouwellness.com/ai-products.jsonl \
#   SFTP_HOST=... SFTP_USER=... SFTP_KEY_PATH=/run/secrets/openai_sftp_key \
#   ./push-openai-feed.sh

set -euo pipefail

FEED_URL="${FEED_URL:-https://annalouwellness.com/ai-products.jsonl}"
SFTP_HOST="${SFTP_HOST:-}"
SFTP_USER="${SFTP_USER:-}"
SFTP_KEY_PATH="${SFTP_KEY_PATH:-}"
SFTP_PASSWORD="${SFTP_PASSWORD:-}"
SFTP_REMOTE_PATH="${SFTP_REMOTE_PATH:-/}"
SFTP_FILE_PREFIX="${SFTP_FILE_PREFIX:-anna-lou-wellness-products}"

# --- preflight ---
if [[ -z "${SFTP_HOST}" || -z "${SFTP_USER}" ]]; then
  echo "[push-openai-feed] ERROR: SFTP_HOST and SFTP_USER must be set." >&2
  echo "[push-openai-feed] Apply at https://developers.openai.com/commerce to receive credentials." >&2
  exit 2
fi
if [[ -z "${SFTP_KEY_PATH}" && -z "${SFTP_PASSWORD}" ]]; then
  echo "[push-openai-feed] ERROR: either SFTP_KEY_PATH or SFTP_PASSWORD must be set." >&2
  exit 2
fi

# --- fetch + compress ---
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "${WORK_DIR}"' EXIT
LOCAL_FILE="${WORK_DIR}/${SFTP_FILE_PREFIX}-${TIMESTAMP}.jsonl"
GZ_FILE="${LOCAL_FILE}.gz"

echo "[push-openai-feed] $(date -u +%H:%M:%SZ)  Fetching ${FEED_URL}..."
HTTP_STATUS=$(curl --fail --silent --show-error --location \
  --write-out '%{http_code}' \
  --output "${LOCAL_FILE}" \
  "${FEED_URL}" || true)

if [[ "${HTTP_STATUS}" != "200" ]]; then
  echo "[push-openai-feed] ERROR: feed fetch returned HTTP ${HTTP_STATUS}" >&2
  exit 3
fi

LINE_COUNT=$(wc -l < "${LOCAL_FILE}")
if [[ "${LINE_COUNT}" -lt 1 ]]; then
  echo "[push-openai-feed] ERROR: feed has 0 lines, refusing to push empty file" >&2
  exit 4
fi
echo "[push-openai-feed] Fetched ${LINE_COUNT} product rows."

gzip --force --best "${LOCAL_FILE}"
REMOTE_FILE="${SFTP_REMOTE_PATH%/}/$(basename "${GZ_FILE}")"
echo "[push-openai-feed] Uploading $(basename "${GZ_FILE}") to ${SFTP_USER}@${SFTP_HOST}:${REMOTE_FILE} ..."

# --- sftp push ---
# Use a batch file so we can run sftp non-interactively. The single 'put'
# command names the remote file explicitly so each daily snapshot lands
# with its timestamp (helps with audit and rollback).
SFTP_BATCH="${WORK_DIR}/sftp.batch"
echo "put ${GZ_FILE} ${REMOTE_FILE}" > "${SFTP_BATCH}"

SFTP_OPTS=(
  -oStrictHostKeyChecking=accept-new
  -oBatchMode=yes
  -b "${SFTP_BATCH}"
)

if [[ -n "${SFTP_KEY_PATH}" ]]; then
  SFTP_OPTS+=(-i "${SFTP_KEY_PATH}")
  sftp "${SFTP_OPTS[@]}" "${SFTP_USER}@${SFTP_HOST}"
else
  # Password mode — needs sshpass installed in the runner image.
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "[push-openai-feed] ERROR: sshpass is required for password-mode SFTP but is not installed." >&2
    exit 5
  fi
  sshpass -p "${SFTP_PASSWORD}" sftp "${SFTP_OPTS[@]}" "${SFTP_USER}@${SFTP_HOST}"
fi

echo "[push-openai-feed] $(date -u +%H:%M:%SZ)  Pushed ${LINE_COUNT} products to OpenAI."
