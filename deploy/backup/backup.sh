#!/bin/sh
# Nightly pg_dump into the backups volume, keeping BACKUP_KEEP_DAYS of history.
# This volume is on the same disk as the database: it covers a bad migration,
# not a dead drive. Copy /backups off the box (NAS or cloud bucket) too.
set -eu

export PGPASSWORD="$(cat /run/secrets/db_password)"

while true; do
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  file="/backups/${POSTGRES_DB}-${stamp}.dump"
  # -Fc = custom format: compressed, and restorable table by table with pg_restore.
  if pg_dump -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f "$file.tmp"; then
    mv "$file.tmp" "$file"
    echo "backup ok: $file"
  else
    rm -f "$file.tmp"
    echo "backup FAILED at $stamp" >&2
  fi
  find /backups -name '*.dump' -mtime +"$BACKUP_KEEP_DAYS" -delete
  sleep 86400
done
