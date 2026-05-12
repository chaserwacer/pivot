"use client";

import { useEffect, useState } from "react";

interface Report {
  id: string;
  kind: "mud" | "snow" | "closure" | "downed_tree" | "fire";
  severity: 1 | 2 | 3;
  observed_at: string;
  source: string;
  body: string;
}

const severityClass: Record<Report["severity"], string> = {
  1: "bg-amber-100 text-amber-900",
  2: "bg-orange-100 text-orange-900",
  3: "bg-red-100 text-red-900",
};

export function Conditions({ routeId }: { routeId: string }) {
  const [reports, setReports] = useState<Report[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/conditions?route_id=${encodeURIComponent(routeId)}`)
      .then((r) => r.json())
      .then((j: { conditions: Report[] }) => {
        if (!cancelled) setReports(j.conditions ?? []);
      })
      .catch(() => {
        if (!cancelled) setReports([]);
      });
    return () => {
      cancelled = true;
    };
  }, [routeId]);

  if (reports === null) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">Loading…</div>
    );
  }
  if (reports.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
        No recent reports.
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {reports.map((r) => (
        <li key={r.id} className="rounded-2xl bg-white p-3 text-sm shadow-card">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] capitalize ${severityClass[r.severity]}`}>
              {r.kind.replace("_", " ")}
            </span>
            <span className="text-[11px] text-ink-500">
              {new Date(r.observed_at).toLocaleString()} · {r.source}
            </span>
          </div>
          <p className="mt-1 text-ink-700">{r.body}</p>
        </li>
      ))}
    </ul>
  );
}
