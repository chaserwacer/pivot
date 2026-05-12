"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RouteCard } from "@/components/RouteCard";
import { GpxImport } from "@/components/GpxImport";
import { listSavedRoutes } from "@/lib/offline";
import type { Route } from "@/lib/types";

export default function MePage() {
  const [saved, setSaved] = useState<Route[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSavedRoutes()
      .then((list) => {
        if (!cancelled) setSaved(list);
      })
      .catch(() => {
        if (!cancelled) setSaved([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-5 pt-4 md:pt-8">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">You</h1>
      <p className="mt-1 text-sm text-ink-500">Saved routes and downloads.</p>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Saved offline</h2>
        {saved === null ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">Loading…</p>
        ) : saved.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-2">
            {saved.map((r) => (
              <li key={r.id}>
                <RouteCard route={r} variant="row" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Bring your own</h2>
        <GpxImport />
      </section>

      <section className="mt-6 rounded-2xl bg-white p-4 text-sm shadow-card">
        <p className="font-semibold">Connected accounts</p>
        <ul className="mt-2 space-y-2 text-ink-700">
          <li className="flex items-center justify-between">
            Strava
            <span className="flex items-center gap-3">
              <Link className="text-accent" href="/me/strava">Import</Link>
              <a className="text-accent" href="/api/strava/connect">Connect</a>
            </span>
          </li>
          <li className="flex items-center justify-between">AllTrails <span className="text-ink-300">GPX import</span></li>
          <li className="flex items-center justify-between">Gaia GPS <span className="text-ink-300">GPX import</span></li>
        </ul>
      </section>

      <p className="mt-8 text-center text-xs text-ink-500">
        <Link href="/about" className="hover:text-ink-900">About</Link> · <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-card">
      <p className="text-sm font-semibold">No saved routes yet</p>
      <p className="mt-1 text-xs text-ink-500">
        Open any route and tap <span className="font-medium">Download for offline</span> to keep
        it on your phone.
      </p>
      <Link
        href="/routes"
        className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-sm text-white"
      >
        Browse routes
      </Link>
    </div>
  );
}
