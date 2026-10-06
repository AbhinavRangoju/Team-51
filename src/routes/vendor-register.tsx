import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Clock,
  Info,
  MapPin,
  Package,
  ShieldCheck,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import { StoreLayout } from "@/components/mh/StoreLayout";
import { Field, fieldCls, SectionHeader, StatusBadge } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { categories, vendors } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vendor-register")({
  head: () => ({
    meta: [
      { title: "Sell on MarketHub — become a verified vendor" },
      { name: "description", content: "Apply to sell on MarketHub. Verified sellers reach thousands of shoppers with protected payouts and no listing fees." },
      { property: "og:title", content: "Sell on MarketHub — become a verified vendor" },
      { property: "og:description", content: "Apply to sell on MarketHub. Verified sellers reach thousands of shoppers." },
    ],
  }),
  component: VendorRegisterPage,
});

const steps = ["Business", "Contact", "Catalogue", "Review"] as const;

type Form = {
  legalName: string;
  storeName: string;
  category: string;
  gstin: string;
  pan: string;
  owner: string;
  email: string;
  phone: string;
  city: string;
  pin: string;
  catalogueSize: string;
  priceBand: string;
  pitch: string;
  declared: boolean;
};

const blank: Form = {
  legalName: "", storeName: "", category: "", gstin: "", pan: "",
  owner: "", email: "", phone: "", city: "", pin: "",
  catalogueSize: "1-25", priceBand: "", pitch: "", declared: false,
};

const SIZES = ["1-25", "26-100", "101-500", "500+"] as const;

// Indian statutory formats, validated client-side so applicants get the mistake
// pointed out immediately. A real submission would re-validate server-side and
// verify against the GST and PAN registries — format alone proves nothing.
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/;
const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStep(step: number, f: Form): Record<string, string> {
  const e: Record<string, string> = {};

  if (step === 0) {
    if (f.legalName.trim().length < 3) e.legalName = "Enter the registered business name";
    if (f.storeName.trim().length < 3) e.storeName = "Pick a store name shoppers will see";
    if (!f.category) e.category = "Choose your main category";
    if (!GSTIN_RE.test(f.gstin.toUpperCase())) e.gstin = "15-character GSTIN, e.g. 29ABCDE1234F1Z5";
    if (!PAN_RE.test(f.pan.toUpperCase())) e.pan = "10-character PAN, e.g. ABCDE1234F";
  }

  if (step === 1) {
    if (f.owner.trim().length < 3) e.owner = "Enter the owner's full name";
    if (!EMAIL_RE.test(f.email)) e.email = "Enter a valid business email";
    if (!PHONE_RE.test(f.phone)) e.phone = "10-digit Indian mobile number";
    if (!f.city.trim()) e.city = "Enter your city";
    if (!/^\d{6}$/.test(f.pin)) e.pin = "PIN code must be 6 digits";
  }

  if (step === 2) {
    if (!f.priceBand.trim()) e.priceBand = "Give a typical price range";
    if (f.pitch.trim().length < 30) e.pitch = "Tell us a little more — at least 30 characters";
  }

  if (step === 3 && !f.declared) {
    e.declared = "Please confirm the declaration to submit";
  }

  return e;
}

