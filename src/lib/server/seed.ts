/**
 * One-time import of the existing catalogue into the store.
 *
 * src/lib/data.ts stays exactly where it is and keeps its job of supplying
 * product imagery and category art to the client — those are Vite asset imports
 * and cannot live in a data row. What moves server-side is everything a request
 * must not be trusted to assert: prices, stock, ownership, roles, order state.
 *
 * Runs once, guarded by a `seeded` flag that is persisted with the data, so a
 * restart does not duplicate rows or reset stock that real orders have already
 * decremented.
 *
 * DEMO CREDENTIALS
 * Seeded accounts need a password to be usable in a demo. It is read from
 * MH_SEED_PASSWORD and falls back to a documented default. This is acceptable
 * only because every seeded account is fictional sample data. The admin account
 * is deliberately different: it is created ONLY when MH_ADMIN_PASSWORD is set,
 * so a deployment never ships a privileged account with a guessable password.
 */

import {
  customers,
  products as seedProducts,
  seedOrders,
  vendorOrders,
  vendors as seedVendors,
  type Order as SeedOrder,
} from "@/lib/data";

import {
  db,
  newId,
  nowIso,
  persist,
  type OrderItemRow,
  type OrderRow,
  type ProductRow,
  type UserRow,
  type VendorRow,
} from "./db";
import { hashPassword } from "./password";
import { quote } from "./pricing";

const DEMO_PASSWORD = process.env.MH_SEED_PASSWORD?.trim() || "Demo@1234";

const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);

function makeUser(
  email: string,
  name: string,
  role: UserRow["role"],
  plain: string,
  status: UserRow["status"] = "Active",
): UserRow {
  const { hash, salt } = hashPassword(plain);
  return {
    id: newId(),
    email: email.toLowerCase(),
    name,
    phone: null,
    passwordHash: hash,
    passwordSalt: salt,
    role,
    status,
    createdAt: nowIso(),
  };
}

function insertUser(user: UserRow): UserRow {
  const d = db();
  d.t.users.set(user.id, user);
  d.emailIndex.set(user.email, user.id);
  return user;
}

/**
 * Rebuilds a seeded order through the real pricing path.
 *
 * The seed's hardcoded `total` fields were authored by hand and do not include
 * GST or delivery, so trusting them would mean the demo's order history
 * contradicts what checkout now charges. Recomputing keeps one pricing rule in
 * the system.
 */
function convertOrder(src: SeedOrder, userId: string, byProductId: Map<string, ProductRow>): OrderRow | null {
  const lines = src.items
    .map((i) => {
      const product = byProductId.get(i.productId);
      return product ? { product, qty: i.qty } : null;
    })
    .filter((l): l is { product: ProductRow; qty: number } => l !== null);

  if (!lines.length) return null;

  const q = quote(lines, "std");
  const items: OrderItemRow[] = q.lines.map((l) => ({
    productId: l.productId,
    vendorId: l.vendorId,
    qty: l.qty,
    unitPricePaise: l.unitPricePaise,
    unitMrpPaise: l.unitMrpPaise,
    nameSnapshot: l.name,
  }));

  return {
    id: src.id,
    userId,
    items,
    subtotalPaise: q.subtotalPaise,
    discountPaise: q.discountPaise,
    deliveryPaise: q.deliveryPaise,
    taxPaise: q.taxPaise,
    totalPaise: q.totalPaise,
    status: src.status,
    payment: src.payment,
    method: src.method,
    eta: src.eta,
    shipName: src.customer,
    // Seeded shipping details are intentionally coarse. The seed only carries a
    // display string, and inventing a precise postal address for a fictional
    // person would put fake PII in the store for no benefit.
    shipPhone: "0000000000",
    shipLine: src.address,
    shipCity: src.address.split(",").pop()?.trim() ?? src.address,
    shipPin: "000000",
    idempotencyKey: `seed:${src.id}`,
    createdAt: new Date(`${src.date}T12:00:00.000Z`).toISOString(),
  };
}

export function seedIfEmpty(): void {
  const d = db();
  if (d.seeded) return;

  // ---- vendors, each paired with a seller login ----
  const vendorRowById = new Map<string, VendorRow>();
  for (const v of seedVendors) {
    const owner = insertUser(makeUser(v.email, v.owner, "vendor", DEMO_PASSWORD));
    const row: VendorRow = {
      id: v.id,
      userId: owner.id,
      name: v.name,
      tagline: v.tagline,
      city: v.city,
      since: v.since,
      status: v.status,
      verified: v.verified,
      rating: v.rating,
      createdAt: nowIso(),
    };
    d.t.vendors.set(row.id, row);
    vendorRowById.set(row.id, row);
  }

  // ---- products ----
  const byProductId = new Map<string, ProductRow>();
  for (const p of seedProducts) {
    if (!vendorRowById.has(p.vendorId)) continue;
    const row: ProductRow = {
      id: p.id,
      vendorId: p.vendorId,
      name: p.name,
      category: p.category,
      brand: p.brand,
      pricePaise: rupeesToPaise(p.price),
      originalPricePaise: p.originalPrice ? rupeesToPaise(p.originalPrice) : null,
      stock: p.stock,
      rating: p.rating,
      reviews: p.reviews,
      sku: p.sku,
      status: p.status,
      description: p.description,
      specs: p.specs,
      createdAt: p.createdAt,
    };
    d.t.products.set(row.id, row);
    byProductId.set(row.id, row);
  }

  // ---- shoppers ----
  const userIdByName = new Map<string, string>();
  for (const c of customers) {
    const user = insertUser(
      makeUser(
        c.email,
        c.name,
        "customer",
        DEMO_PASSWORD,
        c.status === "Suspended" ? "Suspended" : "Active",
      ),
    );
    userIdByName.set(c.name.toLowerCase(), user.id);
  }

  // ---- admin, only when a password was supplied ----
  const adminPassword = process.env.MH_ADMIN_PASSWORD?.trim();
  if (adminPassword) {
    insertUser(makeUser("admin@markethub.local", "MarketHub Admin", "admin", adminPassword));
  }

  // ---- order history ----
  // Both seed arrays are keyed by customer display name, which is the only link
  // the original data provides. Orders whose shopper cannot be resolved are
  // skipped rather than attached to an arbitrary account.
  for (const src of [...seedOrders, ...vendorOrders]) {
    if (d.t.orders.has(src.id)) continue;
    const userId = userIdByName.get(src.customer.toLowerCase());
    if (!userId) continue;
    const row = convertOrder(src, userId, byProductId);
    if (!row) continue;
    d.t.orders.set(row.id, row);
    d.idemIndex.set(row.idempotencyKey, row.id);
  }

  d.seeded = true;
  persist();
}
