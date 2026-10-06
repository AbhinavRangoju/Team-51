/**
 * Quote and checkout.
 *
 * WHAT THE CLIENT IS ALLOWED TO SEND
 * Product ids, quantities, a delivery speed, a payment method, a shipping
 * address, and an idempotency key. That is the user's *intent*, and it is the
 * only thing a browser is in a position to know.
 *
 * WHAT THE SERVER DECIDES
 * Unit prices, MRP, discount, delivery fee, GST, grand total, the order id, the
 * payment state, and whether there was enough stock. routes/checkout.tsx used
 * to decide every one of those and submit the result; none of it is read from
 * the request now. There is no validator for a price or a total, so there is no
 * field to tamper with.
 *
 * DOUBLE SUBMIT
 * `idempotencyKey` is unique across the orders table. A retry — double click,
 * impatient refresh, flaky network replay — finds the existing order and gets
 * it back verbatim instead of placing a second one and charging twice.
 *
 * STOCK
 * The check and the decrement sit in the same synchronous `tx()` block. Node
 * runs one thread, so no other checkout can observe the stock between the
 * check and the write. Two shoppers racing for the last unit means one succeeds
 * and one is told it sold out.
 */

import { createServerFn } from "@tanstack/react-start";

import type { ProductRow } from "@/lib/server/db";
import type { OrderDto } from "@/lib/server/dto";
import type { DeliverySpeed, PaymentMethod } from "@/lib/server/pricing";
import {
  badRequest,
  conflict,
  guarded,
  int,
  obj,
  oneOf,
  phone as parsePhone,
  pin as parsePin,
  str,
} from "@/lib/server/validate";

const MAX_LINES = 50;
const MAX_QTY_PER_LINE = 20;

export type CartInputLine = { productId: string; qty: number };

export type QuoteInput = {
  items: CartInputLine[];
  speed: DeliverySpeed;
};

export type ShippingInput = {
  name: string;
  phone: string;
  line: string;
  city: string;
  pin: string;
};

export type PlaceOrderInput = QuoteInput & {
  method: PaymentMethod;
  address: ShippingInput;
  idempotencyKey: string;
};

/** Money leaves the server already formatted-ready: integer paise plus rupees. */
export type QuoteDto = {
  lines: {
    productId: string;
    name: string;
    qty: number;
    unitPricePaise: number;
    linePaise: number;
    /** Clamped to what is actually in stock, so the UI can flag a shortfall. */
    available: number;
  }[];
  mrpPaise: number;
  subtotalPaise: number;
  discountPaise: number;
  deliveryPaise: number;
  taxPaise: number;
  totalPaise: number;
  /** Set when at least one line cannot be fulfilled at the requested quantity. */
  problems: string[];
};

export type { OrderDto };

const SPEEDS = ["std", "exp"] as const;
const METHODS = ["Card", "UPI", "COD", "Wallet"] as const;

function validateItems(raw: unknown): CartInputLine[] {
  if (!Array.isArray(raw) || raw.length === 0) throw badRequest("Your cart is empty.");
  if (raw.length > MAX_LINES) throw badRequest("Too many items in one order.");

  const seen = new Set<string>();
  const items: CartInputLine[] = [];
  for (const entry of raw) {
    const line = obj(entry);
    const productId = str(line.productId, "Product", { max: 64 });
    // Collapsing duplicates server-side stops a crafted body from sneaking past
    // the per-line quantity cap by repeating the same product.
    if (seen.has(productId)) throw badRequest("Duplicate item in cart.");
    seen.add(productId);
    items.push({ productId, qty: int(line.qty, "Quantity", { min: 1, max: MAX_QTY_PER_LINE }) });
  }
  return items;
}

function validateQuote(raw: unknown): QuoteInput {
  const body = obj(raw);
  return {
    items: validateItems(body.items),
    speed: oneOf(body.speed ?? "std", SPEEDS, "Delivery option"),
  };
}

function validateAddress(raw: unknown): ShippingInput {
  const a = obj(raw);
  return {
    name: str(a.name, "Full name", { min: 2, max: 80 }),
    phone: parsePhone(a.phone),
    line: str(a.line, "Address", { min: 5, max: 200 }),
    city: str(a.city, "City", { min: 2, max: 80 }),
    pin: parsePin(a.pin),
  };
}

function validatePlaceOrder(raw: unknown): PlaceOrderInput {
  const body = obj(raw);
  return {
    items: validateItems(body.items),
    speed: oneOf(body.speed ?? "std", SPEEDS, "Delivery option"),
    method: oneOf(body.method, METHODS, "Payment method"),
    address: validateAddress(body.address),
    idempotencyKey: str(body.idempotencyKey, "Request key", { min: 8, max: 100 }),
  };
}

/**
 * Priced from stored rows, with no side effects.
 *
 * Used for the checkout summary. It reports shortfalls rather than throwing, so
 * the UI can show "only 3 left" while the shopper is still editing, and only
 * `placeOrder` is strict.
 */
