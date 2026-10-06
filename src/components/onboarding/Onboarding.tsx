import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ShoppingBag, ShieldCheck, Clock } from "lucide-react";

import { OnboardingIllustration, RoleIcon } from "./Illustrations";
import { customerSlides, vendorSlides, shoppingCategories, businessCategories, type Slide } from "./slides";
import { loadOnboarding, saveOnboarding, roleHome, type Role } from "@/lib/onboarding-store";

type Step = { kind: "role" } | { kind: "slide"; slide: Slide } | { kind: "prefs" } | { kind: "setup" };

function journey(role: Role | null): Step[] {
  if (role === "vendor") return [{ kind: "role" }, ...vendorSlides.map((slide) => ({ kind: "slide" as const, slide })), { kind: "setup" }];
  return [{ kind: "role" }, ...customerSlides.map((slide) => ({ kind: "slide" as const, slide })), { kind: "prefs" }];
}

/* ---------------- Small building blocks ---------------- */

export function ProgressIndicator({ total, current }: { total: number; current: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all duration-500 ${
            i === current ? "w-6 bg-primary" : i < current ? "w-2 bg-foreground/70" : "w-2 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function Btn({
  variant = "primary",
  className = "",
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  const v = {
    primary:
      "bg-primary text-primary-foreground shadow-[var(--shadow-button)] hover:brightness-105 disabled:opacity-40 disabled:shadow-none",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
    outline: "border bg-card text-foreground hover:bg-secondary",
  }[variant];

  return (
    <button
      type="button"
      {...p}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed ${v} ${className}`}
    />
  );
}

export function OnboardingNavigation({ left, right }: { left?: ReactNode; right: ReactNode }) {
  return (
    <div className="ob-rise mt-auto flex items-center justify-between gap-3 pt-6" style={{ animationDelay: "0.28s" }}>
      {left ?? <span />}
      {right}
    </div>
  );
}

export function OnboardingPanel({ slide }: { slide: Slide }) {
  return (
    <>
      <div className="ob-illus relative aspect-[32/25] w-full overflow-hidden rounded-[1.6rem] bg-scene">
        <OnboardingIllustration scene={slide.scene} />
      </div>
      <div className="mt-7 text-center">
        <h2 className="ob-rise font-display text-[1.75rem] font-bold leading-tight tracking-tight" style={{ animationDelay: "0.08s" }}>
          {slide.title}
        </h2>
        <p className="ob-rise mx-auto mt-3 max-w-[30ch] text-muted-foreground" style={{ animationDelay: "0.16s" }}>
          {slide.text}
        </p>
      </div>
    </>
  );
}

export function RoleSelectionCard({
  role,
  title,
  tag,
  text,
  selected,
  onSelect,
}: {
  role: Role;
  title: string;
  tag: string;
  text: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`group relative flex w-full items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
        selected
          ? "-translate-y-1 border-primary shadow-[0_18px_40px_-20px_var(--primary)]"
          : "border-border hover:-translate-y-0.5 hover:border-foreground/25"
      }`}
    >
      <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-scene p-2 ${selected ? "ob-pop" : ""}`}>
        <RoleIcon role={role} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-foreground">{tag}</span>
        <span className="block font-display text-lg font-bold leading-tight">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{text}</span>
      </span>
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  );
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
        on ? "border-foreground bg-foreground text-card" : "bg-card text-foreground hover:border-foreground/30"
      }`}
    >
      {on && <Check size={14} strokeWidth={3} />}
      {label}
    </button>
  );
}

export function PreferenceSelector({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (c: string) => onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]);
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Shopping interests">
      {shoppingCategories.map((c) => (
        <Chip key={c} label={c} on={value.includes(c)} onClick={() => toggle(c)} />
      ))}
    </div>
  );
}

/* ---------------- Vendor setup ---------------- */

const setupStages = ["Store Information", "Business Details", "Verification", "Your Store"];

const inputCls =
  "h-12 w-full rounded-xl border bg-card px-4 text-[15px] outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-destructive";

export function VendorSetupForm({ onBack, onLater, onDone }: { onBack: () => void; onLater: () => void; onDone: () => void }) {
  const [stage, setStage] = useState(0);
  const [f, setF] = useState({ name: "", category: "", description: "", email: "", phone: "" });
  const [err, setErr] = useState<{ name?: string; category?: string; description?: string; email?: string }>({});

  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const next = () => {
    const e: { name?: string; category?: string; description?: string; email?: string } = {};
    if (stage === 0) {
      if (!f.name.trim()) e.name = "Give your store a name.";
      if (!f.category) e.category = "Pick a category.";
    } else {
      if (f.description.trim().length < 10) e.description = "Add a short description (10+ characters).";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid contact email.";
    }
    setErr(e);
    if (Object.keys(e).length) return;
    if (stage === 0) setStage(1);
    else {
      saveOnboarding({ vendorSetupStatus: "submitted" });
      setStage(2);
    }
  };

  const Stages = (
    <ol className="mb-6 grid grid-cols-4 gap-1.5">
      {setupStages.map((s, i) => (
        <li key={s} className="text-center">
          <span
            className={`block h-1.5 rounded-full transition-colors duration-500 ${
              i < stage || (stage === 2 && i === 2) ? "bg-foreground/70" : i === stage ? "bg-primary" : "bg-border"
            }`}
          />
          <span
            className={`mt-1.5 block text-[10.5px] font-semibold leading-tight ${
              i === stage ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {s}
          </span>
        </li>
      ))}
    </ol>
  );

  if (stage === 2) {
    return (
      <div key="done" className="ob-panel-in flex flex-1 flex-col">
        <div className="ob-illus relative aspect-[32/25] w-full overflow-hidden rounded-[1.6rem] bg-scene">
          <OnboardingIllustration scene="store" />
        </div>
        <div className="mt-6 text-center">
          <h2 className="ob-rise font-display text-[1.75rem] font-bold leading-tight tracking-tight">Your store setup is complete.</h2>
          <p className="ob-rise mx-auto mt-3 max-w-[32ch] text-muted-foreground" style={{ animationDelay: "0.1s" }}>
            <span className="font-semibold text-foreground">{f.name}</span> is ready. Your vendor profile may require verification before certain selling features become available.
          </p>
          <div className="ob-rise mx-auto mt-5 flex max-w-xs flex-col gap-2 text-left text-sm" style={{ animationDelay: "0.18s" }}>
            <span className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
              <ShieldCheck size={16} className="text-success" /> Store information submitted
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
              <Clock size={16} className="text-accent-foreground" /> Verification pending
            </span>
          </div>
        </div>
        <OnboardingNavigation
          right={
            <Btn className="w-full" onClick={onDone}>
              Go to Vendor Dashboard <ArrowRight size={18} />
            </Btn>
          }
        />
      </div>
    );
  }

  return (
    <div key={stage} className="ob-panel-in flex flex-1 flex-col">
      <h2 className="ob-rise font-display text-[1.75rem] font-bold leading-tight tracking-tight">Let's set up your store</h2>
      <p className="ob-rise mb-5 mt-1.5 text-muted-foreground" style={{ animationDelay: "0.06s" }}>
        Just the essentials — you can add a logo and banner later.
      </p>

      {Stages}

      <div className="ob-rise space-y-4" style={{ animationDelay: "0.12s" }}>
        {stage === 0 ? (
          <>
            <Field label="Store / business name" error={err.name} id="store-name">
              <input
                id="store-name"
                className={inputCls}
                placeholder="e.g. Juniper & Co."
                value={f.name}
                aria-invalid={!!err.name}
                onChange={(e) => set("name")(e.target.value)}
              />
            </Field>
            <Field label="Business category" error={err.category}>
              <div className="flex flex-wrap gap-2">
                {businessCategories.map((c) => (
                  <Chip key={c} label={c} on={f.category === c} onClick={() => set("category")(c)} />
                ))}
              </div>
            </Field>
          </>
        ) : (
          <>
            <Field label="Store description" error={err.description} id="store-desc">
              <textarea
                id="store-desc"
                rows={3}
                className={`${inputCls} h-auto resize-none py-3`}
                placeholder="What do you sell, and what makes it special?"
                value={f.description}
                aria-invalid={!!err.description}
                onChange={(e) => set("description")(e.target.value)}
              />
            </Field>
            <Field label="Contact email" error={err.email} id="store-email">
              <input
                id="store-email"
                type="email"
                className={inputCls}
                placeholder="hello@yourstore.com"
                value={f.email}
                aria-invalid={!!err.email}
                onChange={(e) => set("email")(e.target.value)}
              />
            </Field>
            <Field label="Phone (optional)" id="store-phone">
              <input
                id="store-phone"
                type="tel"
                className={inputCls}
                placeholder="+1 555 000 0000"
                value={f.phone}
                onChange={(e) => set("phone")(e.target.value)}
              />
            </Field>
          </>
        )}
      </div>

      <OnboardingNavigation
        left={
          <Btn variant="ghost" onClick={stage === 0 ? onBack : () => setStage(0)}>
            <ArrowLeft size={18} /> Back
          </Btn>
        }
        right={
          <div className="flex items-center gap-1">
            <Btn variant="ghost" onClick={onLater} className="px-3 text-sm">
              Finish later
            </Btn>
            <Btn onClick={next}>
              {stage === 0 ? "Next" : "Submit"} <ArrowRight size={18} />
            </Btn>
          </div>
        }
      />
    </div>
  );
}

