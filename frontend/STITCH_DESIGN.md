# PharmaMap Stitch design direction

Stitch project: `projects/2059521797541322910`

Design system: `assets/17285986900585481743` — **PharmaMap Calm Clinical Precision**

## Direction

- Light warm-white canvas, pure white surfaces, cool-gray hairline borders.
- Pharmacy teal `#0f766e`, restrained blue accents, red only for errors.
- Manrope typography, strong hierarchy, generous whitespace and 12–20px radii.
- Subtle teal-tinted shadows and 160–240ms interaction transitions.
- Product language: premium healthcare discovery, never a generic admin dashboard.

## Map concepts compared

1. **Split 38/62** — `beaf2fe906d24ec2bdf615b30a185c68`, refined variant `ad7a6f4795884179b6f39b35d86b815e`.
   Stable list on the left and a dominant sticky map on the right. Best for scanning and comparing several pharmacies.
2. **Map-first floating panel** — `b291e52899ba465ab77a8a9719088499`.
   Edge-to-edge map with an elevated results panel. More immersive but less efficient for long result comparison.

Chosen implementation: the refined split for desktop and map-first with a results sheet for mobile.

## Audit redesign — full viewport map application

New screens generated from the explicit concept “Google Maps-like map-first pharmacy discovery interface, full viewport canvas, fixed left place panel, floating top search, filter chips, map controls, selected pharmacy detail, but original PharmaMap visual identity”:

1. **A — fixed 420px desktop sidebar + full map** — `d1e4f7da210f451e9f0846d44e33ae37`.
2. **B — collapsible selected-place panel + full map** — `bce825b6792a4c43a25a31666ffaed0e`.
3. **C — 390px mobile full map + floating search + bottom sheet** — `f4f11f7eb96d406e945eb45dd9f3942c`.

The implementation combines A as the desktop shell, B as the selected-pharmacy state inside the same sidebar, and C as the mobile interaction model. Compared with the earlier 38/62 composition, the hero, marketing metrics, outer page shell, gutters and rounded map card are removed from Home. The map is now a true viewport canvas; list/detail navigation happens without moving it.

## Generated screens

- Home / search / split map: `beaf2fe906d24ec2bdf615b30a185c68`
- Map-first desktop variant: `b291e52899ba465ab77a8a9719088499`
- Refined 38/62 desktop variant: `ad7a6f4795884179b6f39b35d86b815e`
- Medicine detail: `7e69b75187f94575a86714a73fceaaf3`
- Pharmacy detail: `68b1abc82e824e94b14dc3152fefa402`
- Login: `d7b5e775de9e47bc85ee2954b661f932`
- Register: `194949f54c1c4d0fb72a6f3cb0a8a823`
- Profile: `b8d82a3433f94ae2a770369ac2fb90fb`
- Reservations: `3d39ca3c369446eda61aaf28660c7575`
- Chat: `ff281ff3a908498c8418df2d801fdcfc`
- Notifications: `ffd4ad700c9249938b77bbb103ec2559`
- Mobile map-first: `f1efef13a9a8484ba5feec2dc010968e`

Stitch is treated as the product designer. Its generated HTML is not copied into the repository; the selected composition, tokens, hierarchy and interaction patterns are implemented as React components against the existing API.

## Admin, inventory and ratings expansion — 2026-10-01

Stitch was run again against the same project and the `PharmaMap Calm Clinical Precision` design system. The generation used `GEMINI_3_5_FLASH_LITE` after the first provider attempts timed out.

- Admin Dashboard — `dfeb79d0a19549f1aeef0ec3d516c462`
- Pharmacy Management — `c78e12b5919d49569c4873455bb51daf`
- Medicine Management — `c6dc4ac81086419f89bb2776e9b8955a`
- Inventory & Prices Management — `cd354a9469984741aefe61404f749642`
- Pharmacist Rating Profile — `7914462e5db54ae3ac64a185f8563c8b`
- Reservation Management — Stitch session `14774492221645317173` completed, but the connector response did not expose a screen ID.
- Public Leaderboard — Stitch session `4943795742611323719` completed, but the connector response did not expose a screen ID.

The generated screens were used as product-design references, not copied as application code. The React implementation carries over the fixed role-aware sidebar, factual KPI hierarchy, compact management tables, semantic status badges, low-stock emphasis, explicit TJS pricing, separate pharmacy/pharmacist rankings, and pharmacist-specific review transparency. Generated placeholder metrics, unsupported clinical fields and fictional revenue were deliberately excluded; all UI values come from the existing API.
