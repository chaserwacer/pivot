/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { readRecentlyViewed, recordView } from "./recentlyViewed";

describe("recentlyViewed", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns [] when there is nothing stored", () => {
    expect(readRecentlyViewed()).toEqual([]);
  });

  it("records a view and lets us read it back", () => {
    recordView({ id: "a", title: "Aspen Loop" });
    const list = readRecentlyViewed();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("a");
    expect(list[0].title).toBe("Aspen Loop");
    expect(typeof list[0].at).toBe("number");
  });

  it("dedupes by id and moves the latest view to the front", () => {
    recordView({ id: "a", title: "A" });
    recordView({ id: "b", title: "B" });
    recordView({ id: "a", title: "A2" });
    const list = readRecentlyViewed();
    expect(list.map((r) => r.id)).toEqual(["a", "b"]);
    expect(list[0].title).toBe("A2");
  });

  it("caps the list at eight entries", () => {
    for (let i = 0; i < 12; i++) recordView({ id: `r${i}`, title: `R${i}` });
    expect(readRecentlyViewed().length).toBe(8);
  });

  it("recovers from corrupted storage gracefully", () => {
    window.localStorage.setItem("pivot:recently-viewed", "{not json");
    expect(readRecentlyViewed()).toEqual([]);
  });
});
