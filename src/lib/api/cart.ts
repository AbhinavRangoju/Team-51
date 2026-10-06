/**
 * Persistent cart APIs.
 *
 * A cart is owned by the authenticated session user, never a userId in a
 * request. It stores only product identity and quantity. Prices, vendor data,
 * availability and totals are recalculated from the current server catalogue
 * whenever the cart is read; stock is intentionally NOT reserved until checkout.
 */

import { createServerFn } from "@tanstack/react-start";

import type { CartItemRow } from "@/lib/server/db";
import type { CartDto } from "@/lib/server/dto";
import { badRequest, conflict, guarded, int, str, strictObj } from "@/lib/server/validate";

const MAX_CART_ITEMS = 50;
const MAX_QUANTITY = 20;

type CartLineInput = { productId: string; quantity: number };

/** Exported for focused contract tests; endpoint validators call it directly. */
export function validateAddCartItem(raw: unknown): CartLineInput {
  const body = strictObj(raw, ["productId", "quantity"]);
  return {
    productId: str(body.productId, "Product", { min: 1, max: 64 }),
    quantity: int(body.quantity, "Quantity", { min: 1, max: MAX_QUANTITY }),
  };
}

/** Exported for focused contract tests; set is deliberately not an increment. */
export function validateSetCartItemQuantity(raw: unknown): CartLineInput {
  const body = strictObj(raw, ["productId", "quantity"]);
  return {
    productId: str(body.productId, "Product", { min: 1, max: 64 }),
    quantity: int(body.quantity, "Quantity", { min: 1, max: MAX_QUANTITY }),
  };
}

export function validateRemoveCartItem(raw: unknown): { productId: string } {
  const body = strictObj(raw, ["productId"]);
  return { productId: str(body.productId, "Product", { min: 1, max: 64 }) };
}

function myLines(userId: string, cartItems: Map<string, CartItemRow>): CartItemRow[] {
  return [...cartItems.values()].filter((item) => item.userId === userId);
}

async function cartResponse(userId: string): Promise<CartDto> {
  const [{ db }, { toCartDto }, { isPurchasableProduct }, { seedIfEmpty }] = await Promise.all([
    import("@/lib/server/db"),
    import("@/lib/server/dto"),
    import("@/lib/server/guards"),
    import("@/lib/server/seed"),
  ]);
  seedIfEmpty();
  const d = db();
  return toCartDto(myLines(userId, d.t.cartItems), d.t.products, d.t.vendors, isPurchasableProduct);
}

/** Current server prices and availability; no client totals are accepted or stored. */
export const getMyCart = createServerFn({ method: "GET" }).handler(async (): Promise<CartDto> =>
  guarded(async () => {
    const { requireUser } = await import("@/lib/server/guards");
    const user = await requireUser();
    return cartResponse(user.id);
  }),
);

export const addCartItem = createServerFn({ method: "POST" })
  .validator(validateAddCartItem)
  .handler(async ({ data }): Promise<CartDto> =>
    guarded(async () => {
      const [{ db, cartItemKey, nowIso, tx }, { requireUser, isPurchasableProduct }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/guards"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();
      const user = await requireUser();

      tx(() => {
        const d = db();
        const product = d.t.products.get(data.productId);
        const vendor = product ? d.t.vendors.get(product.vendorId) : undefined;
        if (!isPurchasableProduct(product, vendor)) {
          throw conflict("This product is not currently available.");
        }

        const key = cartItemKey(user.id, data.productId);
        const existing = d.t.cartItems.get(key);
        if (existing) {
          const nextQuantity = existing.quantity + data.quantity;
          if (nextQuantity > MAX_QUANTITY) {
            throw badRequest(`Quantity must be ${MAX_QUANTITY} or fewer.`);
          }
          existing.quantity = nextQuantity;
          existing.updatedAt = nowIso();
          return;
        }

        if (myLines(user.id, d.t.cartItems).length >= MAX_CART_ITEMS) {
          throw badRequest(`Cart may contain at most ${MAX_CART_ITEMS} distinct items.`);
        }

        const now = nowIso();
        d.t.cartItems.set(key, {
          userId: user.id,
          productId: data.productId,
          quantity: data.quantity,
          createdAt: now,
          updatedAt: now,
        });
      });

      return cartResponse(user.id);
    }),
  );

export const setCartItemQuantity = createServerFn({ method: "POST" })
  .validator(validateSetCartItemQuantity)
  .handler(async ({ data }): Promise<CartDto> =>
    guarded(async () => {
      const [{ db, nowIso, tx }, { requireOwnCartItem, requireUser, isPurchasableProduct }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/guards"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();
      const user = await requireUser();

      tx(() => {
        const d = db();
        const item = requireOwnCartItem(user.id, data.productId);
        const product = d.t.products.get(item.productId);
        const vendor = product ? d.t.vendors.get(product.vendorId) : undefined;
        if (!isPurchasableProduct(product, vendor)) {
          throw conflict("This product is not currently available. Remove it from your cart.");
        }
        item.quantity = data.quantity;
        item.updatedAt = nowIso();
      });

      return cartResponse(user.id);
    }),
  );

export const removeCartItem = createServerFn({ method: "POST" })
  .validator(validateRemoveCartItem)
  .handler(async ({ data }): Promise<CartDto> =>
    guarded(async () => {
      const [{ db, cartItemKey, tx }, { requireOwnCartItem, requireUser }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/db"),
        import("@/lib/server/guards"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();
      const user = await requireUser();

      tx(() => {
        requireOwnCartItem(user.id, data.productId);
        db().t.cartItems.delete(cartItemKey(user.id, data.productId));
      });

      return cartResponse(user.id);
    }),
  );
