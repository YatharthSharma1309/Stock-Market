#!/usr/bin/env bash
# Restore a gzipped PostgreSQL dump into the configured database.
# Usage:
#   BACKUP_FILE=/backups/stocksim_db_20260414T020000Z.sql.gz ./scripts/restore-db.sh
#
# Env vars (with defaults):
#   POSTGRES_HOST     postgres
#   POSTGRES_PORT     5432
#   POSTGRES_DB       stocksim_db
#   POSTGRES_USER     stocksim
#   PGPASSWORD        (must be set externally)
#   BACKUP_FILE       required path to .sql.gz file

set -euo pipefail

POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-stocksim_db}"
POSTGRES_USER="${POSTGRES_USER:-stocksim}"

if [[ -z "${BACKUP_FILE:-}" ]]; then
  echo "[restore] BACKUP_FILE is required" >&2
  exit 1
fi

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "[restore] backup file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

echo "[restore] restoring ${BACKUP_FILE} into ${POSTGRES_DB}"
gunzip -c "${BACKUP_FILE}" | psql \
  -h "${POSTGRES_HOST}" \
  -p "${POSTGRES_PORT}" \
  -U "${POSTGRES_USER}" \
  --no-password \
  -d "${POSTGRES_DB}"

echo "[restore] complete"
