/**
 * Row -> wire mapping.
 *
 * Every response is built here rather than by returning a row directly. That is
 * deliberate: a row carries `passwordHash`, `passwordSalt`, `userId` and the
 * shopper's full postal address, and returning one by accident is the easiest
 * way to leak all of it. Serialising through an explicit shape means a new
 * column is invisible to the client until someone adds it here on purpose.
 */

import type { AddressRow, CartItemRow, OrderRow, ProductRow, UserRow, VendorRow } from "./db";

export type OrderDto = {
  id: string;
  createdAt: string;
  status: string;
  payment: string;
  method: string;
  eta: string;
  items: { productId: string; name: string; qty: number; unitPricePaise: number }[];
  subtotalPaise: number;
  discountPaise: number;
  deliveryPaise: number;
  taxPaise: number;
  totalPaise: number;
  shipTo: { name: string; line: string; city: string; pin: string };
};

/** For the shopper who placed the order. Their own address is theirs to see. */
export function toOrderDto(o: OrderRow): OrderDto {
  return {
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    payment: o.payment,
    method: o.method,
    eta: o.eta,
    items: o.items.map((i) => ({
      productId: i.productId,
      name: i.nameSnapshot,
      qty: i.qty,
      unitPricePaise: i.unitPricePaise,
    })),
    subtotalPaise: o.subtotalPaise,
    discountPaise: o.discountPaise,
    deliveryPaise: o.deliveryPaise,
    taxPaise: o.taxPaise,
    totalPaise: o.totalPaise,
    shipTo: { name: o.shipName, line: o.shipLine, city: o.shipCity, pin: o.shipPin },
  };
}

export type VendorOrderDto = {
  id: string;
  createdAt: string;
  status: string;
  payment: string;
  method: string;
  eta: string;
  /** Only the lines this seller is fulfilling. */
  items: { productId: string; name: string; qty: number; unitPricePaise: number }[];
  /** This seller's share of the order, not the order's grand total. */
  vendorSubtotalPaise: number;
  /** Given name only. */
  customerName: string;
  /** Destination city only. */
  shipCity: string;
};

/**
 * For a seller looking at an order they are part of.
 *
 * Three things are withheld on purpose:
 *   - lines sold by other sellers, which are none of this seller's business
 *   - the shopper's street address, phone and PIN; a seller needs the
 *     destination city to quote dispatch, not enough to identify a household
 *     (the existing UI already only rendered the city)
 *   - the order's grand total, which includes other sellers' revenue
 */
export function toVendorOrderDto(o: OrderRow, vendorId: string): VendorOrderDto {
  const mine = o.items.filter((i) => i.vendorId === vendorId);
  return {
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    payment: o.payment,
    method: o.method,
    eta: o.eta,
    items: mine.map((i) => ({
      productId: i.productId,
      name: i.nameSnapshot,
      qty: i.qty,
      unitPricePaise: i.unitPricePaise,
    })),
    vendorSubtotalPaise: mine.reduce((s, i) => s + i.unitPricePaise * i.qty, 0),
    customerName: o.shipName.split(" ")[0] ?? o.shipName,
    shipCity: o.shipCity,
  };
}

export type ProductDto = {
  id: string;
  name: string;
  category: string;
  brand: string;
  pricePaise: number;
  originalPricePaise: number | null;
  stock: number;
  rating: number;
  reviews: number;
  sku: string;
  status: string;
  vendorId: string;
};

export const toProductDto = (p: ProductRow): ProductDto => ({
  id: p.id,
  name: p.name,
  category: p.category,
  brand: p.brand,
  pricePaise: p.pricePaise,
  originalPricePaise: p.originalPricePaise,
  stock: p.stock,
  rating: p.rating,
  reviews: p.reviews,
  sku: p.sku,
  status: p.status,
  vendorId: p.vendorId,
});

