/**
 * Recently viewed routes are tracked in localStorage so the home page can
 * surface a "continue planning" rail without server-side state. This lives
 * outside the offline IndexedDB store on purpose — it's metadata, not the
 * full payload.
 */

const KEY = "pivot:recently-viewed";
const MAX = 8;

export interface RecentlyViewedEntry {
  id: string;
  title: string;
  at: number; // unix ms
}

export function recordView(entry: { id: string; title: string }): void {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const list = read();
    const next = [
      { ...entry, at: now },
      ...list.filter((r) => r.id !== entry.id),
    ].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // QuotaExceeded / disabled storage → silently no-op.
  }
}

export function readRecentlyViewed(): RecentlyViewedEntry[] {
  if (typeof window === "undefined") return [];
  return read();
}

function read(): RecentlyViewedEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is RecentlyViewedEntry =>
          !!x && typeof x === "object" && "id" in x && "title" in x && "at" in x,
      )
      .slice(0, MAX);
  } catch {
    return [];
  }
}
