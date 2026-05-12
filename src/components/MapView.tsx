"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/cn";

interface Props {
  /** [west, south, east, north] in degrees. */
  bbox: [number, number, number, number];
  /** Optional polyline drawn over the basemap as [lng, lat] pairs. */
  line?: Array<[number, number]>;
  accent?: string;
  className?: string;
}

/**
 * Real interactive MapLibre map. Uses the public MapLibre demo style as a basemap
 * so the scaffold works without an API token. In production we self-host vector
 * tiles via Protomaps (see ARCHITECTURE.md §2) and swap the style URL here.
 */
export function MapView({ bbox, line, accent = "#0EA5A4", className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);

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

      map.on("load", () => {
        if (!line || line.length < 2) return;
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
      });
    })().catch((err) => {
      console.error("[MapView] init failed:", err);
    });

    return () => {
      cancelled = true;
      const m = mapRef.current as { remove?: () => void } | null;
      m?.remove?.();
      mapRef.current = null;
    };
    // bbox is a tuple — JSON-stringify to skip rerenders on identical arrays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(bbox), JSON.stringify(line), accent]);

  return <div ref={ref} className={cn("relative overflow-hidden rounded-2xl bg-ink-100", className)} />;
}
