# PharmaMap deployment

This document describes the safe deployment flow for the shared Ubuntu host.
It contains no passwords, API keys, or private tokens.

## Target

- SSH user: `dilovar`
- Host: `31.25.238.204`
- Project directory: `/home/dilovar/pharmamap`

Do not stop containers or edit files outside this project. Inspect existing
ports and reverse-proxy ownership before publishing PharmaMap. PostgreSQL and
Redis must stay on the internal Compose network; never expose ports 5432 or
6379 publicly.

## First deployment

```bash
cd /home/dilovar
git clone https://github.com/dilovar6666/py4-drf-exam4.git pharmamap
cd pharmamap
git checkout master
cp .env.example .env
chmod 600 .env
```

Fill the ignored `.env` with production values. Required secrets include
`SECRET_KEY`, `POSTGRES_PASSWORD`, SMTP credentials, and any enabled Gemini or
MapTiler keys. Do not commit `.env`.

Before starting, inspect the shared host:

```bash
docker compose ls
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
ss -ltnp | grep -E ':(80|443|5432|6379|8000)\b' || true
```

If 80/443 belong to a shared reverse proxy, use its approved per-project
configuration instead of binding another service directly to those ports.

## Start infrastructure and restore data

Copy the locally-created custom dump and media archive over SSH. Verify their
checksums and that the target database is new/empty before restoring.

```bash
docker compose up -d db redis
docker compose ps db redis
docker compose cp /home/dilovar/pharmamap.dump db:/tmp/pharmamap.dump
docker compose exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --no-owner --no-privileges /tmp/pharmamap.dump
```

Never use `--clean` against an unknown database. If the database already has
data, stop and take a separate server backup first.

Restore media only after confirming the Compose media volume/path:

```bash
unzip -q /home/dilovar/pharmamap_media.zip -d /tmp/pharmamap-media
```

Copy the archive contents into the confirmed persistent media directory and
preserve the container's expected ownership.

## Build and start

```bash
docker compose config
docker compose build
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
docker compose exec backend python manage.py check
docker compose ps
```

Check backend, worker, Nginx, Redis, and database logs before opening the site:

```bash
docker compose logs --tail=200 backend celery_worker nginx redis db
```

Validate `/api/`, `/api/docs/`, `/admin/`, media URLs, chat WebSocket, and
notification WebSocket through the approved reverse proxy. Compare restored
model counts with the source counts recorded in `SERVER_TRANSFER_NOTES.md`.

## Future updates

```bash
cd /home/dilovar/pharmamap
git pull origin master
docker compose build
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
docker compose ps
```

Take a database backup before schema changes. Do not use `docker compose down
-v`, `git reset --hard`, or system-wide cleanup commands on the shared host.

## Backups

Store PharmaMap backups only in `/home/dilovar/backups/pharmamap/` and retain
the most recent 7–14 custom-format dumps. A backup must be validated with
`pg_restore -l`; never commit it to Git.

## HTTPS

HTTPS and WSS require a real production domain whose DNS points to
`31.25.238.204`. Do not invent a domain or claim certificate readiness before
DNS, the shared proxy, and the certificate are verified.
