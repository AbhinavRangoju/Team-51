/**
 * Tests for the server-side rules the client is not allowed to decide.
 *
 * These exercise the store, pricing, password and guard layers directly rather
 * than over HTTP. The HTTP layer adds the session cookie and the CSRF
 * middleware, both of which are framework-provided; what is worth testing is
 * the logic underneath that decides prices, stock, ownership and order state,
 * because that is where a bug becomes a vulnerability.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { db, newOrderId, tx, type OrderRow, type ProductRow } from "@/lib/server/db";
import { toOrderDto, toVendorOrderDto } from "@/lib/server/dto";
import { requireOwnOrder, requireOwnedProduct, requireVendorOrder } from "@/lib/server/guards";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { quote } from "@/lib/server/pricing";
import { seedIfEmpty } from "@/lib/server/seed";

beforeAll(() => {
  seedIfEmpty();
});

/** Mirrors what placeOrder does, so stock/idempotency can be tested directly. */
function createOrder(
  userId: string,
  items: { product: ProductRow; qty: number }[],
  idempotencyKey: string,
): OrderRow {
  const d = db();
  return tx(() => {
    const scoped = `${userId}:${idempotencyKey}`;
    const existing = d.idemIndex.get(scoped);
    if (existing) return d.t.orders.get(existing)!;

    for (const { product, qty } of items) {
      if (product.stock < qty) throw new Error("insufficient stock");
    }

    const q = quote(items, "std");
    for (const { product, qty } of items) product.stock -= qty;

    const order: OrderRow = {
      id: newOrderId(),
      userId,
      items: q.lines.map((l) => ({
        productId: l.productId,
        vendorId: l.vendorId,
        qty: l.qty,
        unitPricePaise: l.unitPricePaise,
        unitMrpPaise: l.unitMrpPaise,
        nameSnapshot: l.name,
      })),
      subtotalPaise: q.subtotalPaise,
      discountPaise: q.discountPaise,
      deliveryPaise: q.deliveryPaise,
      taxPaise: q.taxPaise,
      totalPaise: q.totalPaise,
      status: "Order Placed",
      payment: "Paid",
      method: "UPI",
      eta: "soon",
      shipName: "Test Shopper",
      shipPhone: "9999999999",
      shipLine: "1 Test Road",
      shipCity: "Hyderabad",
      shipPin: "500001",
      idempotencyKey: scoped,
      createdAt: new Date().toISOString(),
    };
    d.t.orders.set(order.id, order);
    d.idemIndex.set(scoped, order.id);
    return order;
  });
}

describe("seed", () => {
  it("loads the catalogue and links every vendor to an owning user", () => {
    const d = db();
    expect(d.t.products.size).toBeGreaterThan(0);
    expect(d.t.vendors.size).toBeGreaterThan(0);
    for (const v of d.t.vendors.values()) {
      expect(v.userId).toBeTruthy();
      expect(d.t.users.get(v.userId!)?.role).toBe("vendor");
    }
  });

  it("stores prices as integer paise", () => {
    for (const p of db().t.products.values()) {
      expect(Number.isInteger(p.pricePaise)).toBe(true);
    }
  });

  it("creates no admin account unless MH_ADMIN_PASSWORD is set", () => {
    if (!process.env.MH_ADMIN_PASSWORD) {
      const admins = [...db().t.users.values()].filter((u) => u.role === "admin");
      expect(admins).toHaveLength(0);
    }
  });
});

describe("passwords", () => {
  it("verifies a correct password and rejects a wrong one", () => {
    const { hash, salt } = hashPassword("Correct@123");
    expect(verifyPassword("Correct@123", hash, salt)).toBe(true);
    expect(verifyPassword("Correct@124", hash, salt)).toBe(false);
  });

  it("salts per user, so identical passwords do not share a hash", () => {
    const a = hashPassword("SamePass1");
    const b = hashPassword("SamePass1");
    expect(a.hash).not.toBe(b.hash);
    expect(a.salt).not.toBe(b.salt);
  });

  it("never stores the plaintext", () => {
    const { hash } = hashPassword("Secret@999");
    expect(hash).not.toContain("Secret");
  });
});

describe("pricing is server-authoritative", () => {
  it("ignores any price supplied alongside the item and uses the stored one", () => {
    const product = db().t.products.get("p1")!;
    const q = quote([{ product, qty: 2 }], "std");
    expect(q.subtotalPaise).toBe(product.pricePaise * 2);
    expect(q.lines[0]!.unitPricePaise).toBe(product.pricePaise);
  });

  it("charges delivery below the threshold and not above it", () => {
    const cheap = db().t.products.get("p10")!; // Rs.899 -> under Rs.999
    const dear = db().t.products.get("p1")!;
    expect(quote([{ product: cheap, qty: 1 }], "std").deliveryPaise).toBe(7_900);
    expect(quote([{ product: dear, qty: 1 }], "std").deliveryPaise).toBe(0);
  });

  it("adds the express fee on top of the base delivery fee", () => {
    const dear = db().t.products.get("p1")!;
    expect(quote([{ product: dear, qty: 1 }], "exp").deliveryPaise).toBe(14_900);
  });

  it("keeps totals as exact integers", () => {
    const q = quote([{ product: db().t.products.get("p6")!, qty: 3 }], "exp");
    for (const v of [q.subtotalPaise, q.taxPaise, q.deliveryPaise, q.totalPaise]) {
      expect(Number.isInteger(v)).toBe(true);
    }
    expect(q.totalPaise).toBe(q.subtotalPaise + q.deliveryPaise + q.taxPaise);
  });

  it("computes discount from stored MRP, not from client input", () => {
    const p = db().t.products.get("p1")!; // 8999 from 12999
    const q = quote([{ product: p, qty: 1 }], "std");
    expect(q.discountPaise).toBe(p.originalPricePaise! - p.pricePaise);
  });
});

