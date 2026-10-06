import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  ExternalLink,
  LayoutDashboard,
  Package,
  PackageSearch,
  ShieldAlert,
  ShoppingCart,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { DashShell, PageTitle, type DashNavItem } from "@/components/mh/DashShell";
import { EmptyState, StatCard, StatusBadge, stockLabel } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import {
  advanceVendorOrder,
  getVendorDashboard,
  type VendorDashboard,
} from "@/lib/api/vendor";
import { getProduct, salesSeries } from "@/lib/data";
import { inrPaise } from "@/lib/money";
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

const COMMISSION_RATE = 0.08;

/**
 * Loads the caller's own store from the server.
 *
 * This replaces `useMyVendor()`, which matched the session email against the
 * seed array and then fell back to `vendors.find(v => v.verified)` when nothing
 * matched — quietly showing a seller somebody else's dashboard. There is no
 * fallback now: `getVendorDashboard` resolves the store by the session's user
 * id and refuses if there is no link, and the refusal is surfaced rather than
 * papered over.
 */
function useDashboard() {
  const [data, setData] = useState<VendorDashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setData(await getVendorDashboard());
      setError("");
    } catch (err) {
      const raw = err instanceof Error ? err.message.trim() : "";
      setError(raw && raw.length <= 200 ? raw : "Could not load your store.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload };
}

function VendorPage() {
  const search = Route.useSearch();
  const view = search.view ?? "overview";
  const { data, error, loading, reload } = useDashboard();

  return (
    <DashShell role="vendor" title="Vendor workspace" nav={nav}>
      {loading && (
        <div className="grid min-h-[40vh] place-items-center" aria-busy="true">
          <span className="text-sm text-muted-foreground">Loading your store…</span>
        </div>
      )}

      {!loading && error && (
        <div className="card-mh mx-auto mt-10 max-w-md p-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-warning-soft text-warning">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">Store unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/vendor-register">Check application status</Link>
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {view === "overview" && <Overview d={data} />}
          {view === "orders" && <Orders d={data} onChanged={reload} />}
          {view === "products" && <Listings d={data} />}
          {view === "payouts" && <Payouts d={data} />}
        </>
      )}
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
          {/* Labelled as illustrative on purpose: this series is sample data
              from lib/data.ts, not a query over this store's real orders. */}
          <p className="text-sm text-muted-foreground">Illustrative trend — sample data, not your live orders.</p>
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
              aria-label={`${s.month}: ${s.sales} rupees from ${s.orders} orders`}
            />
            <span className="text-xs text-muted-foreground">{s.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Overview({ d }: { d: VendorDashboard }) {
  const { vendor, products, orders, stats } = d;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10);
  const outOfStock = products.filter((p) => p.stock === 0);

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
        {/* Revenue is this store's share of its orders, computed server-side.
            It never includes another seller's lines from a shared order. */}
        <StatCard label="Revenue" value={inrPaise(stats.revenuePaise)} icon={<TrendingUp />} />
        <StatCard label="Open orders" value={String(stats.openOrders)} icon={<ShoppingCart />} />
        <StatCard label="Live listings" value={String(stats.liveListings)} icon={<Package />} />
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
            {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{o.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.createdAt.slice(0, 10)} · {inrPaise(o.vendorSubtotalPaise)}
                  </div>
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

function Orders({ d, onChanged }: { d: VendorDashboard; onChanged: () => Promise<void> }) {
  const [filter, setFilter] = useState<"All" | "Open" | "Delivered" | "Cancelled">("All");
  const [busy, setBusy] = useState<string | null>(null);
  const rows = d.orders;

  const visible = rows.filter((o) =>
    filter === "All" ? true
      : filter === "Delivered" ? o.status === "Delivered"
        : filter === "Cancelled" ? o.status === "Cancelled"
          : o.status !== "Delivered" && o.status !== "Cancelled",
  );

  /**
   * Asks the server to move the order one step on.
   *
   * The destination is not sent — the server computes the next state from the
   * current one, so skipping ahead to Delivered or reviving a cancelled order
   * is not expressible. Previously this was local `useState` over the shared
   * `vendorOrders` seed array and accepted any transition.
   */
  const advance = async (id: string) => {
    if (busy) return;
    setBusy(id);
    try {
      const updated = await advanceVendorOrder({ data: { orderId: id } });
      toast.success(`${id} moved to ${updated.status}`);
      await onChanged();
    } catch (error) {
      const raw = error instanceof Error ? error.message.trim() : "";
      toast.error("Could not update order", {
        description: raw && raw.length <= 200 ? raw : "Please try again.",
      });
    } finally {
      setBusy(null);
    }
  };

  const isComplete = (s: string) => s === "Delivered";

  return (
    <>
      <PageTitle title="Orders" sub={`${rows.length} order${rows.length === 1 ? "" : "s"} placed with your store.`} />

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
                <th className="px-5 py-3.5 font-semibold">Your total</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((o) => {
                const names = o.items.map((i) => i.name).join(", ");
                return (
                  <tr key={o.id} className="transition hover:bg-surface/60">
                    <td className="px-5 py-4">
                      <div className="font-medium">{o.id}</div>
                      {/* Given name and destination city only. The server does
                          not send the shopper's street address, PIN or phone to
                          a seller at all, so there is nothing here to leak. */}
                      <div className="text-xs text-muted-foreground">
                        {o.createdAt.slice(0, 10)} · {o.customerName} · {o.shipCity}
                      </div>
                    </td>
                    <td className="max-w-[220px] px-5 py-4 text-muted-foreground">
                      <span className="line-clamp-2">{names || "—"}</span>
                    </td>
                    {/* This store's share, not the order's grand total. */}
                    <td className="px-5 py-4 font-semibold">{inrPaise(o.vendorSubtotalPaise)}</td>
                    <td className="px-5 py-4"><StatusBadge status={o.payment} /></td>
                    <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-4">
                      {o.status === "Cancelled" ? (
                        <span className="text-xs text-muted-foreground">Cancelled</span>
                      ) : isComplete(o.status) ? (
                        <span className="text-xs text-muted-foreground">Complete</span>
                      ) : (
                        <Button size="sm" variant="outline" disabled={busy === o.id} onClick={() => advance(o.id)}>
                          {busy === o.id ? "Updating…" : "Advance"}
                        </Button>
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

function Listings({ d }: { d: VendorDashboard }) {
  const mine = d.products;

  return (
    <>
      <PageTitle
        title="Listings"
        sub={`${mine.length} product${mine.length === 1 ? "" : "s"} in your store.`}
        action={<Button variant="brand" onClick={() => toast("Listing editor not built yet", { description: "Creating products needs a catalogue write API, which is not part of this build." })}>Add product</Button>}
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
              {mine.map((p) => {
                // Imagery stays a client asset import; only the data moved server-side.
                const art = getProduct(p.id);
                return (
                  <tr key={p.id} className="transition hover:bg-surface/60">
                    <td className="px-5 py-4">
                      <Link to="/product/$id" params={{ id: p.id }} className="flex items-center gap-3 hover:text-brand">
                        {art && <img src={art.image} alt="" className="h-11 w-11 rounded-xl object-cover" />}
                        <span className="line-clamp-2 max-w-[220px] font-medium">{p.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{p.sku}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{inrPaise(p.pricePaise)}</div>
                      {p.originalPricePaise && <div className="text-xs text-muted-foreground line-through">{inrPaise(p.originalPricePaise)}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{p.stock}</div>
                      <StatusBadge status={stockLabel(p.stock)} />
                    </td>
                    <td className="px-5 py-4">★ {p.rating} <span className="text-xs text-muted-foreground">({p.reviews})</span></td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
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

function Payouts({ d }: { d: VendorDashboard }) {
  const settled = d.orders.filter((o) => o.status === "Delivered");
  const { settledPaise, commissionPaise, inFlightPaise } = d.stats;

  return (
    <>
      <PageTitle title="Payouts" sub="Settled after the buyer's 7-day return window closes." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Ready to pay out" value={inrPaise(settledPaise - commissionPaise)} icon={<Banknote />} />
        <StatCard label="Commission (8%)" value={inrPaise(commissionPaise)} icon={<Wallet />} />
        <StatCard label="Pending delivery" value={inrPaise(inFlightPaise)} icon={<ShoppingCart />} />
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
                const fee = Math.round(o.vendorSubtotalPaise * COMMISSION_RATE);
                return (
                  <tr key={o.id}>
                    <td className="px-5 py-4 font-medium">{o.id}</td>
                    <td className="px-5 py-4 text-muted-foreground">{o.eta}</td>
                    <td className="px-5 py-4">{inrPaise(o.vendorSubtotalPaise)}</td>
                    <td className="px-5 py-4 text-muted-foreground">−{inrPaise(fee)}</td>
                    <td className="px-5 py-4 font-semibold">{inrPaise(o.vendorSubtotalPaise - fee)}</td>
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
