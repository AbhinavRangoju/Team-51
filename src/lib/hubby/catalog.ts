/**
 * Hubby's knowledge base.
 *
 * Serialises the live MarketHub catalogue — every product, price, discount,
 * stock level, spec, seller and category — plus the platform's own commerce
 * rules into one plain-text snapshot that is handed to Gemini as grounding
 * context on every turn.
 *
 * Two rules govern what goes in here:
 *
 * 1. ACCURACY. Everything below is derived from `@/lib/data`, the same module
 *    the storefront renders from, so Hubby can never quote a price the product
 *    page contradicts. Figures that are decorative rather than real (the
 *    per-category and per-vendor catalogue counts in the seed data) are
 *    labelled as such instead of being passed off as browsable inventory.
 *
 * 2. NO PII. `Vendor` carries `owner` and `email`. Neither is serialised. A
 *    prompt is attacker-reachable — the user controls part of the input the
 *    model reads — so putting seller contact details in it would be one
 *    successful prompt injection away from being exfiltrated. The public
 *    /vendors page withholds them for the same reason.
 */

import {
  categories,
  discountPct,
  getVendor,
  inr,
  orderFlow,
  products,
  vendors,
  type Product,
} from "@/lib/data";

/** Routes that actually exist. Hubby may only ever link to one of these. */
export const LIVE_ROUTES = [
  "/",
  "/shop",
  "/categories",
  "/deals",
  "/vendors",
  "/cart",
  "/checkout",
  "/login",
] as const;

/** Mirrors the stock wording on the product page so the two never disagree. */
function stockPhrase(p: Product): string {
  if (p.stock === 0) return "OUT OF STOCK — cannot be bought right now";
  if (p.stock < 10) return `low stock, only ${p.stock} left`;
  return `in stock, ${p.stock} units`;
}

function pricePhrase(p: Product): string {
  if (!p.originalPrice) return inr(p.price);
  const off = discountPct(p);
  const saving = p.originalPrice - p.price;
  return `${inr(p.price)} (was ${inr(p.originalPrice)} — ${off}% off, saves ${inr(saving)})`;
}

function productBlock(p: Product): string {
  const v = getVendor(p.vendorId);
  const seller = v
    ? `${v.name} (${v.id}, ${v.status}, ${v.city})`
    : `unknown seller (${p.vendorId})`;
  const specs = Object.entries(p.specs)
    .map(([k, val]) => `${k}=${val}`)
    .join("; ");

  return [
    `[${p.id}] ${p.name}`,
    `  price: ${pricePhrase(p)}`,
    `  category: ${p.category} | brand: ${p.brand} | sold by: ${seller}`,
    `  rating: ${p.rating}/5 from ${p.reviews.toLocaleString("en-IN")} reviews | ${stockPhrase(p)}`,
    `  tags: ${p.tags.join(", ") || "none"} | sku: ${p.sku} | listed: ${p.createdAt}`,
    `  specs: ${specs}`,
    `  about: ${p.description}`,
    `  link: /product/${p.id}`,
  ].join("\n");
}

function catalogueStats(): string {
  const prices = products.map((p) => p.price);
  const cheapest = products.reduce((a, b) => (a.price <= b.price ? a : b));
  const dearest = products.reduce((a, b) => (a.price >= b.price ? a : b));
  const discounted = products.filter((p) => discountPct(p) > 0);
  const deepest = discounted.reduce((a, b) => (discountPct(a) >= discountPct(b) ? a : b));
  const biggestSaving = discounted.reduce((a, b) =>
    (a.originalPrice! - a.price) >= (b.originalPrice! - b.price) ? a : b,
  );
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const mostReviewed = [...products].sort((a, b) => b.reviews - a.reviews)[0];
  const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const oos = products.filter((p) => p.stock === 0);
  const low = products.filter((p) => p.stock > 0 && p.stock < 10);
  const avgRating = products.reduce((s, p) => s + p.rating, 0) / products.length;

  return [
    `Live listings: ${products.length} products from ${new Set(products.map((p) => p.vendorId)).size} sellers across ${new Set(products.map((p) => p.category)).size} categories.`,
    `Price range: ${inr(Math.min(...prices))} to ${inr(Math.max(...prices))}.`,
    `Cheapest: ${cheapest.name} (${cheapest.id}) at ${inr(cheapest.price)}.`,
    `Most expensive: ${dearest.name} (${dearest.id}) at ${inr(dearest.price)}.`,
    `On discount: ${discounted.length} of ${products.length} products.`,
    `Deepest discount: ${deepest.name} (${deepest.id}) at ${discountPct(deepest)}% off.`,
    `Largest rupee saving: ${biggestSaving.name} (${biggestSaving.id}), saves ${inr(biggestSaving.originalPrice! - biggestSaving.price)}.`,
    `Average rating across the catalogue: ${avgRating.toFixed(2)}/5.`,
    `Top rated: ${topRated.map((p) => `${p.name} (${p.id}, ${p.rating})`).join(", ")}.`,
    `Most reviewed: ${mostReviewed.name} (${mostReviewed.id}, ${mostReviewed.reviews.toLocaleString("en-IN")} reviews).`,
    `Newest listing: ${newest.name} (${newest.id}, listed ${newest.createdAt}).`,
    `Out of stock: ${oos.length ? oos.map((p) => `${p.name} (${p.id})`).join(", ") : "none"}.`,
    `Low stock (under 10 left): ${low.length ? low.map((p) => `${p.name} (${p.id}, ${p.stock} left)`).join(", ") : "none"}.`,
  ].join("\n");
}

