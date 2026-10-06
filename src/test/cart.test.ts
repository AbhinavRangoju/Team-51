import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { validateAddCartItem, validateRemoveCartItem, validateSetCartItemQuantity } from "@/lib/api/cart";
import { cartItemKey, db } from "@/lib/server/db";
import { toCartDto } from "@/lib/server/dto";
import { isPurchasableProduct, isSellableProduct, requireOwnCartItem } from "@/lib/server/guards";
import { seedIfEmpty } from "@/lib/server/seed";

beforeAll(() => {
  seedIfEmpty();
});

afterEach(() => {
  db().t.cartItems.clear();
});

const ownLine = {
  userId: "cart-owner-a",
  productId: "p1",
  quantity: 2,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("persistent cart ownership", () => {
  it("uses a user-scoped composite key and rejects another user's product id", () => {
    db().t.cartItems.set(cartItemKey(ownLine.userId, ownLine.productId), ownLine);
    expect(requireOwnCartItem("cart-owner-a", "p1")).toEqual(ownLine);
    expect(() => requireOwnCartItem("cart-owner-b", "p1")).toThrow(/not found/i);
  });

  it("has no cart row until an authenticated user owns one", () => {
    expect(() => requireOwnCartItem("cart-owner-a", "p1")).toThrow(/not found/i);
  });
});

describe("cart input validation", () => {
  it("accepts only product id and quantity in the server-approved range", () => {
    expect(validateAddCartItem({ productId: "p1", quantity: 1 })).toEqual({ productId: "p1", quantity: 1 });
    expect(validateSetCartItemQuantity({ productId: "p1", quantity: 20 })).toEqual({ productId: "p1", quantity: 20 });
    expect(validateRemoveCartItem({ productId: "p1" })).toEqual({ productId: "p1" });
    expect(() => validateAddCartItem({ productId: "p1", quantity: 0 })).toThrow();
    expect(() => validateAddCartItem({ productId: "p1", quantity: 21 })).toThrow();
    expect(() => validateSetCartItemQuantity({ productId: "p1", quantity: 1.5 })).toThrow();
  });

  it("rejects user, vendor, price, stock and total mass-assignment fields", () => {
    for (const key of ["userId", "vendorId", "pricePaise", "stock", "totalPaise", "status"] as const) {
      expect(() => validateAddCartItem({ productId: "p1", quantity: 1, [key]: "attacker" })).toThrow(/invalid request field/i);
    }
    expect(() => validateRemoveCartItem({ productId: "p1", userId: "cart-owner-b" })).toThrow(/invalid request field/i);
  });
});

describe("cart availability and current pricing", () => {
  it("allows only active products from verified vendors", () => {
    const product = db().t.products.get("p1")!;
    const vendor = db().t.vendors.get(product.vendorId)!;
    expect(isSellableProduct(product, vendor)).toBe(true);
    expect(isPurchasableProduct(product, vendor)).toBe(true);
    expect(isSellableProduct({ ...product, status: "Archived" }, vendor)).toBe(false);
    expect(isSellableProduct(product, { ...vendor, status: "Suspended", verified: false })).toBe(false);
    expect(isPurchasableProduct({ ...product, stock: 0 }, vendor)).toBe(false);
  });

  it("uses the current server price in its DTO and never exposes account ids", () => {
    const product = db().t.products.get("p1")!;
    const vendor = db().t.vendors.get(product.vendorId)!;
    const dto = toCartDto([ownLine], db().t.products, db().t.vendors, isPurchasableProduct);

    expect(dto.subtotalPaise).toBe(product.pricePaise * ownLine.quantity);
    expect(dto.items[0]).toMatchObject({
      productId: "p1",
      quantity: 2,
      unitPricePaise: product.pricePaise,
      linePaise: product.pricePaise * 2,
      available: true,
    });
    const wire = JSON.stringify(dto);
    expect(wire).not.toContain("userId");
    expect(wire).not.toContain("vendorId");
    expect(wire).not.toContain('"email"');
    expect(wire).not.toContain('"stock"');
  });

  it("marks stale cart lines unavailable rather than using stale client prices", () => {
    const product = db().t.products.get("p1")!;
    const vendor = db().t.vendors.get(product.vendorId)!;
    const dto = toCartDto([ownLine], new Map([[product.id, { ...product, status: "Archived" }]]), new Map([[vendor.id, vendor]]), isPurchasableProduct);
    expect(dto.items[0]).toMatchObject({ available: false, unitPricePaise: null, linePaise: null });
    expect(dto.hasUnavailableItems).toBe(true);
    expect(dto.subtotalPaise).toBe(0);
  });
});
