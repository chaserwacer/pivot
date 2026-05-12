# Pivot — Architecture & MVP Plan

Pivot is an outdoor route-planning app (hike, bike, run, ski, climb) with AI-personalized
suggestions, third-party export to Strava / AllTrails / Gaia, and offline-first behavior on
mobile. This document defines the architecture, technology choices, workflows, wireframes
and integration plan for the MVP scaffold in this repository, then enumerates the work
deferred to follow-up sessions.

---

## 1. Product principles

1. **Trust on the trail.** Routes shown must be real, current, and survivable. AI never
   invents geometry — it ranks and composes verified segments.
2. **Apple-grade calm.** Lots of whitespace, one dominant action per screen, system fonts,
   restrained color (a single accent — Pivot teal `#0EA5A4`), and physics-based motion.
3. **Offline by default.** Anything you've opened is cached. The "Downloaded" tab works
   in airplane mode at 11,000 ft.
4. **Privacy on the move.** Location and booking data are processed server-side per
   request and never persisted past the suggestion. No background tracking unless the
   user is in an active session.
5. **Plan for a 10× day.** Saturday at 9am in a national park, the backend must not melt.

---

## 2. Technology choices

| Layer            | Choice                                         | Why                                                                                                |
| ---------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Web shell        | **Next.js 14 (App Router) + React 18 + TS**    | One codebase serves PWA, desktop browser, and the web view inside the native shell. SSR for SEO on public route pages. |
| Mobile shell     | **Capacitor 6** wrapping the same Next export  | Ships iOS & Android with native geolocation, haptics, and background sync, without rebuilding the UI in React Native. Strategic option to migrate hot screens to Expo/RN later. |
| Styling          | **Tailwind CSS** + a tiny `cn()` helper        | Fast, consistent spacing scale; pairs naturally with the Apple-like restraint we want. |
| Maps             | **MapLibre GL JS** + vector tiles from **Protomaps** (self-hosted) with **Mapbox** as fallback | Open, license-friendly, runs offline from MBTiles bundles. Mapbox available for high-fidelity satellite. |
| Routing engine   | **Valhalla** self-hosted for hike/bike/run; **GraphHopper** for ski touring profile | OSM-based, supports elevation, custom costing for trail surface, and isochrones for "what's within 2 hours of my hotel". |
| Elevation        | **Open-Elevation** for MVP, **AWS Terrain Tiles** for production | Sampled along the polyline server-side; cached per route hash. |
| AI               | **Claude (Anthropic SDK)** — Sonnet 4.6 default, Haiku 4.5 for cheap ranking | Tool-use to query our own segment/weather/booking services. Models are interchangeable behind one `suggestRoute()` interface. |
| Backend API      | **Next.js Route Handlers** for thin orchestration; **Fastify** workers for long jobs | Keep the API surface co-located with the UI for MVP; promote hot endpoints to dedicated services as we scale. |
| Persistence      | **Postgres + PostGIS** (routes, segments, users) and **Redis** (rate limits, AI cache, session) | PostGIS makes geo queries trivial; Redis absorbs the read spike at weekends. |
| Object storage   | **S3** for GPX/FIT, route thumbnails, MBTiles  | Cheap, CDN-frontable.                                                                              |
| Auth             | **Auth.js (NextAuth)** with Email + Apple + Google + Strava | Strava is both auth and a primary integration target.                                              |
| Background jobs  | **BullMQ** on Redis                            | Tile pre-rendering, GPX import, Strava sync.                                                       |
| Observability    | **OpenTelemetry → Grafana / Tempo / Loki**     | One trace from tap → AI → DB → tile.                                                               |
| Feature flags    | **OpenFeature** + a tiny in-house provider     | Roll AI features per cohort; kill switches for paid APIs.                                          |

### Why Next.js + Capacitor over React Native?
The route-builder is fundamentally a map + form + list UI, all available cleanly on the
web. Capacitor lets us reuse the React tree on iOS/Android while still calling native
geolocation, haptics, secure storage, and background location APIs through plugins. We
keep the option to drop into native Swift/Kotlin for the recording screen (the one place
performance matters) without rewriting the rest.

---

## 3. System architecture

