import { NextResponse } from "next/server";
import { suggestRoute } from "@/lib/ai";
import type { AISuggestRequest } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AISuggestRequest;
  const result = await suggestRoute(body);
  return NextResponse.json(result);
}
