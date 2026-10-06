/**
 * Authorization. Every server function that touches owned data starts here.
 *
 * The rule is that identity and ownership are *derived*, never accepted. A
 * handler is given a user id by the session layer and looks up what that id is
 * allowed to see. No handler takes a `userId`, `vendorId` or `role` from the
 * request body — there is deliberately no validator for those fields.
 *
 * On the vendor fallback that used to live in routes/vendor.tsx:
 * `useMyVendor()` ended with `vendors.find(v => v.verified) ?? vendors[0]`, so a
 * seller with no matching record was shown somebody else's store. Harmless over
 * a static seed and cross-tenant data exposure the moment the data is real.
 * `requireVendor` below throws instead. There is no fallback path.
 */

import { cartItemKey, db, type CartItemRow, type OrderRow, type ProductRow, type Role, type VendorRow } from "./db";
import { requireSessionUser, type SessionUser } from "./session";
import { forbidden, notFound } from "./validate";

export async function requireUser(): Promise<SessionUser> {
  return requireSessionUser();
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) throw forbidden();
  return user;
}

/**
 * The vendor record owned by the caller.
 *
 * Throws `forbidden` when the caller is not a vendor and when a vendor account
 * has no store linked. "Not linked" is an error state, not an invitation to
 * show the first store on the list.
 */
export async function requireVendor(): Promise<{ user: SessionUser; vendor: VendorRow }> {
  const user = await requireRole("vendor");
  const vendor = [...db().t.vendors.values()].find((v) => v.userId === user.id);
  if (!vendor) {
    throw forbidden("Your seller account is not linked to a store yet.");
  }
  return { user, vendor };
}

/** A store is sellable/manageable only after server-side verification. */
export function isApprovedVendor(vendor: VendorRow): boolean {
  return vendor.status === "Verified" && vendor.verified === true;
}

/** Pure approval assertion: shared by the authenticated guard and direct tests. */
export function assertApprovedVendor(vendor: VendorRow): void {
  if (!isApprovedVendor(vendor)) {
    throw forbidden("Your store is not approved to manage products.");
  }
}

/**
 * A cart may contain only products that a customer could buy right now.
 * Stock is deliberately not reserved here; checkout remains the final,
 * transaction-protected stock authority.
 */
export function isSellableProduct(product: ProductRow | undefined, vendor: VendorRow | undefined): boolean {
  return Boolean(product && vendor && product.status === "Active" && isApprovedVendor(vendor));
}

/** Cart writes require current stock, but do not reserve it. Checkout re-checks atomically. */
export function isPurchasableProduct(product: ProductRow | undefined, vendor: VendorRow | undefined): boolean {
  return Boolean(isSellableProduct(product, vendor) && product && product.stock > 0);
}

/**
 * Loads a cart line through the authenticated user's own composite key.
 * Returning not-found for another user's product id prevents cart enumeration.
 */
export function requireOwnCartItem(userId: string, productId: string): CartItemRow {
  const item = db().t.cartItems.get(cartItemKey(userId, productId));
  if (!item) throw notFound("Cart item not found.");
  return item;
}

/**
 * Product writes require both a vendor role and an approved linked store.
 *
 * This is deliberately separate from requireVendor(): a pending seller may be
 * allowed to view their onboarding/dashboard state, but cannot publish, alter,
 * or archive marketplace inventory before approval.
 */
export async function requireApprovedVendor(): Promise<{ user: SessionUser; vendor: VendorRow }> {
  const scope = await requireVendor();
  assertApprovedVendor(scope.vendor);
  return scope;
}

/**
 * Loads a product and proves the caller's store owns it.
 *
 * `notFound` rather than `forbidden` when the owner does not match: replying
 * "that exists but is not yours" turns the endpoint into a probe for other
 * sellers' product ids.
 */
export function requireOwnedProduct(vendorId: string, productId: string): ProductRow {
  const product = db().t.products.get(productId);
  if (!product || product.vendorId !== vendorId) throw notFound("Product not found.");
  return product;
}

/**
 * Loads an order and proves the caller placed it. This is the IDOR guard for
 * /orders — an order id in the URL is worthless without the matching session.
 */
export function requireOwnOrder(userId: string, orderId: string): OrderRow {
  const order = db().t.orders.get(orderId);
  if (!order || order.userId !== userId) throw notFound("Order not found.");
  return order;
}

/**
 * Loads an order that contains at least one line sold by this store.
 *
 * A seller is a participant in an order, not its owner, so they get the order
 * only if they are actually in it — and callers must still strip the lines that
 * belong to other sellers before returning anything.
 */
export function requireVendorOrder(vendorId: string, orderId: string): OrderRow {
  const order = db().t.orders.get(orderId);
  if (!order || !order.items.some((i) => i.vendorId === vendorId)) {
    throw notFound("Order not found.");
  }
  return order;
}
