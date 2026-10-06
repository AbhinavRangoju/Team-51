/**
 * Neon Postgres persistence backend (HTTP driver only — no Pool/Client/WebSocket).
 *
 * Load: 6 SELECTs + row mappers that coerce string-typed numerics to number
 * (node-postgres-family drivers return int8/numeric as strings).
 *
 * Save: 11 parameterized statements in one transaction — upserts parent-first,
 * deletes child-first — so a mid-flush failure can never empty the catalogue.
 * Never calls sql.unsafe(). Never interpolates values into statement text.
 */

import type {
  OrderItemRow,
  OrderRow,
  ProductRow,
  SessionRow,
  UserRow,
  VendorRow,
} from "./db";
import type { Persisted, SqlExecutor, StorePersistence } from "./store-types";
import { redactDbUrl } from "./store-types";

function num(v: unknown): number {
  return Number(v);
}

function mapUser(r: Record<string, unknown>): UserRow {
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    phone: r.phone == null ? null : String(r.phone),
    passwordHash: String(r.password_hash),
    passwordSalt: String(r.password_salt),
    role: r.role as UserRow["role"],
    status: r.status as UserRow["status"],
    createdAt: String(r.created_at),
  };
}

function mapSession(r: Record<string, unknown>): SessionRow {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    expiresAt: num(r.expires_at),
    createdAt: String(r.created_at),
  };
}

function mapVendor(r: Record<string, unknown>): VendorRow {
  return {
    id: String(r.id),
    userId: r.user_id == null ? null : String(r.user_id),
    name: String(r.name),
    tagline: String(r.tagline),
    city: String(r.city),
    since: num(r.since),
    status: r.status as VendorRow["status"],
    verified: Boolean(r.verified),
    rating: num(r.rating),
    createdAt: String(r.created_at),
  };
}

function mapProduct(r: Record<string, unknown>): ProductRow {
  const specsRaw = r.specs;
  const specs =
    specsRaw && typeof specsRaw === "object" && !Array.isArray(specsRaw)
      ? (specsRaw as Record<string, string>)
      : {};
  return {
    id: String(r.id),
    vendorId: String(r.vendor_id),
    name: String(r.name),
    category: String(r.category),
    brand: String(r.brand),
    pricePaise: num(r.price_paise),
    originalPricePaise:
      r.original_price_paise == null ? null : num(r.original_price_paise),
    stock: num(r.stock),
    rating: num(r.rating),
    reviews: num(r.reviews),
    sku: String(r.sku),
    status: r.status as ProductRow["status"],
    description: String(r.description),
    specs,
    createdAt: String(r.created_at),
  };
}

function mapOrder(r: Record<string, unknown>): OrderRow {
  const itemsRaw = r.items;
  const items = Array.isArray(itemsRaw)
    ? (itemsRaw as OrderItemRow[])
    : typeof itemsRaw === "string"
      ? (JSON.parse(itemsRaw) as OrderItemRow[])
      : [];
  return {
    id: String(r.id),
    userId: String(r.user_id),
    items,
    subtotalPaise: num(r.subtotal_paise),
    discountPaise: num(r.discount_paise),
    deliveryPaise: num(r.delivery_paise),
    taxPaise: num(r.tax_paise),
    totalPaise: num(r.total_paise),
    status: r.status as OrderRow["status"],
    payment: r.payment as OrderRow["payment"],
    method: String(r.method),
    eta: String(r.eta),
    shipName: String(r.ship_name),
    shipPhone: String(r.ship_phone),
    shipLine: String(r.ship_line),
    shipCity: String(r.ship_city),
    shipPin: String(r.ship_pin),
    idempotencyKey: String(r.idempotency_key),
    createdAt: String(r.created_at),
  };
}

/** Exported for unit tests that feed string-typed driver rows. */
export function mapRowsFromDriver(raw: {
  users: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  vendors: Record<string, unknown>[];
  products: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  seeded: boolean;
}): Persisted {
  return {
    users: raw.users.map(mapUser),
    sessions: raw.sessions.map(mapSession),
    vendors: raw.vendors.map(mapVendor),
    products: raw.products.map(mapProduct),
    orders: raw.orders.map(mapOrder),
    seeded: raw.seeded,
  };
}

