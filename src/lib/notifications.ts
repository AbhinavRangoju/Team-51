/**
 * Notifications are derived, not stored.
 *
 * There is no notification service behind MarketHub, so rather than ship a
 * hardcoded feed that says the same three things forever, this reads the
 * shopper's actual state — their orders, their wishlist, the live catalogue —
 * and reports what is genuinely true right now. Mark an order delivered and the
 * feed changes. Wishlist a discounted product and it appears.
 *
 * Everything here is a pure function of (orders, wishlist), which also means the
 * unread badge in the header cannot drift out of sync with the list.
 */

import { discountPct, getProduct, getVendor, inr, type Order } from "./data";

export type NoticeKind = "order" | "price" | "stock" | "promo";

/** Where a notification sends you. Kept as a union so Link stays type-checked. */
export type NoticeTarget =
  | { to: "/orders" }
  | { to: "/deals" }
  | { to: "/product/$id"; params: { id: string } }
  | { to: "/account"; search: { tab: "wishlist" } };

export type Notice = {
  /** Stable across renders so read-state survives a reload. */
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  /** ISO date, used for ordering and display. */
  date: string;
  target: NoticeTarget;
};

const ORDER_COPY: Partial<Record<Order["status"], (o: Order) => string>> = {
  Confirmed: (o) => `The seller has confirmed ${o.id}. It will be packed shortly.`,
  Processing: (o) => `${o.id} is being packed and will ship soon.`,
  Shipped: (o) => `${o.id} has shipped and should arrive by ${o.eta}.`,
  "Out for Delivery": (o) => `${o.id} is out for delivery today. Keep your phone handy.`,
  Delivered: (o) => `${o.id} was delivered. Returns stay open for 7 days.`,
  Cancelled: (o) => `${o.id} was cancelled and ${inr(o.total)} refunded to your original payment method.`,
};

export function buildNotices(orders: Order[], wishlist: string[]): Notice[] {
  const out: Notice[] = [];

  // One notice per order, reflecting where it actually is in the flow.
  for (const o of orders) {
    const copy = ORDER_COPY[o.status];
    if (!copy) continue;
    out.push({
      // Status is part of the id so advancing an order surfaces a fresh unread
      // notice rather than silently reusing a read one.
      id: `order:${o.id}:${o.status}`,
      kind: o.status === "Cancelled" ? "order" : "order",
      title:
        o.status === "Delivered"
          ? "Order delivered"
          : o.status === "Cancelled"
            ? "Order cancelled"
            : o.status === "Out for Delivery"
              ? "Arriving today"
              : o.status === "Shipped"
                ? "Order shipped"
                : "Order update",
      body: copy(o),
      date: o.date,
      target: { to: "/orders" },
    });
  }

  // Price and stock movement on things the shopper actually saved.
  for (const id of wishlist) {
    const p = getProduct(id);
    if (!p) continue;

    const off = discountPct(p);
    if (off > 0) {
      out.push({
        id: `price:${p.id}:${p.price}`,
        kind: "price",
        title: `${off}% off something you saved`,
        body: `${p.name} from ${getVendor(p.vendorId)?.name ?? "a verified seller"} is down to ${inr(p.price)}.`,
        date: p.createdAt,
        target: { to: "/product/$id", params: { id: p.id } },
      });
    }

    if (p.stock === 0) {
      out.push({
        id: `stock:${p.id}:out`,
        kind: "stock",
        title: "Saved item out of stock",
        body: `${p.name} has sold out. We'll keep it on your wishlist in case it returns.`,
        date: p.createdAt,
        target: { to: "/account", search: { tab: "wishlist" } },
      });
    } else if (p.stock < 10) {
      out.push({
        id: `stock:${p.id}:${p.stock}`,
        kind: "stock",
        title: "Saved item running low",
        body: `Only ${p.stock} left of ${p.name}.`,
        date: p.createdAt,
        target: { to: "/product/$id", params: { id: p.id } },
      });
    }
  }

  // One standing campaign notice, so a brand-new account is not staring at an
  // empty page on first visit.
  out.push({
    id: "promo:festive-week",
    kind: "promo",
    title: "Festive Week is live",
    body: "Discounts from verified sellers, with prices dropping daily at noon.",
    date: new Date().toISOString().slice(0, 10),
    target: { to: "/deals" },
  });

  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export function unreadCount(notices: Notice[], read: string[]): number {
  const seen = new Set(read);
  return notices.reduce((n, x) => (seen.has(x.id) ? n : n + 1), 0);
}
