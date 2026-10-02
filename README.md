# PharmaMap

PharmaMap — учебный сервис поиска лекарств и аптек Душанбе. Пользователь сравнивает цены и наличие на карте, создаёт бронь, пишет аптеке и оставляет отзывы. Фармацевт работает только с данными своей аптеки, а staff использует React admin panel.

## Stack

- Backend: Django, Django REST Framework, SimpleJWT, SQLite, Django Channels
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
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

Frontend `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api/
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_MAPTILER_KEY=
VITE_ROUTING_URL=https://router.project-osrm.org
```

Реальные ключи не коммитятся: оба `.env` находятся в `.gitignore`. `GEMINI_API_KEY` используется только Django и не попадает в frontend. Без `VITE_MAPTILER_KEY` стандартная карта продолжает работать, а спутниковый слой показывает понятное сообщение о недоступности. Для публичного deployment используйте собственный routing provider/лимиты вместо публичного demo OSRM endpoint.

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