function userPayload(u: UserRow) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    password_hash: u.passwordHash,
    password_salt: u.passwordSalt,
    role: u.role,
    status: u.status,
    created_at: u.createdAt,
  };
}

function sessionPayload(s: SessionRow) {
  return {
    id: s.id,
    user_id: s.userId,
    expires_at: s.expiresAt,
    created_at: s.createdAt,
  };
}

function vendorPayload(v: VendorRow) {
  return {
    id: v.id,
    user_id: v.userId,
    name: v.name,
    tagline: v.tagline,
    city: v.city,
    since: v.since,
    status: v.status,
    verified: v.verified,
    rating: v.rating,
    created_at: v.createdAt,
  };
}

function productPayload(p: ProductRow) {
  return {
    id: p.id,
    vendor_id: p.vendorId,
    name: p.name,
    category: p.category,
    brand: p.brand,
    price_paise: p.pricePaise,
    original_price_paise: p.originalPricePaise,
    stock: p.stock,
    rating: p.rating,
    reviews: p.reviews,
    sku: p.sku,
    status: p.status,
    description: p.description,
    specs: p.specs,
    created_at: p.createdAt,
  };
}

function orderPayload(o: OrderRow) {
  return {
    id: o.id,
    user_id: o.userId,
    items: o.items,
    subtotal_paise: o.subtotalPaise,
    discount_paise: o.discountPaise,
    delivery_paise: o.deliveryPaise,
    tax_paise: o.taxPaise,
    total_paise: o.totalPaise,
    status: o.status,
    payment: o.payment,
    method: o.method,
    eta: o.eta,
    ship_name: o.shipName,
    ship_phone: o.shipPhone,
    ship_line: o.shipLine,
    ship_city: o.shipCity,
    ship_pin: o.shipPin,
    idempotency_key: o.idempotencyKey,
    created_at: o.createdAt,
  };
}

