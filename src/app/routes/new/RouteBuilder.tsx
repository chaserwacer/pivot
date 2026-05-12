"use client";

import { useMemo, useState } from "react";
import { MapView } from "@/components/MapView";
import { ElevationProfile } from "@/components/ElevationProfile";
import { Chip } from "@/components/Chip";
import { ActivityGlyph } from "@/components/ActivityGlyph";
import type { Activity, Route } from "@/lib/types";
import { formatAscent, formatDistance, formatDuration } from "@/lib/units";

const activities: Activity[] = ["hike", "run", "bike", "ski", "climb"];

// Default to a friendly Aspen-area bbox until iteration 1 wires real
// geolocation through Capacitor.
const DEFAULT_BBOX: [number, number, number, number] = [-106.85, 39.17, -106.78, 39.22];

// Nominal moving pace per activity (m/s). Used for the time estimate while
// Valhalla isn't wired up.
const PACE: Record<Activity, number> = {
  hike: 1.2,
  run: 2.8,
  bike: 4.5,
  ski: 0.9,
  climb: 0.3,
};

export default function RouteBuilder({ aiMode }: { aiMode: boolean }) {
  const [activity, setActivity] = useState<Activity>("hike");
  const [waypoints, setWaypoints] = useState<Array<[number, number]>>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState<{ route: Route; rationale: string }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    if (waypoints.length < 2) {
      return { distance_m: 0, ascent_m: 0, estimated_time_s: 0, elevation: [2400, 2400] };
    }
    let dist = 0;
    for (let i = 1; i < waypoints.length; i++) {
      dist += haversine(waypoints[i - 1], waypoints[i]);
    }
    const ascent_m = Math.round(dist * 0.04);
    const estimated_time_s = Math.round(dist / PACE[activity]);
    const samples = 60;
    const elevation = Array.from({ length: samples }, (_, i) => {
      const t = i / (samples - 1);
      return 2400 + Math.sin(t * Math.PI) * ascent_m;
    });
    return { distance_m: dist, ascent_m, estimated_time_s, elevation };
  }, [waypoints, activity]);

  async function runAi() {
    setLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, activity }),
      });
      const json = await res.json();
      setAiResult(json.suggestions);
    } finally {
      setLoading(false);
    }
  }

  function handleMapClick(pt: [number, number]) {
    setWaypoints((wp) => [...wp, pt]);
  }

  function undoWaypoint() {
    setWaypoints((wp) => wp.slice(0, -1));
  }

  function clearWaypoints() {
    setWaypoints([]);
  }

  function closeLoop() {
    setWaypoints((wp) => (wp.length >= 2 ? [...wp, wp[0]] : wp));
  }

  function reverseRoute() {
    setWaypoints((wp) => [...wp].reverse());
  }

  return (
    <div className="px-5 pt-4 md:pt-8">
      <div className="mb-4 flex items-center justify-between">
        <a href="/" className="text-sm text-ink-500">‹ Cancel</a>
        <h1 className="text-base font-semibold">{aiMode ? "Plan with AI" : "New route"}</h1>
        <button className="rounded-full bg-accent px-3 py-1.5 text-sm text-white shadow-card">Save</button>
      </div>

      {aiMode ? (
        <section className="mb-6">
          <label className="mb-1 block text-xs uppercase tracking-wide text-ink-500">Tell us about today</label>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Scenic ridge hike, ~2 h, finish before the afternoon storms."
            className="w-full resize-none rounded-2xl border border-ink-100 bg-white p-3 text-sm shadow-card focus:border-accent focus:outline-none"
            rows={3}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {activities.map((a) => (
              <button key={a} onClick={() => setActivity(a)} aria-pressed={a === activity}>
                <Chip active={a === activity}>
                  <ActivityGlyph activity={a} className="h-3.5 w-3.5" />
                  <span className="capitalize">{a}</span>
                </Chip>
              </button>
            ))}
          </div>
          <button
            onClick={runAi}
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-white shadow-card transition active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="thinking-dots inline-flex" aria-hidden>
                  <span /><span /><span />
                </span>
                <span>Thinking</span>
              </>
            ) : (
              "Suggest routes"
            )}
          </button>

          {aiResult && (
            <div className="mt-5 space-y-3">
              {aiResult.map(({ route, rationale }) => (
                <a
                  key={route.id}
                  href={`/routes/${route.id}`}
                  className="block rounded-2xl bg-white p-4 shadow-card transition hover:-translate-y-0.5"
                >
                  <p className="text-sm font-semibold">{route.title}</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {formatDistance(route.distance_m)} · ↑ {formatAscent(route.ascent_m)} · {formatDuration(route.estimated_time_s)}
                  </p>
                  <p className="mt-2 text-sm text-ink-700">{rationale}</p>
                </a>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <MapView
            className="h-72 md:h-96"
            bbox={DEFAULT_BBOX}
            waypoints={waypoints}
            line={waypoints.length >= 2 ? waypoints : undefined}
            onClick={handleMapClick}
          />
          <p className="mt-2 text-xs text-ink-500">
            Tap the map to drop a waypoint. {waypoints.length} placed.
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <button onClick={undoWaypoint} disabled={waypoints.length === 0} className="rounded-full border border-ink-100 bg-white px-3 py-1.5 disabled:opacity-40">
              Undo
            </button>
            <button onClick={clearWaypoints} disabled={waypoints.length === 0} className="rounded-full border border-ink-100 bg-white px-3 py-1.5 disabled:opacity-40">
              Clear
            </button>
            <button onClick={closeLoop} disabled={waypoints.length < 2} className="rounded-full border border-ink-100 bg-white px-3 py-1.5 disabled:opacity-40">
              Close loop
            </button>
            <button onClick={reverseRoute} disabled={waypoints.length < 2} className="rounded-full border border-ink-100 bg-white px-3 py-1.5 disabled:opacity-40">
              Reverse
            </button>
          </div>

          <div className="mx-0 mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-4 shadow-card">
            <Stat label="Distance" value={formatDistance(stats.distance_m)} />
            <Stat label="Ascent" value={formatAscent(stats.ascent_m)} />
            <Stat label="Time" value={formatDuration(stats.estimated_time_s)} />
          </div>

          <div className="mt-4 rounded-2xl bg-white p-3 shadow-card">
            <ElevationProfile samples={stats.elevation} height={96} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {activities.map((a) => (
              <button key={a} onClick={() => setActivity(a)} aria-pressed={a === activity}>
                <Chip active={a === activity}>
                  <ActivityGlyph activity={a} className="h-3.5 w-3.5" />
                  <span className="capitalize">{a}</span>
                </Chip>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-base font-semibold">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-ink-500">{label}</span>
    </div>
  );
}

/** Great-circle distance between two [lng, lat] points, in metres. */
function haversine(a: [number, number], b: [number, number]): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
