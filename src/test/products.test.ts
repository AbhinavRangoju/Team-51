import { beforeAll, describe, expect, it } from "vitest";

import {
  isPublicProduct,
  validateCreateVendorProduct,
  validatePublicProductList,
  validateUpdateVendorProduct,
} from "@/lib/api/products";
import { db } from "@/lib/server/db";
import { toPublicProductDto } from "@/lib/server/dto";
import { assertApprovedVendor, isApprovedVendor, requireOwnedProduct } from "@/lib/server/guards";
import { seedIfEmpty } from "@/lib/server/seed";

beforeAll(() => {
  seedIfEmpty();
});

const validProduct = {
  name: "Verified Seller Travel Mug",
  category: "home",
  brand: "MarketHub Test",
  pricePaise: 129900,
  originalPricePaise: 159900,
  description: "A practical insulated travel mug from a verified seller.",
  specs: { Material: "Steel", Capacity: "500 ml" },
};

describe("public product contract", () => {
  it("exposes an active verified-vendor product publicly", () => {
    const product = db().t.products.get("p1")!;
    const vendor = db().t.vendors.get(product.vendorId)!;
    expect(isPublicProduct(product, vendor)).toBe(true);
  });

  it("hides archived products and products from pending or suspended vendors", () => {
    const product = db().t.products.get("p1")!;
    const vendor = db().t.vendors.get(product.vendorId)!;
    expect(isPublicProduct({ ...product, status: "Archived" }, vendor)).toBe(false);
    expect(isPublicProduct(product, { ...vendor, status: "Pending Verification", verified: false })).toBe(false);
    expect(isPublicProduct(product, { ...vendor, status: "Suspended", verified: false })).toBe(false);
  });

  it("public DTO excludes vendor account data, exact stock, SKU and lifecycle status", () => {
    const product = db().t.products.get("p1")!;
    const vendor = db().t.vendors.get(product.vendorId)!;
    const wire = JSON.stringify(toPublicProductDto(product, vendor));
    expect(wire).not.toContain("vendorId");
    expect(wire).not.toContain("userId");
    expect(wire).not.toContain("email");
    expect(wire).not.toContain("sku");
    expect(wire).not.toContain("status");
    expect(wire).not.toContain('"stock"');
  });

  it("validates bounded, allowlisted public filters", () => {
    expect(validatePublicProductList({ q: "headphones", category: "electronics", sort: "priceAsc", limit: 20, offset: 0 })).toMatchObject({
      q: "headphones",
      category: "electronics",
      sort: "priceAsc",
      limit: 20,
    });
    expect(() => validatePublicProductList({ category: "not-a-category" })).toThrow();
    expect(() => validatePublicProductList({ minPricePaise: 900, maxPricePaise: 100 })).toThrow();
    expect(() => validatePublicProductList({ limit: 51 })).toThrow();
  });
});

describe("vendor product security", () => {
  it("allows only a verified store to manage products", () => {
    const verified = db().t.vendors.get("v1")!;
    expect(isApprovedVendor(verified)).toBe(true);
    expect(() => assertApprovedVendor({ ...verified, status: "Pending Verification", verified: false })).toThrow(/not approved/i);
    expect(() => assertApprovedVendor({ ...verified, status: "Suspended", verified: false })).toThrow(/not approved/i);
  });

  it("enforces vendor ownership and returns not found for cross-vendor product IDs", () => {
    expect(requireOwnedProduct("v1", "p1").id).toBe("p1");
    expect(() => requireOwnedProduct("v2", "p1")).toThrow(/not found/i);
  });

  it("strictly rejects client-controlled ownership, status, stock-history and review fields on create", () => {
    expect(validateCreateVendorProduct(validProduct)).toMatchObject({ name: validProduct.name });
    for (const key of ["vendorId", "ownerId", "stock", "status", "rating", "reviews", "sku", "id"] as const) {
      expect(() => validateCreateVendorProduct({ ...validProduct, [key]: key === "rating" ? 5 : "attacker-value" })).toThrow(/invalid request field/i);
    }
  });

  it("strictly rejects mass-assignment fields on update and requires a real patch", () => {
    expect(() => validateUpdateVendorProduct({ productId: "p1", vendorId: "v2" })).toThrow(/invalid request field/i);
    expect(() => validateUpdateVendorProduct({ productId: "p1", status: "Active" })).toThrow(/invalid request field/i);
    expect(() => validateUpdateVendorProduct({ productId: "p1", rating: 5 })).toThrow(/invalid request field/i);
    expect(() => validateUpdateVendorProduct({ productId: "p1", stock: 3 })).toThrow(/invalid request field/i);
    expect(() => validateUpdateVendorProduct({ productId: "p1" })).toThrow(/at least one/i);
    expect(validateUpdateVendorProduct({ productId: "p1", pricePaise: 799900 })).toMatchObject({ productId: "p1" });
  });

  it("refuses prototype-pollution-shaped specification keys", () => {
    // JSON input preserves __proto__ as an own property; an object literal does
    // not, because JavaScript treats it as prototype syntax.
    const specs = JSON.parse('{"__proto__":"bad"}') as Record<string, string>;
    expect(() => validateCreateVendorProduct({ ...validProduct, specs })).toThrow();
  });
});
