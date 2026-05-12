import { NextResponse } from "next/server";
import { seedRoutes } from "@/lib/mockData";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return NextResponse.json({ routes: [] });
  const list = seedRoutes
    .filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)),
    )
    .slice(0, 20);
  return NextResponse.json({ routes: list });
}
