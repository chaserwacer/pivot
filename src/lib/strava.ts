/**
 * Strava integration seam. Iteration 4 will:
 *   - persist tokens in Postgres (`strava_links` table, see prisma schema)
 *   - rotate refresh tokens via /oauth/token
 *   - implement push uploads (/uploads) and segment matching
 *
 * For the MVP scaffold we keep an in-memory token store keyed by athlete id.
 * That obviously loses state on restart — explicit, documented, and good
 * enough for a local dev round-trip.
 */

export interface StravaTokens {
  athleteId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  scope: string;
}

const store = new Map<number, StravaTokens>();

export const stravaStore = {
  put(t: StravaTokens) {
    store.set(t.athleteId, t);
  },
  get(athleteId: number): StravaTokens | undefined {
    return store.get(athleteId);
  },
  all(): StravaTokens[] {
    return [...store.values()];
  },
  size(): number {
    return store.size;
  },
};

interface ExchangeResult {
  athlete: { id: number; firstname?: string; lastname?: string };
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope?: string;
}

/** Exchange an OAuth `code` for an access/refresh token pair. */
export async function exchangeCode(code: string): Promise<ExchangeResult> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("strava_not_configured");
  }
  const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`strava_exchange_failed: ${res.status}`);
  }
  return (await res.json()) as ExchangeResult;
}
