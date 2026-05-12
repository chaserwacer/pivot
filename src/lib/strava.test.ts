import { afterEach, describe, expect, it } from "vitest";
import { stravaStore } from "./strava";

describe("strava token store", () => {
  afterEach(() => {
    // Clear everything between tests since the module-level Map is shared.
    for (const t of stravaStore.all()) stravaStore.put({ ...t, accessToken: "" });
  });

  it("stores and retrieves tokens by athlete id", () => {
    stravaStore.put({
      athleteId: 12345,
      accessToken: "at1",
      refreshToken: "rt1",
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      scope: "read,activity:read_all",
    });
    expect(stravaStore.get(12345)?.accessToken).toBe("at1");
    expect(stravaStore.size()).toBeGreaterThan(0);
  });

  it("returns undefined for unknown ids", () => {
    expect(stravaStore.get(999_999)).toBeUndefined();
  });

  it("overwrites the entry when the same id is put twice", () => {
    stravaStore.put({
      athleteId: 222,
      accessToken: "first",
      refreshToken: "rt",
      expiresAt: 0,
      scope: "",
    });
    stravaStore.put({
      athleteId: 222,
      accessToken: "second",
      refreshToken: "rt",
      expiresAt: 0,
      scope: "",
    });
    expect(stravaStore.get(222)?.accessToken).toBe("second");
  });
});
