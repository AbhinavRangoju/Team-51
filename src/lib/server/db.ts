/**
 * MarketHub server-side data store — the single source of truth.
 *
 * Dual backend: when DATABASE_URL is set (via serverEnv), the working set is
 * loaded from and flushed to Neon Postgres. When unset, the original JSON file
 * store is used unchanged. Callers still see synchronous `db()` / `tx()` /
 * `persist()` — Postgres async I/O is confined to hydration and flush.
 *
 * HOW ATOMICITY IS GUARANTEED
 * Node runs one thread. A *synchronous* function therefore runs to completion
 * before any other request handler is allowed to resume. `tx()` forbids `await`
 * inside a critical section. The in-memory Maps stay the working set either way.
 *
 * This module must never reach the browser. It is only ever pulled in by
 * `await import()` from inside a server function handler.
 */

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { serverEnv } from "./env";
import { createJsonPersistence } from "./store-json";
import { createNeonExecutor, createPostgresPersistence } from "./store-postgres";
import {
  type Persisted,
  type StorePersistence,
  redactDbUrl,
  selectBackend,
} from "./store-types";

export type Role = "customer" | "vendor" | "admin";
export type UserStatus = "Active" | "Suspended";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  passwordHash: string;
  passwordSalt: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
};

export type SessionRow = {
  id: string;
  userId: string;
  expiresAt: number;
  createdAt: string;
};

export type VendorStatus = "Verified" | "Pending Verification" | "Rejected";

export type VendorRow = {
  id: string;
  userId: string | null;
  name: string;
  tagline: string;
  city: string;
  since: number;
  status: VendorStatus;
  verified: boolean;
  rating: number;
  createdAt: string;
};

export type ProductStatus = "Active" | "Draft" | "Archived";

export type ProductRow = {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  brand: string;
  /** integer paise */
  pricePaise: number;
  /** integer paise, null when the item is not discounted */
  originalPricePaise: number | null;
  stock: number;
  rating: number;
  reviews: number;
  sku: string;
  status: ProductStatus;
  description: string;
  specs: Record<string, string>;
  createdAt: string;
};

export type OrderStatus =
  | "Order Placed"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus = "Paid" | "Pending" | "Refunded";

export type OrderItemRow = {
  productId: string;
  vendorId: string;
  qty: number;
  /** integer paise, snapshotted at purchase time */
  unitPricePaise: number;
  /** integer paise, the pre-discount reference price at purchase time */
  unitMrpPaise: number;
  /** product name as it was when bought, so later edits cannot rewrite history */
  nameSnapshot: string;
};

export type OrderRow = {
  id: string;
  userId: string;
  items: OrderItemRow[];
  subtotalPaise: number;
  discountPaise: number;
  deliveryPaise: number;
  taxPaise: number;
  totalPaise: number;
  status: OrderStatus;
  payment: PaymentStatus;
  method: string;
  eta: string;
  shipName: string;
  shipPhone: string;
  shipLine: string;
  shipCity: string;
  shipPin: string;
  /** Defeats double-submit. Unique across the table. */
  idempotencyKey: string;
  createdAt: string;
};

type Tables = {
  users: Map<string, UserRow>;
  sessions: Map<string, SessionRow>;
  vendors: Map<string, VendorRow>;
  products: Map<string, ProductRow>;
  orders: Map<string, OrderRow>;
};

type Db = {
  t: Tables;
  /** email (lowercased) -> userId. Enforces the unique email constraint. */
  emailIndex: Map<string, string>;
  /** idempotencyKey -> orderId. Enforces at-most-once checkout. */
  idemIndex: Map<string, string>;
  seeded: boolean;
};

const DATA_FILE =
  process.env.MH_DATA_FILE?.trim() || join(process.cwd(), "data", "markethub.json");

const GLOBAL_KEY = "__markethub_db__";
const READY_KEY = "__markethub_db_ready__";
const BACKEND_KEY = "__markethub_db_backend__";

function emptyDb(): Db {
  return {
    t: {
      users: new Map(),
      sessions: new Map(),
      vendors: new Map(),
      products: new Map(),
      orders: new Map(),
    },
    emailIndex: new Map(),
    idemIndex: new Map(),
    seeded: false,
  };
}

function hydrate(db: Db, raw: Persisted): void {
  db.t.users.clear();
  db.t.sessions.clear();
  db.t.vendors.clear();
  db.t.products.clear();
  db.t.orders.clear();
  db.emailIndex.clear();
  db.idemIndex.clear();

  for (const u of raw.users ?? []) {
    db.t.users.set(u.id, u);
    db.emailIndex.set(u.email.toLowerCase(), u.id);
  }
  for (const s of raw.sessions ?? []) db.t.sessions.set(s.id, s);
  for (const v of raw.vendors ?? []) db.t.vendors.set(v.id, v);
  for (const p of raw.products ?? []) db.t.products.set(p.id, p);
  for (const o of raw.orders ?? []) {
    db.t.orders.set(o.id, o);
    db.idemIndex.set(o.idempotencyKey, o.id);
  }
  db.seeded = Boolean(raw.seeded);
}

