# Contributing to Pivot

Thanks for caring about Pivot. This file captures the conventions we expect
before opening a PR. The bar is small but enforced.

## Quick start

```bash
git clone <fork>
cd pivot
npm install
cp .env.example .env.local      # optional
npm run dev                     # http://localhost:3000
npm test                        # vitest run
npm run typecheck               # tsc --noEmit
```

## What we ship per iteration

ARCHITECTURE.md §11 lists the iteration roadmap. Each iteration is sized to
land in one focused PR — keep that scope. If a change spans iterations, split
it. We'd rather ship two small PRs than one sprawling one.

## Code conventions

- **TypeScript everywhere.** No `.js` in `src/` except generated files.
- **No comments that restate the code.** Comments explain the *why* —
  surprising invariants, hidden constraints, the reason this loop has an
  explicit step limit. Naming should carry the *what*.
- **Tailwind classes** are the styling primitive; don't introduce a new CSS
  module without checking with a maintainer first.
- **Server components by default.** Add `"use client"` only when a component
  needs state, effects, or browser APIs.
- **`/api` handlers return JSON.** Use `NextResponse.json(...)`. Always set a
  status when the response isn't 200.
- **No `any`.** Reach for `unknown` + a narrowing predicate, or define the
  shape. `as never` is acceptable at SDK seams (see `src/lib/ai.ts`).

## Tests

- Unit-test pure logic with Vitest — `*.test.ts` next to the file under test.
- Use the `jsdom` annotation only for browser-API tests (see
  `src/lib/recentlyViewed.test.ts`).
- A PR that changes `src/lib/*.ts` without updating or adding a test will get
  a comment asking for one.

## AI changes

`src/lib/ai.ts` is the only place that talks to Anthropic. New tools go
through the validator — never let the model emit geometry that didn't come
from a tool the server populated this turn. See ARCHITECTURE.md §4.3.

## Commits and PRs

- One logical change per commit. The commit message should explain *why* in
  the body, not just *what*.
- Reference the iteration the change belongs to (e.g. "Iteration 4 —
  Strava OAuth").
- CI must be green before merge.

## Out of scope (right now)

- New runtime dependencies without a maintainer ack.
- Frontend frameworks other than Next.js + React.
- Anything that requires the user to be logged in (Auth.js lands in
  iteration 3 — until then, `/me` is a demo identity).
