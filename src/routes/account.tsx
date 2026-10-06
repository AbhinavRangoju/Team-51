import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  Heart,
  HeartOff,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  TriangleAlert,
  User as UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/mh/ProductCard";
import { RequireAuth } from "@/components/mh/RequireAuth";
import { EmptyState, Field, fieldCls, StatusBadge } from "@/components/mh/ui";
import { Button } from "@/components/ui/button";
import { getProduct, inr } from "@/lib/data";
import { useStore, type Address } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = ["profile", "addresses", "wishlist", "security"] as const;
type Tab = (typeof tabs)[number];
type Search = { tab?: Tab };

const tabMeta: Record<Tab, { label: string; icon: typeof UserIcon }> = {
  profile: { label: "Profile", icon: UserIcon },
  addresses: { label: "Addresses", icon: MapPin },
  wishlist: { label: "Wishlist", icon: Heart },
  security: { label: "Security", icon: ShieldCheck },
};

export const Route = createFileRoute("/account")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tab: tabs.includes(s.tab as Tab) ? (s.tab as Tab) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My account — MarketHub" },
      { name: "description", content: "Manage your MarketHub profile, delivery addresses, wishlist and account security." },
      // Account pages carry personal data; keep them out of indexes.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <RequireAuth
      title="Sign in to your account"
      body="Your profile, addresses and saved items are tied to your MarketHub account."
    >
      <AccountContent />
    </RequireAuth>
  );
}

