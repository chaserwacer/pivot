import { describe, expect, it } from "vitest";
import { parseGpx, routeToGpx, summarizeGpx } from "./gpx";
import { seedRoutes } from "./mockData";

describe("gpx", () => {
  it("emits a valid GPX 1.1 document for a seed route", () => {
    const xml = routeToGpx(seedRoutes[0]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<gpx version="1.1"');
    expect(xml).toContain("<trkseg>");
    expect(xml).toContain("</trkseg>");
    expect(xml.match(/<trkpt /g)?.length ?? 0).toBeGreaterThan(0);
  });

  it("escapes XML special characters in titles", () => {
    const route = { ...seedRoutes[0], title: "Route <fancy> & \"quoted\"" };
    const xml = routeToGpx(route);
    expect(xml).toContain("&lt;fancy&gt;");
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&quot;");
    expect(xml).not.toContain("<fancy>");
  });

  it("parses a real-shape GPX 1.1 document", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <metadata><name>Test Trail</name></metadata>
  <trk><name>Test Trail</name><trkseg>
    <trkpt lat="39.190" lon="-106.820"><ele>2440</ele></trkpt>
    <trkpt lat="39.195" lon="-106.815"><ele>2470</ele></trkpt>
    <trkpt lat="39.200" lon="-106.810"><ele>2495</ele></trkpt>
  </trkseg></trk>
</gpx>`;
    const g = parseGpx(xml);
    expect(g.name).toBe("Test Trail");
    expect(g.points).toHaveLength(3);
    expect(g.points[0].ele).toBe(2440);
  });

  it("summarises distance + ascent from parsed points", () => {
    const xml = `<gpx><trkseg>
      <trkpt lat="39.190" lon="-106.820"><ele>2400</ele></trkpt>
      <trkpt lat="39.200" lon="-106.810"><ele>2450</ele></trkpt>
      <trkpt lat="39.205" lon="-106.805"><ele>2440</ele></trkpt>
    </trkseg></gpx>`;
    const stats = summarizeGpx(parseGpx(xml));
    expect(stats.distance_m).toBeGreaterThan(800);
    expect(stats.ascent_m).toBe(50);
  });

  it("returns an empty point list for a malformed document", () => {
    expect(parseGpx("not really xml").points).toEqual([]);
  });
});
