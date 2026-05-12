import type { Route } from "./types";

/**
 * Minimal GPX 1.1 writer. Iteration 1 will decode `route.polyline` into real
 * lat/lng pairs once Valhalla snapping is wired up. For now we synthesise an
 * evenly-spaced line across the bbox so the export is a valid GPX file.
 */
export function routeToGpx(route: Route): string {
  const [w, s, e, n] = route.bbox;
  const samples = Math.max(route.elevation.length, 32);
  const pts: string[] = [];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const lat = s + (n - s) * t;
    const lng = w + (e - w) * t;
    const ele = route.elevation[Math.min(i, route.elevation.length - 1)] ?? 0;
    pts.push(`      <trkpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}"><ele>${ele}</ele></trkpt>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Pivot" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escape(route.title)}</name>
    <desc>${escape(route.summary)}</desc>
  </metadata>
  <trk>
    <name>${escape(route.title)}</name>
    <type>${route.activity}</type>
    <trkseg>
${pts.join("\n")}
    </trkseg>
  </trk>
</gpx>
`;
}

function escape(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}
