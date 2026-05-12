import { describe, expect, it } from "vitest";
import { detectLocale, t } from "./i18n";

describe("i18n", () => {
  it("falls back to English when there's no Accept-Language", () => {
    expect(detectLocale(null)).toBe("en");
    expect(detectLocale(undefined)).toBe("en");
    expect(detectLocale("")).toBe("en");
  });

  it("picks Spanish from a Spanish header", () => {
    expect(detectLocale("es-MX,es;q=0.9,en;q=0.8")).toBe("es");
    expect(detectLocale("es")).toBe("es");
  });

  it("translates known keys per locale", () => {
    expect(t("en", "home.plan_with_ai")).toBe("Plan with AI");
    expect(t("es", "home.plan_with_ai")).toBe("Planifica con IA");
  });

  it("falls back to English for unknown locale keys", () => {
    expect(t("es", "common.share")).toBe("Compartir");
    expect(t("en", "missing.key")).toBe("missing.key");
  });
});
