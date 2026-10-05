import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedOrders, type Order } from "./data";

export type Role = "customer" | "vendor" | "admin";
export type User = { name: string; email: string; role: Role };
export type CartLine = { productId: string; qty: number; saved?: boolean };

type Store = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
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
  hydrated: boolean;
};

const Ctx = createContext<Store | null>(null);
const KEY = "markethub-state-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setUser(s.user ?? null);
        setCart(s.cart ?? []);
        setWishlist(s.wishlist ?? []);
        setOrders(s.orders ?? seedOrders);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify({ user, cart, wishlist, orders }));
  }, [hydrated, user, cart, wishlist, orders]);

  const value: Store = {
    user,
    hydrated,
    login: setUser,
    logout: () => setUser(null),
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
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
