"use client";

import { useMemo, useState } from "react";
import { MapPreview } from "@/components/MapPreview";
import { ElevationProfile } from "@/components/ElevationProfile";
import { Chip } from "@/components/Chip";
import { ActivityGlyph } from "@/components/ActivityGlyph";
import type { Activity, Route } from "@/lib/types";
import { formatAscent, formatDistance, formatDuration } from "@/lib/units";

const activities: Activity[] = ["hike", "run", "bike", "ski", "climb"];

export default function RouteBuilder({ aiMode }: { aiMode: boolean }) {
  const [activity, setActivity] = useState<Activity>("hike");
  const [waypoints, setWaypoints] = useState(3);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState<{ route: Route; rationale: string }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const distance_m = 2000 * waypoints + 800;
    const ascent_m = Math.round(distance_m * 0.045);
    const estimated_time_s = Math.round((distance_m / 4500) * 3600);
    const elevation = Array.from({ length: 60 }, (_, i) => {
      const t = i / 59;
      return 2400 + Math.sin(t * Math.PI) * ascent_m;
    });
    return { distance_m, ascent_m, estimated_time_s, elevation };
  }, [waypoints]);

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
              <button key={a} onClick={() => setActivity(a)}>
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
            className="mt-4 w-full rounded-2xl bg-accent py-3 text-white shadow-card transition active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Thinking…" : "Suggest routes"}
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
          <MapPreview className="h-72" />

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
              <button key={a} onClick={() => setActivity(a)}>
                <Chip active={a === activity}>
                  <ActivityGlyph activity={a} className="h-3.5 w-3.5" />
                  <span className="capitalize">{a}</span>
                </Chip>
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-white p-4 shadow-card">
            <div>
              <p className="text-sm font-semibold">Waypoints</p>
              <p className="text-xs text-ink-500">Tap the map to add. Stand-in slider for the MVP scaffold.</p>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              value={waypoints}
              onChange={(e) => setWaypoints(parseInt(e.target.value, 10))}
              className="accent-accent"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <button className="rounded-full border border-ink-100 bg-white px-3 py-1.5">Make a loop</button>
            <button className="rounded-full border border-ink-100 bg-white px-3 py-1.5">Out &amp; back</button>
            <button className="rounded-full border border-ink-100 bg-white px-3 py-1.5">Reverse</button>
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
