import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CreditCard, Info, Smartphone, Wallet, Banknote, TriangleAlert, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RequireAuth } from "@/components/mh/RequireAuth";
import { EmptyState, Field, fieldCls } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { getQuote, placeOrder, type QuoteDto } from "@/lib/api/checkout";
import type { OrderDto } from "@/lib/server/dto";
import { getProduct } from "@/lib/data";
import { inrPaise } from "@/lib/money";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MarketHub" },
      { name: "description", content: "Complete your MarketHub order in a few simple steps." },
      { property: "og:title", content: "Checkout — MarketHub" },
      { property: "og:description", content: "Complete your MarketHub order in a few simple steps." },
      // Nothing here should be indexed; it is a signed-in, per-user page.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutRoute,
});

const steps = ["Address", "Delivery", "Payment", "Review"];

/**
 * Labels and copy only. The fee for each option lives in
 * src/lib/server/pricing.ts and is applied there — this list no longer carries
 * a price, so editing it cannot change what a shopper is charged.
 */
const deliveryOpts = [
  { id: "std", label: "Standard", sub: "3–5 business days" },
  { id: "exp", label: "Express", sub: "1–2 business days" },
] as const;

const payOpts = [
  { id: "Card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "COD", label: "Cash on Delivery", icon: Banknote },
  { id: "Wallet", label: "MarketHub Wallet", icon: Wallet },
] as const;

type Speed = (typeof deliveryOpts)[number]["id"];
type Method = (typeof payOpts)[number]["id"];

function CheckoutRoute() {
  // Checkout writes an order against the caller's identity, so it needs a real
  // session. Previously it "worked" signed out because the order only ever
  // existed in the visitor's own localStorage.
  return (
    <RequireAuth
      title="Sign in to check out"
      body="We need to know who to ship this to, and where to keep your order history."
    >
      <Checkout />
    </RequireAuth>
  );
}

/** Totals as the server computed them. Never recalculated in the browser. */
function SummaryRows({ q, pending }: { q: QuoteDto | null; pending: boolean }) {
  const row = "flex justify-between text-sm";
  if (!q) {
    return (
      <div className="space-y-3 text-sm text-muted-foreground" aria-busy="true">
        Working out your total…
      </div>
    );
  }
  return (
    <div className={cn("space-y-3", pending && "opacity-60")}>
      <div className={row}><span className="text-muted-foreground">Subtotal (MRP)</span><span>{inrPaise(q.mrpPaise)}</span></div>
      <div className={row}><span className="text-muted-foreground">Discounts</span><span className="text-success">−{inrPaise(q.discountPaise)}</span></div>
      <div className={row}><span className="text-muted-foreground">Delivery</span><span>{q.deliveryPaise === 0 ? "Free" : inrPaise(q.deliveryPaise)}</span></div>
      <div className={row}><span className="text-muted-foreground">GST (5%)</span><span>{inrPaise(q.taxPaise)}</span></div>
      <div className="flex justify-between border-t border-border pt-4 font-display text-lg font-semibold"><span>Total</span><span>{inrPaise(q.totalPaise)}</span></div>
    </div>
  );
}

function Checkout() {
  const { cart, clearCart, user, refreshOrders } = useStore();
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({ name: user?.name ?? "", phone: "", line: "", city: "", pin: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [speed, setSpeed] = useState<Speed>("std");
  const [pay, setPay] = useState<Method>("UPI");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", upi: "" });
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [done, setDone] = useState<OrderDto | null>(null);
  const [quote, setQuote] = useState<QuoteDto | null>(null);
  const [quoting, setQuoting] = useState(false);

  // One key per checkout attempt, held for the life of the page. A double click,
  // an impatient refresh or a replayed request reuses it, and the server returns
  // the order it already created instead of placing a second one.
  const idempotencyKey = useRef<string>("");
  if (!idempotencyKey.current) {
    idempotencyKey.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  const items = useMemo(
    () => cart.filter((l) => !l.saved).map((l) => ({ productId: l.productId, qty: l.qty })),
    [cart],
  );

  const refreshQuote = useCallback(async () => {
    if (!items.length) {
      setQuote(null);
      return;
    }
    setQuoting(true);
    try {
      setQuote(await getQuote({ data: { items, speed } }));
    } catch {
      // Leave the previous quote on screen rather than flashing a wrong number.
      // Checkout re-prices server-side anyway, so a stale display cannot cause
      // an incorrect charge.
    } finally {
      setQuoting(false);
    }
  }, [items, speed]);

  useEffect(() => {
    if (done) return;
    void refreshQuote();
  }, [refreshQuote, done]);

  const validateAddr = () => {
    const e: Record<string, string> = {};
    if (addr.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^\d{10}$/.test(addr.phone)) e.phone = "Enter a 10-digit mobile number";
    if (addr.line.trim().length < 5) e.line = "Enter your street address";
    if (!addr.city.trim()) e.city = "Enter a city";
    if (!/^\d{6}$/.test(addr.pin)) e.pin = "PIN code must be 6 digits";
    setErrors(e);
    return !Object.keys(e).length;
  };

  // Payment-instrument checks are presentation only. No card or UPI detail is
  // sent anywhere — there is no payment gateway in this build — so these exist
  // to make the form behave, not to secure anything.
  const validatePay = () => {
    const e: Record<string, string> = {};
    if (pay === "Card") {
      if (card.num.replace(/\s/g, "").length !== 16) e.num = "Card number must be 16 digits";
      if (!/^\d{2}\/\d{2}$/.test(card.exp)) e.exp = "Use MM/YY";
      if (!/^\d{3}$/.test(card.cvv)) e.cvv = "3 digits";
    }
    if (pay === "UPI" && !/^[\w.-]+@\w+$/.test(card.upi)) e.upi = "Enter a valid UPI ID, e.g. name@bank";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (step === 0 && !validateAddr()) return;
    if (step === 2 && !validatePay()) return;
    setStep(step + 1);
  };

  const place = async () => {
    if (placing) return;
    setPlacing(true);
    setPlaceError("");
    try {
      // Only intent crosses the wire: what, how many, how fast, how paid, where
      // to. Prices, the grand total, the order id and the payment state are all
      // decided server-side.
      const order = await placeOrder({
        data: {
          items,
          speed,
          method: pay,
          address: {
            name: addr.name.trim(),
            phone: addr.phone,
            line: addr.line.trim(),
            city: addr.city.trim(),
            pin: addr.pin,
          },
          idempotencyKey: idempotencyKey.current,
        },
      });
      clearCart();
      void refreshOrders();
      setDone(order);
    } catch (error) {
      const raw = error instanceof Error ? error.message.trim() : "";
      setPlaceError(raw && raw.length <= 200 ? raw : "We could not place your order. Please try again.");
      // Stock may have moved under us, so re-price before the shopper retries.
      void refreshQuote();
    } finally {
      setPlacing(false);
    }
  };

  if (done) {
    const units = done.items.reduce((s, i) => s + i.qty, 0);
    return (
      <div className="container-mh max-w-2xl pt-16">
        <div className="card-mh p-8 text-center md:p-12">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success-soft animate-in zoom-in duration-500">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-success text-brand-foreground"><Check className="h-7 w-7" strokeWidth={3} /></div>
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Order confirmed!</h1>
          <p className="mt-2 text-muted-foreground">Thanks, {done.shipTo.name.split(" ")[0]}. Your sellers have been notified.</p>
          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl bg-surface p-5 text-left text-sm">
            <div><div className="text-muted-foreground">Order ID</div><div className="font-semibold">{done.id}</div></div>
            <div><div className="text-muted-foreground">Arrives by</div><div className="font-semibold">{done.eta}</div></div>
            <div><div className="text-muted-foreground">Total paid</div><div className="font-semibold">{inrPaise(done.totalPaise)}</div></div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{units} items purchased</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg"><Link to="/orders">View Order</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/shop">Continue Shopping</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-mh pt-16"><EmptyState icon={<ShoppingBag />} title="Nothing to check out" body="Add a few items to your cart first." action={<Button asChild variant="brand"><Link to="/shop">Browse products</Link></Button>} /></div>
    );
  }

  const optCls = (on: boolean) => cn("flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 text-left transition", on ? "border-primary bg-surface" : "border-border hover:border-muted-foreground");

  return (
    <div className="container-mh pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 text-xs font-semibold text-warning"><Info className="h-3.5 w-3.5" />Demo checkout — no real payment is taken</span>
      </div>
      <ol className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold", i < step ? "bg-success text-brand-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground")}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</span>
            <span className={cn("hidden text-sm font-medium sm:inline", i > step && "text-muted-foreground")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-success" : "bg-border")} />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card-mh p-6 md:p-8">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <h2 className="text-xl font-semibold sm:col-span-2">Shipping address</h2>
              <Field label="Full name" error={errors.name}><input className={fieldCls} aria-invalid={!!errors.name} value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} /></Field>
              <Field label="Mobile number" error={errors.phone}><input className={fieldCls} aria-invalid={!!errors.phone} inputMode="numeric" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="9876543210" /></Field>
              <div className="sm:col-span-2"><Field label="Address" error={errors.line}><input className={fieldCls} aria-invalid={!!errors.line} value={addr.line} onChange={(e) => setAddr({ ...addr, line: e.target.value })} placeholder="House no., street, area" /></Field></div>
              <Field label="City" error={errors.city}><input className={fieldCls} aria-invalid={!!errors.city} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} /></Field>
              <Field label="PIN code" error={errors.pin}><input className={fieldCls} aria-invalid={!!errors.pin} inputMode="numeric" value={addr.pin} onChange={(e) => setAddr({ ...addr, pin: e.target.value })} /></Field>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="mb-4 text-xl font-semibold">Delivery speed</h2>
              {deliveryOpts.map((o) => (
                <button key={o.id} onClick={() => setSpeed(o.id)} className={optCls(speed === o.id)}>
                  <span className={cn("h-5 w-5 rounded-full border-2", speed === o.id ? "border-[6px] border-primary" : "border-border")} />
                  <div className="flex-1"><div className="font-semibold">{o.label}</div><div className="text-sm text-muted-foreground">{o.sub}</div></div>
                  {/* The fee shown is the server's, read back off the live quote. */}
                  <span className="font-semibold">
                    {speed === o.id && quote ? (quote.deliveryPaise ? inrPaise(quote.deliveryPaise) : "Free") : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="mb-4 text-xl font-semibold">Payment method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {payOpts.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => { setPay(id); setErrors({}); }} className={optCls(pay === id)}><Icon className="h-5 w-5" /><span className="font-semibold">{label}</span></button>
                ))}
              </div>
              {pay === "Card" && (
                <div className="grid gap-4 pt-4 sm:grid-cols-4">
                  <div className="sm:col-span-2"><Field label="Card number" error={errors.num} hint="Use any test number, e.g. 4242 4242 4242 4242"><input className={fieldCls} aria-invalid={!!errors.num} value={card.num} onChange={(e) => setCard({ ...card, num: e.target.value })} /></Field></div>
                  <Field label="Expiry" error={errors.exp}><input className={fieldCls} aria-invalid={!!errors.exp} placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></Field>
                  <Field label="CVV" error={errors.cvv}><input className={fieldCls} aria-invalid={!!errors.cvv} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} /></Field>
                </div>
              )}
              {pay === "UPI" && <div className="pt-4"><Field label="UPI ID" error={errors.upi}><input className={fieldCls} aria-invalid={!!errors.upi} placeholder="name@okbank" value={card.upi} onChange={(e) => setCard({ ...card, upi: e.target.value })} /></Field></div>}
              {pay === "COD" && <p className="pt-4 text-sm text-muted-foreground">Pay in cash or UPI when your order arrives.</p>}
              {pay === "Wallet" && <p className="pt-4 text-sm text-muted-foreground">Demo wallet — no balance is debited.</p>}
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Review your order</h2>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-surface p-4"><div className="text-muted-foreground">Ship to</div><div className="mt-1 font-medium">{addr.name}<br />{addr.line}, {addr.city} {addr.pin}</div></div>
                <div className="rounded-2xl bg-surface p-4"><div className="text-muted-foreground">Delivery</div><div className="mt-1 font-medium">{deliveryOpts.find((o) => o.id === speed)?.label}</div></div>
                <div className="rounded-2xl bg-surface p-4"><div className="text-muted-foreground">Payment</div><div className="mt-1 font-medium">{payOpts.find((p) => p.id === pay)?.label}</div></div>
              </div>
              {/* Lines, quantities and prices as priced by the server. */}
              <div className="mt-6 divide-y divide-border">
                {(quote?.lines ?? []).map((l) => {
                  const p = getProduct(l.productId);
                  return (
                    <div key={l.productId} className="flex items-center gap-4 py-3">
                      {p && <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" />}
                      <div className="flex-1 text-sm"><div className="font-medium">{l.name}</div><div className="text-muted-foreground">Qty {l.qty}</div></div>
                      <div className="font-semibold">{inrPaise(l.linePaise)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {quote && quote.problems.length > 0 && (
            <div role="alert" className="mt-6 space-y-1 rounded-2xl bg-warning-soft px-4 py-3 text-sm text-warning">
              {quote.problems.map((p) => (
                <p key={p} className="flex items-start gap-2"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />{p}</p>
              ))}
            </div>
          )}
          {placeError && (
            <p role="alert" className="mt-6 flex items-start gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />{placeError}
            </p>
          )}

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" disabled={step === 0 || placing} onClick={() => setStep(step - 1)}>Back</Button>
            {step < 3 ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <Button variant="brand" size="lg" disabled={placing || !quote} onClick={place}>
                {placing ? "Placing order…" : `Place order · ${quote ? inrPaise(quote.totalPaise) : "…"}`}
              </Button>
            )}
          </div>
        </div>
        <aside className="card-mh h-fit p-6">
          <h3 className="mb-5 text-lg font-semibold">Summary</h3>
          <SummaryRows q={quote} pending={quoting} />
        </aside>
      </div>
    </div>
  );
}
