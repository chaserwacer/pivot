"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "@/lib/types";

export function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Route[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((j: { routes: Route[] }) => setResults(j.routes ?? []))
        .catch(() => setResults([]));
    }, 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  return (
    <div className="relative">
      <input
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="search-results"
        value={q}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search routes, tags, places"
        className="w-full rounded-full border border-ink-100 bg-white px-4 py-2 text-sm shadow-card focus:border-accent focus:outline-none"
      />
      {open && results.length > 0 && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute inset-x-0 top-full z-10 mt-2 max-h-72 overflow-auto rounded-2xl bg-white py-2 shadow-card"
        >
          {results.map((r) => (
            <li key={r.id} role="option" aria-selected="false">
              <Link
                href={`/routes/${r.id}`}
                className="block px-4 py-2 text-sm hover:bg-ink-50"
              >
                <span className="font-medium">{r.title}</span>
                <span className="ml-2 text-xs text-ink-500">{r.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
