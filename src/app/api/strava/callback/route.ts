import { NextResponse } from "next/server";
import { exchangeCode, stravaStore } from "@/lib/strava";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stravaError = url.searchParams.get("error");
  const state = url.searchParams.get("state");

  if (stravaError) {
    return NextResponse.redirect(new URL(`/me?strava=denied`, req.url));
  }
  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  try {
    const r = await exchangeCode(code);
    stravaStore.put({
      athleteId: r.athlete.id,
      accessToken: r.access_token,
      refreshToken: r.refresh_token,
      expiresAt: r.expires_at,
      scope: r.scope ?? "",
    });

    // If the connect call carried a `route` reference, drop the user back on it.
    const target = state?.startsWith("route:")
      ? `/routes/${state.slice("route:".length)}?strava=ok`
      : "/me?strava=ok";
    return NextResponse.redirect(new URL(target, req.url));
  } catch (err) {
    console.error("[strava] callback failed:", err);
    return NextResponse.redirect(new URL("/me?strava=error", req.url));
  }
}
