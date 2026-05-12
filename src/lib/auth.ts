/**
 * Auth.js (NextAuth) configuration target — iteration 3 wires this up.
 *
 * Captured as a typed value so the providers list, scopes, and session-cookie
 * settings live in version control and can be reviewed without booting the
 * service. When we install `next-auth`, this becomes the default export of
 * `auth.config.ts` and feeds `NextAuth({...})`.
 */

export interface AuthProvider {
  id: "email" | "google" | "apple" | "strava";
  /** OAuth scope(s) we request. */
  scopes?: string[];
  /** Env keys that must be present for the provider to be enabled at boot. */
  envRequired: string[];
}

export const PIVOT_AUTH_CONFIG = {
  providers: [
    { id: "email", envRequired: ["EMAIL_SERVER", "EMAIL_FROM"] },
    {
      id: "google",
      scopes: ["openid", "email", "profile"],
      envRequired: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    },
    {
      id: "apple",
      scopes: ["name", "email"],
      envRequired: ["APPLE_CLIENT_ID", "APPLE_CLIENT_SECRET"],
    },
    {
      id: "strava",
      scopes: ["read", "activity:read_all", "activity:write"],
      envRequired: ["STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET"],
    },
  ] satisfies AuthProvider[],
  session: {
    strategy: "jwt" as const,
    maxAgeS: 60 * 60 * 24 * 30, // 30 days
  },
  cookies: {
    sessionToken: {
      name: "pivot.session",
      options: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
    },
  },
  pages: {
    signIn: "/me",
    error: "/me?auth=error",
  },
};

/** Which providers are usable based on the current env? */
export function enabledProviders(env: NodeJS.ProcessEnv = process.env): AuthProvider[] {
  return PIVOT_AUTH_CONFIG.providers.filter((p) => p.envRequired.every((k) => !!env[k]));
}
