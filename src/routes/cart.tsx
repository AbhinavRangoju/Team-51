import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/mh/StoreLayout";
import { EmptyState } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { getProduct, getVendor, inr, vendors } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — MarketHub" },
      { name: "description", content: "Review items from multiple sellers in your MarketHub cart." },
      { property: "og:title", content: "Your cart — MarketHub" },
      { property: "og:description", content: "Review items from multiple sellers in your MarketHub cart." },
    ],
  }),
  component: CartPage,
});

export function useCartTotals() {
  const { cart } = useStore();
  const lines = cart.filter((l) => !l.saved).map((l) => ({ ...l, product: getProduct(l.productId)! })).filter((l) => l.product);
  const mrp = lines.reduce((s, l) => s + (l.product.originalPrice ?? l.product.price) * l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discount = mrp - subtotal;
  const delivery = subtotal === 0 || subtotal >= 999 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  return { lines, mrp, subtotal, discount, delivery, tax, total: subtotal + delivery + tax };
}

export function SummaryRows({ t }: { t: ReturnType<typeof useCartTotals> }) {
  const row = "flex justify-between text-sm";
  return (
    <div className="space-y-3">
      <div className={row}><span className="text-muted-foreground">Subtotal (MRP)</span><span>{inr(t.mrp)}</span></div>
      <div className={row}><span className="text-muted-foreground">Discounts</span><span className="text-success">−{inr(t.discount)}</span></div>
      <div className={row}><span className="text-muted-foreground">Delivery</span><span>{t.delivery === 0 ? "Free" : inr(t.delivery)}</span></div>
      <div className={row}><span className="text-muted-foreground">GST (5%)</span><span>{inr(t.tax)}</span></div>
      <div className="flex justify-between border-t border-border pt-4 font-display text-lg font-semibold"><span>Total</span><span>{inr(t.total)}</span></div>
    </div>
  );
}

function CartPage() {
  const { cart, setQty, removeFromCart, toggleSaved } = useStore();
  const t = useCartTotals();
  const saved = cart.filter((l) => l.saved);
  const groups = vendors.map((v) => ({ vendor: v, lines: t.lines.filter((l) => l.product.vendorId === v.id) })).filter((g) => g.lines.length);

  return (
    <StoreLayout>
      <div className="container-mh pt-10">
        <h1 className="text-3xl font-semibold md:text-4xl">Your cart</h1>
        {t.lines.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={<ShoppingBag />} title="Your cart is empty" body="Looks like you haven't added anything yet. Explore thousands of products from verified sellers." action={<Button asChild variant="brand" size="lg"><Link to="/shop">Start shopping</Link></Button>} />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              {groups.map(({ vendor, lines }) => (
                <div key={vendor.id} className="card-mh overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border bg-surface/60 px-5 py-3 text-sm">
                    <span className="flex items-center gap-1.5 font-semibold">{vendor.name}<BadgeCheck className="h-4 w-4 text-brand" /></span>
                    <span className="text-muted-foreground">Ships from {vendor.city}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {lines.map(({ product: p, qty }) => (
                      <div key={p.id} className="flex gap-4 p-5">
                        <Link to="/product/$id" params={{ id: p.id }} className="shrink-0"><img src={p.image} alt="" className="h-24 w-24 rounded-2xl object-cover" /></Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex justify-between gap-3">
                            <Link to="/product/$id" params={{ id: p.id }} className="font-medium hover:text-brand">{p.name}</Link>
                            <span className="font-semibold">{inr(p.price * qty)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{inr(p.price)} each</span>
                          <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                            <div className="flex h-9 items-center rounded-full border border-border">
                              <button className="grid h-9 w-9 place-items-center disabled:opacity-40" disabled={qty <= 1} onClick={() => setQty(p.id, qty - 1)} aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                              <button className="grid h-9 w-9 place-items-center disabled:opacity-40" disabled={qty >= p.stock} onClick={() => setQty(p.id, qty + 1)} aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                            </div>
                            <button onClick={() => { toggleSaved(p.id); toast("Saved for later"); }} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Save for later</button>
                            <button onClick={() => { removeFromCart(p.id); toast("Removed from cart"); }} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {saved.length > 0 && (
                <div>
                  <h3 className="mb-3 mt-8 font-semibold">Saved for later ({saved.length})</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {saved.map((l) => { const p = getProduct(l.productId)!; return (
                      <div key={p.id} className="card-mh flex items-center gap-3 p-3">
                        <img src={p.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{getVendor(p.vendorId)?.name}</div></div>
                        <Button size="sm" variant="outline" onClick={() => toggleSaved(p.id)}>Move to cart</Button>
                      </div>
                    ); })}
                  </div>
                </div>
              )}
            </div>
            <aside className="card-mh h-fit p-6 lg:sticky lg:top-28">
              <h3 className="mb-5 text-lg font-semibold">Order summary</h3>
              <SummaryRows t={t} />
              <Button asChild variant="brand" size="lg" className="mt-6 w-full"><Link to="/checkout">Proceed to Checkout</Link></Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">{groups.length} seller{groups.length > 1 ? "s" : ""} · protected by MarketHub Buyer Guarantee</p>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
