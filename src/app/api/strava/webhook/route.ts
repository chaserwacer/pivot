import { NextResponse } from "next/server";
import crypto from "node:crypto";

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
  // Strava's documented webhook does not sign its push, but partner / private
  // deployments often add an HMAC. If STRAVA_WEBHOOK_SECRET is set we require
  // it; otherwise we fall back to accepting any payload (consistent with the
  // public Strava behaviour).
  const secret = process.env.STRAVA_WEBHOOK_SECRET;
  const rawBody = await req.text();
  if (secret) {
    const signature = req.headers.get("x-strava-signature");
    if (!signature) {
      return NextResponse.json({ error: "missing_signature" }, { status: 401 });
    }
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const ok = (() => {
      try {
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
      } catch {
        return false;
      }
    })();
    if (!ok) {
      return NextResponse.json({ error: "bad_signature" }, { status: 401 });
    }
  }

  const body = (() => {
    try {
      return JSON.parse(rawBody) as {
        object_type?: string;
        object_id?: number;
        aspect_type?: string;
        owner_id?: number;
        event_time?: number;
      };
    } catch {
      return {};
    }
  })();

  // Acknowledge immediately. Real ingestion happens in the worker so the
  // handler returns under Strava's 2 s deadline.
  console.log("[strava] webhook event:", body);
  return NextResponse.json({ ok: true });
}
