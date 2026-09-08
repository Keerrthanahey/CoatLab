/**
 * Server-side Google OAuth 2.0 helper.
 *
 * CoatLab runs a self-contained session-auth system (see lib/auth). Google
 * Sign-In is layered on top of the same architecture: a server-side OAuth
 * code exchange produces the user's identity, which is then stored in the
 * same user store and issued a normal CoatLab session cookie. No tokens or
 * secrets ever reach the client.
 *
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (server-only env).
 */

export interface GoogleProfile {
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function clientId(): string {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not configured.");
  }
  return process.env.GOOGLE_CLIENT_ID;
}

function clientSecret(): string {
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET is not configured.");
  }
  return process.env.GOOGLE_CLIENT_SECRET;
}

export function googleRedirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

/**
 * Build the Google consent URL. `state` carries a validated return path so
 * users land back where they started (echoed verbatim by Google).
 */
export function buildGoogleAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: googleRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    access_type: "online",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange an authorization code for the verified Google profile.
 * Identity is read from the userinfo endpoint over HTTPS with the access
 * token as a Bearer credential — never a password.
 */
export async function exchangeGoogleCode(code: string, origin: string): Promise<GoogleProfile> {
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: googleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new Error("Google token exchange failed.");
  }
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("Google authentication failed.");

  const infoRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) {
    throw new Error("Google user info request failed.");
  }
  const profile = (await infoRes.json()) as {
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!profile.email) throw new Error("Google account has no email address.");
  if (profile.email_verified !== true) {
    throw new Error("Google account email is not verified.");
  }

  return {
    email: profile.email.toLowerCase(),
    emailVerified: true,
    name: profile.name?.trim() || profile.email.split("@")[0],
    picture: profile.picture,
  };
}