import { NextResponse } from "next/server";
import { parseGpx, summarizeGpx } from "@/lib/gpx";

/**
 * Import a GPX file as a new draft route. Iteration 3 persists this through
 * Prisma; today we just echo a server-assigned id so the UI flow round-trips.
 */
export async function POST(req: Request) {
  const xml = await req.text();
  if (!xml || xml.length > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "bad_payload" }, { status: 400 });
  }
  const gpx = parseGpx(xml);
  if (gpx.points.length < 2) {
    return NextResponse.json({ error: "no_trkpts" }, { status: 422 });
  }
  const stats = summarizeGpx(gpx);
  return NextResponse.json(
    {
      id: `imp-${Date.now().toString(36)}`,
      title: gpx.name,
      point_count: gpx.points.length,
      ...stats,
    },
    { status: 201 },
  );
}
