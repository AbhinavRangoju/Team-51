/**
 * The only place money is calculated.
 *
 * routes/cart.tsx has a `useCartTotals()` that does this arithmetic in the
 * browser, and routes/checkout.tsx used to submit the result as the amount to
 * charge. The client copy still exists, because it is what paints the cart
 * summary while you adjust quantities, but it is now advisory only: this module
 * recomputes every figure from stored product rows at checkout, and the stored
 * order carries these numbers, not the browser's.
 *
 * The rules match the existing UI exactly so the displayed total and the
 * charged total agree:
 *   delivery  free at or above Rs.999 of subtotal, otherwise Rs.79
 *   GST       5% of subtotal, rounded to the nearest paisa
 *   total     subtotal + delivery + tax
 *
 * Everything is integer paise. `subtotal * 0.05` on rupee floats produces
 * values like 539.9999999999999 that stop reconciling once summed.
 */

import type { ProductRow } from "./db";

export const DELIVERY_FREE_THRESHOLD_PAISE = 99_900;
export const DELIVERY_FEE_PAISE = 7_900;
export const GST_NUMERATOR = 5;
export const GST_DENOMINATOR = 100;

export const DELIVERY_OPTIONS = {
  std: { label: "Standard", feePaise: 0, etaDays: 5 },
  exp: { label: "Express", feePaise: 14_900, etaDays: 2 },
} as const;

export type DeliverySpeed = keyof typeof DELIVERY_OPTIONS;
export const DELIVERY_SPEEDS = Object.keys(DELIVERY_OPTIONS) as DeliverySpeed[];

export const PAYMENT_METHODS = ["Card", "UPI", "COD", "Wallet"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type QuoteLine = {
  product: ProductRow;
  qty: number;
};

export type Quote = {
  lines: {
    productId: string;
    vendorId: string;
    name: string;
    qty: number;
    unitPricePaise: number;
    unitMrpPaise: number;
    linePaise: number;
  }[];
  mrpPaise: number;
  subtotalPaise: number;
  discountPaise: number;
  deliveryPaise: number;
  taxPaise: number;
  totalPaise: number;
};

/** Rounds half away from zero, matching the UI's Math.round on a positive value. */
const gst = (subtotalPaise: number): number =>
  Math.round((subtotalPaise * GST_NUMERATOR) / GST_DENOMINATOR);

export function quote(lines: QuoteLine[], speed: DeliverySpeed = "std"): Quote {
  const out: Quote["lines"] = lines.map(({ product, qty }) => ({
    productId: product.id,
    vendorId: product.vendorId,
    name: product.name,
    qty,
    unitPricePaise: product.pricePaise,
    unitMrpPaise: product.originalPricePaise ?? product.pricePaise,
    linePaise: product.pricePaise * qty,
  }));

  const mrpPaise = out.reduce((s, l) => s + l.unitMrpPaise * l.qty, 0);
  const subtotalPaise = out.reduce((s, l) => s + l.linePaise, 0);
  const baseDelivery =
    subtotalPaise === 0 || subtotalPaise >= DELIVERY_FREE_THRESHOLD_PAISE ? 0 : DELIVERY_FEE_PAISE;
  const deliveryPaise = baseDelivery + DELIVERY_OPTIONS[speed].feePaise;
  const taxPaise = gst(subtotalPaise);

  return {
    lines: out,
    mrpPaise,
    subtotalPaise,
    discountPaise: mrpPaise - subtotalPaise,
    deliveryPaise,
    taxPaise,
    totalPaise: subtotalPaise + deliveryPaise + taxPaise,
  };
}

export function etaLabel(speed: DeliverySpeed, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + DELIVERY_OPTIONS[speed].etaDays);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