function snapshot(d: Db): Persisted {
  return {
    users: [...d.t.users.values()],
    sessions: [...d.t.sessions.values()],
    vendors: [...d.t.vendors.values()],
    products: [...d.t.products.values()],
    orders: [...d.t.orders.values()],
    seeded: d.seeded,
  };
}

function resolvePersistence(): StorePersistence {
  const url = serverEnv("DATABASE_URL");
  const kind = selectBackend(url);
  if (kind === "postgres" && url) {
    return createPostgresPersistence(createNeonExecutor(url));
  }
  return createJsonPersistence(DATA_FILE);
}

let persistence: StorePersistence | null = null;
function getPersistence(): StorePersistence {
  if (!persistence) {
    persistence = resolvePersistence();
    (globalThis as Record<string, unknown>)[BACKEND_KEY] = persistence.kind;
  }
  return persistence;
}

/** Which backend is active after resolve. Useful for live tests. */
export function storeBackend(): "json" | "postgres" | "unresolved" {
  const g = globalThis as Record<string, unknown>;
  return (g[BACKEND_KEY] as "json" | "postgres" | undefined) ?? "unresolved";
}

/**
 * Async hydration. Idempotent. Must be awaited (via start.ts middleware) before
 * any handler touches `db()` when the Postgres backend is selected.
 * JSON backend stays lazily synchronous via `db()` for the unit suite.
 */
export function ensureStoreReady(): Promise<void> {
  const g = globalThis as Record<string, unknown>;
  const existing = g[READY_KEY] as Promise<void> | undefined;
  if (existing) return existing;

  const ready = (async () => {
    const p = getPersistence();
    if (p.kind === "json") {
      // Keep today's lazy sync load: do not force a disk read here.
      return;
    }
    const raw = await p.load();
    const instance = emptyDb();
    hydrate(instance, raw);
    g[GLOBAL_KEY] = instance;
  })();

  g[READY_KEY] = ready;
  return ready;
}

export function db(): Db {
  const g = globalThis as Record<string, unknown>;
  let instance = g[GLOBAL_KEY] as Db | undefined;
  if (!instance) {
    const p = getPersistence();
    if (p.kind === "postgres") {
      throw new Error(
        "store not ready: ensureStoreReady() must complete before db() on the Postgres backend",
      );
    }
    // JSON path: synchronous load, identical to the pre-Neon behaviour.
    instance = emptyDb();
    try {
      const text = readFileSync(DATA_FILE, "utf8");
      hydrate(instance, JSON.parse(text) as Persisted);
    } catch {
      // No file yet — seed repopulates. Do not log (absolute path leakage).
    }
    g[GLOBAL_KEY] = instance;
  }
  return instance;
}

let persistQueued = false;
let flushInFlight: Promise<void> | null = null;
let dirty = false;

async function flushAsync(): Promise<void> {
  const d = db();
  const p = getPersistence();
  try {
    await p.save(snapshot(d));
  } catch (error) {
    console.error(
      "[db] persist failed",
      redactDbUrl(error instanceof Error ? error.message : "unknown"),
    );
  }
}

function scheduleFlush(): void {
  if (flushInFlight) {
    dirty = true;
    return;
  }
  flushInFlight = flushAsync().finally(() => {
    flushInFlight = null;
    if (dirty) {
      dirty = false;
      scheduleFlush();
    }
  });
}

/**
 * Await the pending flush (and any dirty re-flush). Scripts and live tests use
 * this so the process cannot exit before the write lands.
 */
export async function flushNow(): Promise<void> {
  if (persistQueued) {
    // Force the microtask to run its schedule before we wait.
    persistQueued = false;
    scheduleFlush();
  }
  while (flushInFlight) {
    await flushInFlight;
  }
}

export function persist(): void {
  if (persistQueued) return;
  persistQueued = true;
  queueMicrotask(() => {
    persistQueued = false;
    scheduleFlush();
  });
}

export function tx<T>(fn: () => T): T {
  const result = fn();
  if (result instanceof Promise) {
    throw new Error("tx() callback must be synchronous");
  }
  persist();
  return result;
}

export const newId = (): string => randomUUID();

/** Order ids are random, not sequential, so one order id never reveals another. */
export function newOrderId(): string {
  const d = db();
  for (let i = 0; i < 10; i += 1) {
    const candidate = `MH-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
    if (!d.t.orders.has(candidate)) return candidate;
  }
  throw new Error("could not allocate order id");
}

export const nowIso = (): string => new Date().toISOString();
