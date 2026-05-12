import { NextResponse } from "next/server";

const startedAt = Date.now();

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: process.env.npm_package_version ?? "0.1.0",
    git_sha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_SHA ?? null,
    uptime_s: Math.floor((Date.now() - startedAt) / 1000),
    ai: process.env.ANTHROPIC_API_KEY ? "configured" : "fallback",
    strava: process.env.STRAVA_CLIENT_ID ? "configured" : "stub",
  });
}
