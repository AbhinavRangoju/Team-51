/**
 * MarketHub server-side data store — the single source of truth.
 *
 * WHY NOT SQLITE
 * This machine runs Node 20, which has no `node:sqlite`, and `better-sqlite3`
 * needs a native toolchain build that is not available here. Rather than ship a
 * dependency that may not compile on a teammate's machine hours before the code
 * freeze, the store is hand-written with zero dependencies.
 *
 * HOW ATOMICITY IS GUARANTEED
 * Node runs one thread. A *synchronous* function therefore runs to completion
 * before any other request handler is allowed to resume — there is no point at
 * which two checkouts can interleave. `tx()` exists to make that contract
 * explicit and to forbid `await` inside a critical section, which is the only
 * way the guarantee could be broken.
 *
 * Because there is no rollback, every mutation follows validate-then-mutate:
 * all checks run first and throw, then the writes happen and cannot fail. That
 * is the same end state a SQL transaction would leave behind.
 *
 * WHAT IS ENFORCED HERE, NOT BY THE CLIENT
 * Unique email, unique order idempotency key, non-negative stock, role values,
 * and vendor->product ownership. A request body can never set any of them.
 *
 * MONEY
 * Every amount is an integer number of paise. Rupee floats (`price * 0.05`)
 * drift and stop reconciling; integers do not. Formatting back to rupees is the
 * client's job.
 *
 * This module must never reach the browser. It is only ever pulled in by
 * `await import()` from inside a server function handler.
 */

import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

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

export type VendorStatus = "Verified" | "Pending Verification" | "Rejected" | "Suspended";

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

/**
 * Overridable so tests get a scratch file instead of the real one, and so a
 * deployment can point the store at a mounted volume rather than the bundle
 * directory.
 */
const DATA_FILE =
  process.env.MH_DATA_FILE?.trim() || join(process.cwd(), "data", "markethub.json");

/**
 * Held on globalThis so the Vite dev server's module reloading cannot create a
 * second store and silently split the data in half.
 */
const GLOBAL_KEY = "__markethub_db__";

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

type Persisted = {
  users: UserRow[];
  sessions: SessionRow[];
  vendors: VendorRow[];
  products: ProductRow[];
  orders: OrderRow[];
  seeded: boolean;
};

function hydrate(db: Db, raw: Persisted): void {
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

function loadFromDisk(): Db {
  const db = emptyDb();
  try {
    const text = readFileSync(DATA_FILE, "utf8");
    hydrate(db, JSON.parse(text) as Persisted);
  } catch {
    // No file yet, or an unreadable one. Either way we start clean; the seed
    // step repopulates the catalogue. Deliberately not logging the raw error,
    // which would put an absolute filesystem path into the server log.
  }
  return db;
}

export function db(): Db {
  const g = globalThis as Record<string, unknown>;
  let instance = g[GLOBAL_KEY] as Db | undefined;
  if (!instance) {
    instance = loadFromDisk();
    g[GLOBAL_KEY] = instance;
  }
  return instance;
}

let persistQueued = false;

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

/**
 * Write-then-rename, so a crash mid-write cannot leave a truncated JSON file
 * where the catalogue used to be. Coalesced onto the next microtask because a
 * single checkout touches several tables and only needs one flush.
 */
function flush(): void {
  const d = db();
  try {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(snapshot(d)), "utf8");
    renameSync(tmp, DATA_FILE);
  } catch (error) {
    // Durability is best-effort; losing the flush must not fail the request
    // that already succeeded in memory.
    console.error("[db] persist failed", error instanceof Error ? error.message : "unknown");
  }
}

export function persist(): void {
  if (persistQueued) return;
  persistQueued = true;
  queueMicrotask(() => {
    persistQueued = false;
    flush();
  });
}

/**
 * Runs a critical section.
 *
 * `fn` MUST be synchronous. That is the whole point: no `await` means no
 * suspension point, which means no other request can observe or modify the
 * tables halfway through. Stock checks and the idempotency check are only sound
 * because of this.
 */
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
