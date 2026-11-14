# Backup image: the same Postgres client as the database, plus age for
# encryption. age is installed here at build time because the backup container
# sits on the internal-only network and can't download anything once running.
FROM postgres:18.6-alpine
RUN apk add --no-cache age
COPY backup.sh /usr/local/bin/backup.sh
ENTRYPOINT ["sh", "/usr/local/bin/backup.sh"]
