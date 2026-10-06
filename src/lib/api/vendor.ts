/**
 * Seller endpoints. Every one is scoped to the caller's own store.
 *
 * The store is resolved by `requireVendor()`, which looks up the vendor record
 * whose `userId` is the session's user and throws when there is none. No
 * endpoint here accepts a `vendorId`; there is no such field in any validator,
 * so one seller cannot address another seller's store.
 *
 * This is the fix for the fallback in routes/vendor.tsx, where `useMyVendor()`
 * ended in `vendors.find(v => v.verified) ?? vendors[0]` and quietly showed an
 * unmatched seller somebody else's dashboard.
 *
 * Orders are filtered to those containing at least one of this store's lines,
 * and `toVendorOrderDto` then strips other sellers' lines, the grand total and
 * the shopper's postal address before anything is returned.
 */

import { createServerFn } from "@tanstack/react-start";

import type { ProductDto, VendorDto, VendorOrderDto } from "@/lib/server/dto";
import { conflict, guarded, obj, str } from "@/lib/server/validate";

export type VendorDashboard = {
  vendor: VendorDto;
  products: ProductDto[];
  orders: VendorOrderDto[];
  stats: {
    liveListings: number;
    lowStock: number;
    outOfStock: number;
    openOrders: number;
    /** This store's revenue only, excluding cancelled orders. */
    revenuePaise: number;
    settledPaise: number;
    inFlightPaise: number;
    commissionPaise: number;
  };
};

const COMMISSION_NUMERATOR = 8;
const COMMISSION_DENOMINATOR = 100;

/** Mirrors `orderFlow` in src/lib/data.ts. Cancelled is not a step forward. */
const FLOW = [
  "Order Placed",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
] as const;

export const getVendorDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<VendorDashboard> =>
    guarded(async () => {
      const [{ db }, { requireVendor }, { toProductDto, toVendorDto, toVendorOrderDto }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/guards"),
          import("@/lib/server/dto"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();

      const { vendor } = await requireVendor();
      const d = db();

      const products = [...d.t.products.values()].filter((p) => p.vendorId === vendor.id);

      const mineOrders = [...d.t.orders.values()]
        .filter((o) => o.items.some((i) => i.vendorId === vendor.id))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      const dtos = mineOrders.map((o) => toVendorOrderDto(o, vendor.id));

      const notCancelled = dtos.filter((o) => o.status !== "Cancelled");
      const settled = dtos.filter((o) => o.status === "Delivered");
      const inFlight = notCancelled.filter((o) => o.status !== "Delivered");
      const settledPaise = settled.reduce((s, o) => s + o.vendorSubtotalPaise, 0);

      return {
        vendor: toVendorDto(vendor),
        products: products.map(toProductDto),
        orders: dtos,
        stats: {
          liveListings: products.filter((p) => p.status === "Active").length,
          lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
          outOfStock: products.filter((p) => p.stock === 0).length,
          openOrders: inFlight.length,
          revenuePaise: notCancelled.reduce((s, o) => s + o.vendorSubtotalPaise, 0),
          settledPaise,
          inFlightPaise: inFlight.reduce((s, o) => s + o.vendorSubtotalPaise, 0),
          commissionPaise: Math.round(
            (settledPaise * COMMISSION_NUMERATOR) / COMMISSION_DENOMINATOR,
          ),
        },
      };
    }),
);

/**
 * Moves an order one step along the lifecycle.
 *
 * The request names the order, never the destination status — the next state is
 * computed from the current one. That makes "jump straight to Delivered" and
 * "reopen a cancelled order" unrepresentable rather than merely rejected.
 */
export const advanceVendorOrder = createServerFn({ method: "POST" })
  .validator((raw: unknown) => ({ orderId: str(obj(raw).orderId, "Order", { max: 64 }) }))
  .handler(async ({ data }): Promise<VendorOrderDto> =>
    guarded(async () => {
      const [{ tx }, { requireVendor, requireVendorOrder }, { toVendorOrderDto }, { seedIfEmpty }] =
        await Promise.all([
          import("@/lib/server/db"),
          import("@/lib/server/guards"),
          import("@/lib/server/dto"),
          import("@/lib/server/seed"),
        ]);
      seedIfEmpty();

      const { vendor } = await requireVendor();

      return tx(() => {
        const order = requireVendorOrder(vendor.id, data.orderId);

        if (order.status === "Cancelled") {
          throw conflict("This order was cancelled and can no longer be updated.");
        }
        const index = FLOW.indexOf(order.status as (typeof FLOW)[number]);
        if (index < 0 || index >= FLOW.length - 1) {
          throw conflict("This order is already complete.");
        }

        order.status = FLOW[index + 1]!;
        // Collecting cash is what settles a COD order, and that happens on
        // delivery. Any other method was already settled at checkout.
        if (order.status === "Delivered" && order.method === "COD" && order.payment === "Pending") {
          order.payment = "Paid";
        }

        return toVendorOrderDto(order, vendor.id);
      });
    }),
  );

// No listing write endpoints here on purpose.
//
// A stock-correction endpoint was written and then removed: nothing in the UI
// called it, and an endpoint no client needs is pure attack surface — it still
// has to be validated, authorized and maintained while earning nothing. The
// ownership helper it would use (`requireOwnedProduct` in guards.ts) is kept,
// because it is covered by tests and is what any future listing write must go
// through.
