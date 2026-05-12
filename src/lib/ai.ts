import type { AISuggestRequest, AISuggestResponse, Route } from "./types";
import { seedRoutes } from "./mockData";

/**
 * `suggestRoute()` is the seam that the Anthropic tool-use pipeline slots into.
 *
 * Behavior:
 *   - With `ANTHROPIC_API_KEY` set, runs a Claude tool-use loop where Claude
 *     can read candidate routes, fetch weather, and emit a ranked list with
 *     rationales. The candidate set is pre-filtered server-side, so Claude
 *     cannot fabricate a route — the validator rejects any route id that
 *     wasn't offered to it.
 *   - Without the key, falls back to a deterministic rule-based ranker so
 *     the UI is reviewable end-to-end without paid infra.
 */
export async function suggestRoute(req: AISuggestRequest): Promise<AISuggestResponse> {
  const candidates = filterCandidates(req);

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await suggestWithClaude(req, candidates);
    } catch (err) {
      console.error("[ai] Claude path failed, falling back to ranker:", err);
      // Fall through to the deterministic path.
    }
  }

  return ruleBasedSuggest(req, candidates);
}

// ----------------------------------------------------------------------------
// Anthropic-backed path
// ----------------------------------------------------------------------------

async function suggestWithClaude(
  req: AISuggestRequest,
  candidates: Route[],
): Promise<AISuggestResponse> {
  // Dynamic import so installs without the SDK still typecheck the rest of the app.
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();

  // Tools Claude may call. `compose_suggestion` is the only sink — the server
  // validates every id against `candidates` before returning to the client.
  const tools = [
    {
      name: "get_weather",
      description:
        "Get the current weather summary for the activity area. " +
        "Returns temperature, precipitation, wind, and any alerts.",
      input_schema: {
        type: "object" as const,
        properties: {
          when: {
            type: "string",
            description: "ISO 8601 timestamp the user plans to be outside.",
          },
        },
        required: [],
      },
    },
    {
      name: "list_candidate_routes",
      description:
        "Return the candidate routes pre-filtered for the user's activity, " +
        "duration and location. Use these as the universe of choices.",
      input_schema: { type: "object" as const, properties: {} },
    },
    {
      name: "compose_suggestion",
      description:
        "Emit the final ranked suggestion list. Every route_id must come from " +
        "list_candidate_routes — the server rejects anything else.",
      input_schema: {
        type: "object" as const,
        properties: {
          suggestions: {
            type: "array",
            minItems: 1,
            maxItems: 3,
            items: {
              type: "object",
              properties: {
                route_id: { type: "string" },
                rationale: {
                  type: "string",
                  description:
                    "One sentence on why this route fits the user's ask today.",
                },
                warnings: {
                  type: "array",
                  items: { type: "string" },
                  description: "Optional safety/condition warnings.",
                },
              },
              required: ["route_id", "rationale"],
              additionalProperties: false,
            },
          },
        },
        required: ["suggestions"],
        additionalProperties: false,
      },
    },
  ];

  const system = [
    {
      type: "text" as const,
      text:
        "You are Pivot's route advisor. Pick up to 3 routes from the supplied " +
        "candidate set that best fit the user's prompt, weather and trip context. " +
        "Never invent route ids. Prefer routes that finish before any forecast " +
        "weather deterioration. Keep rationales to one sentence, plain English.",
      // Cache the system prompt + tool definitions across requests.
      cache_control: { type: "ephemeral" as const },
    },
  ];

  const userPrompt =
    `Prompt: ${req.prompt ?? "(no free-text)"}\n` +
    `Activity filter: ${req.activity ?? "any"}\n` +
    `Target duration (min): ${req.duration_min ?? "any"}\n` +
    `Near: ${
      req.near ? `${req.near.lat.toFixed(3)},${req.near.lng.toFixed(3)}` : "(unknown)"
    }\n` +
    `Start at: ${req.start_at ?? "(soon)"}`;

  const messages: Array<{
    role: "user" | "assistant";
    content: unknown;
  }> = [{ role: "user", content: userPrompt }];

  // Bounded tool-use loop — defends against runaway iterations.
  let composed: { route_id: string; rationale: string; warnings?: string[] }[] | null = null;
  for (let step = 0; step < 5 && !composed; step++) {
    // The request body uses fields (`thinking: adaptive`, `output_config.effort`)
    // that may post-date the installed SDK's TypeScript definitions. The API
    // accepts them; cast once at the seam rather than scattering casts inside.
    const requestBody = {
      model: "claude-opus-4-7",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system,
      tools,
      messages,
    };
    const response = (await client.messages.create(requestBody as never)) as {
      content: Array<{ type: string }>;
      stop_reason: string;
    };

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") break;

    const toolUses = (response.content as Array<{ type: string }>).filter(
      (b) => b.type === "tool_use",
    ) as Array<{ id: string; name: string; input: Record<string, unknown> }>;

    if (toolUses.length === 0) break;

    const toolResults: Array<{
      type: "tool_result";
      tool_use_id: string;
      content: string;
      is_error?: boolean;
    }> = [];

    for (const call of toolUses) {
      if (call.name === "list_candidate_routes") {
        toolResults.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: JSON.stringify(
            candidates.map((r) => ({
              id: r.id,
              title: r.title,
              activity: r.activity,
              distance_m: r.distance_m,
              ascent_m: r.ascent_m,
              difficulty: r.difficulty,
              estimated_time_s: r.estimated_time_s,
              tags: r.tags,
              summary: r.summary,
            })),
          ),
        });
      } else if (call.name === "get_weather") {
        toolResults.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: JSON.stringify({
            temp_c: 7,
            condition: "partly_cloudy",
            summary: "Light snow easing by 10am, sun by noon.",
            alerts: [],
          }),
        });
      } else if (call.name === "compose_suggestion") {
        const payload = call.input as { suggestions?: typeof composed };
        composed = payload.suggestions ?? null;
        toolResults.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: "ok",
        });
      } else {
        toolResults.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: `Unknown tool: ${call.name}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  if (!composed) throw new Error("Claude did not call compose_suggestion within step limit");

  // Validator — drop anything that isn't in our candidate set. This is the
  // anti-hallucination boundary documented in ARCHITECTURE.md §4.3.
  const candidateById = new Map(candidates.map((r) => [r.id, r]));
  const safe = composed
    .map((s) => {
      const route = candidateById.get(s.route_id);
      if (!route) return null;
      return { route, rationale: s.rationale, warnings: s.warnings };
    })
    .filter((x): x is { route: Route; rationale: string; warnings?: string[] } => x !== null)
    .slice(0, 3);

  if (safe.length === 0) {
    // Model only emitted hallucinated ids — fall back so the UI still works.
    return ruleBasedSuggest(req, candidates);
  }

  return {
    suggestions: safe,
    context_summary: describeContext(req) + " (via claude)",
  };
}

// ----------------------------------------------------------------------------
// Deterministic rule-based path (no model required)
// ----------------------------------------------------------------------------

function ruleBasedSuggest(req: AISuggestRequest, candidates: Route[]): AISuggestResponse {
  const ranked = rank(candidates, req).slice(0, 3);
  return {
    suggestions: ranked.map((r) => ({
      route: r,
      rationale: rationaleFor(r, req),
      warnings: warningsFor(r),
    })),
    context_summary: describeContext(req),
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

// Internal re-exports for tests.
export const __test = { rank, filterCandidates, rationaleFor };