function VendorRegisterPage() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const next = () => {
    const e = validateStep(step, f);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = () => {
    const e = validateStep(3, f);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    setTimeout(() => {
      setReference(`MH-APP-${Math.floor(10000 + Math.random() * 89999)}`);
      setSubmitting(false);
    }, 1100);
  };

  if (reference) return <Submitted reference={reference} storeName={f.storeName} />;

  return (
    <StoreLayout>
      <div className="container-mh pt-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">Become a vendor</span>
        </nav>
        <Hero />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <ol className="mb-8 flex items-center">
              {steps.map((label, i) => (
                <li key={label} className={cn("flex min-w-0 flex-1 items-center", i === steps.length - 1 && "flex-none")}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition",
                        i < step ? "border-success bg-success text-success-foreground"
                          : i === step ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className={cn("hidden text-sm font-medium sm:block", i <= step ? "text-foreground" : "text-muted-foreground")}>
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && <span className={cn("mx-3 h-0.5 flex-1", i < step ? "bg-success" : "bg-border")} />}
                </li>
              ))}
            </ol>

            <div className="card-mh p-6 md:p-8">
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <h2 className="flex items-center gap-2 text-xl font-semibold sm:col-span-2">
                    <Building2 className="h-5 w-5 text-brand" /> Business details
                  </h2>
                  <Field label="Registered business name" error={errors.legalName}>
                    <input className={fieldCls} value={f.legalName} aria-invalid={!!errors.legalName} onChange={(e) => set("legalName", e.target.value)} placeholder="Nordic Sound Private Limited" />
                  </Field>
                  <Field label="Store name on MarketHub" error={errors.storeName} hint="This is what shoppers see.">
                    <input className={fieldCls} value={f.storeName} aria-invalid={!!errors.storeName} onChange={(e) => set("storeName", e.target.value)} placeholder="Nordic Sound Co." />
                  </Field>
                  <Field label="Main category" error={errors.category}>
                    <select className={fieldCls} value={f.category} aria-invalid={!!errors.category} onChange={(e) => set("category", e.target.value)}>
                      <option value="">Select a category</option>
                      {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="GSTIN" error={errors.gstin} hint="15 characters.">
                    <input className={cn(fieldCls, "uppercase")} value={f.gstin} aria-invalid={!!errors.gstin} maxLength={15} onChange={(e) => set("gstin", e.target.value.toUpperCase())} placeholder="29ABCDE1234F1Z5" />
                  </Field>
                  <Field label="PAN" error={errors.pan} hint="10 characters.">
                    <input className={cn(fieldCls, "uppercase")} value={f.pan} aria-invalid={!!errors.pan} maxLength={10} onChange={(e) => set("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <h2 className="flex items-center gap-2 text-xl font-semibold sm:col-span-2">
                    <MapPin className="h-5 w-5 text-brand" /> Contact and location
                  </h2>
                  <Field label="Owner's full name" error={errors.owner}>
                    <input className={fieldCls} value={f.owner} aria-invalid={!!errors.owner} onChange={(e) => set("owner", e.target.value)} />
                  </Field>
                  <Field label="Business email" error={errors.email}>
                    <input className={fieldCls} type="email" value={f.email} aria-invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} placeholder="you@yourstore.in" />
                  </Field>
                  <Field label="Mobile number" error={errors.phone}>
                    <input className={fieldCls} inputMode="numeric" maxLength={10} value={f.phone} aria-invalid={!!errors.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} placeholder="9876543210" />
                  </Field>
                  <Field label="City" error={errors.city}>
                    <input className={fieldCls} value={f.city} aria-invalid={!!errors.city} onChange={(e) => set("city", e.target.value)} placeholder="Bengaluru" />
                  </Field>
                  <Field label="PIN code" error={errors.pin}>
                    <input className={fieldCls} inputMode="numeric" maxLength={6} value={f.pin} aria-invalid={!!errors.pin} onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))} />
                  </Field>
                  {/* Deliberately absent: bank account and IFSC. See the note in the sidebar. */}
                  <p className="flex items-start gap-2 rounded-xl bg-surface px-3.5 py-3 text-xs text-muted-foreground sm:col-span-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    We do not ask for bank or payout details on this form. Those are collected once,
                    over a verified channel, after your application is approved.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold">
                    <Package className="h-5 w-5 text-brand" /> About your catalogue
                  </h2>
                  <Field label="How many products will you list?">
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set("catalogueSize", s)}
                          aria-pressed={f.catalogueSize === s}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-medium transition",
                            f.catalogueSize === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Typical price range" error={errors.priceBand}>
                    <input className={fieldCls} value={f.priceBand} aria-invalid={!!errors.priceBand} onChange={(e) => set("priceBand", e.target.value)} placeholder="₹1,500 – ₹12,000" />
                  </Field>
                  <Field label="Tell us about your products" error={errors.pitch} hint={`${f.pitch.trim().length}/30 characters minimum.`}>
                    <textarea
                      className={cn(fieldCls, "h-28 resize-none py-3")}
                      value={f.pitch}
                      aria-invalid={!!errors.pitch}
                      maxLength={600}
                      onChange={(e) => set("pitch", e.target.value)}
                      placeholder="What you make, where you make it, and what makes it worth buying."
                    />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="flex items-center gap-2 text-xl font-semibold">
                    <BadgeCheck className="h-5 w-5 text-brand" /> Review your application
                  </h2>
                  <dl className="grid gap-x-6 gap-y-3 rounded-2xl bg-surface p-5 text-sm sm:grid-cols-2">
                    {([
                      ["Store name", f.storeName],
                      ["Registered name", f.legalName],
                      ["Category", categories.find((c) => c.slug === f.category)?.name ?? "—"],
                      ["GSTIN", f.gstin],
                      ["PAN", f.pan],
                      ["Owner", f.owner],
                      ["Email", f.email],
                      ["Mobile", f.phone],
                      ["Location", `${f.city} ${f.pin}`],
                      ["Catalogue size", f.catalogueSize],
                      ["Price range", f.priceBand],
                    ] as const).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="font-medium break-words">{v || "—"}</dd>
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">About</dt>
                      <dd className="font-medium">{f.pitch}</dd>
                    </div>
                  </dl>
                  <div className="space-y-1.5">
                    <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                      <input type="checkbox" checked={f.declared} onChange={(e) => set("declared", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[var(--brand)]" />
                      <span className="text-muted-foreground">
                        I confirm these details are accurate and I accept the{" "}
                        <Link to="/seller-policy" className="font-semibold text-brand hover:underline">Seller Policy</Link>,{" "}
                        <Link to="/terms" className="font-semibold text-brand hover:underline">Terms</Link> and{" "}
                        <Link to="/returns" className="font-semibold text-brand hover:underline">Returns Policy</Link>.
                      </span>
                    </label>
                    {errors.declared && <p className="text-xs text-destructive">{errors.declared}</p>}
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
                <Button variant="outline" onClick={back} disabled={step === 0 || submitting}>
                  <ArrowLeft /> Back
                </Button>
                {step < steps.length - 1 ? (
                  <Button variant="brand" onClick={next}>Continue <ArrowRight /></Button>
                ) : (
                  <Button variant="brand" onClick={submit} disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit application"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Sidebar />
        </div>
      </div>
    </StoreLayout>
  );
}

function Hero() {
  const verified = vendors.filter((v) => v.verified).length;
  return (
    <section className="mt-4">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand">Sell on MarketHub</p>
        <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
          Put your shop in front of thousands of shoppers
        </h1>
        <p className="mt-4 text-muted-foreground">
          MarketHub verifies every seller before their listings go live, so shoppers arrive already
          trusting the storefront. Apply in four short steps — most reviews finish within two
          business days.
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: TrendingUp, title: "No listing fees", body: "Commission only on what you sell." },
          { icon: Wallet, title: "Protected payouts", body: "Settled after delivery confirmation." },
          { icon: Store, title: `${verified} verified sellers`, body: "Join a vetted marketplace." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="card-mh flex gap-3.5 p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold">{title}</div>
              <div className="text-sm text-muted-foreground">{body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Sidebar() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="card-mh p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-brand" /> What happens next</h3>
        <ol className="mt-4 space-y-3.5 text-sm">
          {[
            ["Application received", "You get a reference number immediately."],
            ["Document check", "We verify your GSTIN and PAN against the registries."],
            ["Verification call", "A short call to confirm your business details."],
            ["Store goes live", "Add listings and your badge appears on the storefront."],
          ].map(([t, b], i) => (
            <li key={t} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold">{i + 1}</span>
              <div>
                <div className="font-medium">{t}</div>
                <div className="text-muted-foreground">{b}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="card-mh p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Info className="h-4 w-4 text-info" /> Why we ask for so little</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          This form collects only what is needed to verify that your business exists. No bank
          account, no account number, no document uploads. Payout details are collected separately
          after approval, so a half-finished application never leaves sensitive data lying around.
        </p>
      </div>

      <div className="card-mh p-5">
        <h3 className="font-semibold">Already applied?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Sellers awaiting review show as <StatusBadge status="Pending Verification" /> in the public
          directory until the check completes.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link to="/vendors">View the seller directory</Link>
        </Button>
      </div>
    </aside>
  );
}

function Submitted({ reference, storeName }: { reference: string; storeName: string }) {
  return (
    <StoreLayout>
      <div className="container-mh max-w-2xl pt-16">
        <div className="card-mh p-8 text-center md:p-12">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success-soft animate-in zoom-in duration-500">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground">
              <Check className="h-7 w-7" strokeWidth={3} />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Application received</h1>
          <p className="mt-2 text-muted-foreground">
            Thanks — {storeName} is now queued for verification.
          </p>

          <div className="mt-8 grid gap-3 rounded-2xl bg-surface p-5 text-left text-sm sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground">Reference</div>
              <div className="font-semibold">{reference}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="mt-0.5"><StatusBadge status="Pending Verification" /></div>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Keep your reference number handy. We will email the address on your application once the
            document check finishes — usually within two business days.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button asChild variant="brand"><Link to="/vendors">See the seller directory</Link></Button>
            <Button asChild variant="outline"><Link to="/">Back to store</Link></Button>
          </div>
        </div>

        <div className="mt-6">
          <SectionHeader title="While you wait" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/seller-policy" className="card-mh p-5 transition hover:border-brand">
              <div className="font-semibold">Read the Seller Policy</div>
              <p className="mt-1 text-sm text-muted-foreground">Listing standards, commission and payout timelines.</p>
            </Link>
            <Link to="/returns" className="card-mh p-5 transition hover:border-brand">
              <div className="font-semibold">Understand returns</div>
              <p className="mt-1 text-sm text-muted-foreground">How the 7-day window affects your orders.</p>
            </Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
