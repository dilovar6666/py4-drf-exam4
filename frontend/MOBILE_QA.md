# PharmaMap Mobile QA

## Authenticated QA (Edge CDP, 2026-10-02)

The authenticated pass used the real Microsoft Edge executable listed below. Login was verified against the running API for `user1/demo12345`, `pharmacist1/demo12345`, and `admin/admin`. The seeded database has an owner worker (`apteca22`), but no valid password for that existing account was available; no password was changed or invented, so owner-only flows remain explicitly unverified.

| Role | Viewports | Result |
| --- | --- | --- |
| User | 360x800, 390x844, 430x932, 768x1024, 1440x900 | PASS: Home/map, profile, reservations, messages, notifications, applications, leaderboard; no overflow, console errors, or 4xx/5xx responses |
| Pharmacist | same | PASS: workspace, reservations, chats, notifications, profile; data rendered after API completion |
| Admin/staff | same | PASS: dashboard, profile, notifications; dashboard rendered after API completion |

Additional real interactions: authenticated RU -> TJ language change without reload (localStorage persisted `tj`), authenticated theme switch to dark, and Edge screenshots at 390x844/430x932. A confirmed mobile chat bug was fixed: the block/unblock header action now shows only its icon on mobile (desktop keeps the text label), preventing clipping at 390px.

The system keyboard was not emulated; viewport resize/fixed composer behavior was checked instead. Owner-only employee management, two-profile presence timeout, reservation creation/cancellation, real AI request, avatar upload, and destructive admin CRUD are not claimed as completed because owner credentials or disposable-data interaction were unavailable/safely avoided.

Дата: 2026-10-02

## Реальный браузер

- Microsoft Edge `154.0.4258.48`
- `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- Headless DevTools Protocol, не CUA

## Автоматический viewport-прогон

Проверены реальные рендеры публичных/auth-маршрутов `/`, `/login`, `/register`, `/leaderboard`, `/notifications`, `/reservations`, `/profile`, `/chats`, `/pharmacy-applications`, `/admin` в light и dark режимах.

| Конфигурация | Результат |
| --- | --- |
| 360px width | PASS, эффективный CSS viewport Edge: 362px; height was part of the shared 844px mobile run |
| 375px width | PASS, shared 844px mobile run |
| 390x844 | PASS, light/dark screenshots сняты во временную QA-папку |
| 393px width | PASS, shared 844px mobile run |
| 412px width | PASS, shared 844px mobile run |
| 430px width | PASS, shared 844px mobile run; screenshots shell сняты во временную QA-папку |
| 768px width | PASS, 1024px tablet-height run; overflow не найден |
| scrollWidth > innerWidth | 0 случаев |
| console.error / exception | 0 |
| HTTP responses 4xx/5xx во время прогона | 0 |

## Подтверждённые исправления

- Mobile bottom navigation получила равномерные touch-targets, `text-overflow` и safe-area padding.
- Убран горизонтальный overflow на проверенных маршрутах.
- Map sheet, map controls и chat composer получили безопасные mobile z-index/viewport-ограничения.
- Dialog scroll ограничен viewport, вложенный scroll не выходит за экран.

## Ограничения

- QA выполнялся без авторизации, поэтому staff-only Workspace/Admin CRUD и реальный message composer не проходили authenticated click-flow.
- Настоящая системная клавиатура в headless Edge не эмулировалась; resize/fixed-layout проверены.
- Network audit отражает только публичные/auth-маршруты текущего прогона.
- Временные screenshots и логи после проверки удалены и в Git не добавлялись.

## Проверки

- `npm run lint` — PASS
- `npm run build` — PASS
