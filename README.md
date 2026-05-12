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
| `/record`             | Activity recorder (timer + push-to-Strava stub)                  |

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

## Testing

```bash
npm test            # vitest run
npm run test:watch  # vitest in watch mode
```

Coverage today: `units`, `gpx`, and the `ai` rule-based ranker.

## Mobile shell (Capacitor)

`capacitor.config.ts` is in place. To produce native shells:

```bash
npm run build && npx next export -o out
npx cap add ios       # one-time
npx cap add android   # one-time
npx cap sync
npx cap open ios      # opens Xcode
```

## What's mocked vs real

Real in this scaffold:
- Full Next.js 14 App Router app, Tailwind design system, typed data model.
- **Interactive MapLibre map** on route detail (using the public MapLibre demo
  style; swap to your own vector tiles in production).
- **Anthropic tool-use loop** with prompt caching when `ANTHROPIC_API_KEY` is
  set; server-side id validation rejects hallucinated routes.
- GPX export, deep-link OAuth start, PWA manifest + service worker, accessible
  bottom-nav, elevation profile rendering.
- **Prisma schema** for Postgres + PostGIS; **Capacitor 6** config.
- **Vitest** unit tests.

Still mocked / deferred:
- Valhalla snap-to-trail (manual builder uses a slider stand-in).
- Strava token exchange + webhooks.
- Auth.js + database migrations (schema is drafted but not migrated).
- Background geolocation for the recorder (native plugin in iteration 6).

The full roadmap is in ARCHITECTURE.md §11.
