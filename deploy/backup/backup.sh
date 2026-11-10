#!/bin/sh
# Nightly pg_dump into the backups volume, encrypted, keeping BACKUP_KEEP_DAYS
# of history. The privacy policy promises encrypted backups kept 30 days, so
# change both together.
#
# Encryption uses an age PUBLIC key (deploy/secrets/backup_age.pub). The
# private key never goes on the server, so someone who gets this disk can't
# read the dumps. Restoring needs the private key from wherever Tommy keeps it.
#
# This volume is on the same disk as the database: it covers a bad migration,
# not a dead drive. Copy /backups off the box (NAS or cloud bucket) too.
set -eu
# Without pipefail a failed pg_dump would still look like a good backup,
# because age (the last command in the pipe) would exit 0.
set -o pipefail

# tr strips \r as well as \n: a secret file made or edited on Windows ends in
# CRLF, and the Postgres image ignores that \r when it sets the password, so
# keeping it here would make every login fail.
export PGPASSWORD="$(tr -d '\r\n' < /run/secrets/db_password)"
RECIPIENT_FILE=/run/secrets/backup_age_pub
KEEP_DAYS="${BACKUP_KEEP_DAYS:-30}"

if [ ! -s "$RECIPIENT_FILE" ]; then
  echo "backup_age_pub secret is missing or empty: refusing to write unencrypted backups" >&2
  exit 1
fi

while true; do
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  file="/backups/${POSTGRES_DB}-${stamp}.dump.age"
  # -Fc = custom format: compressed, and restorable table by table with pg_restore.
  if pg_dump -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc \
    | age -R "$RECIPIENT_FILE" -o "$file.tmp"; then
    mv "$file.tmp" "$file"
    echo "backup ok: $file"
  else
    rm -f "$file.tmp"
    echo "backup FAILED at $stamp" >&2
  fi
  # -mmin rather than -mtime: -mtime +N rounds to whole days and would keep
  # files a day longer than the policy says.
  find /backups \( -name '*.dump.age' -o -name '*.dump' \) \
    -mmin +"$((KEEP_DAYS * 1440))" -delete
  sleep 86400
done
