/**
 * Product APIs.
 *
 * Public reads expose only active listings from server-verified vendors.
 * Vendor writes derive the seller from the session, generate ids/SKUs/status on
 * the server, and accept no ownership, stock-history, rating, review-count, or
 * lifecycle fields from the client.
 *
 * This module intentionally does not make the existing frontend consume these
 * APIs. The static storefront remains untouched; Member 3 can migrate it to
 * these contracts independently.
 */

import { createServerFn } from "@tanstack/react-start";

import type { ProductRow, VendorRow } from "@/lib/server/db";
import type { ProductDto, PublicProductDto } from "@/lib/server/dto";
import {
  badRequest,
  conflict,
  guarded,
  int,
  notFound,
  oneOf,
  optionalStr,
  str,
  strictObj,
} from "@/lib/server/validate";

const CATEGORY_SLUGS = [
  "fashion",
  "electronics",
  "home",
  "beauty",
  "sports",
  "accessories",
  "books",
  "grocery",
] as const;

const SORTS = ["relevance", "name", "priceAsc", "priceDesc", "rating", "newest"] as const;
const VENDOR_STATUSES = ["Active", "Draft", "Archived"] as const;
const MAX_PAGE_SIZE = 50;
const MAX_OFFSET = 5_000;
const MAX_PRICE_PAISE = 100_000_000;

type PublicSort = (typeof SORTS)[number];
type ProductStatusFilter = (typeof VENDOR_STATUSES)[number];

export type PublicProductFilters = {
  q?: string;
  category?: (typeof CATEGORY_SLUGS)[number];
  vendorId?: string;
  minPricePaise?: number;
  maxPricePaise?: number;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort: PublicSort;
  limit: number;
  offset: number;
};

export type PublicProductPage = {
  items: PublicProductDto[];
  total: number;
  limit: number;
  offset: number;
};

type NewProductInput = {
  name: string;
  category: (typeof CATEGORY_SLUGS)[number];
  brand: string;
  pricePaise: number;
  originalPricePaise: number | null;
  description: string;
  specs: Record<string, string>;
};

type UpdateProductInput = {
  productId: string;
  patch: Partial<NewProductInput>;
};

function hasOwn(body: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, key);
}

function optionalBoundedInt(
  raw: unknown,
  field: string,
  min: number,
  max: number,
): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  return int(raw, field, { min, max });
}

function optionalBoolean(raw: unknown, field: string): boolean | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  if (typeof raw !== "boolean") throw badRequest(`${field} must be true or false.`);
  return raw;
}

function parseSpecs(raw: unknown): Record<string, string> {
  const body = strictObj(raw, Object.keys(raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}));
  const entries = Object.entries(body);
  if (entries.length > 20) throw badRequest("Specifications may contain at most 20 entries.");

  const out: Record<string, string> = {};
  for (const [rawKey, rawValue] of entries) {
    const key = str(rawKey, "Specification name", { min: 1, max: 50 });
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw badRequest("Invalid specification name.");
    }
    if (hasOwn(out, key)) throw badRequest("Duplicate specification name.");
    out[key] = str(rawValue, "Specification value", { min: 1, max: 200 });
  }
  return out;
}

function parseCategory(raw: unknown): (typeof CATEGORY_SLUGS)[number] {
  return oneOf(raw, CATEGORY_SLUGS, "Category");
}

function parseOriginalPrice(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  return int(raw, "Original price", { min: 1, max: MAX_PRICE_PAISE });
}

/** Exported for direct security tests; used by the public listing endpoint. */
export function isPublicProduct(product: ProductRow, vendor: VendorRow | undefined): boolean {
  return Boolean(vendor && vendor.status === "Verified" && vendor.verified && product.status === "Active");
}