function Field({ label, error, id, children }: { label: string; error?: string | undefined; id?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && <p className="animate-fade-in text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

/* ---------------- Container ---------------- */

export function OnboardingContainer() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [prefs, setPrefs] = useState<string[]>([]);

  // Resume where the user left off on this device.
  useEffect(() => {
    const s = loadOnboarding();
    if (s.onboardingCompleted) {
      void navigate({ to: roleHome(s.selectedRole) });
      return;
    }
    if (s.selectedRole) {
      setRole(s.selectedRole);
      setI(Math.min(s.onboardingStep, journey(s.selectedRole).length - 1));
    }
    setPrefs(s.customerPreferences);
  }, [navigate]);

  const steps = journey(role);
  const step = steps[i] ?? steps[0]!;
  const last = steps.length - 1;

  const go = (to: number) => {
    setDir(to >= i ? 1 : -1);
    setI(to);
    saveOnboarding({ onboardingStep: to });
  };

  const finish = (r: Role) => {
    saveOnboarding({ onboardingCompleted: true, selectedRole: r, customerPreferences: prefs });
    void navigate({ to: roleHome(r) });
  };

  let body: ReactNode;

  if (step.kind === "role") {
    body = (
      <>
        <div className="ob-rise text-center">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-ink text-primary-foreground ob-pop">
            <ShoppingBag size={24} />
          </span>
          <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight">Welcome to MarketHub</h1>
          <p className="mt-2 text-muted-foreground">How would you like to use MarketHub?</p>
        </div>

        <div role="radiogroup" aria-label="Choose how to use MarketHub" className="ob-rise mt-7 space-y-3" style={{ animationDelay: "0.12s" }}>
          <RoleSelectionCard
            role="customer"
            tag="Shop"
            title="Shop on MarketHub"
            text="Discover products, compare sellers, and shop securely."
            selected={role === "customer"}
            onSelect={() => setRole("customer")}
          />
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <RoleSelectionCard
            role="vendor"
            tag="Sell"
            title="Sell on MarketHub"
            text="Create your store, list products, and manage your orders."
            selected={role === "vendor"}
            onSelect={() => setRole("vendor")}
          />
        </div>

        <p className="ob-rise mt-4 text-center text-xs text-muted-foreground" style={{ animationDelay: "0.2s" }}>
          You can change this later in your profile.
        </p>

        <OnboardingNavigation
          right={
            <Btn
              className="w-full"
              disabled={!role}
              onClick={() => {
                if (role) {
                  saveOnboarding({ selectedRole: role });
                  go(1);
                }
              }}
            >
              Continue <ArrowRight size={18} />
            </Btn>
          }
        />
      </>
    );
  } else if (step.kind === "slide") {
    const first = i === 1;
    const lastSlide = i === last - 1;
    const label = lastSlide ? (role === "vendor" ? "Continue" : "Get Started") : "Next";
    body = (
      <>
        <OnboardingPanel slide={step.slide} />
        <OnboardingNavigation
          left={
            first ? (
              <Btn variant="ghost" onClick={() => go(last)}>
                Skip
              </Btn>
            ) : (
              <Btn variant="ghost" onClick={() => go(i - 1)}>
                <ArrowLeft size={18} /> Back
              </Btn>
            )
          }
          right={
            <Btn onClick={() => go(i + 1)}>
              {label} <ArrowRight size={18} />
            </Btn>
          }
        />
      </>
    );
  } else if (step.kind === "prefs") {
    body = (
      <>
        <div className="text-center">
          <h2 className="ob-rise font-display text-[1.75rem] font-bold leading-tight tracking-tight">
            What are you shopping for?
          </h2>
          <p className="ob-rise mx-auto mb-7 mt-2 max-w-[30ch] text-muted-foreground" style={{ animationDelay: "0.06s" }}>
            Pick a few — we'll tailor your home page, deals and picks. Totally optional.
          </p>
        </div>

        <div className="ob-rise" style={{ animationDelay: "0.12s" }}>
          <PreferenceSelector
            value={prefs}
            onChange={(v) => {
              setPrefs(v);
              saveOnboarding({ customerPreferences: v });
            }}
          />
        </div>

        <div className="mt-auto space-y-2 pt-8">
          <Btn
            className="ob-rise w-full"
            style={{ animationDelay: "0.2s" }}
            onClick={() => finish("customer")}
          >
            Start Shopping{prefs.length ? ` · ${prefs.length}` : ""} <ArrowRight size={18} />
          </Btn>
          <div className="flex justify-between">
            <Btn variant="ghost" onClick={() => go(i - 1)}>
              <ArrowLeft size={18} /> Back
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => {
                setPrefs([]);
                saveOnboarding({ onboardingCompleted: true, selectedRole: "customer", customerPreferences: [] });
                void navigate({ to: "/shop" });
              }}
            >
              Skip for now
            </Btn>
          </div>
        </div>
      </>
    );
  } else {
    body = (
      <VendorSetupForm
        onBack={() => go(i - 1)}
        onLater={() => {
          saveOnboarding({ vendorSetupStatus: "in_progress" });
          finish("vendor");
        }}
        onDone={() => finish("vendor")}
      />
    );
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center sm:p-8">
      <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-card px-5 pb-6 pt-5 sm:min-h-[760px] sm:max-w-[460px] sm:rounded-[2.25rem] sm:px-7 sm:pb-7 sm:shadow-[var(--shadow-card)]">
        <header className="mb-5 flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-[15px] font-bold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-primary-foreground">
              <ShoppingBag size={14} />
            </span>
            MarketHub
          </span>
          <ProgressIndicator total={steps.length} current={i} />
        </header>

        <div key={`${role}-${i}`} className={`flex flex-1 flex-col ${dir > 0 ? "ob-in-right" : "ob-in-left"}`}>
          {body}
        </div>
      </div>
    </main>
  );
}
