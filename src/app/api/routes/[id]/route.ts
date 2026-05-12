import { NextResponse } from "next/server";
import { getRoute } from "@/lib/mockData";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const route = getRoute(params.id);
  if (!route) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ route });
}
