import { NextResponse } from "next/server";

/**
 * Strava OAuth start. Iteration 4 will store `state` in a signed cookie and
 * implement /api/strava/callback to exchange the code for tokens, persist
 * encrypted refresh tokens in `strava_links`, and register the activity webhook.
 */
export async function GET(req: Request) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  const scope = "read,activity:read_all,activity:write";

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "strava_not_configured",
        message:
          "Set STRAVA_CLIENT_ID and STRAVA_REDIRECT_URI to enable Strava login. See .env.example.",
      },
      { status: 501 },
    );
  }

  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", scope);
  // Carry the optional ?route=... through OAuth so we can deep-link back.
  const route = new URL(req.url).searchParams.get("route");
  if (route) url.searchParams.set("state", `route:${route}`);

  return NextResponse.redirect(url.toString(), 302);
}
