import { NextResponse } from "next/server";

/** Iteration 3 persists to Postgres; for now we acknowledge and echo. */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ saved: true, preferences: body });
}
