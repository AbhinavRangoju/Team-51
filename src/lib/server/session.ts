/**
 * Server-side sessions.
 *
 * The browser holds an opaque random id in a cookie and nothing else. Identity,
 * role and status are looked up from the store on every single request, so:
 *
 *   - There is no token payload to tamper with. Granting yourself
 *     `role: "admin"` would mean guessing another user's 128-bit session id.
 *   - A suspended or deleted account loses access immediately, which a signed
 *     JWT could not do without a revocation list.
 *
 * Cookie flags, and the reason for each:
 *   httpOnly  — script cannot read it, so an XSS foothold cannot exfiltrate it
 *   sameSite  — "strict": the cookie is not attached to cross-site requests,
 *               which is the second layer under the CSRF middleware in start.ts
 *   secure    — set in production only, so local http dev still works
 *   path "/"  — one session for the whole app
 *   maxAge    — bounded lifetime; the server-side expiry is the real check
 */

import { randomBytes } from "node:crypto";

import { db, nowIso, persist, type Role, type UserRow } from "./db";
import { unauthorized } from "./validate";

const COOKIE = "mh_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
};

export const toSessionUser = (u: UserRow): SessionUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
});

/** 256 bits from the CSPRNG. Not guessable, not derived from the user. */
const newSessionId = (): string => randomBytes(32).toString("base64url");

type CookieApi = {
  getCookie: (name: string) => string | undefined;
  setCookie: (name: string, value: string, options?: Record<string, unknown>) => void;
  deleteCookie: (name: string, options?: Record<string, unknown>) => void;
};

async function cookies(): Promise<CookieApi> {
  const mod = (await import("@tanstack/react-start/server")) as unknown as CookieApi;
  return mod;
}

const isProd = (): boolean => process.env.NODE_ENV === "production";

export async function issueSession(userId: string): Promise<void> {
  const d = db();
  const id = newSessionId();
  d.t.sessions.set(id, {
    id,
    userId,
    expiresAt: Date.now() + TTL_MS,
    createdAt: nowIso(),
  });
  persist();

  const { setCookie } = await cookies();
  setCookie(COOKIE, id, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProd(),
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

export async function destroySession(): Promise<void> {
  const { getCookie, deleteCookie } = await cookies();
  const id = getCookie(COOKIE);
  if (id) {
    db().t.sessions.delete(id);
    persist();
  }
  deleteCookie(COOKIE, { path: "/" });
}

/**
 * Resolves the caller, or null. Never throws — callers that require a user go
 * through `requireUser` in guards.ts.
 *
 * Expired sessions are deleted on read rather than swept on a timer, which
 * keeps the table from growing without needing a scheduler.
 */
export async function currentUser(): Promise<SessionUser | null> {
  const { getCookie } = await cookies();
  const id = getCookie(COOKIE);
  if (!id) return null;

  const d = db();
  const session = d.t.sessions.get(id);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    d.t.sessions.delete(id);
    persist();
    return null;
  }

  const user = d.t.users.get(session.userId);
  // A session whose user vanished, or whose account was suspended, is dead on
  // arrival. Status is re-read here on every request for exactly this reason.
  if (!user || user.status !== "Active") {
    d.t.sessions.delete(id);
    persist();
    return null;
  }

  return toSessionUser(user);
}

/** Drops every session belonging to a user. Used when the password changes. */
export function revokeAllSessions(userId: string): void {
  const d = db();
  for (const [id, s] of d.t.sessions) {
    if (s.userId === userId) d.t.sessions.delete(id);
  }
  persist();
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw unauthorized();
  return user;
}
