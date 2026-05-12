"use client";

import { useState } from "react";

interface Day {
  day: number;
  activity: string;
  title: string;
  rationale: string;
  route_id: string;
}

export default function PlanPage() {
  const [prompt, setPrompt] = useState("");
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Day[] | null>(null);

  async function run() {
    setLoading(true);
    setPlan(null);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, days }),
      });
      const j = (await res.json()) as { plan: Day[] };
      setPlan(j.plan);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 pt-4 md:pt-8">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Trip planner</h1>
      <p className="mt-1 text-sm text-ink-500">
        Tell us about the trip — we'll line up one route per day around your stay.
      </p>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-card">
        <label className="block text-xs uppercase tracking-wide text-ink-500">Trip notes</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="3 days in Aspen, mix of hiking and biking, avoid afternoon storms."
          rows={3}
          className="mt-1 w-full resize-none rounded-xl border border-ink-100 p-3 text-sm focus:border-accent focus:outline-none"
        />
        <div className="mt-3 flex items-center gap-3">
          <label className="text-xs uppercase tracking-wide text-ink-500">Days</label>
          <input
            type="number"
            min={1}
            max={7}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10) || 1)}
            className="w-16 rounded-lg border border-ink-100 px-2 py-1 text-sm"
          />
          <button
            onClick={run}
            disabled={loading}
            className="ml-auto rounded-full bg-accent px-4 py-2 text-sm text-white shadow-card disabled:opacity-60"
          >
            {loading ? "Planning…" : "Build trip"}
          </button>
        </div>
      </section>

      {plan && (
        <section className="mt-6 space-y-3">
          {plan.length === 0 && (
            <p className="rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
              No routes matched. Try a different prompt or expand the activity mix.
            </p>
          )}
          {plan.map((d) => (
            <a
              key={d.day}
              href={`/routes/${d.route_id}`}
              className="block rounded-2xl bg-white p-4 shadow-card transition hover:-translate-y-0.5"
            >
              <p className="text-[11px] uppercase tracking-wide text-ink-500">
                Day {d.day} · {d.activity}
              </p>
              <p className="mt-0.5 text-sm font-semibold">{d.title}</p>
              <p className="mt-1 text-sm text-ink-700">{d.rationale}</p>
            </a>
          ))}
        </section>
      )}
    </div>
  );
}
