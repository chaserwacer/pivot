# Changelog

All notable changes to Pivot are tracked here. Versioning is calendar-style for
now (`YYYY-MM-DD`) — once we ship to TestFlight / Play we'll switch to SemVer.

## Unreleased

### Added
- GitHub Actions CI: typecheck, lint, and tests on every push and PR.
- `/api/health` endpoint reporting version, uptime, and feature-flag status.
- Weather-alerts banner on the home page (with role=alert), driven by the
  weather snapshot's `alerts` array.
- Paginated `/routes` listing with previous/next links and an empty-state CTA
  pointing at the AI planner.
- Builder Save button now POSTs to `/api/routes` and surfaces a live status
  toast (with `role=status`).
- `CHANGELOG.md`, `.editorconfig`, `.eslintrc.json`.

### Changed
- Home page hero now stacks a secondary "Trip planner" CTA next to the
  Plan-with-AI card.

## 2026-05-12 — Iteration 3 (polish)

- Difficulty rating shown as a 5-dot accessibility-friendly indicator on cards
  and the detail page.
- "You might also like" similar-routes section on the detail page.
- "Continue planning" rail on the home page reading from a localStorage
  recently-viewed list.
- 3-step first-launch onboarding sheet gated on localStorage.
- `/me/strava` import view backed by `/api/strava/activities`.
- CSS-only thinking-dots animation on the AI suggest button.
- `/me` reads from the IndexedDB offline store and shows an empty state.

## 2026-05-12 — Iteration 2 (planner + integrations)

- `/plan` page + `/api/ai/plan` multi-day itinerary planner (rotates activity).
- Per-route OpenGraph + Twitter metadata via `generateMetadata`.
- Share button with Web Share API + clipboard fallback.
- `/about`, `/privacy`, `/robots.txt`, `/sitemap.xml` pages.
- `loading.tsx`, `error.tsx`, `not-found.tsx` boundaries.
- Strava OAuth callback (`/api/strava/callback`) and webhook stub
  (`/api/strava/webhook`).
- `/api/conditions` and `Conditions` component on route detail.
- `/api/search` + debounced combobox `SearchBar` on Discover.
- `/api/bookings` stub feeding the AI context.
- Skip-to-content link and global focus-visible accent ring.
- Tests for the Strava token store.

## 2026-05-12 — Iteration 1 (the real stack)

- Anthropic-backed `suggestRoute()` tool-use loop with prompt caching and an
  id-validator that blocks hallucinated geometry; deterministic ranker fallback.
- Interactive **MapLibre** map on the route-detail page.
- **Prisma schema** for the Postgres + PostGIS data model.
- **Capacitor 6** config ready for `cap add ios|android`.
- `/record` screen with timer + push-to-Strava stub.
- App-shell **service worker** (cache-first navigations, network-first API).
- **Vitest** unit tests for units, GPX, and the AI ranker.

## 2026-05-12 — Iteration 0 (scaffold)

- `ARCHITECTURE.md`: product principles, stack, system architecture, data model,
  AI pipeline, workflows, wireframes, API plan, offline strategy, performance
  budgets, and the iteration roadmap.
- Next.js 14 App Router scaffold (TS + Tailwind) with home / discover / route
  detail / builder / AI settings / profile pages.
- Mock API routes and seed data for 6 Aspen-area routes.
- PWA manifest + maskable icon.
