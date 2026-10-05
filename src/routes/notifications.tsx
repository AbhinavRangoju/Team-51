import { createFileRoute, Link } from "@tanstack/react-router";
import { BellOff, CheckCheck, Package, Tag, TrendingDown, Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";

import { RequireAuth } from "@/components/mh/RequireAuth";
import { EmptyState } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { buildNotices, type Notice, type NoticeKind } from "@/lib/notifications";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — MarketHub" },
      { name: "description", content: "Order updates, price drops on saved items and MarketHub offers." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NotificationsPage,
});

const kindStyle: Record<NoticeKind, { icon: typeof Package; cls: string }> = {
  order: { icon: Package, cls: "bg-info-soft text-info" },
  price: { icon: TrendingDown, cls: "bg-success-soft text-success" },
  stock: { icon: Tag, cls: "bg-warning-soft text-warning" },
  promo: { icon: Sparkles, cls: "bg-brand-soft text-brand" },
};

/** Renders the right typed Link for a notice's target. */
function NoticeLink({ notice, children, className }: { notice: Notice; children: React.ReactNode; className?: string }) {
  const t = notice.target;
  if (t.to === "/product/$id") {
    return <Link to={t.to} params={t.params} className={className}>{children}</Link>;
  }
  if (t.to === "/account") {
    return <Link to={t.to} search={t.search} className={className}>{children}</Link>;
  }
  return <Link to={t.to} className={className}>{children}</Link>;
}

function NotificationsPage() {
  return (
    <RequireAuth
      title="Sign in to see notifications"
      body="Order updates and price drops on your saved items appear here."
    >
      <NotificationsContent />
    </RequireAuth>
  );
}

function NotificationsContent() {
  const { orders, wishlist, user, readNotices, markNoticesRead } = useStore();

  const myOrders = useMemo(
    () => orders.filter((o) => o.customer.trim().toLowerCase() === (user?.name ?? "").trim().toLowerCase()),
    [orders, user?.name],
  );

  const notices = useMemo(() => buildNotices(myOrders, wishlist), [myOrders, wishlist]);
  const read = useMemo(() => new Set(readNotices), [readNotices]);
  const unread = notices.filter((n) => !read.has(n.id));

  // Opening the page is what "seeing" them means, so clear the badge on mount.
  // Each notice keeps its own id, so a later status change still arrives unread.
  useEffect(() => {
    if (unread.length) markNoticesRead(unread.map((n) => n.id));
    // Intentionally keyed on the id list rather than the array identity, which
    // changes on every render of the derived list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread.map((n) => n.id).join("|")]);

  return (
    <div className="container-mh pt-8">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">Notifications</span>
      </nav>

      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {notices.length === 0
              ? "Nothing to report just yet."
              : `${notices.length} update${notices.length === 1 ? "" : "s"} from your orders and saved items.`}
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => markNoticesRead(notices.map((n) => n.id))}>
            <CheckCheck /> Mark all read
          </Button>
        )}
      </div>

      <div className="mt-7 space-y-3">
        {notices.length === 0 ? (
          <EmptyState
            icon={<BellOff />}
            title="No notifications"
            body="Place an order or save something to your wishlist and updates will show up here."
            action={<Button asChild variant="brand"><Link to="/shop">Browse products</Link></Button>}
          />
        ) : (
          notices.map((n) => {
            const { icon: Icon, cls } = kindStyle[n.kind];
            const isUnread = !read.has(n.id);
            return (
              <NoticeLink
                key={n.id}
                notice={n}
                className={cn(
                  "card-mh flex gap-4 p-5 transition hover:border-brand",
                  isUnread && "border-brand/40 bg-brand-soft/20",
                )}
              >
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", cls)}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold">{n.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{n.date}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </div>
                {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
              </NoticeLink>
            );
          })
        )}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        These updates are generated from your own orders and wishlist in this browser. MarketHub does
        not email or message you in this build.
      </p>
    </div>
  );
}
