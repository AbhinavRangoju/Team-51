import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CreditCard, Info, Smartphone, Wallet, Banknote } from "lucide-react";
import { useState } from "react";
import { StoreLayout } from "@/components/mh/StoreLayout";
import { EmptyState, Field, fieldCls } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { inr, type Order } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SummaryRows, useCartTotals } from "./cart";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MarketHub" },
      { name: "description", content: "Complete your MarketHub order in a few simple steps." },
      { property: "og:title", content: "Checkout — MarketHub" },
      { property: "og:description", content: "Complete your MarketHub order in a few simple steps." },
    ],
  }),
  component: Checkout,
});

const steps = ["Address", "Delivery", "Payment", "Review"];
const deliveryOpts = [
  { id: "std", label: "Standard", sub: "3–5 business days", fee: 0, eta: "Oct 10, 2026" },
  { id: "exp", label: "Express", sub: "1–2 business days", fee: 149, eta: "Oct 7, 2026" },
];
const payOpts = [
  { id: "Card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "COD", label: "Cash on Delivery", icon: Banknote },
  { id: "Wallet", label: "MarketHub Wallet", icon: Wallet },
];

function Checkout() {
  const t = useCartTotals();
  const { addOrder, clearCart, user } = useStore();
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({ name: user?.name ?? "", phone: "", line: "", city: "", pin: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [delivery, setDelivery] = useState("std");
  const [pay, setPay] = useState("UPI");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", upi: "" });
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const d = deliveryOpts.find((o) => o.id === delivery)!;
  const total = t.total + d.fee;

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
  const place = () => {
    setPlacing(true);
    setTimeout(() => {
      const o: Order = {
        id: "MH-" + Math.floor(484000 + Math.random() * 9999),
        date: new Date().toISOString().slice(0, 10),
        customer: addr.name,
        items: t.lines.map((l) => ({ productId: l.productId, qty: l.qty, price: l.product.price })),
        total,
        status: "Order Placed",
        payment: pay === "COD" ? "Pending" : "Paid",
        method: pay,
        eta: d.eta,
        address: `${addr.line}, ${addr.city} ${addr.pin}`,
      };
      addOrder(o);
      clearCart();
      setDone(o);
      setPlacing(false);
    }, 1200);
  };

  if (done) {
    return (
      <StoreLayout>
        <div className="container-mh max-w-2xl pt-16">
          <div className="card-mh p-8 text-center md:p-12">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success-soft animate-in zoom-in duration-500">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-success text-brand-foreground"><Check className="h-7 w-7" strokeWidth={3} /></div>
            </div>
            <h1 className="mt-6 text-3xl font-semibold">Order confirmed!</h1>
            <p className="mt-2 text-muted-foreground">Thanks, {done.customer.split(" ")[0]}. Your sellers have been notified.</p>
            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl bg-surface p-5 text-left text-sm">
              <div><div className="text-muted-foreground">Order ID</div><div className="font-semibold">{done.id}</div></div>
              <div><div className="text-muted-foreground">Arrives by</div><div className="font-semibold">{done.eta}</div></div>
              <div><div className="text-muted-foreground">Total paid</div><div className="font-semibold">{inr(done.total)}</div></div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{done.items.reduce((s, i) => s + i.qty, 0)} items purchased</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to="/orders">View Order</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/shop">Continue Shopping</Link></Button>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!t.lines.length) {
    return (
      <StoreLayout>
        <div className="container-mh pt-16"><EmptyState icon={<ShoppingBag />} title="Nothing to check out" body="Add a few items to your cart first." action={<Button asChild variant="brand"><Link to="/shop">Browse products</Link></Button>} /></div>
      </StoreLayout>
    );
  }

  const optCls = (on: boolean) => cn("flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 text-left transition", on ? "border-primary bg-surface" : "border-border hover:border-muted-foreground");

  return (
    <StoreLayout>
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
                  <button key={o.id} onClick={() => setDelivery(o.id)} className={optCls(delivery === o.id)}>
                    <span className={cn("h-5 w-5 rounded-full border-2", delivery === o.id ? "border-[6px] border-primary" : "border-border")} />
                    <div className="flex-1"><div className="font-semibold">{o.label}</div><div className="text-sm text-muted-foreground">{o.sub} · arrives {o.eta}</div></div>
                    <span className="font-semibold">{o.fee ? inr(o.fee) : "Free"}</span>
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
                {pay === "Wallet" && <p className="pt-4 text-sm text-muted-foreground">Demo wallet balance: {inr(25000)}</p>}
              </div>
            )}
            {step === 3 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Review your order</h2>
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-2xl bg-surface p-4"><div className="text-muted-foreground">Ship to</div><div className="mt-1 font-medium">{addr.name}<br />{addr.line}, {addr.city} {addr.pin}</div></div>
                  <div className="rounded-2xl bg-surface p-4"><div className="text-muted-foreground">Delivery</div><div className="mt-1 font-medium">{d.label} · {d.eta}</div></div>
                  <div className="rounded-2xl bg-surface p-4"><div className="text-muted-foreground">Payment</div><div className="mt-1 font-medium">{payOpts.find((p) => p.id === pay)?.label}</div></div>
                </div>
                <div className="mt-6 divide-y divide-border">
                  {t.lines.map((l) => (
                    <div key={l.productId} className="flex items-center gap-4 py-3">
                      <img src={l.product.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                      <div className="flex-1 text-sm"><div className="font-medium">{l.product.name}</div><div className="text-muted-foreground">Qty {l.qty}</div></div>
                      <div className="font-semibold">{inr(l.product.price * l.qty)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
              {step < 3 ? <Button onClick={next}>Continue</Button> : <Button variant="brand" size="lg" disabled={placing} onClick={place}>{placing ? "Placing order…" : `Place order · ${inr(total)}`}</Button>}
            </div>
          </div>
          <aside className="card-mh h-fit p-6">
            <h3 className="mb-5 text-lg font-semibold">Summary</h3>
            <SummaryRows t={{ ...t, delivery: t.delivery + d.fee, total }} />
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}
