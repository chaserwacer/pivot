# Pivot

Outdoor route-planning app (hike, bike, run, ski, climb) with AI-personalized
suggestions, third-party export, and offline-first behavior on mobile.

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the design rationale, stack
choices, data model, workflows, wireframes, API plan and roadmap.

## Quickstart

```bash
npm install
cp .env.example .env.local   # optional; everything works without it
npm run dev
# open http://localhost:3000
```

Screens to try:

| URL                   | What's there                                                     |
| --------------------- | ---------------------------------------------------------------- |
| `/`                   | Home with weather, "Plan with AI" CTA, hero rail, popular nearby |
| `/routes`             | Discover, filtered by activity                                   |
| `/routes/:id`         | Route detail: stats, elevation, conditions, export, send-to-Strava |
| `/routes/new`         | Manual route builder (map preview + waypoint slider stand-in)    |
| `/routes/new?ai=1`    | AI route suggestions panel (calls `/api/ai/suggest`)              |
| `/settings`           | AI preferences (activities, intensity, signals)                  |
| `/me`                 | Saved routes + connected accounts                                |

API endpoints:

```
GET    /api/routes                 list seed routes
POST   /api/routes                 create (echo for MVP)
GET    /api/routes/:id             route detail
GET    /api/routes/:id/export      GPX (KML/FIT return 501)
POST   /api/ai/suggest             AI suggestions (rule-based mock)
GET    /api/weather                mock forecast snapshot
GET    /api/strava/connect         OAuth start (501 unless configured)
GET    /api/strava/activities      list (stub)
POST   /api/strava/activities      push (stub)
GET    /api/me                     demo user
PATCH  /api/me/preferences         save AI prefs (echo)
```

## What's mocked vs real

Real in this scaffold: full Next.js 14 App Router app, Tailwind design system,
typed data model, GPX export, AI suggestion seam, deep-link OAuth start,
PWA manifest, accessible bottom-nav, elevation profile rendering.

Mocked: map (SVG topo placeholder — MapLibre in iteration 1), routing engine,
Anthropic tool-use loop (rule-based ranker today, swaps to Claude in iteration
2 without changing `suggestRoute()`'s signature), Strava token exchange,
Postgres persistence.

The roadmap from here is in ARCHITECTURE.md §11.