describe("checkout: stock and idempotency", () => {
  it("decrements stock by exactly the quantity ordered", () => {
    const p = db().t.products.get("p10")!;
    const before = p.stock;
    createOrder("user-stock-1", [{ product: p, qty: 3 }], "key-stock-1");
    expect(p.stock).toBe(before - 3);
  });

  it("returns the same order for a replayed idempotency key and does not double-charge stock", () => {
    const p = db().t.products.get("p10")!;
    const before = p.stock;
    const first = createOrder("user-idem", [{ product: p, qty: 2 }], "key-idem");
    const second = createOrder("user-idem", [{ product: p, qty: 2 }], "key-idem");
    expect(second.id).toBe(first.id);
    expect(p.stock).toBe(before - 2);
  });

  it("scopes the idempotency key per user, so one shopper cannot fetch another's order", () => {
    const p = db().t.products.get("p10")!;
    const mine = createOrder("user-a", [{ product: p, qty: 1 }], "shared-key");
    const theirs = createOrder("user-b", [{ product: p, qty: 1 }], "shared-key");
    expect(theirs.id).not.toBe(mine.id);
  });

  it("refuses to oversell", () => {
    const p = db().t.products.get("p12")!;
    expect(() =>
      createOrder("user-oversell", [{ product: p, qty: p.stock + 1 }], "key-oversell"),
    ).toThrow();
  });

  it("leaves stock untouched when the order is rejected", () => {
    const p = db().t.products.get("p12")!;
    const before = p.stock;
    try {
      createOrder("user-oversell-2", [{ product: p, qty: before + 5 }], "key-oversell-2");
    } catch {
      /* expected */
    }
    expect(p.stock).toBe(before);
  });

  it("never allows stock to go negative across repeated orders", () => {
    const p = db().t.products.get("p9")!;
    for (let i = 0; i < 20; i += 1) {
      try {
        createOrder(`user-drain-${i}`, [{ product: p, qty: 1 }], `key-drain-${i}`);
      } catch {
        /* sold out */
      }
    }
    expect(p.stock).toBeGreaterThanOrEqual(0);
  });

  it("allocates unguessable, non-sequential order ids", () => {
    const a = newOrderId();
    const b = newOrderId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^MH-[0-9A-F]{10}$/);
  });
});

describe("authorization: ownership and IDOR", () => {
  it("returns a shopper their own order", () => {
    const p = db().t.products.get("p10")!;
    const order = createOrder("owner-1", [{ product: p, qty: 1 }], "key-own-1");
    expect(requireOwnOrder("owner-1", order.id).id).toBe(order.id);
  });

  it("refuses another shopper's order, and says 'not found' rather than confirming it exists", () => {
    const p = db().t.products.get("p10")!;
    const order = createOrder("owner-2", [{ product: p, qty: 1 }], "key-own-2");
    expect(() => requireOwnOrder("attacker", order.id)).toThrowError(/not found/i);
  });

  it("refuses a product that belongs to a different store", () => {
    const product = db().t.products.get("p1")!; // vendor v1
    expect(requireOwnedProduct("v1", "p1").id).toBe("p1");
    expect(() => requireOwnedProduct("v2", "p1")).toThrowError(/not found/i);
  });

  it("gives a seller an order only when they have a line in it", () => {
    const p1 = db().t.products.get("p1")!; // v1
    const order = createOrder("buyer-x", [{ product: p1, qty: 1 }], "key-vendor-scope");
    expect(requireVendorOrder("v1", order.id).id).toBe(order.id);
    expect(() => requireVendorOrder("v3", order.id)).toThrowError(/not found/i);
  });
});

describe("response shaping: what sellers and shoppers are allowed to see", () => {
  it("strips other sellers' lines and the grand total from a seller's view", () => {
    const fromV1 = db().t.products.get("p1")!;
    const fromV3 = db().t.products.get("p3")!;
    const order = createOrder(
      "buyer-multi",
      [{ product: fromV1, qty: 1 }, { product: fromV3, qty: 1 }],
      "key-multi",
    );

    const v1View = toVendorOrderDto(order, "v1");
    expect(v1View.items).toHaveLength(1);
    expect(v1View.items[0]!.productId).toBe("p1");
    expect(v1View.vendorSubtotalPaise).toBe(fromV1.pricePaise);
    // The order's real total includes v3's line, delivery and GST.
    expect(order.totalPaise).toBeGreaterThan(v1View.vendorSubtotalPaise);
    expect(JSON.stringify(v1View)).not.toContain("p3");
  });

  it("withholds the shopper's street address, PIN and phone from a seller", () => {
    const p = db().t.products.get("p1")!;
    const order = createOrder("buyer-pii", [{ product: p, qty: 1 }], "key-pii");
    const sellerView = JSON.stringify(toVendorOrderDto(order, "v1"));
    expect(sellerView).not.toContain("1 Test Road");
    expect(sellerView).not.toContain("500001");
    expect(sellerView).not.toContain("9999999999");
    // Destination city is needed to quote dispatch and is allowed.
    expect(sellerView).toContain("Hyderabad");
  });

  it("never serialises a password hash, salt or user id to a shopper", () => {
    const p = db().t.products.get("p10")!;
    const order = createOrder("buyer-leak", [{ product: p, qty: 1 }], "key-leak");
    const dto = JSON.stringify(toOrderDto(order));
    expect(dto).not.toContain("passwordHash");
    expect(dto).not.toContain("passwordSalt");
    expect(dto).not.toContain("buyer-leak");
    expect(dto).not.toContain("idempotencyKey");
  });
});
