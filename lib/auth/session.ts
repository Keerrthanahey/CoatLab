import { createHmac, randomBytes } from "node:crypto";

/**
 * Session tokens are stateless, signed with HMAC-SHA256 so the proxy can
 * verify authenticity without a database round-trip. The payload embeds the
 * user id, display name, email and an expiry timestamp.
 */

const SESSION_COOKIE = "coatlab_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const SEP = ".";

/**
 * Resolve the HMAC secret. In production this MUST be set via AUTH_SECRET.
 * A dev-only fallback keeps local development working without env config,
 * but the app logs a loud warning so it is never relied on silently.
 */
function getSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.COATLAB_AUTH_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[auth] AUTH_SECRET must be set in production to secure user sessions.",
    );
  }

  console.warn(
    "[auth] AUTH_SECRET not set — using an insecure dev-only fallback. Set AUTH_SECRET before deploying.",
  );
  return "dev-only-insecure-secret-change-me";
}

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
}

export interface SessionToken extends SessionPayload {
  exp: number;
  sig: string;
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(payload: SessionPayload): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const body = btoa(JSON.stringify({ userId: payload.userId, name: payload.name, email: payload.email, exp }));
  const secret = getSecret();
  const sig = sign(body, secret);
  return body + SEP + sig;
}

/**
 * Verify a session token's signature and expiry. Returns the payload, or null
 * if the token is invalid, tampered with, or expired.
 */
export function verifySessionToken(token: string | undefined | null): Omit<SessionToken, "sig"> | null {
  if (!token) return null;
  try {
    // Cookie serializers percent-encode `=` padding; undo that before signing.
    token = decodeURIComponent(token);
  } catch {
    return null;
  }
  const idx = token.lastIndexOf(SEP);
  if (idx <= 0) return null;
  const body = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const secret = getSecret();
  const expected = sign(body, secret);
  if (sig.length !== expected.length) return null;

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  if (mismatch !== 0) return null;

  let parsed: SessionToken;
  try {
    parsed = JSON.parse(atob(body));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed.exp !== "number" || parsed.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return { userId: parsed.userId, name: parsed.name, email: parsed.email, exp: parsed.exp };
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
