"use client";

import { useEffect, useState } from "react";
import type { Route } from "@/lib/types";
import { deleteSavedRoute, getSavedRoute, saveRoute } from "@/lib/offline";

export function DownloadButton({ route }: { route: Route }) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSavedRoute(route.id)
      .then((r) => {
        if (!cancelled) setSaved(!!r);
      })
      .catch(() => {
        if (!cancelled) setSaved(false);
      });
    return () => {
      cancelled = true;
    };
  }, [route.id]);

  async function toggle() {
    if (saved === null) return;
    setBusy(true);
    try {
      if (saved) {
        await deleteSavedRoute(route.id);
        setSaved(false);
      } else {
        await saveRoute(route);
        setSaved(true);
      }
    } catch (err) {
      console.error("[offline] toggle failed:", err);
    } finally {
      setBusy(false);
    }
  }

  const label = saved === null ? "Checking…" : saved ? "Saved offline ✓" : "Download for offline";
  return (
    <button
      onClick={toggle}
      disabled={busy || saved === null}
      className="rounded-full border border-ink-100 bg-white px-3 py-1.5 text-sm disabled:opacity-60"
      aria-pressed={!!saved}
    >
      {busy ? "Working…" : label}
    </button>
  );
}