/** Exported for direct security tests and used by create/update handlers. */
export function validateCreateVendorProduct(raw: unknown): NewProductInput {
  const body = strictObj(raw, [
    "name",
    "category",
    "brand",
    "pricePaise",
    "originalPricePaise",
    "description",
    "specs",
  ]);

  const pricePaise = int(body.pricePaise, "Price", { min: 1, max: MAX_PRICE_PAISE });
  const originalPricePaise = parseOriginalPrice(body.originalPricePaise);
  if (originalPricePaise !== null && originalPricePaise < pricePaise) {
    throw badRequest("Original price cannot be lower than selling price.");
  }

  return {
    name: str(body.name, "Product name", { min: 3, max: 120 }),
    category: parseCategory(body.category),
    brand: str(body.brand, "Brand", { min: 1, max: 80 }),
    pricePaise,
    originalPricePaise,
    description: str(body.description, "Description", { min: 10, max: 4_000 }),
    specs: parseSpecs(body.specs),
  };
}

/** Exported for direct security tests; update has an allow-list separate from create. */
export function validateUpdateVendorProduct(raw: unknown): UpdateProductInput {
  const body = strictObj(raw, [
    "productId",
    "name",
    "category",
    "brand",
    "pricePaise",
    "originalPricePaise",
    "description",
    "specs",
  ]);

  const patch: Partial<NewProductInput> = {};
  if (hasOwn(body, "name")) patch.name = str(body.name, "Product name", { min: 3, max: 120 });
  if (hasOwn(body, "category")) patch.category = parseCategory(body.category);
  if (hasOwn(body, "brand")) patch.brand = str(body.brand, "Brand", { min: 1, max: 80 });
  if (hasOwn(body, "pricePaise")) {
    patch.pricePaise = int(body.pricePaise, "Price", { min: 1, max: MAX_PRICE_PAISE });
  }
  if (hasOwn(body, "originalPricePaise")) {
    patch.originalPricePaise = parseOriginalPrice(body.originalPricePaise);
  }
  if (hasOwn(body, "description")) {
    patch.description = str(body.description, "Description", { min: 10, max: 4_000 });
  }
  if (hasOwn(body, "specs")) patch.specs = parseSpecs(body.specs);
  if (Object.keys(patch).length === 0) throw badRequest("Provide at least one product change.");

  return {
    productId: str(body.productId, "Product", { min: 1, max: 64 }),
    patch,
  };
}

export function validatePublicProductList(raw: unknown): PublicProductFilters {
  const body = strictObj(raw, [
    "q",
    "category",
    "vendorId",
    "minPricePaise",
    "maxPricePaise",
    "minRating",
    "inStock",
    "onSale",
    "sort",
    "limit",
    "offset",
  ]);

  const minPricePaise = optionalBoundedInt(body.minPricePaise, "Minimum price", 0, MAX_PRICE_PAISE);
  const maxPricePaise = optionalBoundedInt(body.maxPricePaise, "Maximum price", 0, MAX_PRICE_PAISE);
  if (minPricePaise !== undefined && maxPricePaise !== undefined && minPricePaise > maxPricePaise) {
    throw badRequest("Minimum price cannot exceed maximum price.");
  }

  return {
    q: optionalStr(body.q, "Search", { max: 64 }) ?? undefined,
    category: body.category === undefined ? undefined : parseCategory(body.category),
    vendorId: optionalStr(body.vendorId, "Vendor", { max: 64 }) ?? undefined,
    minPricePaise,
    maxPricePaise,
    minRating: optionalBoundedInt(body.minRating, "Minimum rating", 0, 5),
    inStock: optionalBoolean(body.inStock, "In stock"),
    onSale: optionalBoolean(body.onSale, "On sale"),
    sort: body.sort === undefined ? "relevance" : oneOf(body.sort, SORTS, "Sort"),
    limit: body.limit === undefined ? 24 : int(body.limit, "Limit", { min: 1, max: MAX_PAGE_SIZE }),
    offset: body.offset === undefined ? 0 : int(body.offset, "Offset", { min: 0, max: MAX_OFFSET }),
  };
}

function validatePublicProductDetail(raw: unknown): { productId: string } {
  const body = strictObj(raw, ["productId"]);
  return { productId: str(body.productId, "Product", { min: 1, max: 64 }) };
}

