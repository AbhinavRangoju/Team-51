/**
 * Input validation and the error boundary for every server function.
 *
 * Two rules hold throughout:
 *
 * 1. Nothing reaches a handler body until it has been through a validator here.
 *    Validators are allow-lists — they name the fields they accept, coerce the
 *    type, bound the length, and drop everything else. An unexpected key in the
 *    request body cannot survive to touch the store.
 *
 * 2. Only `AppError` messages are allowed out. Anything else is logged
 *    server-side and replaced with a generic sentence, so a thrown TypeError,
 *    a filesystem path or a stack trace can never land in the browser.
 */

export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code = "bad_request") {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export const badRequest = (m: string) => new AppError(m, "bad_request");
export const unauthorized = (m = "Please sign in to continue.") => new AppError(m, "unauthorized");
export const forbidden = (m = "You do not have access to that.") => new AppError(m, "forbidden");
export const notFound = (m = "Not found.") => new AppError(m, "not_found");
export const conflict = (m: string) => new AppError(m, "conflict");

/**
 * Wraps a handler body. Keeps intentional messages, swallows everything else.
 */
export async function guarded<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("[api] unhandled", error);
    throw new AppError("Something went wrong. Please try again.", "internal");
  }
}

/** Control characters belong in no user-supplied field and pollute logs. */
export function clean(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}

export function obj(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw badRequest("Invalid request.");
  }
  return raw as Record<string, unknown>;
}

/**
 * Strict allow-list object parser for new write/query contracts.
 *
 * `obj()` only proves a value is an object. APIs that mutate or filter data
 * need the next guarantee as well: an attacker cannot smuggle a field such as
 * `vendorId`, `role`, `status`, `price`, or `stock` through an object spread.
 * Existing frozen endpoint validators keep their compatibility; new endpoints
 * use this helper exclusively.
 */
export function strictObj(raw: unknown, allowed: readonly string[]): Record<string, unknown> {
  const body = obj(raw);
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) throw badRequest("Invalid request field.");
  }
  return body;
}

export function str(
  raw: unknown,
  field: string,
  { min = 1, max = 200 }: { min?: number; max?: number } = {},
): string {
  if (typeof raw !== "string") throw badRequest(`${field} is required.`);
  const value = clean(raw);
  if (value.length < min) throw badRequest(`${field} is required.`);
  if (value.length > max) throw badRequest(`${field} must be ${max} characters or fewer.`);
  return value;
}

export function optionalStr(
  raw: unknown,
  field: string,
  { max = 200 }: { max?: number } = {},
): string | null {
  if (raw === undefined || raw === null || raw === "") return null;
  return str(raw, field, { min: 1, max });
}

export function int(
  raw: unknown,
  field: string,
  { min, max }: { min: number; max: number },
): number {
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isInteger(value)) throw badRequest(`${field} must be a whole number.`);
  if (value < min || value > max) throw badRequest(`${field} must be between ${min} and ${max}.`);
  return value;
}

/**
 * Deliberately permissive on the local part and strict on shape. A stricter
 * regex rejects valid addresses, and the address is never interpolated into a
 * query or a template, so shape is all that is needed.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function email(raw: unknown): string {
  const value = str(raw, "Email", { max: 254 }).toLowerCase();
  if (!EMAIL.test(value)) throw badRequest("That email doesn't look right.");
  return value;
}

export function password(raw: unknown): string {
  if (typeof raw !== "string") throw badRequest("Password is required.");
  // Not cleaned or trimmed: a password is bytes the user chose, and silently
  // stripping characters would make it unreproducible at login.
  if (raw.length < 8) throw badRequest("Use at least 8 characters.");
  // bcrypt-style truncation is not a risk with scrypt, but an unbounded body is
  // a cheap way to make the server do expensive work.
  if (raw.length > 200) throw badRequest("Password must be 200 characters or fewer.");
  if (!/\d/.test(raw) || !/[A-Za-z]/.test(raw)) {
    throw badRequest("Use letters and at least one number.");
  }
  return raw;
}

export function phone(raw: unknown): string {
  const value = str(raw, "Mobile number", { max: 20 }).replace(/\s/g, "");
  if (!/^\d{10}$/.test(value)) throw badRequest("Enter a 10-digit mobile number.");
  return value;
}

export function pin(raw: unknown): string {
  const value = str(raw, "PIN code", { max: 10 }).replace(/\s/g, "");
  if (!/^\d{6}$/.test(value)) throw badRequest("PIN code must be 6 digits.");
  return value;
}

export function oneOf<T extends string>(raw: unknown, allowed: readonly T[], field: string): T {
  if (typeof raw !== "string" || !allowed.includes(raw as T)) {
    throw badRequest(`${field} is not valid.`);
  }
  return raw as T;
}