function vendorBlock(): string {
  return vendors
    .map((v) => {
      const live = products.filter((p) => p.vendorId === v.id);
      const rating = v.rating > 0 ? `${v.rating}/5 seller rating` : "not yet rated";
      const liveNote = live.length
        ? `${live.length} browsable listing${live.length === 1 ? "" : "s"}: ${live.map((p) => p.id).join(", ")}`
        : "no browsable listings yet";
      return `[${v.id}] ${v.name} — "${v.tagline}" | ${v.status} | ${v.city} | selling since ${v.since} | ${rating} | catalogue size claimed: ${v.products} | ${liveNote}`;
    })
    .join("\n");
}

function categoryBlock(): string {
  return categories
    .map((c) => {
      const live = products.filter((p) => p.category === c.slug);
      return `${c.name} (slug "${c.slug}") — catalogue size claimed: ${c.count} | browsable now: ${live.length}${live.length ? ` (${live.map((p) => p.id).join(", ")})` : ""} | link: /shop?cat=${c.slug}`;
    })
    .join("\n");
}

const PLATFORM_RULES = `
MarketHub is a multi-vendor marketplace. Sellers list their own products; MarketHub
verifies sellers before their listings go live. All prices are Indian Rupees (INR),
formatted Indian-style, e.g. ₹8,999 and ₹64,990. Prices on product pages are
inclusive of all taxes.

CART AND CHARGES (exactly how the cart computes a total):
- Delivery is FREE when the cart subtotal is ₹999 or more; below that it is ₹79.
- GST is added at 5% of the subtotal.
- Total = subtotal + delivery + GST.

CHECKOUT:
- Four steps: Address, Delivery, Payment, Review.
- Delivery speeds: Standard — free, 3 to 5 business days. Express — ₹149, 1 to 2
  business days. The Express fee is charged on top of the cart total.
- Payment methods: Credit/Debit Card, UPI, Cash on Delivery, MarketHub Wallet.
- Cash on Delivery leaves the order's payment state as Pending until it arrives.
- A 6-digit PIN code is required for the shipping address.

BUYER PROMISES shown on every product page:
- Free delivery, 7-day returns, and buyer protection on every order.

ORDER TRACKING: orders move through ${orderFlow.join(" -> ")}. An order can also be
Cancelled, in which case payment is Refunded.

DEALS: the current campaign is "Festive Week", live on /deals. It runs until the end
of the coming Sunday and prices drop daily at noon. Deals can be filtered by discount
tier: all offers, 20%+, 30%+, 40%+.

SHOPPING AND FILTERING on /shop:
- Filters: category, maximum price (slider from ₹500 to ₹70,000), minimum rating
  (any, 4★ and up, 4.5★ and up), seller (verified sellers only), in-stock only, and
  on-discount only.
- Sort options: Relevance, Price: Low to High, Price: High to Low, Rating, Newest,
  Popularity. Results paginate 8 at a time.
- A category can be deep-linked as /shop?cat=<slug> and a search as /shop?q=<terms>.

SELLING ON MARKETHUB: sellers apply and are listed as Pending Verification until
MarketHub verifies them; only verified sellers appear in the /shop seller filter.
`.trim();

let cached: string | undefined;

/**
 * The full grounding snapshot. Built once per process — the catalogue is static
 * seed data, so there is nothing to invalidate. If MarketHub later moves to a
 * real database, this is the single place that has to start reading from it.
 */
export function getCatalogContext(): string {
  if (cached) return cached;

  cached = [
    "=== MARKETHUB PLATFORM RULES ===",
    PLATFORM_RULES,
    "",
    "=== CATALOGUE AT A GLANCE ===",
    catalogueStats(),
    "",
    "=== ALL LIVE PRODUCTS (this is the complete catalogue — there are no others) ===",
    products.map(productBlock).join("\n\n"),
    "",
    "=== SELLERS ===",
    'Note: "catalogue size claimed" is the seller\'s own stated catalogue size. Only the',
    "browsable listings below can actually be bought or linked to today. Never quote the",
    "claimed figure as though those products are available.",
    vendorBlock(),
    "",
    "=== CATEGORIES ===",
    'Same caveat: "catalogue size claimed" is a marketing figure, "browsable now" is real.',
    categoryBlock(),
  ].join("\n");

  return cached;
}
