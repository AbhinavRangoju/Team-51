import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { logout as logoutFn, me } from "@/lib/api/auth";
import { listMyOrders } from "@/lib/api/orders";
import type { OrderDto } from "@/lib/server/dto";
import { type Order } from "./data";

export type Role = "customer" | "vendor" | "admin";
export type User = { name: string; email: string; role: Role; phone?: string };
export type CartLine = { productId: string; qty: number; saved?: boolean };

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line: string;
  city: string;
  pin: string;
  isDefault?: boolean;
};

type Store = {
  user: User | null;
  /** Re-reads the session from the server. Call after sign-in or sign-out. */
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  addresses: Address[];
  saveAddress: (a: Address) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  cart: CartLine[];
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  toggleSaved: (id: string) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
  /** Server-owned. Never written locally. */
  orders: Order[];
  refreshOrders: () => Promise<void>;
  readNotices: string[];
  markNoticesRead: (ids: string[]) => void;
  hydrated: boolean;
};

const Ctx = createContext<Store | null>(null);

/**
 * Bumped from -v1 to -v2 deliberately.
 *
 * The v1 payload contained `user` and `orders`, which are now server-owned. A
 * stale v1 blob would otherwise rehydrate a forged session object — the exact
 * privilege-escalation path this change exists to close — so the old key is
 * abandoned rather than migrated.
 */
const KEY = "markethub-state-v2";
const LEGACY_KEYS = ["markethub-state-v1"];

/**
 * Server orders arrive as integer paise in a flat DTO. The rest of the app was
 * written against the `Order` shape in lib/data.ts and reads rupees, so the
 * conversion happens here, once, instead of touching every consumer.
 */
function toOrder(dto: OrderDto): Order {
  return {
    id: dto.id,
    date: dto.createdAt.slice(0, 10),
    customer: dto.shipTo.name,
    items: dto.items.map((i) => ({
      productId: i.productId,
      qty: i.qty,
      price: i.unitPricePaise / 100,
    })),
    total: dto.totalPaise / 100,
    status: dto.status as Order["status"],
    payment: dto.payment as Order["payment"],
    method: dto.method,
    eta: dto.eta,
    address: `${dto.shipTo.line}, ${dto.shipTo.city} ${dto.shipTo.pin}`.trim(),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [readNotices, setReadNotices] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refreshOrders = useCallback(async () => {
    try {
      const list = await listMyOrders();
      setOrders(list.map(toOrder));
    } catch {
      // Signed out, or the request failed. Either way an empty history is the
      // honest answer; it must never fall back to the seed array, which would
      // show one shopper another shopper's orders.
      setOrders([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const current = await me();
      setUser(
        current
          ? { name: current.name, email: current.email, role: current.role, phone: current.phone ?? undefined }
          : null,
      );
      if (current) await refreshOrders();
      else setOrders([]);
    } catch {
      setUser(null);
      setOrders([]);
    }
  }, [refreshOrders]);

  // Local-only slices. Cart, wishlist and the address book stay in the browser
  // for now (persisting them server-side is the next step); none of them is
  // trusted at checkout, which re-reads every price and total from the store.
  useEffect(() => {
    try {
      for (const stale of LEGACY_KEYS) localStorage.removeItem(stale);
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setAddresses(s.addresses ?? []);
        setCart(s.cart ?? []);
        setWishlist(s.wishlist ?? []);
        setReadNotices(s.readNotices ?? []);
      }
    } catch {}

    // The session is the server's answer, not a localStorage value.
    void refreshUser().finally(() => setHydrated(true));
  }, [refreshUser]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(KEY, JSON.stringify({ addresses, cart, wishlist, readNotices }));
    }
  }, [hydrated, addresses, cart, wishlist, readNotices]);

  const value: Store = {
    user,
    hydrated,
    refreshUser,
    // Clearing addresses on sign-out as well: they are postal addresses and
    // phone numbers sitting in localStorage on what may be a shared machine, so
    // "log out" should mean the next person sees nothing.
    logout: async () => {
      try {
        await logoutFn();
      } catch {
        // The cookie is cleared server-side on success; on failure we still drop
        // local state so the UI cannot keep showing a signed-in shell.
      }
      setUser(null);
      setAddresses([]);
      setOrders([]);
    },
    // Local display patch only. `role` is intentionally not patchable here —
    // it is whatever the server last said it was.
    updateUser: (patch) =>
      setUser((u) => (u ? { ...u, name: patch.name ?? u.name, phone: patch.phone ?? u.phone } : u)),
    addresses,
    saveAddress: (a) =>
      setAddresses((list) => {
        const exists = list.some((x) => x.id === a.id);
        const next = exists ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a];
        // First address saved becomes the default; there is no useful
        // alternative when the list was empty.
        return next.length === 1 ? next.map((x) => ({ ...x, isDefault: true })) : next;
      }),
    removeAddress: (id) =>
      setAddresses((list) => {
        const next = list.filter((x) => x.id !== id);
        // Never leave the book without a default after removing the one that held it.
        return next.length && !next.some((x) => x.isDefault)
          ? next.map((x, i) => ({ ...x, isDefault: i === 0 }))
          : next;
      }),
    setDefaultAddress: (id) => setAddresses((list) => list.map((x) => ({ ...x, isDefault: x.id === id }))),
    cart,
    addToCart: (id, qty = 1) =>
      setCart((c) => {
        const ex = c.find((l) => l.productId === id);
        if (ex) return c.map((l) => (l.productId === id ? { ...l, qty: l.qty + qty, saved: false } : l));
        return [...c, { productId: id, qty }];
      }),
    setQty: (id, qty) => setCart((c) => c.map((l) => (l.productId === id ? { ...l, qty: Math.max(1, qty) } : l))),
    removeFromCart: (id) => setCart((c) => c.filter((l) => l.productId !== id)),
    toggleSaved: (id) => setCart((c) => c.map((l) => (l.productId === id ? { ...l, saved: !l.saved } : l))),
    clearCart: () => setCart((c) => c.filter((l) => l.saved)),
    wishlist,
    toggleWish: (id) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    orders,
    refreshOrders,
    readNotices,
    markNoticesRead: (ids) => setReadNotices((r) => [...new Set([...r, ...ids])]),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
