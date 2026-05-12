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

export interface ImportedGpx {
  name: string;
  points: Array<{ lat: number; lon: number; ele?: number }>;
}

/**
 * Pull `<trkpt>` points out of a GPX 1.0/1.1 document with a tolerant regex
 * parser. Good enough for the common case (Strava/Garmin/AllTrails exports);
 * a malformed file produces an empty point list which the caller can reject.
 *
 * Why not an XML parser? Pivot runs on the edge runtime where DOMParser isn't
 * available, and pulling in a bundle-heavy XML lib for one shape is overkill.
 * Iteration 4 swaps this for a streaming SAX pass if files start getting large.
 */
export function parseGpx(xml: string): ImportedGpx {
  const nameMatch = xml.match(/<name>([\s\S]*?)<\/name>/i);
  const name = (nameMatch?.[1] ?? "Imported route").trim();
  const points: ImportedGpx["points"] = [];
  const re = /<trkpt\s+lat="([-\d.]+)"\s+lon="([-\d.]+)"[^>]*>([\s\S]*?)<\/trkpt>|<trkpt\s+lat="([-\d.]+)"\s+lon="([-\d.]+)"\s*\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const lat = parseFloat(m[1] ?? m[4] ?? "");
    const lon = parseFloat(m[2] ?? m[5] ?? "");
    if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
    const inner = m[3] ?? "";
    const eleMatch = inner.match(/<ele>([-\d.]+)<\/ele>/i);
    points.push({ lat, lon, ele: eleMatch ? parseFloat(eleMatch[1]) : undefined });
  }
  return { name, points };
}

/** Aggregate distance + ascent for a parsed GPX, in metres. */
export function summarizeGpx(g: ImportedGpx): { distance_m: number; ascent_m: number } {
  if (g.points.length < 2) return { distance_m: 0, ascent_m: 0 };
  let dist = 0;
  let ascent = 0;
  for (let i = 1; i < g.points.length; i++) {
    const a = g.points[i - 1];
    const b = g.points[i];
    dist += haversine(a, b);
    if (a.ele !== undefined && b.ele !== undefined && b.ele > a.ele) {
      ascent += b.ele - a.ele;
    }
  }
  return { distance_m: Math.round(dist), ascent_m: Math.round(ascent) };
}

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
