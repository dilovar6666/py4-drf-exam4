# PharmaMap

## Docker, Redis, Celery and email verification

The production-shaped local stack is defined in `docker-compose.yml`: PostgreSQL, Redis, the Django ASGI backend, a Celery worker, the Vite build served by Nginx, and the Nginx reverse proxy. Copy `.env.example` to `.env`, fill local secrets, then run:

```powershell
Copy-Item .env.example .env
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f backend celery_worker
```

Nginx serves the app at `http://localhost/`, proxies `/api/`, `/admin/`, `/media/`, and upgrades `/ws/` connections. PostgreSQL and Redis are internal services with healthchecks and persistent volumes. The backend entrypoint runs migrations and `collectstatic`; it never creates migrations automatically.

Registration now creates a 6-digit email verification code valid for 10 minutes. The frontend route is `/verify-email`; the API endpoints are `/api/auth/verify-email/` and `/api/auth/resend-email-code/`. Existing users are marked verified by the accounts data migration so demo accounts keep working.

For SMTP, put your own provider values in the root `.env` (never in Git):

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-account@example.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=your-account@example.com
```

For Gmail commonly use `smtp.gmail.com:587`; for Microsoft 365 use `smtp.office365.com:587`. Many providers require an app password. If these variables are empty, development uses Django's console email backend; that is not a real delivery test.

PharmaMap — учебный сервис поиска лекарств и аптек Душанбе. Пользователь сравнивает цены и наличие на карте, создаёт бронь, пишет аптеке и оставляет отзывы. Фармацевт работает только с данными своей аптеки, а staff использует React admin panel.

## Stack

- Backend: Django, Django REST Framework, SimpleJWT, PostgreSQL, Django Channels
- Frontend: React, Vite, React Router, Axios, Tailwind CSS, Radix/shadcn-style UI, Lucide, Framer Motion
- Maps: React Leaflet, Leaflet, OpenStreetMap Standard, optional MapTiler Satellite, OSRM routing
- AI: Gemini API через защищённый Django endpoint

## Возможности

- JWT register/login/refresh, `/me/` и защищённые маршруты
- Map-first поиск аптек и лекарств по названию, веществу, производителю, категории и штрихкоду
- Сравнение цен, остатков и бронирование с резервированием stock
- Realtime chat и notifications через WebSocket; REST сохраняется для истории
- Блокировка участника чата с сохранением истории
- Отзывы и отдельные рейтинги аптек/фармацевтов
- Заявка на добавление аптеки с approve/reject процессом
- Рабочее место фармацевта и staff React admin panel
- Светлая, тёмная и системная тема
- Справочный Pharma AI на странице лекарства без диагностики и назначения лечения
- Swagger `/api/docs/`, schema `/api/schema/`, Redoc `/api/redoc/`

## Backend setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
 # Create the local PostgreSQL database once.
 & "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres pharmamap
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

`daphne` стоит первым в `INSTALLED_APPS`, поэтому development server обслуживает HTTP и WebSocket ASGI. Для отдельного ASGI-процесса можно использовать `daphne config.asgi:application`.

API: `http://127.0.0.1:8000/api/`

WebSocket endpoints:

- `ws://127.0.0.1:8000/ws/chats/<chat_id>/?token=<access>`
- `ws://127.0.0.1:8000/ws/notifications/?token=<access>`

## Frontend setup

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend: `http://127.0.0.1:5173/`

## Environment

Backend `.env`:

```env
SECRET_KEY=replace-with-a-long-local-key
DEBUG=False
ALLOWED_HOSTS=127.0.0.1,localhost
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
DB_NAME=pharmamap
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
```

The application uses PostgreSQL when `DB_NAME` is set. Create it once with:

```sql
CREATE DATABASE pharmamap;
```

The former SQLite database is preserved locally as `db.sqlite3.backup` before migration. It is intentionally ignored by Git. For a manual SQLite-to-PostgreSQL migration, export from the SQLite configuration with `python -X utf8 manage.py dumpdata --natural-foreign --natural-primary --exclude contenttypes --exclude auth.permission --exclude sessions --exclude admin.logentry -o .postgres_data.json`, switch the DB environment variables, run `python manage.py migrate`, then load it with `python -X utf8 manage.py loaddata .postgres_data.json`.

Frontend `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api/
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_MAPTILER_KEY=
VITE_ROUTING_URL=https://router.project-osrm.org
```

Реальные ключи не коммитятся: оба `.env` находятся в `.gitignore`. `GEMINI_API_KEY` используется только Django и не попадает в frontend. Без `VITE_MAPTILER_KEY` стандартная карта продолжает работать, а переключатель спутникового слоя остаётся отключённым. Для публичного deployment используйте собственный routing provider/лимиты вместо публичного demo OSRM endpoint.

## Demo accounts

После `python manage.py seed_demo`:

| Роль | Логин | Пароль |
|---|---|---|
| Superuser | `admin` | `admin` |
| User | `user1` … `user4` | `demo12345` |
| Pharmacist | `pharmacist1` … `pharmacist6` | `demo12345` |

Demo pharmacies имеют префикс `PharmaMap Demo` и не выдаются за проверенные реальные организации.

## Проверки

```powershell
python manage.py check
python manage.py makemigrations --check
python manage.py showmigrations
python manage.py test
cd frontend
npm run lint
npm run build
```

Swagger UI загружает текущую статическую OpenAPI schema с `/api/schema/`. WebSocket маршруты описаны здесь, поскольку OpenAPI документирует HTTP, а не WebSocket transport.
