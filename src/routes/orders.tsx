import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Ban,
  Check,
  ChevronDown,
  CreditCard,
  MapPin,
  Package,
  PackageSearch,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, StatusBadge } from "@/components/mh/ui";
import { RequireAuth } from "@/components/mh/RequireAuth";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/lib/api/orders";
import { getProduct, inr, orderFlow, type Order, type OrderStatus } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Search = { filter?: Filter };
const filters = ["All", "Active", "Delivered", "Cancelled"] as const;
type Filter = (typeof filters)[number];

export const Route = createFileRoute("/orders")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    filter: filters.includes(s.filter as Filter) ? (s.filter as Filter) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My orders — MarketHub" },
      { name: "description", content: "Track your MarketHub orders, follow delivery progress and review past purchases." },
      // Order history is personal. Keep it out of search indexes entirely.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrdersPage,
});

const isCancellable = (s: OrderStatus) =>
  s === "Order Placed" || s === "Confirmed" || s === "Processing";

function matchesFilter(o: Order, f: Filter) {
  if (f === "All") return true;
  if (f === "Delivered") return o.status === "Delivered";
  if (f === "Cancelled") return o.status === "Cancelled";
  return o.status !== "Delivered" && o.status !== "Cancelled";
}

/** Horizontal progress rail built from the canonical `orderFlow`. */
function Tracker({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
        <Ban className="h-4 w-4 shrink-0" />
        This order was cancelled and the payment refunded.
      </div>
    );
  }

  const current = orderFlow.indexOf(status);

  return (
    <ol className="flex items-start">
      {orderFlow.map((step, i) => {
        const done = i <= current;
        const isLast = i === orderFlow.length - 1;
        return (
          <li key={step} className={cn("flex min-w-0 flex-1 flex-col items-center", isLast && "flex-none")}>
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-[10px] font-bold transition",
                  done ? "border-success bg-success text-success-foreground" : "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {!isLast && <span className={cn("h-0.5 flex-1", i < current ? "bg-success" : "bg-border")} />}
            </div>
            <span
              className={cn(
                "mt-2 max-w-[8ch] text-center text-[10px] leading-tight sm:max-w-none sm:text-xs",
                done ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const lines = order.items
    .map((it) => ({ item: it, product: getProduct(it.productId) }))
    .filter((l): l is { item: typeof l.item; product: NonNullable<typeof l.product> } => Boolean(l.product));
  const units = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <article className="card-mh overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center">
        <div className="flex -space-x-3">
          {lines.slice(0, 3).map(({ product }) => (
            <img key={product.id} src={product.image} alt="" className="h-14 w-14 rounded-xl border-2 border-card object-cover" />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold">{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Ordered {order.date} · {units} {units === 1 ? "item" : "items"} · {inr(order.total)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? "Hide" : "Details"}
            <ChevronDown className={cn("transition", open && "rotate-180")} />
          </Button>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <Tracker status={order.status} />

        {order.status !== "Cancelled" && order.status !== "Delivered" && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-brand" />
            Estimated delivery {order.eta}
          </p>
        )}

        {open && (
          <div className="space-y-5 border-t border-border pt-5 animate-in fade-in slide-in-from-top-1">
            <div className="space-y-3">
              {lines.map(({ item, product }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <Link to="/product/$id" params={{ id: product.id }} className="shrink-0">
                    <img src={product.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to="/product/$id" params={{ id: product.id }} className="line-clamp-1 text-sm font-medium hover:text-brand">
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">Qty {item.qty} · {inr(item.price)} each</p>
                  </div>
                  <span className="text-sm font-semibold">{inr(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <dl className="grid gap-4 rounded-2xl bg-surface p-4 text-sm sm:grid-cols-2">
              <div className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Delivering to</dt>
                  <dd className="font-medium">{order.address}</dd>
                </div>
              </div>
              <div className="flex gap-2.5">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Payment</dt>
                  <dd className="font-medium">{order.method} · {order.payment}</dd>
                </div>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2">
              {lines[0] && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/product/$id" params={{ id: lines[0].product.id }}>Buy it again</Link>
                </Button>
              )}
              {order.status === "Delivered" && (
                <Button variant="outline" size="sm" onClick={() => toast("Returns open for 7 days after delivery", { description: "Pick the items to send back and we'll arrange pickup." })}>
                  <RotateCcw /> Return items
                </Button>
              )}
              {isCancellable(order.status) && (
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onCancel(order.id)}>
                  <Ban /> Cancel order
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function OrdersPage() {
  return (
    <RequireAuth
      title="Sign in to see your orders"
      body="Order history and live delivery tracking are tied to your account."
    >
      <OrdersContent />
    </RequireAuth>
  );
}

function OrdersContent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { orders, refreshOrders } = useStore();
  const filter = search.filter ?? "All";

  /**
   * `orders` now arrives from `listMyOrders`, which filters by the session's
   * user id server-side. The previous client-side filter compared the order's
   * customer name to the session name; that is both redundant now and wrong,
   * because the shipping name is free text a shopper can set to anything at
   * checkout. Authorization is no longer this component's job.
   */
  const visible = useMemo(() => orders.filter((o) => matchesFilter(o, filter)), [orders, filter]);

  const cancel = async (id: string) => {
    try {
      // The server decides whether this order is still cancellable, restores
      // the stock and sets the refund state. The request only names the order.
      await cancelOrder({ data: { orderId: id } });
      await refreshOrders();
      toast.success("Order cancelled", { description: `${id} has been cancelled.` });
    } catch (error) {
      const raw = error instanceof Error ? error.message.trim() : "";
      toast.error("Could not cancel", {
        description: raw && raw.length <= 200 ? raw : "Please try again.",
      });
    }
  };

  const counts = {
    All: orders.length,
    Active: orders.filter((o) => matchesFilter(o, "Active")).length,
    Delivered: orders.filter((o) => o.status === "Delivered").length,
    Cancelled: orders.filter((o) => o.status === "Cancelled").length,
  } satisfies Record<Filter, number>;

  return (
    <div className="container-mh pt-8">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">My orders</span>
      </nav>

      <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">My orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length === 0
              ? "No orders yet."
              : `${orders.length} order${orders.length === 1 ? "" : "s"} placed with MarketHub sellers.`}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/shop">Continue shopping</Link>
        </Button>
      </div>

      {orders.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => navigate({ search: f === "All" ? {} : { filter: f } })}
              aria-pressed={filter === f}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground",
              )}
            >
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-5">
        {visible.length === 0 ? (
          <EmptyState
            icon={<PackageSearch />}
            title={orders.length === 0 ? "No orders yet" : `No ${filter.toLowerCase()} orders`}
            body={
              orders.length === 0
                ? "When you place your first order it will show up here with live tracking."
                : "Try a different filter to see the rest of your order history."
            }
            action={
              orders.length === 0 ? (
                <Button asChild variant="brand"><Link to="/shop">Start shopping</Link></Button>
              ) : (
                <Button variant="outline" onClick={() => navigate({ search: {} })}>Show all orders</Button>
              )
            }
          />
        ) : (
          visible.map((o) => <OrderCard key={o.id} order={o} onCancel={cancel} />)
        )}
      </div>

      {orders.length > 0 && (
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          Every order is covered by MarketHub buyer protection and 7-day returns.
        </p>
      )}
    </div>
  );
}