/**
 * Public catalogue shape. Intentionally omits vendorId, vendor account data,
 * SKU, internal lifecycle status, and exact inventory. A shopper needs to know
 * whether an item can be bought, not how many units a seller holds or which
 * account owns the listing.
 */
export type PublicProductDto = {
  id: string;
  name: string;
  category: string;
  brand: string;
  pricePaise: number;
  originalPricePaise: number | null;
  inStock: boolean;
  rating: number;
  reviews: number;
  description: string;
  specs: Record<string, string>;
  createdAt: string;
  vendor: { name: string; city: string; verified: true };
};

export const toPublicProductDto = (p: ProductRow, v: VendorRow): PublicProductDto => ({
  id: p.id,
  name: p.name,
  category: p.category,
  brand: p.brand,
  pricePaise: p.pricePaise,
  originalPricePaise: p.originalPricePaise,
  inStock: p.stock > 0,
  rating: p.rating,
  reviews: p.reviews,
  description: p.description,
  specs: { ...p.specs },
  createdAt: p.createdAt,
  vendor: { name: v.name, city: v.city, verified: true },
});

/** Cart DTOs use current server pricing and no account/vendor identifiers. */
export type CartItemDto = {
  productId: string;
  name: string;
  quantity: number;
  unitPricePaise: number | null;
  linePaise: number | null;
  available: boolean;
  vendor: { name: string; city: string } | null;
};

export type CartDto = {
  items: CartItemDto[];
  distinctItems: number;
  subtotalPaise: number;
  hasUnavailableItems: boolean;
};

/**
 * Current price only; cart lines never snapshot price or reserve stock. An
 * unavailable historical line remains removable, but cannot be increased.
 */
export function toCartDto(
  items: CartItemRow[],
  products: Map<string, ProductRow>,
  vendors: Map<string, VendorRow>,
  isSellable: (product: ProductRow | undefined, vendor: VendorRow | undefined) => boolean,
): CartDto {
  let subtotalPaise = 0;
  let hasUnavailableItems = false;

  const lines = items
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((item) => {
      const product = products.get(item.productId);
      const vendor = product ? vendors.get(product.vendorId) : undefined;
      const available = isSellable(product, vendor);
      if (!product || !vendor || !available) {
        hasUnavailableItems = true;
        return {
          productId: item.productId,
          name: product?.name ?? "Unavailable product",
          quantity: item.quantity,
          unitPricePaise: null,
          linePaise: null,
          available: false,
          vendor: vendor ? { name: vendor.name, city: vendor.city } : null,
        };
      }

      const linePaise = product.pricePaise * item.quantity;
      subtotalPaise += linePaise;
      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPricePaise: product.pricePaise,
        linePaise,
        available: true,
        vendor: { name: vendor.name, city: vendor.city },
      };
    });

  return { items: lines, distinctItems: lines.length, subtotalPaise, hasUnavailableItems };
}

export type VendorDto = {
  id: string;
  name: string;
  tagline: string;
  city: string;
  since: number;
  status: string;
  verified: boolean;
  rating: number;
};

/**
 * Note what is absent: `userId` and the owner's email. The public seller
 * directory at /vendors already made a point of not publishing seller contact
 * addresses; this keeps that true at the API layer so it cannot regress.
 */
export const toVendorDto = (v: VendorRow): VendorDto => ({
  id: v.id,
  name: v.name,
  tagline: v.tagline,
  city: v.city,
  since: v.since,
  status: v.status,
  verified: v.verified,
  rating: v.rating,
});

export type AddressDto = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: "IN";
  isDefault: boolean;
};

/** Owner-facing PII, but never persistence ownership or internal timestamps. */
export const toAddressDto = (address: AddressRow): AddressDto => ({
  id: address.id,
  label: address.label,
  name: address.name,
  phone: address.phone,
  line1: address.line1,
  line2: address.line2,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  isDefault: address.isDefault,
});

export type AccountDto = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

export const toAccountDto = (u: UserRow): AccountDto => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
});