```
                    ┌────────────────────────────────────────────────────┐
                    │                     Clients                         │
   iOS (Capacitor)  │  Android (Capacitor)   Desktop browser    PWA       │
                    └─────────────┬──────────────────────┬──────────────-─┘
                                  │ HTTPS / WSS          │
                       ┌──────────▼──────────┐  ┌────────▼─────────┐
                       │   Next.js Edge      │  │  Static CDN      │
                       │   (UI + API)        │  │  (tiles, thumbs) │
                       └──────────┬──────────┘  └──────────────────┘
                                  │
   ┌───────────────┬──────────────┼──────────────┬──────────────────┐
   │               │              │              │                  │
┌──▼────┐    ┌─────▼────┐   ┌─────▼──────┐  ┌────▼─────┐     ┌──────▼──────┐
│Routes │    │ AI       │   │ Routing    │  │ Strava   │     │ Weather /   │
│ API   │    │ Service  │   │ (Valhalla) │  │ Bridge   │     │ Forecast    │
└──┬────┘    └────┬─────┘   └────────────┘  └──────────┘     └─────────────┘
   │              │
   │      ┌───────▼────────┐
   │      │ Claude (tools) │
   │      └────────────────┘
   │
┌──▼──────────────────────────────────────────────────────────────────────┐
│   Postgres + PostGIS    Redis    S3 (GPX / tiles / thumbs)    BullMQ    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data model (PostGIS, abridged)

```
users           (id, email, display_name, units, home_geog GEOGRAPHY(Point), …)
preferences     (user_id PK FK, activities text[], intensity int, crowd_pref int,
                 surface_pref text[], avoid_features text[], updated_at)
routes          (id, owner_id FK, title, activity, distance_m, ascent_m,
                 difficulty int, geom GEOGRAPHY(LineString), bbox GEOGRAPHY,
                 source text, source_ref text, popularity int, created_at)
route_versions  (id, route_id FK, geom, notes, created_at)        -- edit history
segments        (id, geom, surface, popularity, last_condition_at,
                 closure_until, avg_grade)                          -- composable pieces
conditions      (id, segment_id FK, kind, severity, observed_at, source, body)
weather_cache   (geohash, valid_at, payload jsonb)
strava_links    (user_id, athlete_id, access_token_enc, refresh_token_enc, expires_at)
ai_suggestions  (id, user_id, prompt_hash, response jsonb, created_at)  -- audit + caching
bookings        (id, user_id, vendor, ref, location GEOGRAPHY, start, end)
```

Indexes that matter on day one: `GIST(routes.geom)`, `GIST(routes.bbox)`,
`GIST(segments.geom)`, `BTREE(routes.popularity DESC)`, partial index on
`routes(owner_id)` where `visibility='private'`.

---

## 4. AI-powered personalization

### 4.1 Inputs (the "context bundle")
Built server-side per request, never sent verbatim to the model:

- **User**: preferences (activities, intensity 1-5, crowd tolerance, surface, avoids),
  fitness signal from Strava (last-90-day average pace/HR if linked), home location.
- **Trip context**: `near` (hotel/booking coords if any), `start_at`, `duration_min`,
  `mode_of_transport`.
- **Environment**: 48 h weather grid for the bbox (precip, wind, temp, viz, sunrise/set,
  avalanche bulletin if winter), trail closures, recent condition reports (≤14 days).
- **Calendar/season**: month, holiday flag, school break flag, sunrise/sunset.

### 4.2 Pipeline

```
        ┌──────────┐    ┌────────────┐    ┌─────────────┐    ┌──────────────┐
input → │ Validate │ →  │  Candidate │ →  │  Claude     │ →  │  Re-rank +   │ → response
        │ + bundle │    │  retrieval │    │  tool calls │    │  enrich      │
        └──────────┘    └────────────┘    └─────────────┘    └──────────────┘
                              ▲                  │
                              │                  ▼
                              └──── tools: getWeather, getConditions,
                                           getBookings, queryRoutesNear,
                                           composeRoute(segmentIds[])
