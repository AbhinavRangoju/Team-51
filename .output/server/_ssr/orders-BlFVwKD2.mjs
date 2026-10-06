import { __toESM } from "../_runtime.mjs";
import { getProduct, inr, orderFlow } from "./data-B5ji5bfz.mjs";
import { require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { useStore } from "./store-Bi6xghwA.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { toast } from "../_libs/sonner.mjs";
import { Route$9, filters } from "./router-C8aofr3U.mjs";
import { Ban, Check, ChevronDown, CreditCard, MapPin, Package, PackageSearch, RotateCcw, Truck } from "../_libs/lucide-react.mjs";
import { EmptyState, StatusBadge, cn } from "./ui-JZvfr52Y.mjs";
import { Button } from "./button-B2WEFLZt.mjs";
import { RequireAuth } from "./RequireAuth-Bfz6Xezd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-BlFVwKD2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var isCancellable = (s) => s === "Order Placed" || s === "Confirmed" || s === "Processing";
function matchesFilter(o, f) {
	if (f === "All") return true;
	if (f === "Delivered") return o.status === "Delivered";
	if (f === "Cancelled") return o.status === "Cancelled";
	return o.status !== "Delivered" && o.status !== "Cancelled";
}
/** Horizontal progress rail built from the canonical `orderFlow`. */
function Tracker({ status }) {
	if (status === "Cancelled") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2.5 rounded-2xl bg-destructive-soft px-4 py-3 text-sm text-destructive",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-4 w-4 shrink-0" }), "This order was cancelled and the payment refunded."]
	});
	const current = orderFlow.indexOf(status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "flex items-start",
		children: orderFlow.map((step, i) => {
			const done = i <= current;
			const isLast = i === orderFlow.length - 1;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("flex min-w-0 flex-1 flex-col items-center", isLast && "flex-none"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-[10px] font-bold transition", done ? "border-success bg-success text-success-foreground" : "border-border bg-card text-muted-foreground"),
						children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }) : i + 1
					}), !isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-0.5 flex-1", i < current ? "bg-success" : "bg-border") })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mt-2 max-w-[8ch] text-center text-[10px] leading-tight sm:max-w-none sm:text-xs", done ? "font-semibold text-foreground" : "text-muted-foreground"),
					children: step
				})]
			}, step);
		})
	});
}
function OrderCard({ order, onCancel }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const lines = order.items.map((it) => ({
		item: it,
		product: getProduct(it.productId)
	})).filter((l) => Boolean(l.product));
	const units = order.items.reduce((s, i) => s + i.qty, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "card-mh overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex -space-x-3",
					children: lines.slice(0, 3).map(({ product }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: product.image,
						alt: "",
						className: "h-14 w-14 rounded-xl border-2 border-card object-cover"
					}, product.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display font-semibold",
							children: order.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: order.status })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: [
							"Ordered ",
							order.date,
							" · ",
							units,
							" ",
							units === 1 ? "item" : "items",
							" · ",
							inr(order.total)
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setOpen((o) => !o),
						"aria-expanded": open,
						children: [open ? "Hide" : "Details", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("transition", open && "rotate-180") })]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tracker, { status: order.status }),
				order.status !== "Cancelled" && order.status !== "Delivered" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-4 w-4 text-brand" }),
						"Estimated delivery ",
						order.eta
					]
				}),
				open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 border-t border-border pt-5 animate-in fade-in slide-in-from-top-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: lines.map(({ item, product }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/product/$id",
										params: { id: product.id },
										className: "shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: product.image,
											alt: "",
											className: "h-14 w-14 rounded-xl object-cover"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/product/$id",
											params: { id: product.id },
											className: "line-clamp-1 text-sm font-medium hover:text-brand",
											children: product.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												"Qty ",
												item.qty,
												" · ",
												inr(item.price),
												" each"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-semibold",
										children: inr(item.price * item.qty)
									})
								]
							}, product.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid gap-4 rounded-2xl bg-surface p-4 text-sm sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs text-muted-foreground",
									children: "Delivering to"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: order.address
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs text-muted-foreground",
									children: "Payment"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "font-medium",
									children: [
										order.method,
										" · ",
										order.payment
									]
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								lines[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/product/$id",
										params: { id: lines[0].product.id },
										children: "Buy it again"
									})
								}),
								order.status === "Delivered" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => toast("Returns open for 7 days after delivery", { description: "Pick the items to send back and we'll arrange pickup." }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}), " Return items"]
								}),
								isCancellable(order.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "text-destructive hover:text-destructive",
									onClick: () => onCancel(order.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, {}), " Cancel order"]
								})
							]
						})
					]
				})
			]
		})]
	});
}
function OrdersPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, {
		title: "Sign in to see your orders",
		body: "Order history and live delivery tracking are tied to your account.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersContent, {})
	});
}
function OrdersContent() {
	const search = Route$9.useSearch();
	const navigate = Route$9.useNavigate();
	const { orders: allOrders, updateOrder, user } = useStore();
	const filter = search.filter ?? "All";
	/**
	* Only the signed-in shopper's own orders are listed.
	*
	* Worth being precise about what this is: the order list is a single
	* localStorage array in the visitor's own browser, so this filter is a
	* correctness and privacy-hygiene measure, not an authorization boundary —
	* there is no server withholding anything. It matters because the seeded
	* orders belong to a named shopper, and showing them to every visitor who
	* signs up would be leaking one customer's purchase history to another.
	* The real check belongs on whichever API eventually serves orders.
	*/
	const orders = (0, import_react.useMemo)(() => allOrders.filter((o) => o.customer.trim().toLowerCase() === (user?.name ?? "").trim().toLowerCase()), [allOrders, user?.name]);
	const visible = (0, import_react.useMemo)(() => orders.filter((o) => matchesFilter(o, filter)), [orders, filter]);
	const cancel = (id) => {
		updateOrder(id, {
			status: "Cancelled",
			payment: "Refunded",
			eta: "—"
		});
		toast.success("Order cancelled", { description: `${id} has been cancelled and refunded.` });
	};
	const counts = {
		All: orders.length,
		Active: orders.filter((o) => matchesFilter(o, "Active")).length,
		Delivered: orders.filter((o) => o.status === "Delivered").length,
		Cancelled: orders.filter((o) => o.status === "Cancelled").length
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-mh pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "hover:text-foreground",
						children: "Home"
					}),
					" / ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: "My orders"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-semibold md:text-4xl",
					children: "My orders"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: orders.length === 0 ? "No orders yet." : `${orders.length} order${orders.length === 1 ? "" : "s"} placed with MarketHub sellers.`
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/shop",
						children: "Continue shopping"
					})
				})]
			}),
			orders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-7 flex flex-wrap gap-2",
				children: filters.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => navigate({ search: f === "All" ? {} : { filter: f } }),
					"aria-pressed": filter === f,
					className: cn("rounded-full border px-4 py-1.5 text-sm font-medium transition", filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground"),
					children: [
						f,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "opacity-70",
							children: [
								"(",
								counts[f],
								")"
							]
						})
					]
				}, f))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-5",
				children: visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, {}),
					title: orders.length === 0 ? "No orders yet" : `No ${filter.toLowerCase()} orders`,
					body: orders.length === 0 ? "When you place your first order it will show up here with live tracking." : "Try a different filter to see the rest of your order history.",
					action: orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "brand",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop",
							children: "Start shopping"
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => navigate({ search: {} }),
						children: "Show all orders"
					})
				}) : visible.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderCard, {
					order: o,
					onCancel: cancel
				}, o.id))
			}),
			orders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }), "Every order is covered by MarketHub buyer protection and 7-day returns."]
			})
		]
	});
}
//#endregion
export { OrdersPage as component };
