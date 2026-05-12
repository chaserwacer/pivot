"use client";

import { useEffect, useState } from "react";

interface Activity {
  id: number;
  name: string;
  distance_m: number;
  moving_time_s: number;
  start_date: string;
  type: string;
}

export default function StravaImportPage() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/strava/activities")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) setError(j.note ?? j.error);
        else setActivities(j.activities ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function importActivity(id: number) {
    setImporting(id);
    try {
      await fetch("/api/routes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "strava", source_ref: String(id) }),
      });
    } finally {
      setImporting(null);
    }
  }

  return (
    <div className="px-5 pt-4 md:pt-8">
      <a href="/me" className="text-sm text-ink-500">‹ Back</a>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Import from Strava</h1>
      <p className="mt-1 text-sm text-ink-500">
        Pull a past activity in as a route you can edit and share.
      </p>

      {error && (
        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 shadow-card">
          {error}
          <p className="mt-2">
            <a className="text-accent" href="/api/strava/connect">Connect Strava</a> first.
          </p>
        </div>
      )}

      {!error && activities && activities.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
          No recent activities.
        </p>
      )}

      {activities && activities.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2">
          {activities.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-card">
              <div>
                <p className="text-sm font-semibold">{a.name}</p>
                <p className="text-xs text-ink-500">
                  {new Date(a.start_date).toLocaleDateString()} · {a.type}
                </p>
              </div>
              <button
                onClick={() => importActivity(a.id)}
                disabled={importing === a.id}
                className="rounded-full bg-accent px-3 py-1.5 text-xs text-white disabled:opacity-60"
              >
                {importing === a.id ? "Importing…" : "Import"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
