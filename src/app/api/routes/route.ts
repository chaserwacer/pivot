import { NextResponse } from "next/server";
import { seedRoutes } from "@/lib/mockData";
import type { Activity } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const activity = url.searchParams.get("activity") as Activity | null;
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const list = (activity ? seedRoutes.filter((r) => r.activity === activity) : seedRoutes).slice(0, limit);
  return NextResponse.json({ routes: list });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // MVP: echo back a server-issued id; iteration 1 wires Valhalla + Postgres.
  const id = `usr-${Date.now().toString(36)}`;
  return NextResponse.json({ id, ...body }, { status: 201 });
}
