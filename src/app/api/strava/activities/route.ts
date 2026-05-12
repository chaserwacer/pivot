import { NextResponse } from "next/server";

/**
 * GET  → list the connected athlete's activities (for "import as route").
 * POST → push a completed in-app session to Strava as a new activity.
 *
 * Both are stubbed until iteration 4 wires real tokens.
 */
export async function GET() {
  return NextResponse.json({
    activities: [],
    note: "Strava integration not configured. See ARCHITECTURE.md §11 iteration 4.",
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(
    {
      queued: false,
      reason: "strava_not_configured",
      received: body,
    },
    { status: 501 },
  );
}
