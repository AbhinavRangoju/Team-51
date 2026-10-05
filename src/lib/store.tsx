import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedOrders, type Order } from "./data";

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
  login: (u: User) => void;
  logout: () => void;
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
  orders: Order[];
  addOrder: (o: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  /** Ids of notifications already seen. Notices themselves are derived, not stored. */
  readNotices: string[];
  markNoticesRead: (ids: string[]) => void;
  hydrated: boolean;
};

const Ctx = createContext<Store | null>(null);
const KEY = "markethub-state-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [readNotices, setReadNotices] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setUser(s.user ?? null);
        setAddresses(s.addresses ?? []);
        setCart(s.cart ?? []);
        setWishlist(s.wishlist ?? []);
        setOrders(s.orders ?? seedOrders);
        setReadNotices(s.readNotices ?? []);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(KEY, JSON.stringify({ user, addresses, cart, wishlist, orders, readNotices }));
    }
  }, [hydrated, user, addresses, cart, wishlist, orders, readNotices]);

  const value: Store = {
    user,
    hydrated,
    login: setUser,
    // Clearing addresses on logout as well: they are postal addresses and phone
    // numbers sitting in localStorage on what may be a shared machine, so
    // "log out" should mean the next person sees nothing.
    logout: () => {
      setUser(null);
      setAddresses([]);
    },
    updateUser: (patch) => setUser((u) => (u ? { ...u, ...patch } : u)),
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
    addOrder: (o) => setOrders((os) => [o, ...os]),
    updateOrder: (id, patch) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o))),
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