```

1. **Retrieve** — PostGIS pulls ~50 candidate routes (and free segments) in the bbox,
   filtered by activity and hard constraints (distance, ascent ceiling, closures).
2. **Tool-using LLM call** — Claude is given the context bundle and tool definitions.
   It selects routes, may compose a new one from segments, and emits a ranked list
   with one-sentence rationales ("Cooler aspect — afternoon thunderstorm risk after 2pm").
3. **Server validates** every returned route — geometry must come from our DB, not be
   hallucinated. If `composeRoute` was used, Valhalla snaps and verifies continuity.
4. **Enrich** — elevation, time estimate, weather summary, Strava-segment matches.
5. **Cache** on `hash(prompt_bundle minus volatile fields)` for 15 min. Redis.

### 4.3 Why the model can't hallucinate trails
The only geometry-producing tool is `composeRoute(segmentIds[])`. Segment IDs are
server-issued for the candidate set in this request. Anything else is rejected by the
validator before it reaches the client.

### 4.4 Cost & latency budget
- p50 < 1.8 s end-to-end (cache hit < 250 ms).
- Default to Haiku 4.5 for ranking-only requests; escalate to Sonnet 4.6 when the user
  asked an open question ("plan me a weekend"). One-tap "regenerate" is a free re-roll
  on the cached candidate set.

---

## 5. Core user workflows

### 5.1 Route discovery
1. App opens to **Home**, geolocation prompt on first launch.
2. Home shows: weather card, "For you today" AI strip, "Popular nearby" grid,
   "Continue planning" (last unfinished route).
3. Tap a card → **Route detail**: map, elevation profile, stats, conditions, export
   menu, save / start.

### 5.2 Route building (manual)
1. **+** on home → builder with full-screen map.
2. Tap waypoints; engine snaps to trails (`Valhalla /route` with `costing=pedestrian`
   and `use_trails=1`).
3. Live stats panel updates (distance, ascent, time). Drag a waypoint mid-line to
   insert; long-press to delete.
4. "Make a loop" / "Out & back" / "Reverse" shortcuts.
5. Save → name, activity, visibility → POST `/api/routes`.

### 5.3 AI route generation
1. Home → "Plan with AI" sheet.
2. Two inputs: a free-text wish ("scenic ridge ride, ~2 h, finish by sunset") and
   chips (activity, intensity). Booking & weather are pulled silently.
3. Loading state shows the 3-step pipeline ("Looking around Aspen → Checking
   weather → Picking the best fit"). Stream tokens for the rationale text only.
4. Result is a vertical stack of 3 routes with one-line "why this". Tap to open.

### 5.4 Strava round-trip
- **Import**: OAuth → list activities → "use as route" creates a `routes` row with
  source=`strava`.
- **Export activity**: from a completed in-app session, POST to Strava's
  `/uploads` endpoint with the GPX produced by our recorder.

---

## 6. Wireframes (ASCII; high-fidelity Figma to follow)

### Home (mobile)
```
 ┌──────────────────────────────────────┐
 │  Good morning, Sam            ◔ 7°C  │
 │  Light snow easing by 10am           │
 │ ┌─────────────────────────────────┐  │
 │ │   Plan with AI       ▶          │  │ ← primary CTA, accent fill
 │ └─────────────────────────────────┘  │
 │  For you today                       │
 │  ┌────────┐ ┌────────┐ ┌────────┐    │
 │  │ Maroon │ │ Smuggl │ │ Hunter │    │ ← horizontal scroll, large hero img
 │  │ Bells  │ │ er Mtn │ │ Creek  │    │
 │  │ 8.4 mi │ │ 6.1 mi │ │ 11 mi  │    │
 │  └────────┘ └────────┘ └────────┘    │
 │  Popular nearby                      │
 │  • Rio Grande Trail        12.0 mi   │
 │  • Lost Man Loop            8.7 mi   │
 │                                      │
 │ ┌──────┬──────┬──────┬──────┬──────┐ │
 │ │ Home │ Map  │  +   │ You  │ Set. │ │ ← bottom tab bar
 │ └──────┴──────┴──────┴──────┴──────┘ │
 └──────────────────────────────────────┘
