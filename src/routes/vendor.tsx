import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  ExternalLink,
  LayoutDashboard,
  Package,
  PackageSearch,
  ShoppingCart,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DashShell, PageTitle, type DashNavItem } from "@/components/mh/DashShell";
import { EmptyState, StatCard, StatusBadge, stockLabel } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import {
  getProduct,
  inr,
  orderFlow,
  products,
  salesSeries,
  vendorOrders,
  vendors,
  type Order,
  type OrderStatus,
  type Vendor,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const views = ["overview", "orders", "products", "payouts"] as const;
type View = (typeof views)[number];
type Search = { view?: View };

export const Route = createFileRoute("/vendor")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    view: views.includes(s.view as View) ? (s.view as View) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Vendor dashboard — MarketHub" },
      { name: "description", content: "Manage your MarketHub store: orders, listings, payouts and performance." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VendorPage,
});

const nav: DashNavItem[] = [
  { to: "/vendor", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/vendor", label: "Orders", icon: ShoppingCart, search: { view: "orders" } },
  { to: "/vendor", label: "Listings", icon: Package, search: { view: "products" } },
  { to: "/vendor", label: "Payouts", icon: Wallet, search: { view: "payouts" } },
];

/**
 * Which store the signed-in seller is managing.
 *
 * Matches the session email against the seller records, falling back to the
 * first verified seller so the dashboard is explorable in a seeded demo. The
 * fallback is why nothing on this page may be treated as privileged: a real
 * build would resolve the vendor from a verified server-side session and refuse
 * to render anything if that lookup failed.
 */
function useMyVendor(): Vendor {
  const { user } = useStore();
  return useMemo(() => {
    const email = (user?.email ?? "").trim().toLowerCase();
    const byEmail = vendors.find((v) => v.email.toLowerCase() === email);
    if (byEmail) return byEmail;
    const byOwner = vendors.find((v) => v.owner.toLowerCase() === (user?.name ?? "").trim().toLowerCase());
    if (byOwner) return byOwner;
    return vendors.find((v) => v.verified) ?? vendors[0]!;
  }, [user?.email, user?.name]);
}

function VendorPage() {
  const search = Route.useSearch();
  const view = search.view ?? "overview";

  return (
    <DashShell role="vendor" title="Vendor workspace" nav={nav}>
      {view === "overview" && <Overview />}
      {view === "orders" && <Orders />}
      {view === "products" && <Listings />}
      {view === "payouts" && <Payouts />}
    </DashShell>
  );
}

/** Lightweight CSS bar chart. Avoids the shadcn recharts wrapper, which is
 *  currently incompatible with the installed recharts major. */
function SalesChart() {
  const peak = Math.max(...salesSeries.map((s) => s.sales));
  return (
    <div className="card-mh p-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-semibold">Sales, last 6 months</h2>
          <p className="text-sm text-muted-foreground">Gross merchandise value before commission.</p>
        </div>
        <span className="hidden text-sm font-semibold text-success sm:block">
          +18% vs previous period
        </span>
      </div>
      <div className="mt-8 flex h-44 items-end gap-3">
        {salesSeries.map((s) => (
          <div key={s.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground">{Math.round(s.sales / 1000)}k</span>
            <div
              className="w-full rounded-t-lg bg-brand/85 transition-all hover:bg-brand"
              style={{ height: `${Math.max(6, (s.sales / peak) * 100)}%` }}
              role="img"
              aria-label={`${s.month}: ${inr(s.sales)} from ${s.orders} orders`}
            />
            <span className="text-xs text-muted-foreground">{s.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Overview() {
  const vendor = useMyVendor();
  const mine = products.filter((p) => p.vendorId === vendor.id);
  const revenue = vendorOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
  const live = vendorOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
  const lowStock = mine.filter((p) => p.stock > 0 && p.stock < 10);
  const outOfStock = mine.filter((p) => p.stock === 0);

  return (
    <>
      <PageTitle
        title={vendor.name}
        sub={`${vendor.tagline} · ${vendor.city} · selling since ${vendor.since}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={vendor.status} />
            <Button asChild variant="outline" size="sm">
              <Link to="/vendors" search={{ v: vendor.id }}>View public store <ExternalLink /></Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={inr(revenue)} delta="+18%" icon={<TrendingUp />} />
        <StatCard label="Open orders" value={String(live.length)} delta="+4%" icon={<ShoppingCart />} />
        <StatCard label="Live listings" value={String(mine.length)} icon={<Package />} />
        <StatCard label="Seller rating" value={vendor.rating > 0 ? `${vendor.rating}/5` : "Not rated"} icon={<Star />} />
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="card-mh mt-4 border-warning/40 bg-warning-soft/30 p-5">
          <h3 className="font-semibold">Stock needs attention</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {outOfStock.map((p) => (
              <li key={p.id}>
                <span className="font-medium text-foreground">{p.name}</span> has sold out — shoppers cannot buy it.
              </li>
            ))}
            {lowStock.map((p) => (
              <li key={p.id}>
                <span className="font-medium text-foreground">{p.name}</span> is down to {p.stock} units.
              </li>
            ))}
          </ul>
          <Button asChild size="sm" variant="outline" className="mt-4">
            <Link to="/vendor" search={{ view: "products" }}>Manage listings <ArrowRight /></Link>
          </Button>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        <SalesChart />
        <div className="card-mh p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Latest orders</h2>
            <Link to="/vendor" search={{ view: "orders" }} className="text-sm text-brand hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {vendorOrders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{o.id}</div>
                  <div className="text-xs text-muted-foreground">{o.date} · {inr(o.total)}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const nextStatus = (s: OrderStatus): OrderStatus | null => {
  const i = orderFlow.indexOf(s);
  return i >= 0 && i < orderFlow.length - 1 ? orderFlow[i + 1]! : null;
};

function Orders() {
  // Seeded seller orders are reference data in src/lib/data.ts, so status moves
  // are held in local state rather than written back to the shared seed.
  const [rows, setRows] = useState<Order[]>(vendorOrders);
  const [filter, setFilter] = useState<"All" | "Open" | "Delivered" | "Cancelled">("All");

  const visible = rows.filter((o) =>
    filter === "All" ? true
      : filter === "Delivered" ? o.status === "Delivered"
        : filter === "Cancelled" ? o.status === "Cancelled"
          : o.status !== "Delivered" && o.status !== "Cancelled",
  );

  const advance = (id: string) => {
    setRows((rs) =>
      rs.map((o) => {
        if (o.id !== id) return o;
        const to = nextStatus(o.status);
        if (!to) return o;
        toast.success(`${id} moved to ${to}`);
        return { ...o, status: to };
      }),
    );
  };

  return (
    <>
      <PageTitle title="Orders" sub={`${rows.length} orders placed with your store.`} />

      <div className="mb-5 flex flex-wrap gap-2">
        {(["All", "Open", "Delivered", "Cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<PackageSearch />} title={`No ${filter.toLowerCase()} orders`} body="Try another filter to see the rest of your orders." />
      ) : (
        <div className="card-mh overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Order</th>
                <th className="px-5 py-3.5 font-semibold">Items</th>
                <th className="px-5 py-3.5 font-semibold">Total</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((o) => {
                const to = nextStatus(o.status);
                const names = o.items
                  .map((i) => getProduct(i.productId)?.name)
                  .filter(Boolean)
                  .join(", ");
                return (
                  <tr key={o.id} className="transition hover:bg-surface/60">
                    <td className="px-5 py-4">
                      <div className="font-medium">{o.id}</div>
                      {/* Ship-to city only. A seller needs the destination, not the
                          shopper's full address, until the label is generated. */}
                      <div className="text-xs text-muted-foreground">{o.date} · {o.address}</div>
                    </td>
                    <td className="max-w-[220px] px-5 py-4 text-muted-foreground">
                      <span className="line-clamp-2">{names || "—"}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold">{inr(o.total)}</td>
                    <td className="px-5 py-4"><StatusBadge status={o.payment} /></td>
                    <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-4">
                      {o.status === "Cancelled" ? (
                        <span className="text-xs text-muted-foreground">Refunded</span>
                      ) : to ? (
                        <Button size="sm" variant="outline" onClick={() => advance(o.id)}>Mark {to}</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Complete</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Listings() {
  const vendor = useMyVendor();
  const mine = products.filter((p) => p.vendorId === vendor.id);

  return (
    <>
      <PageTitle
        title="Listings"
        sub={`${mine.length} live product${mine.length === 1 ? "" : "s"} in your store.`}
        action={<Button variant="brand" onClick={() => toast("Listing editor needs a backend", { description: "Creating products requires a catalogue API, which this build does not have." })}>Add product</Button>}
      />

      {mine.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title="No listings yet"
          body="Once your store is verified you can publish products here."
          action={<Button asChild variant="outline"><Link to="/vendor-register">Check application status</Link></Button>}
        />
      ) : (
        <div className="card-mh overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Product</th>
                <th className="px-5 py-3.5 font-semibold">SKU</th>
                <th className="px-5 py-3.5 font-semibold">Price</th>
                <th className="px-5 py-3.5 font-semibold">Stock</th>
                <th className="px-5 py-3.5 font-semibold">Rating</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mine.map((p) => (
                <tr key={p.id} className="transition hover:bg-surface/60">
                  <td className="px-5 py-4">
                    <Link to="/product/$id" params={{ id: p.id }} className="flex items-center gap-3 hover:text-brand">
                      <img src={p.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                      <span className="line-clamp-2 max-w-[220px] font-medium">{p.name}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold">{inr(p.price)}</div>
                    {p.originalPrice && <div className="text-xs text-muted-foreground line-through">{inr(p.originalPrice)}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium">{p.stock}</div>
                    <StatusBadge status={stockLabel(p.stock)} />
                  </td>
                  <td className="px-5 py-4">★ {p.rating} <span className="text-xs text-muted-foreground">({p.reviews})</span></td>
                  <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Payouts() {
  const settled = vendorOrders.filter((o) => o.status === "Delivered");
  const pending = vendorOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
  const gross = settled.reduce((s, o) => s + o.total, 0);
  const commission = Math.round(gross * 0.08);
  const inFlight = pending.reduce((s, o) => s + o.total, 0);

  return (
    <>
      <PageTitle title="Payouts" sub="Settled after the buyer's 7-day return window closes." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Ready to pay out" value={inr(gross - commission)} icon={<Banknote />} />
        <StatCard label="Commission (8%)" value={inr(commission)} icon={<Wallet />} />
        <StatCard label="Pending delivery" value={inr(inFlight)} icon={<ShoppingCart />} />
      </div>

      <div className="card-mh mt-4 p-6">
        <h2 className="font-semibold">How settlement works</h2>
        <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
          {[
            "A shopper pays MarketHub at checkout, not the seller directly.",
            "The order is delivered and the 7-day return window starts.",
            "Once the window closes, the order value minus 8% commission is released.",
            "Payouts batch weekly to the bank account verified during onboarding.",
          ].map((line, i) => (
            <li key={line} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold text-foreground">{i + 1}</span>
              {line}
            </li>
          ))}
        </ol>
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-surface px-3.5 py-3 text-xs text-muted-foreground">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          Bank details are never shown in this dashboard — not even partially masked. There is no
          read path to them from the browser at all.
        </p>
      </div>

      {settled.length > 0 && (
        <div className="card-mh mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Order</th>
                <th className="px-5 py-3.5 font-semibold">Delivered</th>
                <th className="px-5 py-3.5 font-semibold">Gross</th>
                <th className="px-5 py-3.5 font-semibold">Commission</th>
                <th className="px-5 py-3.5 font-semibold">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settled.map((o) => {
                const fee = Math.round(o.total * 0.08);
                return (
                  <tr key={o.id}>
                    <td className="px-5 py-4 font-medium">{o.id}</td>
                    <td className="px-5 py-4 text-muted-foreground">{o.eta}</td>
                    <td className="px-5 py-4">{inr(o.total)}</td>
                    <td className="px-5 py-4 text-muted-foreground">−{inr(fee)}</td>
                    <td className="px-5 py-4 font-semibold">{inr(o.total - fee)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
