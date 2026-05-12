"use client";

import { useEffect, useState } from "react";

type Kind = "mud" | "snow" | "closure" | "downed_tree" | "fire";

interface Report {
  id: string;
  kind: Kind;
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
  const [formOpen, setFormOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("mud");
  const [severity, setSeverity] = useState<1 | 2 | 3>(1);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function submit() {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/conditions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ route_id: routeId, kind, severity, body }),
      });
      const json = (await res.json()) as { condition?: Report };
      if (json.condition) {
        setReports((r) => [json.condition!, ...(r ?? [])]);
        setBody("");
        setFormOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (reports === null) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">Loading…</div>
    );
  }

  return (
    <div className="space-y-2">
      {reports.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
          No recent reports.
        </div>
      ) : (
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
      )}

      {formOpen ? (
        <div className="rounded-2xl bg-white p-3 shadow-card">
          <div className="flex gap-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="rounded-lg border border-ink-100 px-2 py-1 text-sm"
            >
              <option value="mud">Mud</option>
              <option value="snow">Snow</option>
              <option value="closure">Closure</option>
              <option value="downed_tree">Downed tree</option>
              <option value="fire">Fire</option>
            </select>
            <select
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value, 10) as 1 | 2 | 3)}
              className="rounded-lg border border-ink-100 px-2 py-1 text-sm"
            >
              <option value={1}>Minor</option>
              <option value={2}>Notable</option>
              <option value={3}>Severe</option>
            </select>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you see?"
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-ink-100 p-2 text-sm focus:border-accent focus:outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setFormOpen(false)} className="rounded-full border border-ink-100 px-3 py-1 text-xs">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting || !body.trim()}
              className="rounded-full bg-accent px-3 py-1 text-xs text-white disabled:opacity-60"
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setFormOpen(true)}
          className="w-full rounded-2xl border border-dashed border-ink-100 bg-white py-2 text-xs text-ink-500 hover:text-ink-700"
        >
          + Report a condition
        </button>
      )}
    </div>
  );
}
