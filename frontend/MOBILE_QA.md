# PharmaMap Mobile QA

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
