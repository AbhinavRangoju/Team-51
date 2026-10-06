/**
 * Shared persistence types and pure helpers for the MarketHub store.
 *
 * `Persisted` is the on-disk / on-wire snapshot shape both backends produce and
 * consume. `StorePersistence` is the pluggable load/save surface. `selectBackend`
 * and `redactDbUrl` are pure so unit tests can cover them without touching
 * module globals or a live database.
 */

import type {
  OrderRow,
  ProductRow,
  SessionRow,
  UserRow,
  VendorRow,
} from "./db";

export type Persisted = {
  users: UserRow[];
  sessions: SessionRow[];
  vendors: VendorRow[];
  products: ProductRow[];
  orders: OrderRow[];
  seeded: boolean;
};

export type StorePersistence = {
  readonly kind: "json" | "postgres";
  load(): Promise<Persisted>;
  save(snapshot: Persisted): Promise<void>;
};

/**
 * Minimal SQL executor surface. Implementations must never interpolate values
 * into statement text — only `$n` bind parameters.
 */
export type SqlExecutor = {
  query(text: string, params: unknown[]): Promise<Record<string, unknown>[]>;
  transaction(
    items: { text: string; params: unknown[] }[],
  ): Promise<unknown[]>;
};

/** Non-blank URL → postgres; anything else → json file store. */
export function selectBackend(url: string | undefined): "json" | "postgres" {
  return url && url.trim() ? "postgres" : "json";
}

/** Strip credentialed postgres URLs from log lines before they hit stdout. */
export function redactDbUrl(text: string): string {
  return String(text).replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[redacted]");
}
