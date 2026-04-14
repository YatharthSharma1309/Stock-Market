#!/usr/bin/env bash
# Dump the Postgres database to a timestamped gzipped file.
# Usage: ./scripts/backup-db.sh
# Env vars (with defaults):
#   POSTGRES_HOST     postgres
#   POSTGRES_PORT     5432
#   POSTGRES_DB       stocksim_db
#   POSTGRES_USER     stocksim
#   PGPASSWORD        (must be set externally)
#   BACKUP_DIR        /backups
#   RETAIN_DAYS       7

set -euo pipefail

POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-stocksim_db}"
POSTGRES_USER="${POSTGRES_USER:-stocksim}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETAIN_DAYS="${RETAIN_DAYS:-7}"

TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
FILENAME="${POSTGRES_DB}_${TIMESTAMP}.sql.gz"
DEST="${BACKUP_DIR}/${FILENAME}"

mkdir -p "${BACKUP_DIR}"

echo "[backup] dumping ${POSTGRES_DB} → ${DEST}"
pg_dump \
  -h "${POSTGRES_HOST}" \
  -p "${POSTGRES_PORT}" \
  -U "${POSTGRES_USER}" \
  --no-password \
  "${POSTGRES_DB}" \
  | gzip > "${DEST}"

echo "[backup] done: ${DEST} ($(du -sh "${DEST}" | cut -f1))"

# Prune backups older than RETAIN_DAYS
find "${BACKUP_DIR}" -name "${POSTGRES_DB}_*.sql.gz" -mtime +${RETAIN_DAYS} -print -delete

echo "[backup] retention: kept last ${RETAIN_DAYS} days"
