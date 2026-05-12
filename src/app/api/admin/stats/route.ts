import { NextResponse } from "next/server";
import { seedRoutes } from "@/lib/mockData";
import { stravaStore } from "@/lib/strava";

/**
 * Lightweight admin metrics. Locked down with a shared bearer token until
 * Auth.js + role-based access lands in iteration 3. Without `PIVOT_ADMIN_TOKEN`
 * set, the endpoint refuses every request.
 */
export async function GET(req: Request) {
  const expected = process.env.PIVOT_ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "admin_not_configured" }, { status: 503 });
  }
  const provided = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (provided !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const byActivity = seedRoutes.reduce<Record<string, number>>((acc, r) => {
    acc[r.activity] = (acc[r.activity] ?? 0) + 1;
    return acc;
  }, {});
  return NextResponse.json({
    routes_total: seedRoutes.length,
    routes_by_activity: byActivity,
    strava_links: stravaStore.size(),
    server_time: new Date().toISOString(),
  });
}
