import { describe, expect, it } from "vitest";
import { PIVOT_AUTH_CONFIG, enabledProviders } from "./auth";

describe("auth config", () => {
  it("declares the expected providers", () => {
    expect(PIVOT_AUTH_CONFIG.providers.map((p) => p.id).sort()).toEqual(
      ["apple", "email", "google", "strava"],
    );
  });

  it("strava asks for read/activity scopes", () => {
    const s = PIVOT_AUTH_CONFIG.providers.find((p) => p.id === "strava");
    expect(s?.scopes).toContain("activity:read_all");
    expect(s?.scopes).toContain("activity:write");
  });

  it("session cookie is httpOnly, secure, and sameSite=lax", () => {
    const opts = PIVOT_AUTH_CONFIG.cookies.sessionToken.options;
    expect(opts.httpOnly).toBe(true);
    expect(opts.secure).toBe(true);
    expect(opts.sameSite).toBe("lax");
  });

  it("enabledProviders() returns only providers whose env is fully set", () => {
    const fakeEnv = {
      STRAVA_CLIENT_ID: "abc",
      STRAVA_CLIENT_SECRET: "def",
    } as unknown as NodeJS.ProcessEnv;
    expect(enabledProviders(fakeEnv).map((p) => p.id)).toEqual(["strava"]);
  });

  it("enabledProviders() returns nothing when nothing is set", () => {
    expect(enabledProviders({} as NodeJS.ProcessEnv)).toEqual([]);
  });
});
