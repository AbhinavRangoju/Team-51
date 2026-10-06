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

import { db, type OrderRow, type ProductRow, type Role, type VendorRow } from "./db";
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