/** Build the constant 11-statement flush. Exported for mocked-executor tests. */
export function buildFlushStatements(snapshot: Persisted): {
  text: string;
  params: unknown[];
}[] {
  const userIds = snapshot.users.map((u) => u.id);
  const vendorIds = snapshot.vendors.map((v) => v.id);
  const productIds = snapshot.products.map((p) => p.id);
  const orderIds = snapshot.orders.map((o) => o.id);
  const sessionIds = snapshot.sessions.map((s) => s.id);

  return [
    {
      text: `INSERT INTO mh_users (id, email, name, phone, password_hash, password_salt, role, status, created_at)
SELECT r.id, r.email, r.name, r.phone, r.password_hash, r.password_salt, r.role, r.status, r.created_at
FROM jsonb_to_recordset($1::jsonb) AS r(
  id text, email text, name text, phone text, password_hash text, password_salt text,
  role text, status text, created_at text)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email, name = EXCLUDED.name, phone = EXCLUDED.phone,
  password_hash = EXCLUDED.password_hash, password_salt = EXCLUDED.password_salt,
  role = EXCLUDED.role, status = EXCLUDED.status, created_at = EXCLUDED.created_at`,
      params: [JSON.stringify(snapshot.users.map(userPayload))],
    },
    {
      text: `INSERT INTO mh_vendors (id, user_id, name, tagline, city, since, status, verified, rating, created_at)
SELECT r.id, r.user_id, r.name, r.tagline, r.city, r.since, r.status, r.verified, r.rating, r.created_at
FROM jsonb_to_recordset($1::jsonb) AS r(
  id text, user_id text, name text, tagline text, city text, since integer,
  status text, verified boolean, rating double precision, created_at text)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, name = EXCLUDED.name, tagline = EXCLUDED.tagline,
  city = EXCLUDED.city, since = EXCLUDED.since, status = EXCLUDED.status,
  verified = EXCLUDED.verified, rating = EXCLUDED.rating, created_at = EXCLUDED.created_at`,
      params: [JSON.stringify(snapshot.vendors.map(vendorPayload))],
    },
    {
      text: `INSERT INTO mh_products (id, vendor_id, name, category, brand, price_paise,
  original_price_paise, stock, rating, reviews, sku, status, description, specs, created_at)
SELECT r.id, r.vendor_id, r.name, r.category, r.brand, r.price_paise,
  r.original_price_paise, r.stock, r.rating, r.reviews, r.sku, r.status,
  r.description, r.specs, r.created_at
FROM jsonb_to_recordset($1::jsonb) AS r(
  id text, vendor_id text, name text, category text, brand text,
  price_paise integer, original_price_paise integer, stock integer,
  rating double precision, reviews integer, sku text, status text,
  description text, specs jsonb, created_at text)
ON CONFLICT (id) DO UPDATE SET
  vendor_id = EXCLUDED.vendor_id, name = EXCLUDED.name, category = EXCLUDED.category,
  brand = EXCLUDED.brand, price_paise = EXCLUDED.price_paise,
  original_price_paise = EXCLUDED.original_price_paise, stock = EXCLUDED.stock,
  rating = EXCLUDED.rating, reviews = EXCLUDED.reviews, sku = EXCLUDED.sku,
  status = EXCLUDED.status, description = EXCLUDED.description,
  specs = EXCLUDED.specs, created_at = EXCLUDED.created_at`,
      params: [JSON.stringify(snapshot.products.map(productPayload))],
    },
    {
      text: `INSERT INTO mh_orders (id, user_id, items, subtotal_paise, discount_paise, delivery_paise,
  tax_paise, total_paise, status, payment, method, eta, ship_name, ship_phone,
  ship_line, ship_city, ship_pin, idempotency_key, created_at)
SELECT r.id, r.user_id, r.items, r.subtotal_paise, r.discount_paise, r.delivery_paise,
  r.tax_paise, r.total_paise, r.status, r.payment, r.method, r.eta, r.ship_name,
  r.ship_phone, r.ship_line, r.ship_city, r.ship_pin, r.idempotency_key, r.created_at
FROM jsonb_to_recordset($1::jsonb) AS r(
  id text, user_id text, items jsonb, subtotal_paise integer, discount_paise integer,
  delivery_paise integer, tax_paise integer, total_paise integer, status text,
  payment text, method text, eta text, ship_name text, ship_phone text,
  ship_line text, ship_city text, ship_pin text, idempotency_key text, created_at text)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, items = EXCLUDED.items,
  subtotal_paise = EXCLUDED.subtotal_paise, discount_paise = EXCLUDED.discount_paise,
  delivery_paise = EXCLUDED.delivery_paise, tax_paise = EXCLUDED.tax_paise,
  total_paise = EXCLUDED.total_paise, status = EXCLUDED.status, payment = EXCLUDED.payment,
  method = EXCLUDED.method, eta = EXCLUDED.eta, ship_name = EXCLUDED.ship_name,
  ship_phone = EXCLUDED.ship_phone, ship_line = EXCLUDED.ship_line,
  ship_city = EXCLUDED.ship_city, ship_pin = EXCLUDED.ship_pin,
  idempotency_key = EXCLUDED.idempotency_key, created_at = EXCLUDED.created_at`,
      params: [JSON.stringify(snapshot.orders.map(orderPayload))],
    },
    {
      text: `INSERT INTO mh_sessions (id, user_id, expires_at, created_at)
SELECT r.id, r.user_id, r.expires_at, r.created_at
FROM jsonb_to_recordset($1::jsonb) AS r(
  id text, user_id text, expires_at bigint, created_at text)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, expires_at = EXCLUDED.expires_at, created_at = EXCLUDED.created_at`,
      params: [JSON.stringify(snapshot.sessions.map(sessionPayload))],
    },
    {
      text: `INSERT INTO mh_meta (key, value) VALUES ('seeded', $1)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      params: [snapshot.seeded ? "true" : "false"],
    },
    // Deletes child-first so FKs stay happy.
    {
      text: `DELETE FROM mh_sessions WHERE id <> ALL($1::text[])`,
      params: [sessionIds],
    },
    {
      text: `DELETE FROM mh_orders WHERE id <> ALL($1::text[])`,
      params: [orderIds],
    },
    {
      text: `DELETE FROM mh_products WHERE id <> ALL($1::text[])`,
      params: [productIds],
    },
    {
      text: `DELETE FROM mh_vendors WHERE id <> ALL($1::text[])`,
      params: [vendorIds],
    },
    {
      text: `DELETE FROM mh_users WHERE id <> ALL($1::text[])`,
      params: [userIds],
    },
  ];
}

export function createNeonExecutor(connectionString: string): SqlExecutor {
  // Dynamic import keeps the driver out of any accidental client graph analysis.
  let sqlPromise: Promise<
    ReturnType<typeof import("@neondatabase/serverless").neon>
  > | null = null;

  async function getSql() {
    if (!sqlPromise) {
      sqlPromise = import("@neondatabase/serverless").then(({ neon }) =>
        neon(connectionString),
      );
    }
    return sqlPromise;
  }

  function isTransient(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return /fetch failed|ECONNRESET|ETIMEDOUT|socket|network/i.test(msg);
  }

  async function queryOnce(
    text: string,
    params: unknown[],
  ): Promise<Record<string, unknown>[]> {
    const sql = await getSql();
    let last: unknown;
    for (let i = 0; i < 4; i += 1) {
      try {
        return (await sql.query(text, params)) as Record<string, unknown>[];
      } catch (err) {
        last = err;
        if (!isTransient(err) || i === 3) throw err;
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      }
    }
    throw last;
  }

  return {
    async query(text, params) {
      return queryOnce(text, params);
    },
    async transaction(items) {
      const sql = await getSql();
      try {
        return (await sql.transaction(
          items.map((it) => sql.query(it.text, it.params)),
        )) as unknown[];
      } catch (err) {
        console.warn(
          "[db] transaction batch failed; retrying sequentially:",
          redactDbUrl(err instanceof Error ? err.message : "unknown"),
        );
        const out: unknown[] = [];
        for (const it of items) {
          out.push(await queryOnce(it.text, it.params));
        }
        return out;
      }
    },
  };
}

export function createPostgresPersistence(exec: SqlExecutor): StorePersistence {
  return {
    kind: "postgres",

    async load(): Promise<Persisted> {
      // Sequential SELECTs — more reliable than Promise.all over a flaky HTTP link.
      const users = await exec.query(
        `SELECT id, email, name, phone, password_hash, password_salt, role, status, created_at FROM mh_users`,
        [],
      );
      const sessions = await exec.query(
        `SELECT id, user_id, expires_at, created_at FROM mh_sessions`,
        [],
      );
      const vendors = await exec.query(
        `SELECT id, user_id, name, tagline, city, since, status, verified, rating, created_at FROM mh_vendors`,
        [],
      );
      const products = await exec.query(
        `SELECT id, vendor_id, name, category, brand, price_paise, original_price_paise,
                stock, rating, reviews, sku, status, description, specs, created_at FROM mh_products`,
        [],
      );
      const orders = await exec.query(
        `SELECT id, user_id, items, subtotal_paise, discount_paise, delivery_paise, tax_paise,
                total_paise, status, payment, method, eta, ship_name, ship_phone, ship_line,
                ship_city, ship_pin, idempotency_key, created_at FROM mh_orders`,
        [],
      );
      const meta = await exec.query(`SELECT value FROM mh_meta WHERE key = 'seeded'`, []);

      return mapRowsFromDriver({
        users,
        sessions,
        vendors,
        products,
        orders,
        seeded: meta[0]?.value === "true",
      });
    },

    async save(snapshot: Persisted): Promise<void> {
      const statements = buildFlushStatements(snapshot);
      await exec.transaction(statements);
    },
  };
}