export const getQuote = createServerFn({ method: "POST" })
  .validator(validateQuote)
  .handler(async ({ data }): Promise<QuoteDto> =>
    guarded(async () => {
      const [{ db }, { quote }, { seedIfEmpty }] = await Promise.all([
        import("@/lib/server/db"),
        import("@/lib/server/pricing"),
        import("@/lib/server/seed"),
      ]);
      seedIfEmpty();

      const d = db();
      const problems: string[] = [];
      const priced: { product: ProductRow; qty: number }[] = [];

      for (const line of data.items) {
        const product = d.t.products.get(line.productId);
        if (!product || product.status !== "Active") {
          problems.push("An item in your cart is no longer available.");
          continue;
        }
        const qty = Math.min(line.qty, product.stock);
        if (qty <= 0) {
          problems.push(`${product.name} is out of stock.`);
          continue;
        }
        if (qty < line.qty) {
          problems.push(`Only ${product.stock} left of ${product.name}.`);
        }
        priced.push({ product, qty });
      }

      const q = quote(priced, data.speed);
      return {
        lines: q.lines.map((l) => ({
          productId: l.productId,
          name: l.name,
          qty: l.qty,
          unitPricePaise: l.unitPricePaise,
          linePaise: l.linePaise,
          available: d.t.products.get(l.productId)?.stock ?? 0,
        })),
        mrpPaise: q.mrpPaise,
        subtotalPaise: q.subtotalPaise,
        discountPaise: q.discountPaise,
        deliveryPaise: q.deliveryPaise,
        taxPaise: q.taxPaise,
        totalPaise: q.totalPaise,
        problems,
      };
    }),
  );

export const placeOrder = createServerFn({ method: "POST" })
  .validator(validatePlaceOrder)
  .handler(async ({ data }): Promise<OrderDto> =>
    guarded(async () => {
      const [
        { db, newOrderId, nowIso, tx },
        { quote, etaLabel },
        { requireUser },
        { seedIfEmpty },
        { clientKey, rateLimited, CHECKOUT_LIMIT },
        { toOrderDto },
      ] = await Promise.all([
        import("@/lib/server/db"),
        import("@/lib/server/pricing"),
        import("@/lib/server/guards"),
        import("@/lib/server/seed"),
        import("@/lib/server/ratelimit"),
        import("@/lib/server/dto"),
      ]);

      seedIfEmpty();

      // Checkout requires a real session. Previously anyone could "place" an
      // order because it only ever existed in their own localStorage.
      const user = await requireUser();

      if (rateLimited(await clientKey(`checkout:${user.id}`), CHECKOUT_LIMIT)) {
        throw badRequest("Too many checkout attempts. Please wait a moment.");
      }

      const d = db();

      // Idempotency is scoped to the user, so one shopper's key cannot be used
      // to fetch another shopper's order.
      const scopedKey = `${user.id}:${data.idempotencyKey}`;
      const existingId = d.idemIndex.get(scopedKey);
      if (existingId) {
        const existing = d.t.orders.get(existingId);
        if (existing && existing.userId === user.id) return toOrderDto(existing);
      }

      return tx(() => {
        // --- validate everything before touching a single row ---
        const lines: { product: ProductRow; qty: number }[] = [];
        for (const line of data.items) {
          const product = d.t.products.get(line.productId);
          if (!product || product.status !== "Active") {
            throw conflict("An item in your cart is no longer available. Please review your cart.");
          }
          if (product.stock < line.qty) {
            throw conflict(
              product.stock === 0
                ? `${product.name} just sold out.`
                : `Only ${product.stock} left of ${product.name}.`,
            );
          }
          lines.push({ product, qty: line.qty });
        }

        // Re-check the key inside the critical section. Two requests that both
        // passed the read above cannot both get here.
        if (d.idemIndex.has(scopedKey)) {
          const already = d.t.orders.get(d.idemIndex.get(scopedKey)!);
          if (already && already.userId === user.id) return toOrderDto(already);
        }

        const q = quote(lines, data.speed);

        // --- past this point nothing can fail, so no rollback is needed ---
        for (const { product, qty } of lines) {
          product.stock -= qty;
          if (product.stock < 0) throw new Error("stock invariant violated");
        }

        const order = {
          id: newOrderId(),
          userId: user.id,
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
          status: "Order Placed" as const,
          // Decided here, not by the browser. Cash on delivery is unpaid until
          // it is collected; everything else is treated as settled by the
          // (simulated) gateway.
          payment: data.method === "COD" ? ("Pending" as const) : ("Paid" as const),
          method: data.method,
          eta: etaLabel(data.speed),
          shipName: data.address.name,
          shipPhone: data.address.phone,
          shipLine: data.address.line,
          shipCity: data.address.city,
          shipPin: data.address.pin,
          idempotencyKey: scopedKey,
          createdAt: nowIso(),
        };

        d.t.orders.set(order.id, order);
        d.idemIndex.set(scopedKey, order.id);

        return toOrderDto(order);
      });
    }),
  );
