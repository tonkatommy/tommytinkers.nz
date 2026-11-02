#!/bin/sh
# Builds DATABASE_URL from the Compose secret so the database password lives in
# exactly one file (deploy/secrets/db_password.txt) instead of also sitting in
# an env var that `docker inspect` would show.
set -eu

if [ -z "${DATABASE_URL:-}" ] && [ -f /run/secrets/db_password ]; then
  DB_PASSWORD="$(cat /run/secrets/db_password)"
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${DB_PASSWORD}@${POSTGRES_HOST:-db}:5432/${POSTGRES_DB}"
fi

exec "$@"
