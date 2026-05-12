import { describe, expect, it } from "vitest";
import { formatAscent, formatDistance, formatDuration, metresToFeet, metresToMiles } from "./units";

describe("units", () => {
  it("converts metres to miles", () => {
    expect(metresToMiles(1609.344)).toBeCloseTo(1, 5);
  });

  it("converts metres to feet", () => {
    expect(metresToFeet(100)).toBeCloseTo(328.084, 3);
  });

  it("formats distance in imperial by default", () => {
    expect(formatDistance(1609.344)).toBe("1.0 mi");
  });

  it("formats distance in metric when requested", () => {
    expect(formatDistance(750, "metric")).toBe("750 m");
    expect(formatDistance(3210, "metric")).toBe("3.2 km");
  });

  it("formats ascent", () => {
    expect(formatAscent(100)).toBe("328 ft");
    expect(formatAscent(1000, "metric")).toBe("1,000 m");
  });

  it("formats duration", () => {
    expect(formatDuration(45 * 60)).toBe("45m");
    expect(formatDuration(2 * 3600)).toBe("2h");
    expect(formatDuration(2 * 3600 + 5 * 60)).toBe("2h 05m");
  });
});
