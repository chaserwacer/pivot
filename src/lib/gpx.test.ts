import { describe, expect, it } from "vitest";
import { routeToGpx } from "./gpx";
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
});