```

### Route builder
```
 ┌──────────────────────────────────────┐
 │  ← New route              Save ▶     │
 │ ┌──────────────────────────────────┐ │
 │ │                                  │ │
 │ │             [ MAP ]              │ │
 │ │     ● ─────── ● ─────── ●        │ │
 │ │                                  │ │
 │ └──────────────────────────────────┘ │
 │  Distance 6.2 mi · ↑ 1,120 ft · 2h05 │
 │ ┌──────────────────────────────────┐ │
 │ │  ▁▂▄▆█▆▄▃▂▁  elevation profile   │ │
 │ └──────────────────────────────────┘ │
 │  Loop · Out & back · Reverse         │
 │  Activity: 🥾  Surface: Trail        │
 └──────────────────────────────────────┘
```

### AI settings
```
 ┌──────────────────────────────────────┐
 │  AI preferences                      │
 │                                      │
 │  Activities                          │
 │  [Hike] [Run] [Bike] [Ski] [Climb]   │
 │                                      │
 │  Intensity                           │
 │  Easy ●──────○ Hardcore               │
 │                                      │
 │  Crowds                              │
 │  Prefer quiet ●──────○ Don't mind     │
 │                                      │
 │  Use my Strava fitness  [ ON ]       │
 │  Use my bookings        [ ON ]       │
 │  Use my calendar        [ OFF ]      │
 │                                      │
 │  Privacy: context is computed per     │
 │  request and not stored.              │
 └──────────────────────────────────────┘
