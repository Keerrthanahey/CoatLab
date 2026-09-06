import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Minimal durable user store. There is no external database in this project,
 * so users are persisted to a git-ignored JSON file (`.data/users.json`).
 *
 * This module is server-only — it uses synchronous `node:fs` calls and is
 * never imported from client components.
 */

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  /** Optional research domain captured at signup. */
  domain?: string;
  passwordHash: string;
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

export function createUser(data: {
  fullName: string;
  email: string;
  passwordHash: string;
  domain?: string;
}): StoredUser {
  const users = readUsers();
  const id = crypto.randomUUID();
  const user: StoredUser = {
    id,
    fullName: data.fullName,
    email: data.email,
    domain: data.domain,
    passwordHash: data.passwordHash,
    createdAt: new Date().toISOString(),
  };
  users[id] = user;
  writeUsers(users);
  return user;
}

export function emailExists(email: string): boolean {
  const users = readUsers();
  return Object.values(users).some(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
}
