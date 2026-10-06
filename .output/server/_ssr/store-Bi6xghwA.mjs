import { __toESM } from "../_runtime.mjs";
import { seedOrders } from "./data-B5ji5bfz.mjs";
import { require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-Bi6xghwA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Ctx = (0, import_react.createContext)(null);
var KEY = "markethub-state-v1";
function StoreProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [addresses, setAddresses] = (0, import_react.useState)([]);
	const [cart, setCart] = (0, import_react.useState)([]);
	const [wishlist, setWishlist] = (0, import_react.useState)([]);
	const [orders, setOrders] = (0, import_react.useState)(seedOrders);
	const [readNotices, setReadNotices] = (0, import_react.useState)([]);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		if (hydrated) localStorage.setItem(KEY, JSON.stringify({
			user,
			addresses,
			cart,
			wishlist,
			orders,
			readNotices
		}));
	}, [
		hydrated,
		user,
		addresses,
		cart,
		wishlist,
		orders,
		readNotices
	]);
	const value = {
		user,
		hydrated,
		login: setUser,
		logout: () => {
			setUser(null);
			setAddresses([]);
		},
		updateUser: (patch) => setUser((u) => u ? {
			...u,
			...patch
		} : u),
		addresses,
		saveAddress: (a) => setAddresses((list) => {
			const next = list.some((x) => x.id === a.id) ? list.map((x) => x.id === a.id ? a : x) : [...list, a];
			return next.length === 1 ? next.map((x) => ({
				...x,
				isDefault: true
			})) : next;
		}),
		removeAddress: (id) => setAddresses((list) => {
			const next = list.filter((x) => x.id !== id);
			return next.length && !next.some((x) => x.isDefault) ? next.map((x, i) => ({
				...x,
				isDefault: i === 0
			})) : next;
		}),
		setDefaultAddress: (id) => setAddresses((list) => list.map((x) => ({
			...x,
			isDefault: x.id === id
		}))),
		cart,
		addToCart: (id, qty = 1) => setCart((c) => {
			if (c.find((l) => l.productId === id)) return c.map((l) => l.productId === id ? {
				...l,
				qty: l.qty + qty,
				saved: false
			} : l);
			return [...c, {
				productId: id,
				qty
			}];
		}),
		setQty: (id, qty) => setCart((c) => c.map((l) => l.productId === id ? {
			...l,
			qty: Math.max(1, qty)
		} : l)),
		removeFromCart: (id) => setCart((c) => c.filter((l) => l.productId !== id)),
		toggleSaved: (id) => setCart((c) => c.map((l) => l.productId === id ? {
			...l,
			saved: !l.saved
		} : l)),
		clearCart: () => setCart((c) => c.filter((l) => l.saved)),
		wishlist,
		toggleWish: (id) => setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]),
		orders,
		addOrder: (o) => setOrders((os) => [o, ...os]),
		updateOrder: (id, patch) => setOrders((os) => os.map((o) => o.id === id ? {
			...o,
			...patch
		} : o)),
		readNotices,
		markNoticesRead: (ids) => setReadNotices((r) => [.../* @__PURE__ */ new Set([...r, ...ids])])
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function useStore() {
	const c = (0, import_react.useContext)(Ctx);
	if (!c) throw new Error("useStore outside provider");
	return c;
}
//#endregion
export { StoreProvider, useStore };
