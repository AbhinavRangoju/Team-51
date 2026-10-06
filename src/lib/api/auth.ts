/**
 * Authentication endpoints.
 *
 * All are server functions, so they inherit the CSRF middleware registered in
 * src/start.ts and cannot be driven from another origin.
 *
 * THE ROLE DECISION
 * `signup` takes no role. It is not an ignored field or a validated field — the
 * validator does not read one, so there is nothing to send. Every new account
 * is a customer. Becoming a seller requires a vendor record linked by an
 * operator, which is the same path the seeded sellers took.
 *
 * This replaces the RolePicker in AuthPanel.tsx, which let the visitor choose
 * `customer` or `vendor` at sign-in and wrote it straight into the session.
 *
 * ENUMERATION
 * Login answers with one message for "no such email" and "wrong password", and
 * burns comparable CPU in both cases (see fakeVerify). Signup is the one place
 * where existence necessarily leaks, because the address has to be unique; it
 * is rate limited to make harvesting slow.
 */

import { createServerFn } from "@tanstack/react-start";

import { guarded, obj, str, email as parseEmail, password as parsePassword, badRequest, conflict, unauthorized } from "@/lib/server/validate";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "vendor" | "admin";
};

type Credentials = { email: string; password: string };
type SignupInput = Credentials & { name: string };

function validateLogin(raw: unknown): Credentials {
  const body = obj(raw);
  return { email: parseEmail(body.email), password: parsePassword(body.password) };
}

function validateSignup(raw: unknown): SignupInput {
  const body = obj(raw);
  return {
    name: str(body.name, "Name", { min: 2, max: 80 }),
    email: parseEmail(body.email),
    password: parsePassword(body.password),
  };
}

export const signup = createServerFn({ method: "POST" })
  .validator(validateSignup)
  .handler(async ({ data }): Promise<PublicUser> =>
    guarded(async () => {
      const [{ db, newId, nowIso, persist }, { hashPassword }, { issueSession, toSessionUser }, { seedIfEmpty }, { clientKey, rateLimited, SIGNUP_LIMIT }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/password"),
          import("@/lib/server/session"),
          import("@/lib/server/seed"),
          import("@/lib/server/ratelimit"),
        ]);

      seedIfEmpty();

      if (rateLimited(await clientKey("signup"), SIGNUP_LIMIT)) {
        throw badRequest("Too many sign-up attempts. Please try again later.");
      }

      const d = db();
      if (d.emailIndex.has(data.email)) {
        throw conflict("An account with that email already exists.");
      }

      const { hash, salt } = hashPassword(data.password);
      const user = {
        id: newId(),
        email: data.email,
        name: data.name,
        phone: null,
        passwordHash: hash,
        passwordSalt: salt,
        // Not negotiable and not read from the request.
        role: "customer" as const,
        status: "Active" as const,
        createdAt: nowIso(),
      };

      d.t.users.set(user.id, user);
      d.emailIndex.set(user.email, user.id);
      persist();

      await issueSession(user.id);
      return toSessionUser(user);
    }),
  );

export const login = createServerFn({ method: "POST" })
  .validator(validateLogin)
  .handler(async ({ data }): Promise<PublicUser> =>
    guarded(async () => {
      const [{ db }, { verifyPassword, fakeVerify }, { issueSession, toSessionUser }, { seedIfEmpty }, { clientKey, rateLimited, resetLimit, LOGIN_LIMIT }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/password"),
          import("@/lib/server/session"),
          import("@/lib/server/seed"),
          import("@/lib/server/ratelimit"),
        ]);

      seedIfEmpty();

      const key = await clientKey("login");
      if (rateLimited(key, LOGIN_LIMIT)) {
        throw unauthorized("Too many sign-in attempts. Please try again later.");
      }

      const d = db();
      const userId = d.emailIndex.get(data.email);
      const user = userId ? d.t.users.get(userId) : undefined;

      if (!user) {
        // Spend the time a real verification would, so response latency does
        // not reveal whether the address exists.
        fakeVerify();
        throw unauthorized("Email or password is incorrect.");
      }

      if (!verifyPassword(data.password, user.passwordHash, user.passwordSalt)) {
        throw unauthorized("Email or password is incorrect.");
      }

      if (user.status !== "Active") {
        throw unauthorized("This account has been suspended.");
      }

      resetLimit(key);
      await issueSession(user.id);
      return toSessionUser(user);
    }),
  );

export const logout = createServerFn({ method: "POST" }).handler(async (): Promise<{ ok: true }> =>
  guarded(async () => {
    const { destroySession } = await import("@/lib/server/session");
    await destroySession();
    return { ok: true };
  }),
);

/**
 * Who the caller is, according to the server.
 *
 * The client treats this as the only source of identity. It replaces the `user`
 * object that StoreProvider used to read back out of localStorage, where it
 * could be edited freely from devtools.
 */
export const me = createServerFn({ method: "GET" }).handler(async (): Promise<PublicUser | null> =>
  guarded(async () => {
    const [{ currentUser }, { seedIfEmpty }] = await Promise.all([
      import("@/lib/server/session"),
      import("@/lib/server/seed"),
    ]);
    seedIfEmpty();
    return currentUser();
  }),
);
