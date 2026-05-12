"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/cn";

interface Props {
  /** [west, south, east, north] in degrees. */
  bbox: [number, number, number, number];
  /** Optional polyline drawn over the basemap as [lng, lat] pairs. */
  line?: Array<[number, number]>;
  /** Waypoint markers as [lng, lat]. Auto-drawn with numbered markers. */
  waypoints?: Array<[number, number]>;
  /** If set, clicking the map invokes this with the [lng, lat] tapped. */
  onClick?: (lngLat: [number, number]) => void;
  accent?: string;
  className?: string;
}

/**
 * Real interactive MapLibre map. Uses the public MapLibre demo style as a basemap
 * so the scaffold works without an API token. In production we self-host vector
 * tiles via Protomaps (see ARCHITECTURE.md §2) and swap the style URL here.
 */
export function MapView({ bbox, line, waypoints, onClick, accent = "#0EA5A4", className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<Array<{ remove: () => void }>>([]);
  // Hold the latest onClick in a ref so the listener doesn't need re-binding.
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!ref.current) return;
      const maplibre = (await import("maplibre-gl")).default;

      if (cancelled || !ref.current) return;

      const map = new maplibre.Map({
        container: ref.current,
        style: "https://demotiles.maplibre.org/style.json",
        bounds: [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        fitBoundsOptions: { padding: 28 },
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.on("click", (ev: { lngLat: { lng: number; lat: number } }) => {
        onClickRef.current?.([ev.lngLat.lng, ev.lngLat.lat]);
      });

      map.on("load", () => {
        if (line && line.length >= 2) {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: line },
            },
          });
          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": accent, "line-width": 4 },
          });
        }
      });
    })().catch((err) => {
      console.error("[MapView] init failed:", err);
    });

    return () => {
      cancelled = true;
      const m = mapRef.current as { remove?: () => void } | null;
      m?.remove?.();
      mapRef.current = null;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
    // bbox is a tuple — JSON-stringify to skip rerenders on identical arrays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(bbox), JSON.stringify(line), accent]);

  // Reactively draw waypoint markers when they change.
  useEffect(() => {
    const map = mapRef.current as
      | { getCanvas?: () => HTMLCanvasElement }
      | null;
    if (!map?.getCanvas) return;
    let cancelled = false;
    (async () => {
      const maplibre = (await import("maplibre-gl")).default;
      if (cancelled) return;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      (waypoints ?? []).forEach((pt, idx) => {
        const el = document.createElement("div");
        el.textContent = String(idx + 1);
        el.style.cssText =
          `display:grid;place-items:center;width:22px;height:22px;border-radius:9999px;` +
          `background:${accent};color:#fff;font:600 11px/1 system-ui;` +
          `box-shadow:0 1px 2px rgba(0,0,0,.2);`;
        const marker = new maplibre.Marker({ element: el }).setLngLat(pt).addTo(map as never);
        markersRef.current.push(marker);
      });
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(waypoints), accent]);

  return <div ref={ref} className={cn("relative overflow-hidden rounded-2xl bg-ink-100", className)} />;
}
