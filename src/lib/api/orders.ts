/**
 * Shopper-facing order endpoints.
 *
 * IDOR
 * Neither endpoint accepts a user id. The caller is resolved from the session
 * and orders are filtered by it, so there is no parameter to swap. `cancelOrder`
 * takes an order id, and `requireOwnOrder` answers "not found" — not
 * "forbidden" — when the order belongs to someone else, because confirming
 * existence would turn the endpoint into a probe for valid order ids.
 *
 * ORDER STATE
 * routes/orders.tsx used to cancel by writing
 * `{status:"Cancelled", payment:"Refunded"}` straight into local state, which
 * meant a delivered order could be "cancelled" and refunded. The transition is
 * now checked against the real lifecycle here, and the request cannot name the
 * status it wants.
 */

import { createServerFn } from "@tanstack/react-start";

import type { OrderDto } from "@/lib/server/dto";
import { conflict, guarded, obj, str } from "@/lib/server/validate";

/** The only states a shopper may cancel from. After dispatch it is a return. */
const CANCELLABLE = new Set(["Order Placed", "Confirmed", "Processing"]);

export const listMyOrders = createServerFn({ method: "GET" }).handler(async (): Promise<OrderDto[]> =>
  guarded(async () => {
    const [{ db }, { requireUser }, { toOrderDto }, { seedIfEmpty }] = await Promise.all([
      import("@/lib/server/db"),
      import("@/lib/server/guards"),
      import("@/lib/server/dto"),
      import("@/lib/server/seed"),
    ]);
    seedIfEmpty();

    const user = await requireUser();
    return [...db().t.orders.values()]
      .filter((o) => o.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toOrderDto);
  }),
);

export const getMyOrder = createServerFn({ method: "POST" })
  .validator((raw: unknown) => ({ orderId: str(obj(raw).orderId, "Order", { max: 64 }) }))
  .handler(async ({ data }): Promise<OrderDto> =>
    guarded(async () => {
      const [{ requireUser, requireOwnOrder }, { toOrderDto }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/guards"),
        import("@/lib/server/dto"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();

      const user = await requireUser();
      return toOrderDto(requireOwnOrder(user.id, data.orderId));
    }),
  );

export const cancelOrder = createServerFn({ method: "POST" })
  .validator((raw: unknown) => ({ orderId: str(obj(raw).orderId, "Order", { max: 64 }) }))
  .handler(async ({ data }): Promise<OrderDto> =>
    guarded(async () => {
      const [{ db, tx }, { requireUser, requireOwnOrder }, { toOrderDto }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/guards"),
          import("@/lib/server/dto"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();

      const user = await requireUser();

      return tx(() => {
        const order = requireOwnOrder(user.id, data.orderId);

        if (order.status === "Cancelled") {
          // Idempotent rather than an error: a double-clicked cancel button
          // should not produce a scary message.
          return toOrderDto(order);
        }
        if (!CANCELLABLE.has(order.status)) {
          throw conflict(
            order.status === "Delivered"
              ? "This order was delivered. Start a return instead."
              : "This order has already shipped and can no longer be cancelled.",
          );
        }

        // Put the inventory back. Without this a cancellation permanently
        // destroys stock.
        const d = db();
        for (const item of order.items) {
          const product = d.t.products.get(item.productId);
          if (product) product.stock += item.qty;
        }

        order.status = "Cancelled";
        order.eta = "—";
        // Cash on delivery was never collected, so there is nothing to refund
        // and claiming otherwise would be false.
        if (order.payment === "Paid") order.payment = "Refunded";

        return toOrderDto(order);
      });
    }),
  );
