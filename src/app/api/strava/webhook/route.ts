import { NextResponse } from "next/server";

/**
 * Strava webhook endpoint.
 *
 * GET  → subscription challenge handshake.
 * POST → activity / athlete event push. Iteration 4 enqueues a BullMQ job
 *        that pulls the activity, polylines it, and writes a `routes` row
 *        with `source='strava'`.
 *
 * Strava requires the GET handshake to succeed before any POSTs are delivered:
 * https://developers.strava.com/docs/webhooks/
 */

const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN ?? "pivot-verify";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return NextResponse.json({ "hub.challenge": challenge });
  }
  return NextResponse.json({ error: "verify_failed" }, { status: 403 });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    object_type?: string;
    object_id?: number;
    aspect_type?: string;
    owner_id?: number;
    event_time?: number;
  };
  // Acknowledge immediately. Real ingestion happens in the worker so the
  // handler returns under Strava's 2 s deadline.
  console.log("[strava] webhook event:", body);
  return NextResponse.json({ ok: true });
}
