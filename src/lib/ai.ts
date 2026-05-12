import { seedRoutes } from "./mockData";
import type { AISuggestRequest, AISuggestResponse, Route } from "./types";

/**
 * `suggestRoute()` is the seam that the future Anthropic tool-use pipeline
 * slots into. The MVP scaffold returns deterministic, rule-based suggestions
 * so the UI is reviewable end-to-end without a model.
 *
 * When `ANTHROPIC_API_KEY` is present, we'd:
 *   1) Retrieve candidate routes/segments from PostGIS (`queryRoutesNear`).
 *   2) Call Claude with a tool-use loop offering: getWeather, getConditions,
 *      getBookings, composeRoute (server-validated).
 *   3) Validate every returned id against the candidate set; reject hallucinated
 *      geometry.
 *   4) Cache on hash(prompt_bundle) for 15 minutes.
 *
 * That work lives in iteration 2 — keep this signature stable so the UI need
 * not change.
 */
export async function suggestRoute(req: AISuggestRequest): Promise<AISuggestResponse> {
  const candidates = filterCandidates(req);
  const ranked = rank(candidates, req).slice(0, 3);

  const summary = describeContext(req);

  return {
    suggestions: ranked.map((r) => ({
      route: r,
      rationale: rationaleFor(r, req),
      warnings: warningsFor(r),
    })),
    context_summary: summary,
  };
}

function filterCandidates(req: AISuggestRequest): Route[] {
  let list = seedRoutes;
  if (req.activity) list = list.filter((r) => r.activity === req.activity);
  if (req.duration_min) {
    const target = req.duration_min * 60;
    list = list.filter((r) => Math.abs(r.estimated_time_s - target) < target * 0.6);
  }
  return list.length ? list : seedRoutes;
}

function rank(list: Route[], req: AISuggestRequest): Route[] {
  const wantsShort = /quick|short|easy|family|stroll/i.test(req.prompt ?? "");
  const wantsLong = /epic|long|big day|grind|hardcore/i.test(req.prompt ?? "");
  const wantsScenic = /scenic|view|sunset|sunrise|alpine|lake/i.test(req.prompt ?? "");

  return [...list].sort((a, b) => score(b) - score(a));

  function score(r: Route) {
    let s = r.popularity;
    if (wantsShort) s -= r.distance_m / 1000;
    if (wantsLong) s += r.distance_m / 1000;
    if (wantsScenic && r.tags.some((t) => /scenic|alpine|lake|sunrise|sunset/i.test(t))) s += 25;
    return s;
  }
}

function rationaleFor(r: Route, req: AISuggestRequest): string {
  const bits: string[] = [];
  if (req.prompt) {
    if (/scenic|view/i.test(req.prompt) && r.tags.some((t) => /scenic|alpine|lake/i.test(t))) {
      bits.push("Matches your scenic ask — open views, water nearby.");
    }
    if (/storm|afternoon|sunset/i.test(req.prompt) && r.estimated_time_s < 3 * 3600) {
      bits.push("Short enough to finish before afternoon weather shifts.");
    }
  }
  if (bits.length === 0) {
    bits.push(`Popular ${r.activity} pick within range; ${r.tags.slice(0, 2).join(", ").toLowerCase()}.`);
  }
  return bits.join(" ");
}

function warningsFor(r: Route): string[] | undefined {
  if (r.difficulty >= 4) return ["Sustained climbing — be ready for thin air above 3,500 m."];
  return undefined;
}

function describeContext(req: AISuggestRequest): string {
  return [
    req.activity ? `activity=${req.activity}` : "",
    req.duration_min ? `duration=${req.duration_min}m` : "",
    req.near ? `near=${req.near.lat.toFixed(3)},${req.near.lng.toFixed(3)}` : "",
    req.prompt ? `prompt="${req.prompt.slice(0, 80)}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
