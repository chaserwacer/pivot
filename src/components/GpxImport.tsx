"use client";

import { useState } from "react";

export function GpxImport() {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    setStatus(null);
    try {
      const xml = await file.text();
      const res = await fetch("/api/routes/import", {
        method: "POST",
        headers: { "content-type": "application/gpx+xml" },
        body: xml,
      });
      const json = (await res.json()) as {
        id?: string;
        title?: string;
        point_count?: number;
        error?: string;
      };
      if (json.error) {
        setStatus(`Import failed: ${json.error}`);
      } else {
        setStatus(
          `Imported "${json.title}" (${json.point_count} points). Saved as ${json.id}.`,
        );
      }
    } catch (err) {
      setStatus(`Couldn't read file: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 text-sm shadow-card">
      <p className="font-semibold">Import a GPX</p>
      <p className="mt-1 text-xs text-ink-500">
        From AllTrails, Gaia, Garmin, Strava — anything that exports GPX.
      </p>
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink-100 px-3 py-1.5 text-xs hover:bg-ink-50">
        <input
          type="file"
          accept=".gpx,application/gpx+xml,application/xml"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          disabled={busy}
        />
        {busy ? "Importing…" : "Choose .gpx file"}
      </label>
      {status && (
        <p role="status" aria-live="polite" className="mt-3 text-xs text-ink-700">
          {status}
        </p>
      )}
    </div>
  );
}
