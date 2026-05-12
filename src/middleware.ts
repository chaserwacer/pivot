import { NextResponse, type NextRequest } from "next/server";

// Token-bucket-ish rate limit for AI endpoints. Lives in the edge runtime
// memory of one process — production swaps this for Redis (see ARCHITECTURE.md).
const AI_LIMIT = 30; // requests
const AI_WINDOW_MS = 60_000; // per minute, per ip
const buckets = new Map<string, { count: number; resetAt: number }>();

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(self), microphone=(), camera=()",
  // Loose CSP so the MapLibre demo style + maplibre fonts still load in dev.
  // Tighten when we self-host tiles.
  "Content-Security-Policy":
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://demotiles.maplibre.org https://api.maptiler.com",
      "worker-src 'self' blob:",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
    ].join("; "),
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limit AI endpoints by client IP.
  if (pathname.startsWith("/api/ai/")) {
    const ip = clientIp(req);
    const now = Date.now();
    const bucket = buckets.get(ip);
    if (!bucket || bucket.resetAt < now) {
      buckets.set(ip, { count: 1, resetAt: now + AI_WINDOW_MS });
    } else {
      bucket.count++;
      if (bucket.count > AI_LIMIT) {
        const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
        return new NextResponse(
          JSON.stringify({ error: "rate_limited", retry_after_s: retryAfter }),
          {
            status: 429,
            headers: {
              "content-type": "application/json",
              "retry-after": String(retryAfter),
              ...SECURITY_HEADERS,
            },
          },
        );
      }
    }
  }

  const res = NextResponse.next();
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

export const config = {
  // Run on everything except static assets and the service worker.
  matcher: ["/((?!_next/static|_next/image|favicon|sw\\.js|icon\\.svg|manifest\\.webmanifest).*)"],
};