function AccountContent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user, wishlist, orders, logout } = useStore();
  const tab = search.tab ?? "profile";

  const myOrders = useMemo(
    () => orders.filter((o) => o.customer.trim().toLowerCase() === (user?.name ?? "").trim().toLowerCase()),
    [orders, user?.name],
  );
  const spent = myOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <div className="container-mh pt-8">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">My account</span>
      </nav>

      <header className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary font-display text-2xl font-semibold text-primary-foreground">
          {user!.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold md:text-3xl">{user!.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{user!.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={user!.role === "customer" ? "Shopper" : user!.role === "vendor" ? "Seller" : "Admin"} toneOverride="brand" />
          <Button variant="outline" size="sm" onClick={() => { logout(); toast("Signed out"); }}>
            <LogOut /> Log out
          </Button>
        </div>
      </header>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Link to="/orders" className="card-mh flex items-center gap-4 p-5 transition hover:border-brand">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface"><Package className="h-5 w-5" /></span>
          <div>
            <div className="font-display text-xl font-semibold">{myOrders.length}</div>
            <div className="text-xs text-muted-foreground">Orders placed</div>
          </div>
        </Link>
        <button onClick={() => navigate({ search: { tab: "wishlist" } })} className="card-mh flex items-center gap-4 p-5 text-left transition hover:border-brand">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface"><Heart className="h-5 w-5" /></span>
          <div>
            <div className="font-display text-xl font-semibold">{wishlist.length}</div>
            <div className="text-xs text-muted-foreground">Saved items</div>
          </div>
        </button>
        <div className="card-mh flex items-center gap-4 p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface"><ShoppingBag className="h-5 w-5" /></span>
          <div>
            <div className="font-display text-xl font-semibold">{inr(spent)}</div>
            <div className="text-xs text-muted-foreground">Lifetime spend</div>
          </div>
        </div>
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Account sections">
          {tabs.map((t) => {
            const { label, icon: Icon } = tabMeta[t];
            return (
              <button
                key={t}
                onClick={() => navigate({ search: t === "profile" ? {} : { tab: t } })}
                aria-current={tab === t ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {tab === "profile" && <ProfileTab />}
          {tab === "addresses" && <AddressesTab />}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, updateUser } = useStore();
  const [form, setForm] = useState({ name: user!.name, email: user!.email, phone: user!.phone ?? "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Enter your name";
    if (form.phone && !/^\d{10}$/.test(form.phone)) errs.phone = "Phone must be 10 digits";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Name and phone only. Email is the account identifier the server
    // authenticates against, so changing it needs a server endpoint (with
    // re-verification) rather than a local patch — see the read-only field
    // below. This edit is display-only until that endpoint exists.
    updateUser({ name: form.name.trim(), phone: form.phone.trim() || undefined });
    setSaved(true);
    toast.success("Profile updated");
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <section className="card-mh p-6">
      <h2 className="text-lg font-semibold">Personal details</h2>
      <p className="mt-1 text-sm text-muted-foreground">Used for order confirmations and delivery updates.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name}>
          <input className={fieldCls} value={form.name} aria-invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email" hint="This is your sign-in address and cannot be changed here.">
          <input className={fieldCls} type="email" value={form.email} readOnly disabled />
        </Field>
        <Field label="Mobile number" error={errors.phone} hint="Optional. Sellers use it for delivery calls.">
          <input className={fieldCls} inputMode="numeric" placeholder="9876543210" value={form.phone} aria-invalid={!!errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <div className="flex items-end sm:col-span-2">
          <Button type="submit" variant="brand">{saved ? <><Check /> Saved</> : "Save changes"}</Button>
        </div>
      </form>
    </section>
  );
}

const emptyAddress = (): Address => ({
  id: `a-${Date.now()}`,
  label: "Home",
  name: "",
  phone: "",
  line: "",
  city: "",
  pin: "",
});

function AddressesTab() {
  const { addresses, saveAddress, removeAddress, setDefaultAddress, user } = useStore();
  const [draft, setDraft] = useState<Address | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const open = (a?: Address) => {
    setErrors({});
    setDraft(a ? { ...a } : { ...emptyAddress(), name: user!.name, phone: user!.phone ?? "" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const errs: Record<string, string> = {};
    if (!draft.label.trim()) errs.label = "Give it a label";
    if (!draft.name.trim()) errs.name = "Enter the recipient's name";
    if (!/^\d{10}$/.test(draft.phone)) errs.phone = "Phone must be 10 digits";
    if (draft.line.trim().length < 5) errs.line = "Enter the street address";
    if (!draft.city.trim()) errs.city = "Enter a city";
    if (!/^\d{6}$/.test(draft.pin)) errs.pin = "PIN code must be 6 digits";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    saveAddress(draft);
    setDraft(null);
    toast.success("Address saved");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Delivery addresses</h2>
          <p className="mt-1 text-sm text-muted-foreground">Stored in this browser only.</p>
        </div>
        {!draft && <Button onClick={() => open()} variant="brand" size="sm"><Plus /> Add address</Button>}
      </div>

      {draft && (
        <form onSubmit={submit} className="card-mh grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Label" error={errors.label}>
            <input className={fieldCls} value={draft.label} aria-invalid={!!errors.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Home, Work…" />
          </Field>
          <Field label="Recipient name" error={errors.name}>
            <input className={fieldCls} value={draft.name} aria-invalid={!!errors.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Mobile number" error={errors.phone}>
            <input className={fieldCls} inputMode="numeric" value={draft.phone} aria-invalid={!!errors.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="9876543210" />
          </Field>
          <Field label="PIN code" error={errors.pin}>
            <input className={fieldCls} inputMode="numeric" value={draft.pin} aria-invalid={!!errors.pin} onChange={(e) => setDraft({ ...draft, pin: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address" error={errors.line}>
              <input className={fieldCls} value={draft.line} aria-invalid={!!errors.line} onChange={(e) => setDraft({ ...draft, line: e.target.value })} placeholder="House no., street, area" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="City" error={errors.city}>
              <input className={fieldCls} value={draft.city} aria-invalid={!!errors.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            </Field>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" variant="brand">Save address</Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !draft ? (
        <EmptyState
          icon={<MapPin />}
          title="No saved addresses"
          body="Add an address now and checkout will fill itself in next time."
          action={<Button onClick={() => open()} variant="brand"><Plus /> Add address</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className={cn("card-mh p-5", a.isDefault && "border-brand")}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{a.label}</span>
                {a.isDefault && <StatusBadge status="Default" toneOverride="brand" />}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {a.name}<br />
                {a.line}<br />
                {a.city} {a.pin}<br />
                {a.phone}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => open(a)}>Edit</Button>
                {!a.isDefault && (
                  <Button size="sm" variant="outline" onClick={() => { setDefaultAddress(a.id); toast("Default address updated"); }}>
                    <Star /> Make default
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => { removeAddress(a.id); toast("Address removed"); }}>
                  <Trash2 /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WishlistTab() {
  const { wishlist, toggleWish, addToCart } = useStore();
  const items = wishlist.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const inStock = items.filter((p) => p.stock > 0);

  if (!items.length) {
    return (
      <EmptyState
        icon={<HeartOff />}
        title="Your wishlist is empty"
        body="Tap the heart on any product to save it here for later."
        action={<Button asChild variant="brand"><Link to="/shop">Browse products</Link></Button>}
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Saved items</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} saved · {inStock.length} available now
          </p>
        </div>
        <div className="flex gap-2">
          {inStock.length > 0 && (
            <Button
              size="sm"
              variant="brand"
              onClick={() => {
                inStock.forEach((p) => addToCart(p.id));
                toast.success(`Added ${inStock.length} item${inStock.length === 1 ? "" : "s"} to cart`);
              }}
            >
              <ShoppingBag /> Add all in stock
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              items.forEach((p) => toggleWish(p.id));
              toast("Wishlist cleared");
            }}
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.current) errs.current = "Enter your current password";
    if (form.next.length < 8 || !/\d/.test(form.next) || !/[A-Za-z]/.test(form.next)) {
      errs.next = "Use 8+ characters with letters and a number";
    }
    if (form.confirm !== form.next) errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setForm({ current: "", next: "", confirm: "" });
    toast("Password changes need a backend", {
      description: "MarketHub has no credential store in this build, so nothing was saved.",
    });
  };

  return (
    <section className="space-y-4">
      {/* Saying this out loud rather than rendering a form that implies otherwise. */}
      <div className="card-mh flex items-start gap-3 border-warning/40 bg-warning-soft/40 p-5">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="text-sm">
          <p className="font-semibold">This build has no real authentication</p>
          <p className="mt-1 text-muted-foreground">
            Sign-in does not verify a password, and your session is a plain object in this browser's
            local storage. Nothing here protects an account, so treat these controls as a preview of
            the real thing rather than a security feature.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="card-mh p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><KeyRound className="h-4 w-4" /> Change password</h2>
        <div className="mt-5 grid gap-4 sm:max-w-sm">
          <Field label="Current password" error={errors.current}>
            <input className={fieldCls} type="password" autoComplete="current-password" value={form.current} aria-invalid={!!errors.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
          </Field>
          <Field label="New password" error={errors.next} hint="8+ characters with letters and a number.">
            <input className={fieldCls} type="password" autoComplete="new-password" value={form.next} aria-invalid={!!errors.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
          </Field>
          <Field label="Confirm new password" error={errors.confirm}>
            <input className={fieldCls} type="password" autoComplete="new-password" value={form.confirm} aria-invalid={!!errors.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </Field>
          <Button type="submit" variant="brand" className="w-fit">Update password</Button>
        </div>
      </form>

      <div className="card-mh p-6">
        <h2 className="text-lg font-semibold">Data and privacy</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything MarketHub knows about you in this build — profile, addresses, cart, wishlist and
          orders — is stored under a single key in this browser. Logging out clears your session and
          saved addresses.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/privacy">Privacy policy</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/terms">Terms of use</Link></Button>
        </div>
      </div>
    </section>
  );
}
