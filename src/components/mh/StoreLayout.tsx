import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Heart, Home, LayoutGrid, LogOut, Menu, Package, Search, ShoppingBag, Store, User, X, Shield } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Logo } from "./ui";
import { AIAssistant } from "./AIAssistant";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/vendors", label: "Vendors" },
  { to: "/deals", label: "Deals" },
] as const;

function SearchBox({ className, onDone }: { className?: string; onDone?: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/shop", search: { q } });
        onDone?.();
      }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products, brands, sellers"
          aria-label="Search"
          className="h-10 w-full rounded-full border border-transparent bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/10"
        />
      </div>
    </form>
  );
}

function Header() {
  const { cart, wishlist, user, logout } = useStore();
  const [menu, setMenu] = useState(false);
  const count = cart.filter((l) => !l.saved).reduce((s, l) => s + l.qty, 0);
  const iconBtn = "relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface";
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="bg-primary py-2 text-center text-xs text-primary-foreground">
        Free delivery on orders over ₹999 · <span className="text-brand">Festive Week</span> up to 40% off
      </div>
      <div className="container-mh flex h-16 items-center gap-4">
        <button className={`${iconBtn} md:hidden`} onClick={() => setMenu(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground" activeProps={{ className: "!text-foreground bg-surface" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <SearchBox className="ml-auto hidden w-full max-w-xs md:block" />
        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <Link to="/account" className={`${iconBtn} hidden sm:grid`} aria-label="Notifications"><Bell className="h-[18px] w-[18px]" /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand" /></Link>
          <Link to="/account" search={{ tab: "wishlist" }} className={`${iconBtn} hidden sm:grid`} aria-label="Wishlist">
            <Heart className="h-[18px] w-[18px]" />
            {wishlist.length > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className={iconBtn} aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">{count}</span>}
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand">
                {user.name[0]}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>
                  <div className="text-sm">{user.name}</div>
                  <div className="text-xs font-normal capitalize text-muted-foreground">{user.role} account</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/account"><User className="mr-2 h-4 w-4" />My account</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/orders"><Package className="mr-2 h-4 w-4" />My orders</Link></DropdownMenuItem>
                {user.role === "vendor" && <DropdownMenuItem asChild><Link to="/vendor"><Store className="mr-2 h-4 w-4" />Vendor dashboard</Link></DropdownMenuItem>}
                {user.role === "admin" && <DropdownMenuItem asChild><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin console</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="ml-2 hidden h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 sm:flex">Sign in</Link>
          )}
        </div>
      </div>
      <div className="container-mh pb-3 md:hidden"><SearchBox /></div>
      {menu && (
        <div className="fixed inset-0 z-50 bg-foreground/30 md:hidden" onClick={() => setMenu(false)}>
          <div className="h-full w-72 bg-background p-5 animate-in slide-in-from-left" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between"><Logo /><button onClick={() => setMenu(false)} aria-label="Close menu"><X className="h-5 w-5" /></button></div>
            <nav className="flex flex-col gap-1">
              {nav.map((n) => <Link key={n.to} to={n.to} onClick={() => setMenu(false)} className="rounded-xl px-3 py-3 font-medium hover:bg-surface">{n.label}</Link>)}
              <Link to="/vendor-register" onClick={() => setMenu(false)} className="rounded-xl px-3 py-3 font-medium text-brand hover:bg-surface">Sell on MarketHub</Link>
              {!user && <Link to="/login" onClick={() => setMenu(false)} className="mt-4 rounded-full bg-primary px-4 py-3 text-center font-semibold text-primary-foreground">Sign in</Link>}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const cols = [
    { title: "Marketplace", links: [["Shop all", "/shop"], ["Categories", "/categories"], ["Deals", "/deals"], ["Vendors", "/vendors"]] },
    { title: "Support", links: [["My orders", "/orders"], ["My account", "/account"], ["Cart", "/cart"]] },
    { title: "Sell", links: [["Become a vendor", "/vendor-register"], ["Vendor dashboard", "/vendor"], ["Sign in", "/login"]] },
  ] as const;
  return (
    <footer className="mt-24 border-t border-border bg-card pb-24 md:pb-0">
      <div className="container-mh grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">One marketplace, thousands of verified independent sellers. Every order protected end to end.</p>
          <div className="mt-5 flex gap-2 text-xs font-semibold text-muted-foreground">
            {["Instagram", "X", "LinkedIn", "YouTube"].map((s) => <span key={s} className="rounded-full border border-border px-3 py-1.5">{s}</span>)}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="mb-4 text-sm font-semibold">{c.title}</div>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {c.links.map(([l, to]) => <li key={l}><Link to={to} className="hover:text-foreground">{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-mh flex flex-col justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row">
          <span>© 2026 MarketHub Technologies Pvt. Ltd.</span>
          <span>Privacy · Terms · Returns policy · Seller policy</span>
        </div>
      </div>
    </footer>
  );
}

function BottomNav() {
  const { cart } = useStore();
  const count = cart.filter((l) => !l.saved).reduce((s, l) => s + l.qty, 0);
  const items = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/shop", icon: LayoutGrid, label: "Shop" },
    { to: "/cart", icon: ShoppingBag, label: "Cart" },
    { to: "/orders", icon: Package, label: "Orders" },
    { to: "/account", icon: User, label: "Account" },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur md:hidden">
      {items.map(({ to, icon: Icon, label }) => (
        <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="relative flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground" activeProps={{ className: "!text-foreground font-semibold" }}>
          <Icon className="h-5 w-5" />
          {label}
          {to === "/cart" && count > 0 && <span className="absolute right-[28%] top-1.5 h-2 w-2 rounded-full bg-brand" />}
        </Link>
      ))}
    </nav>
  );
}

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      <BottomNav />
      <AIAssistant />
    </div>
  );
}
