import { describe, expect, it } from "vitest";
import { suggestRoute, __test } from "./ai";

describe("ai (rule-based path)", () => {
  it("returns up to three suggestions filtered by activity", async () => {
    const res = await suggestRoute({ activity: "hike", prompt: "scenic short hike" });
    expect(res.suggestions.length).toBeGreaterThan(0);
    expect(res.suggestions.length).toBeLessThanOrEqual(3);
    for (const s of res.suggestions) {
      expect(s.route.activity).toBe("hike");
      expect(typeof s.rationale).toBe("string");
    }
  });

  it("prefers shorter routes when the prompt asks for 'quick'", async () => {
    const res = await suggestRoute({ prompt: "quick easy stroll" });
    // Top suggestion's distance should be no greater than the average.
    const avg =
      res.suggestions.reduce((a, s) => a + s.route.distance_m, 0) / res.suggestions.length;
    expect(res.suggestions[0].route.distance_m).toBeLessThanOrEqual(avg + 1);
  });

  it("filters candidates by duration window", () => {
    const list = __test.filterCandidates({ duration_min: 120 });
    for (const r of list) {
      // Within ±60% of target, per filter rule.
      expect(r.estimated_time_s).toBeGreaterThan(120 * 60 * 0.4);
      expect(r.estimated_time_s).toBeLessThan(120 * 60 * 1.6);
    }
  });

  it("emits a context summary string", async () => {
    const res = await suggestRoute({ activity: "bike", duration_min: 90 });
    expect(res.context_summary).toContain("activity=bike");
    expect(res.context_summary).toContain("duration=90m");
  });
});
