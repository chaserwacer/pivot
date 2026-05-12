import { NextResponse } from "next/server";
import { suggestRoute } from "@/lib/ai";
import type { AISuggestRequest } from "@/lib/types";

interface PlanRequest {
  prompt?: string;
  days: number;
  activities?: AISuggestRequest["activity"][];
}

/**
 * Multi-day trip planner. The MVP composes one AI suggestion per day,
 * varying the activity through the user-provided rotation. Iteration 2
 * proper will replace this with a single Claude call that owns the whole
 * itinerary as a tool-use loop (`plan_day(N, route_id)` → grader).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as PlanRequest;
  const days = Math.max(1, Math.min(7, body.days ?? 3));
  const rotation = body.activities?.length ? body.activities : ["hike", "bike", "hike"];

  const plan: Array<{
    day: number;
    activity: AISuggestRequest["activity"];
    title: string;
    rationale: string;
    route_id: string;
  }> = [];

  for (let i = 0; i < days; i++) {
    const activity = rotation[i % rotation.length];
    const day = await suggestRoute({ prompt: body.prompt, activity });
    const top = day.suggestions[0];
    if (!top) continue;
    plan.push({
      day: i + 1,
      activity,
      title: top.route.title,
      rationale: top.rationale,
      route_id: top.route.id,
    });
  }

  return NextResponse.json({ plan });
}
