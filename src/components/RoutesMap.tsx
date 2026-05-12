"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Route } from "@/lib/types";

interface Props {
  routes: Route[];
  className?: string;
}

/**
 * One map, all routes, each represented by a clickable marker at the centre
 * of its bbox. Markers deep-link to the route detail.
 */
export function RoutesMap({ routes, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!ref.current || routes.length === 0) return;
      const maplibre = (await import("maplibre-gl")).default;
      if (cancelled || !ref.current) return;

      const bounds = boundsOf(routes);
      const map = new maplibre.Map({
        container: ref.current,
        style: "https://demotiles.maplibre.org/style.json",
        bounds,
        fitBoundsOptions: { padding: 40 },
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      for (const r of routes) {
        const [w, s, e, n] = r.bbox;
        const center: [number, number] = [(w + e) / 2, (s + n) / 2];
        const el = document.createElement("a");
        el.href = `/routes/${r.id}`;
        el.title = r.title;
        el.style.cssText =
          "display:grid;place-items:center;width:14px;height:14px;border-radius:9999px;" +
          `background:${r.thumbnail_color};color:#fff;border:2px solid #fff;` +
          "box-shadow:0 1px 3px rgba(0,0,0,.25);text-decoration:none;cursor:pointer;";
        new maplibre.Marker({ element: el }).setLngLat(center).addTo(map as never);
      }
    })().catch((err) => console.error("[RoutesMap] init failed:", err));

    return () => {
      cancelled = true;
      const m = mapRef.current as { remove?: () => void } | null;
      m?.remove?.();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(routes.map((r) => r.id))]);

  return <div ref={ref} className={className} aria-label={`Map of ${routes.length} routes`} />;
}

function boundsOf(routes: Route[]): [[number, number], [number, number]] {
  let w = Infinity,
    s = Infinity,
    e = -Infinity,
    n = -Infinity;
  for (const r of routes) {
    if (r.bbox[0] < w) w = r.bbox[0];
    if (r.bbox[1] < s) s = r.bbox[1];
    if (r.bbox[2] > e) e = r.bbox[2];
    if (r.bbox[3] > n) n = r.bbox[3];
  }
  return [
    [w, s],
    [e, n],
  ];
}
