import { describe, expect, it } from "vitest";
import { getRoute, seedRoutes } from "./mockData";

describe("mockData", () => {
  it("exposes a unique id for each route", () => {
    const ids = new Set(seedRoutes.map((r) => r.id));
    expect(ids.size).toBe(seedRoutes.length);
  });

  it("lets us look up by id", () => {
    expect(getRoute(seedRoutes[0].id)?.title).toBe(seedRoutes[0].title);
    expect(getRoute("nope")).toBeUndefined();
  });

  it("has sensible stats on every seed route", () => {
    for (const r of seedRoutes) {
      expect(r.distance_m).toBeGreaterThan(0);
      expect(r.ascent_m).toBeGreaterThanOrEqual(0);
      expect(r.elevation.length).toBeGreaterThan(10);
      expect(r.bbox).toHaveLength(4);
      // West < East, South < North.
      expect(r.bbox[0]).toBeLessThan(r.bbox[2]);
      expect(r.bbox[1]).toBeLessThan(r.bbox[3]);
    }
  });
});
