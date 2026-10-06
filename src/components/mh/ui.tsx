import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/data";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 font-display text-xl font-bold tracking-tight", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
        <span className="text-[15px] leading-none">m</span>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-brand" />
      </span>
      <span>
        market<span className="text-brand">hub</span>
      </span>
    </Link>
  );
}

export function Stars({ value, reviews, size = "sm" }: { value: number; reviews?: number; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(s, i <= Math.round(value) ? "fill-warning text-warning" : "fill-border text-border")} />
        ))}
      </div>
      <span className="font-medium text-foreground">{value.toFixed(1)}</span>
      {reviews !== undefined && <span>({reviews.toLocaleString("en-IN")})</span>}
    </div>
  );
}

export function Price({ price, original, size = "md" }: { price: number; original?: number; size?: "md" | "lg" }) {
  const pct = original ? Math.round((1 - price / original) * 100) : 0;
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={cn("font-display font-semibold", size === "lg" ? "text-3xl" : "text-lg")}>{inr(price)}</span>
      {original && <span className="text-sm text-muted-foreground line-through">{inr(original)}</span>}
      {pct > 0 && <span className="text-xs font-semibold text-success">{pct}% off</span>}
    </div>
  );
}

const tone: Record<string, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  danger: "bg-destructive-soft text-destructive",
  brand: "bg-brand-soft text-brand",
  neutral: "bg-muted text-muted-foreground",
};

const statusTone: Record<string, keyof typeof tone> = {
  Delivered: "success", Verified: "success", Active: "success", Paid: "success", "In stock": "success",
  Shipped: "info", "Out for Delivery": "info", Confirmed: "info", Processing: "warning",
  "Order Placed": "neutral", Pending: "warning", "Pending Verification": "warning", "Low stock": "warning", Draft: "neutral",
  Cancelled: "danger", Rejected: "danger", Refunded: "neutral", Suspended: "danger", "Out of stock": "danger", Archived: "neutral",
};

export function StatusBadge({ status, toneOverride }: { status: string; toneOverride?: keyof typeof tone }) {
  const t = toneOverride ?? statusTone[status] ?? "neutral";
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", tone[t])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function stockLabel(stock: number) {
  return stock === 0 ? "Out of stock" : stock < 10 ? "Low stock" : "In stock";
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card-mh flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand [&_svg]:h-7 [&_svg]:w-7">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, delta, icon }: { label: string; value: string; delta?: string; icon: ReactNode }) {
  const neg = delta?.startsWith("-");
  return (
    <div className="card-mh p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-foreground [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{value}</div>
      {delta && <div className={cn("mt-1 text-xs font-medium", neg ? "text-destructive" : "text-success")}>{delta} vs last month</div>}
    </div>
  );
}

export const fieldCls =
  "h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/15 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/10";

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="block text-xs text-destructive">{error}</span> : hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
