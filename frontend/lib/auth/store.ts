import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Minimal durable user store. There is no external database in this project,
 * so users are persisted to a git-ignored JSON file (`.data/users.json`).
 *
 * This module is server-only — it uses synchronous `node:fs` calls and is
 * never imported from client components.
 */

export type AuthProvider = "email" | "google";

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  /** Optional research domain captured at signup. */
  domain?: string;
  /**
   * scrypt hash for email/password accounts. Absent for users who signed in
   * via Google (they have no locally stored password).
   */
  passwordHash?: string;
  /** How the account was created / last signed in with. */
  provider: AuthProvider;
  /** Profile image when provided by the identity provider. */
  avatarUrl?: string;
  createdAt: string;
}

const DATA_DIR = join(process.cwd(), ".data");
const USERS_FILE = join(DATA_DIR, "users.json");

type UserRecord = Omit<StoredUser, "passwordHash"> & { passwordHash?: string };

function ensureDir(): void {
  if (!existsSync(DATA_DIR)) {
    try {
      mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      /* ignore — errors surface on the next read/write */
    }
  }
}

function readUsers(): Record<string, UserRecord> {
  if (!existsSync(USERS_FILE)) return {};
  try {
    const raw = readFileSync(USERS_FILE, "utf8");
    return JSON.parse(raw) as Record<string, UserRecord>;
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, UserRecord>): void {
  ensureDir();
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export function getUserByEmail(email: string): StoredUser | null {
  const users = readUsers();
  for (const u of Object.values(users)) {
    if (u.email?.toLowerCase() === email.toLowerCase()) {
      return u as StoredUser;
    }
  }
  return null;
}

export function getUserById(id: string): StoredUser | null {
  const users = readUsers();
  return (users[id] as StoredUser) || null;
}

/** Shape of the user object returned to the client by auth endpoints. */
export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  domain: string | null;
  provider: string;
  avatarUrl: string | null;
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    domain: user.domain ?? null,
    provider: user.provider ?? "email",
    avatarUrl: user.avatarUrl ?? null,
  };
}

export function createUser(data: {
  fullName: string;
  email: string;
  passwordHash?: string;
  domain?: string;
  provider?: AuthProvider;
  avatarUrl?: string;
}): StoredUser {
  const users = readUsers();
  const id = crypto.randomUUID();
  const user: StoredUser = {
    id,
    fullName: data.fullName,
    email: data.email,
    domain: data.domain,
    passwordHash: data.passwordHash,
    provider: data.provider ?? "email",
    avatarUrl: data.avatarUrl,
    createdAt: new Date().toISOString(),
  };
  users[id] = user;
  writeUsers(users);
  return user;
}

/**
 * Update the mutable profile fields of an existing user. Returning the fresh
 * record lets callers echo the changes back without a second read.
 */
/**
 * Attach Google identity details to an existing account found by email.
 * Keeps any existing password (the account can still use email login) but
 * fills in the avatar and, if the account has no identity provider yet,
 * marks it as a Google-backed account.
 */
export function attachGoogleIdentity(
  id: string,
  data: { name: string; avatarUrl?: string },
): StoredUser | null {
  const users = readUsers();
  const user = users[id] as UserRecord | undefined;
  if (!user) return null;
  if (data.avatarUrl) user.avatarUrl = data.avatarUrl;
  if (!user.fullName && data.name) user.fullName = data.name;
  if (!user.provider) user.provider = "google";
  writeUsers(users);
  return user as StoredUser;
}

export function updateUserProfile(
  id: string,
  data: { fullName: string; domain?: string },
): StoredUser | null {
  const users = readUsers();
  const user = users[id] as UserRecord | undefined;
  if (!user) return null;
  user.fullName = data.fullName.trim();
  if (data.domain === undefined) {
    delete user.domain;
  } else {
    const domain = data.domain.trim();
    if (domain) user.domain = domain;
    else delete user.domain;
  }
  writeUsers(users);
  return user as StoredUser;
}

export function emailExists(email: string): boolean {
  const users = readUsers();
  return Object.values(users).some(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
}