```

---

## 7. API surface (MVP)

All under `/api`. JSON. Auth via session cookie or `Authorization: Bearer`.

| Method | Path                                  | Purpose                                                |
| ------ | ------------------------------------- | ------------------------------------------------------ |
| GET    | `/api/routes?near=lat,lng&activity=…` | List popular/nearby routes.                            |
| POST   | `/api/routes`                         | Create a route from waypoints or GPX.                  |
| GET    | `/api/routes/:id`                     | Route detail incl. elevation samples.                  |
| PATCH  | `/api/routes/:id`                     | Update title, visibility, notes.                       |
| DELETE | `/api/routes/:id`                     | Owner only.                                            |
| POST   | `/api/routes/:id/export`              | Returns GPX / FIT / KML.                               |
| POST   | `/api/ai/suggest`                     | Body: free-text + filters. Returns ranked routes.      |
| GET    | `/api/weather?bbox=…&at=…`            | Cached forecast for a bbox.                            |
| GET    | `/api/strava/connect`                 | OAuth start.                                           |
| GET    | `/api/strava/callback`                | OAuth complete.                                        |
| GET    | `/api/strava/activities`              | List user activities to import.                        |
| POST   | `/api/strava/activities`              | Push a completed session to Strava.                    |
| GET    | `/api/me`                             | Current user + preferences.                            |
| PATCH  | `/api/me/preferences`                 | Update AI prefs.                                       |

### Third-party integrations

| Service        | Auth      | What we use                                       | Notes                                                              |
| -------------- | --------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| Strava         | OAuth 2.0 | Athlete, activities, uploads, segments            | Webhook for new activity → ingest as route candidate.              |
| AllTrails      | None public; partner program | Deep links + GPX import          | Export via "Open in AllTrails" universal link; import GPX only.    |
| Gaia GPS       | OAuth (partner) or GPX file       | GPX round-trip                    | MVP: file-based.                                                   |
| Apple/Google Maps | URL schemes                    | Deep-link to navigation for the trailhead, never for the trail itself |
| OpenWeather + NWS | API key                        | Forecast, alerts                  | NWS for US, OpenWeather global fallback.                           |
| Avalanche.org  | Public feed | Winter activity bulletins                         | Render as a banner in the route detail for backcountry routes.    |

---

## 8. Offline strategy

- **App shell** is a PWA with `next-pwa` (workbox). CSS, JS, and route metadata are
  precached.
- **Routes** the user has opened in the last 30 days are stored in **IndexedDB** with
  their elevation samples.
- **Tiles**: a "Download for offline" button on the route detail pulls a 3-km buffer
  MBTiles slice from S3 and stores it in Capacitor Filesystem (mobile) or the
  Origin Private File System (web).
- **Conflict resolution**: edits made offline are stamped with a client ULID and
  reconciled last-write-wins on sync; route geometry is treated as immutable per
  version, so we append a new `route_versions` row rather than mutating.

---

## 9. Performance budgets

| Surface           | Target              |
| ----------------- | ------------------- |
| Home cold open    | < 1.2 s LCP on 4G mid-tier Android |
| Route detail open | < 600 ms to interactive map |
| Builder snap      | < 150 ms per added waypoint |
| AI suggest p50    | < 1.8 s             |
| AI suggest p95    | < 4.5 s             |
| Offline open      | works at 0 kbps     |

---

## 10. MVP scope (what is in this repo today)

Delivered in the scaffold:
- Next.js 14 + TS + Tailwind app shell with App Router.
- Pages: Home, Discover, Route detail (with real **MapLibre** map), Builder,
  AI Settings, You, **Record**.
- Components: route card, SVG elevation profile, **interactive map view**,
  activity chips, bottom nav, top bar, service-worker registrar.
- API routes: `/api/routes`, `/api/routes/[id]`, `/api/routes/[id]/export`
  (real GPX), `/api/ai/suggest`, `/api/weather`, `/api/strava/connect`,
  `/api/strava/activities`, `/api/me`, `/api/me/preferences`.
- Seed data for 6 routes around Aspen, CO with realistic stats.
- AI suggestion endpoint wired through a `suggestRoute()` interface that runs a
  **real Anthropic tool-use loop** (`get_weather` / `list_candidate_routes` /
  `compose_suggestion`) with **prompt caching** when `ANTHROPIC_API_KEY` is set
  — and falls back to the deterministic ranker otherwise. The server validates
  every `route_id` Claude emits against the candidate set, blocking
  hallucinated geometry.
- GPX export helper with XML-escaped metadata.
- PWA manifest + maskable icon + app-shell service worker.
- **Prisma schema** (Postgres + PostGIS) matching the data model in §3.
- **Capacitor 6 config** ready for `npx cap add ios|android`.
- **Vitest** test suite covering units, GPX, and the AI ranker.

Iteration status (vs the original roadmap):

| Iteration | Goal                                                  | Status |
| --------- | ----------------------------------------------------- | ------ |
| 0         | Architecture doc + scaffold + mocks                   | ✅ done |
| 1         | MapLibre + Valhalla snap-to-trail in the builder      | 🟡 MapLibre wired; Valhalla pending |
| 2         | Anthropic tool-use loop and segment validator         | 🟡 loop + id validator shipped; segment compose pending |
| 3         | Auth.js + Prisma + Postgres migrations                | 🟡 schema drafted; auth/migrations pending |
| 4         | Strava OAuth round-trip + webhooks                    | ⬜ deferred |
| 5         | Capacitor shell + offline tiles                       | 🟡 config + service worker; tile caching pending |
| 6         | Recording screen + GPX out + push to Strava           | 🟡 screen shipped against stub; native plugin pending |
| 7         | Observability stack (OTel + Grafana)                  | ⬜ deferred |
| 8         | Accessibility audit + i18n                            | ⬜ deferred |

---

## 11. Token / context management plan for incremental delivery

We treat each follow-up session as an independently bootable iteration:

| Iteration | Goal                                                  | Touches                                  |
| --------- | ----------------------------------------------------- | ---------------------------------------- |
| **0 (this one)** | Architecture doc + scaffold + mocks            | `ARCHITECTURE.md`, `src/**`, `public/**` |
| 1         | MapLibre + Valhalla snap-to-trail in the builder      | `components/Map*`, `lib/routing.ts`      |
| 2         | Anthropic tool-use loop and segment validator         | `lib/ai/*`, `app/api/ai/suggest/`        |
| 3         | Auth.js + Prisma + Postgres migrations                | `prisma/`, `app/api/auth/`               |
| 4         | Strava OAuth round-trip + webhooks                    | `lib/strava.ts`, `app/api/strava/*`      |
| 5         | Capacitor shell + offline tiles                       | `capacitor.config.ts`, `ios/`, `android/`|
| 6         | Recording screen + GPX out + push to Strava           | `app/record/`, `lib/gpx.ts`              |

Each iteration keeps the others compilable: feature flags gate unfinished work, and
nothing in `app/` imports from a not-yet-built `lib/` file. The scaffold here is the
contract — interfaces in `lib/types.ts` are the seams future iterations slot into.
