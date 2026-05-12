import Link from "next/link";
import type { Route } from "@/lib/types";
import { formatAscent, formatDistance, formatDuration } from "@/lib/units";
import { ElevationProfile } from "./ElevationProfile";
import { ActivityGlyph } from "./ActivityGlyph";

interface Props {
  route: Route;
  variant?: "hero" | "row";
}

export function RouteCard({ route, variant = "hero" }: Props) {
  if (variant === "row") {
    return (
      <Link
        href={`/routes/${route.id}`}
        className="group flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white"
          style={{ backgroundColor: route.thumbnail_color }}
        >
          <ActivityGlyph activity={route.activity} className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{route.title}</p>
          <p className="truncate text-xs text-ink-500">
            {formatDistance(route.distance_m)} · ↑ {formatAscent(route.ascent_m)} · {formatDuration(route.estimated_time_s)}
          </p>
        </div>
        <span className="text-xs text-ink-300">›</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/routes/${route.id}`}
      className="group block w-72 shrink-0 overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div
        aria-hidden
        className="relative h-32 w-full"
        style={{ background: `linear-gradient(135deg, ${route.thumbnail_color} 0%, ${shade(route.thumbnail_color, -20)} 100%)` }}
      >
        <div className="absolute inset-0 flex items-end justify-between p-3 text-white/95">
          <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-2 py-1 text-[11px] backdrop-blur">
            <ActivityGlyph activity={route.activity} className="h-3.5 w-3.5" />
            <span className="capitalize">{route.activity}</span>
          </div>
          <span className="rounded-full bg-black/20 px-2 py-1 text-[11px] backdrop-blur">★ {Math.round(route.popularity / 10) / 10}</span>
        </div>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold">{route.title}</p>
        <p className="mt-0.5 text-xs text-ink-500">
          {formatDistance(route.distance_m)} · ↑ {formatAscent(route.ascent_m)} · {formatDuration(route.estimated_time_s)}
        </p>
        <ElevationProfile samples={route.elevation} height={42} accent={route.thumbnail_color} className="mt-2" />
      </div>
    </Link>
  );
}

function shade(hex: string, percent: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + percent));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + percent));
  const b = Math.max(0, Math.min(255, (n & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
