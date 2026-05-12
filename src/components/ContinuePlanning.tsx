"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readRecentlyViewed, type RecentlyViewedEntry } from "@/lib/recentlyViewed";

export function ContinuePlanning() {
  const [items, setItems] = useState<RecentlyViewedEntry[] | null>(null);
  useEffect(() => {
    setItems(readRecentlyViewed().slice(0, 3));
  }, []);
  if (!items || items.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-semibold">Continue planning</h2>
      <ul className="flex flex-col gap-2">
        {items.map((r) => (
          <li key={r.id}>
            <Link
              href={`/routes/${r.id}`}
              className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm shadow-card"
            >
              <span className="truncate">{r.title}</span>
              <span className="text-xs text-ink-500">{relative(r.at)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function relative(at: number): string {
  const delta = Math.max(0, Date.now() - at);
  const m = Math.round(delta / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