function validateVendorProductList(raw: unknown): { status?: ProductStatusFilter } {
  const body = strictObj(raw, ["status"]);
  return {
    status: body.status === undefined ? undefined : oneOf(body.status, VENDOR_STATUSES, "Product status"),
  };
}

function validateArchiveVendorProduct(raw: unknown): { productId: string } {
  const body = strictObj(raw, ["productId"]);
  return { productId: str(body.productId, "Product", { min: 1, max: 64 }) };
}

function makeSku(productId: string, category: string): string {
  return `MH-${category.slice(0, 3).toUpperCase()}-${productId.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

function hasSale(product: ProductRow): boolean {
  return product.originalPricePaise !== null && product.originalPricePaise > product.pricePaise;
}

function searchText(product: ProductRow): string {
  return `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase();
}

export const listPublicProducts = createServerFn({ method: "POST" })
  .validator(validatePublicProductList)
  .handler(async ({ data }): Promise<PublicProductPage> =>
    guarded(async () => {
      const [{ db }, { toPublicProductDto }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/db"),
        import("@/lib/server/dto"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();

      const d = db();
      const q = data.q?.toLowerCase();
      let rows = [...d.t.products.values()].filter((product) => {
        const vendor = d.t.vendors.get(product.vendorId);
        if (!isPublicProduct(product, vendor)) return false;
        if (q && !searchText(product).includes(q)) return false;
        if (data.category && product.category !== data.category) return false;
        if (data.vendorId && product.vendorId !== data.vendorId) return false;
        if (data.minPricePaise !== undefined && product.pricePaise < data.minPricePaise) return false;
        if (data.maxPricePaise !== undefined && product.pricePaise > data.maxPricePaise) return false;
        if (data.minRating !== undefined && product.rating < data.minRating) return false;
        if (data.inStock === true && product.stock <= 0) return false;
        if (data.onSale === true && !hasSale(product)) return false;
        return true;
      });

      const compare = {
        relevance: (a: ProductRow, b: ProductRow) => b.reviews - a.reviews || b.rating - a.rating || a.name.localeCompare(b.name),
        name: (a: ProductRow, b: ProductRow) => a.name.localeCompare(b.name),
        priceAsc: (a: ProductRow, b: ProductRow) => a.pricePaise - b.pricePaise || a.name.localeCompare(b.name),
        priceDesc: (a: ProductRow, b: ProductRow) => b.pricePaise - a.pricePaise || a.name.localeCompare(b.name),
        rating: (a: ProductRow, b: ProductRow) => b.rating - a.rating || b.reviews - a.reviews,
        newest: (a: ProductRow, b: ProductRow) => b.createdAt.localeCompare(a.createdAt),
      } satisfies Record<PublicSort, (a: ProductRow, b: ProductRow) => number>;
      rows = rows.sort(compare[data.sort]);

      const total = rows.length;
      const items = rows.slice(data.offset, data.offset + data.limit).flatMap((product) => {
        const vendor = d.t.vendors.get(product.vendorId);
        return vendor ? [toPublicProductDto(product, vendor)] : [];
      });

      return { items, total, limit: data.limit, offset: data.offset };
    }),
  );

export const getPublicProduct = createServerFn({ method: "POST" })
  .validator(validatePublicProductDetail)
  .handler(async ({ data }): Promise<PublicProductDto> =>
    guarded(async () => {
      const [{ db }, { toPublicProductDto }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/db"),
        import("@/lib/server/dto"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();

      const d = db();
      const product = d.t.products.get(data.productId);
      const vendor = product ? d.t.vendors.get(product.vendorId) : undefined;
      if (!product || !isPublicProduct(product, vendor) || !vendor) throw notFound("Product not found.");
      return toPublicProductDto(product, vendor);
    }),
  );

export const listMyVendorProducts = createServerFn({ method: "POST" })
  .validator(validateVendorProductList)
  .handler(async ({ data }): Promise<ProductDto[]> =>
    guarded(async () => {
      const [{ db }, { requireVendor }, { toProductDto }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/db"),
        import("@/lib/server/guards"),
        import("@/lib/server/dto"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();
      const { vendor } = await requireVendor();
      return [...db().t.products.values()]
        .filter((product) => product.vendorId === vendor.id && (!data.status || product.status === data.status))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(toProductDto);
    }),
  );

export const createVendorProduct = createServerFn({ method: "POST" })
  .validator(validateCreateVendorProduct)
  .handler(async ({ data }): Promise<ProductDto> =>
    guarded(async () => {
      const [{ db, newId, nowIso, tx }, { requireApprovedVendor }, { toProductDto }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/guards"),
          import("@/lib/server/dto"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();
      const { vendor } = await requireApprovedVendor();

      return tx(() => {
        const id = newId();
        const product: ProductRow = {
          id,
          vendorId: vendor.id,
          name: data.name,
          category: data.category,
          brand: data.brand,
          pricePaise: data.pricePaise,
          originalPricePaise: data.originalPricePaise,
          // Inventory changes have their own audited workflow. A product create
          // request never gets to assert stock, so new listings start at zero.
          stock: 0,
          // Review signals are server-owned. Vendors cannot manufacture social proof.
          rating: 0,
          reviews: 0,
          sku: makeSku(id, data.category),
          // Verified vendors create a live listing; client cannot choose status.
          status: "Active",
          description: data.description,
          specs: data.specs,
          createdAt: nowIso(),
        };
        db().t.products.set(product.id, product);
        return toProductDto(product);
      });
    }),
  );

export const updateVendorProduct = createServerFn({ method: "POST" })
  .validator(validateUpdateVendorProduct)
  .handler(async ({ data }): Promise<ProductDto> =>
    guarded(async () => {
      const [{ tx }, { requireApprovedVendor, requireOwnedProduct }, { toProductDto }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/guards"),
          import("@/lib/server/dto"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();
      const { vendor } = await requireApprovedVendor();

      return tx(() => {
        const product = requireOwnedProduct(vendor.id, data.productId);
        if (product.status === "Archived") throw conflict("Archived products cannot be updated.");

        const nextPrice = data.patch.pricePaise ?? product.pricePaise;
        const nextOriginal = hasOwn(data.patch, "originalPricePaise")
          ? (data.patch.originalPricePaise ?? null)
          : product.originalPricePaise;
        if (nextOriginal !== null && nextOriginal < nextPrice) {
          throw badRequest("Original price cannot be lower than selling price.");
        }

        // Explicit assignment only: never spread a request patch into storage.
        if (data.patch.name !== undefined) product.name = data.patch.name;
        if (data.patch.category !== undefined) product.category = data.patch.category;
        if (data.patch.brand !== undefined) product.brand = data.patch.brand;
        if (data.patch.pricePaise !== undefined) product.pricePaise = data.patch.pricePaise;
        if (hasOwn(data.patch, "originalPricePaise")) product.originalPricePaise = nextOriginal;
        if (data.patch.description !== undefined) product.description = data.patch.description;
        if (data.patch.specs !== undefined) product.specs = data.patch.specs;

        return toProductDto(product);
      });
    }),
  );

export const archiveVendorProduct = createServerFn({ method: "POST" })
  .validator(validateArchiveVendorProduct)
  .handler(async ({ data }): Promise<ProductDto> =>
    guarded(async () => {
      const [{ tx }, { requireApprovedVendor, requireOwnedProduct }, { toProductDto }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/guards"),
          import("@/lib/server/dto"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();
      const { vendor } = await requireApprovedVendor();

      return tx(() => {
        const product = requireOwnedProduct(vendor.id, data.productId);
        // Archive, do not delete: OrderItem snapshots and operational history
        // remain valid after a seller removes a listing from sale.
        product.status = "Archived";
        return toProductDto(product);
      });
    }),
  );
