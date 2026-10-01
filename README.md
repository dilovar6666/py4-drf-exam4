# PharmaMap

PharmaMap — учебный сервис поиска лекарств и аптек Душанбе. Пользователь сравнивает цены и наличие на карте, создаёт бронь, пишет аптеке и оставляет отзывы. Фармацевт работает с чатами, остатками и бронями своей аптеки. Staff получает React admin panel с CRUD и аналитикой.

## Stack

- Backend: Django, Django REST Framework, Simple JWT, SQLite
- Frontend: React, Vite, React Router, Axios, Tailwind CSS, Radix/shadcn-style UI, Lucide, Framer Motion
- Maps: React Leaflet, Leaflet, OpenStreetMap Standard; optional MapTiler satellite

## Возможности

- JWT-регистрация, login, refresh и защищённые маршруты
- Map-first поиск аптек и лекарств
- Поиск по названию, действующему веществу, производителю, категории и штрихкоду
- Сравнение цен и остатков
- Бронирования с резервированием stock и статусами
- Отзывы и отдельные рейтинги аптек/фармацевтов
- REST-чаты user ↔ pharmacy
- Уведомления и подписки на наличие
- `/admin-panel` — React-панель для staff
- `/admin/` — стандартный Django Admin

## Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

API: `http://127.0.0.1:8000/api/`

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5173/`

## Environment

Скопируйте `.env.example` в `.env` при необходимости и не коммитьте реальные секреты.

Frontend-переменные находятся в `frontend/.env.example`:

```env
VITE_API_URL=http://127.0.0.1:8000/api/
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_MAPTILER_KEY=
```

Без `VITE_MAPTILER_KEY` карта использует OpenStreetMap Standard. Ключ MapTiler включает легальный спутниковый слой и должен быть ограничен разрешёнными доменами в кабинете MapTiler.

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
python manage.py test
cd frontend
npm run lint
npm run build
```
