import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 } as const;

/**
 * Hash a plaintext password using scrypt with a per-user random salt.
 * Returns a self-describing string of the form `scrypt$N$r$p$salt$hash`.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LEN, SCRYPT_OPTS).toString("hex");
  return `scrypt$${SCRYPT_OPTS.N}$${SCRYPT_OPTS.r}$${SCRYPT_OPTS.p}$${salt}$${derived}`;
}

/**
 * Verify a plaintext password against a previously produced hash string.
 * Uses a timing-safe comparison to avoid leaking information through timing.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = scryptSync(password, salt, KEY_LEN, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  }).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(derived, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
