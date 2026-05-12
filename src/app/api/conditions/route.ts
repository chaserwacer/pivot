import { NextResponse } from "next/server";

interface ConditionReport {
  id: string;
  route_id: string;
  kind: "mud" | "snow" | "closure" | "downed_tree" | "fire";
  severity: 1 | 2 | 3;
  observed_at: string;
  source: string;
  body: string;
}

const mock: ConditionReport[] = [
  {
    id: "c1",
    route_id: "maroon-bells-scenic",
    kind: "snow",
    severity: 2,
    observed_at: "2026-05-09T12:30:00-06:00",
    source: "user:@kira",
    body: "Patchy snow above the second lake — microspikes recommended.",
  },
  {
    id: "c2",
    route_id: "ajax-skin-track",
    kind: "closure",
    severity: 3,
    observed_at: "2026-05-11T08:00:00-06:00",
    source: "Aspen SkiCo",
    body: "Uphill access closed Mon/Wed for grooming until Memorial Day.",
  },
  {
    id: "c3",
    route_id: "hunter-creek-cascade",
    kind: "mud",
    severity: 1,
    observed_at: "2026-05-10T17:00:00-06:00",
    source: "user:@dan",
    body: "Lower mile boggy after recent rain. Bring shoes you can rinse.",
  },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const routeId = url.searchParams.get("route_id");
  const list = routeId ? mock.filter((c) => c.route_id === routeId) : mock;
  return NextResponse.json({ conditions: list });
}
