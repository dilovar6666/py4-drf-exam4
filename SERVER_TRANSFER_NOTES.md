# PharmaMap server transfer notes

These instructions are for the shared server `31.25.238.204` and the
`/home/dilovar` home directory. They do not contain passwords or API keys.

## Local source state

- Source database: PostgreSQL (`postgresql`, database `pharmamap`)
- Source host: local PostgreSQL (`localhost:5432`)
- Custom dump: `deployment_artifacts/pharmamap_20261003.dump`
- Media archive: `deployment_artifacts/pharmamap_media_20261003.zip`
- PostgreSQL and Redis must remain internal to the PharmaMap Compose network.

The dump was created with `pg_dump -Fc` and validated with `pg_restore -l`.
Do not put either artifact in Git.

## Counts captured before dump

```text
CustomUser=19
Pharmacy=12
PharmacyWorker=13
Category=12
Medicine=42
PharmacyMedicine=192
PriceHistory=96
Reservation=12
Review=20
PharmacistReview=13
Chat=7
Message=43
Notification=63
StockNotification=4
PharmacyApplication=3
ChatBlock=0
UserPresence=5
EmailVerificationCode=0
```

## Transfer from Windows

Run from the repository root after confirming the files exist:

```powershell
scp deployment_artifacts/pharmamap_20261003.dump dilovar@31.25.238.204:/home/dilovar/pharmamap_20261003.dump
scp deployment_artifacts/pharmamap_media_20261003.zip dilovar@31.25.238.204:/home/dilovar/pharmamap_media_20261003.zip
```

These commands use SSH only. They do not expose PostgreSQL on port 5432.

## Required server inspection (read-only first)

```bash
cd /home/dilovar
docker compose ls
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
ss -ltnp | grep -E ':(80|443|5432|6379)\b' || true
find /home/dilovar -maxdepth 3 -name 'docker-compose.yml' -o -name 'compose.yaml'
```

Only use the PharmaMap project directory. Do not stop or edit containers,
reverse proxies, or files belonging to other users. If ports 80/443 are owned
by a shared proxy, publish PharmaMap only through that proxy's existing
approved mechanism; do not bind another service directly to those ports.

## Safe restore sequence for a new/empty PharmaMap database

From the PharmaMap directory on the server:

```bash
cp /home/dilovar/pharmamap_20261003.dump ./pharmamap_20261003.dump
docker compose up -d db
docker compose ps db
docker compose cp ./pharmamap_20261003.dump db:/tmp/pharmamap_20261003.dump
```

Before restoring, verify that the target database is new/empty and that its
`POSTGRES_DB`, `POSTGRES_USER`, and password are supplied through the server's
ignored `.env`. Never run `--clean` against an unknown production database.

For a confirmed empty target only:

```bash
docker compose exec -T db pg_restore \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-owner --no-privileges \
  /tmp/pharmamap_20261003.dump
```

If the target already contains data, stop and take a separate server backup;
do not overwrite it without explicit approval. After restore, run migrations
and start the application services:

```bash
docker compose up -d backend celery_worker frontend nginx
docker compose ps
```

## Media restore

Resolve the actual PharmaMap media volume/path from the server Compose and Nginx
configuration first. Then copy and extract only into that path. Example after
the path has been confirmed:

```bash
unzip -q /home/dilovar/pharmamap_media_20261003.zip -d /tmp/pharmamap-media-restore
# copy the contents of /tmp/pharmamap-media-restore/media/ into the confirmed
# persistent media directory, preserving its owner and permissions
```

Do not change a shared Nginx configuration or another user's media directory.

## Post-restore verification

```bash
docker compose exec -T backend python manage.py shell -c \
  "from django.db import connection; print(connection.vendor); \
   from accounts.models import CustomUser; print('users=', CustomUser.objects.count())"
docker compose exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"
docker compose exec -T redis redis-cli ping
```

Compare all model counts with the pre-dump table above, then verify `/api/`,
`/api/docs/`, media URLs, chat WebSocket, and notification WebSocket through
the server's approved reverse proxy.
