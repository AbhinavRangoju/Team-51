import { __toESM } from "../_runtime.mjs";
import { getProduct, inr, orderFlow, products, salesSeries, vendorOrders, vendors } from "./data-B5ji5bfz.mjs";
import { require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { useStore } from "./store-Bi6xghwA.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { toast } from "../_libs/sonner.mjs";
import { Route$3 } from "./router-C8aofr3U.mjs";
import { ArrowRight, BadgeCheck, Banknote, ExternalLink, LayoutDashboard, LogOut, Menu, Package, PackageSearch, ShieldAlert, ShoppingCart, Star, TrendingUp, Wallet, X } from "../_libs/lucide-react.mjs";
import { EmptyState, Logo, StatCard, StatusBadge, cn, stockLabel } from "./ui-JZvfr52Y.mjs";
import { Button } from "./button-B2WEFLZt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vendor-B1dZHQYW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashShell({ role, title, nav, children }) {
	const { user, hydrated, logout } = useStore();
	const [open, setOpen] = (0, import_react.useState)(false);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-screen bg-background" });
	if (!user || user.role !== role) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-mh max-w-md p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-destructive-soft text-destructive",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold",
					children: "Restricted area"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: [
						"This ",
						role,
						" workspace is only available to ",
						role,
						" accounts. Sign in with the right role to continue."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							children: "Sign in"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							children: "Back to store"
						})
					})]
				})
			]
		})
	});
	const side = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-16 items-center justify-between px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "lg:hidden",
					onClick: () => setOpen(false),
					"aria-label": "Close menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-4 mb-4 rounded-xl bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 space-y-0.5 px-3",
				children: nav.map(({ to, label, icon: Icon, exact, search }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to,
					search,
					onClick: () => setOpen(false),
					activeOptions: {
						exact: !!exact,
						includeSearch: !!search
					},
					className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-surface hover:text-foreground",
					activeProps: { className: "!bg-primary !text-primary-foreground" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
						" ",
						label
					]
				}, `${to}-${label}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground",
						children: user.name[0]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate text-sm font-semibold",
							children: user.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate text-xs text-muted-foreground",
							children: user.email
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: logout,
					className: "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Log out"]
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background lg:pl-64",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-sidebar lg:block",
				children: side
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 bg-foreground/30 lg:hidden",
				onClick: () => setOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "h-full w-64 bg-sidebar animate-in slide-in-from-left",
					onClick: (e) => e.stopPropagation(),
					children: side
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lg:hidden",
						onClick: () => setOpen(true),
						"aria-label": "Open menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "ml-auto text-sm font-medium text-muted-foreground hover:text-foreground",
						children: "View storefront →"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "px-4 py-8 md:px-8",
				children
			})
		]
	});
}
function PageTitle({ title, sub, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold md:text-3xl",
			children: title
		}), sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: sub
		})] }), action]
	});
}
var nav = [
	{
		to: "/vendor",
		label: "Overview",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/vendor",
		label: "Orders",
		icon: ShoppingCart,
		search: { view: "orders" }
	},
	{
		to: "/vendor",
		label: "Listings",
		icon: Package,
		search: { view: "products" }
	},
	{
		to: "/vendor",
		label: "Payouts",
		icon: Wallet,
		search: { view: "payouts" }
	}
];
/**
* Which store the signed-in seller is managing.
*
* Matches the session email against the seller records, falling back to the
* first verified seller so the dashboard is explorable in a seeded demo. The
* fallback is why nothing on this page may be treated as privileged: a real
* build would resolve the vendor from a verified server-side session and refuse
* to render anything if that lookup failed.
*/
function useMyVendor() {
	const { user } = useStore();
	return (0, import_react.useMemo)(() => {
		const email = (user?.email ?? "").trim().toLowerCase();
		const byEmail = vendors.find((v) => v.email.toLowerCase() === email);
		if (byEmail) return byEmail;
		const byOwner = vendors.find((v) => v.owner.toLowerCase() === (user?.name ?? "").trim().toLowerCase());
		if (byOwner) return byOwner;
		return vendors.find((v) => v.verified) ?? vendors[0];
	}, [user?.email, user?.name]);
}
function VendorPage() {
	const view = Route$3.useSearch().view ?? "overview";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashShell, {
		role: "vendor",
		title: "Vendor workspace",
		nav,
		children: [
			view === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {}),
			view === "orders" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Orders, {}),
			view === "products" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Listings, {}),
			view === "payouts" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Payouts, {})
		]
	});
}
/** Lightweight CSS bar chart. Avoids the shadcn recharts wrapper, which is
*  currently incompatible with the installed recharts major. */
function SalesChart() {
	const peak = Math.max(...salesSeries.map((s) => s.sales));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-mh p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Sales, last 6 months"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Gross merchandise value before commission."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden text-sm font-semibold text-success sm:block",
				children: "+18% vs previous period"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 flex h-44 items-end gap-3",
			children: salesSeries.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] font-semibold text-muted-foreground",
						children: [Math.round(s.sales / 1e3), "k"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full rounded-t-lg bg-brand/85 transition-all hover:bg-brand",
						style: { height: `${Math.max(6, s.sales / peak * 100)}%` },
						role: "img",
						"aria-label": `${s.month}: ${inr(s.sales)} from ${s.orders} orders`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: s.month
					})
				]
			}, s.month))
		})]
	});
}
function Overview() {
	const vendor = useMyVendor();
	const mine = products.filter((p) => p.vendorId === vendor.id);
	const revenue = vendorOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
	const live = vendorOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
	const lowStock = mine.filter((p) => p.stock > 0 && p.stock < 10);
	const outOfStock = mine.filter((p) => p.stock === 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			title: vendor.name,
			sub: `${vendor.tagline} · ${vendor.city} · selling since ${vendor.since}`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: vendor.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/vendors",
						search: { v: vendor.id },
						children: ["View public store ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {})]
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Revenue",
					value: inr(revenue),
					delta: "+18%",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Open orders",
					value: String(live.length),
					delta: "+4%",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Live listings",
					value: String(mine.length),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Seller rating",
					value: vendor.rating > 0 ? `${vendor.rating}/5` : "Not rated",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {})
				})
			]
		}),
		(lowStock.length > 0 || outOfStock.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-mh mt-4 border-warning/40 bg-warning-soft/30 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Stock needs attention"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 space-y-1 text-sm text-muted-foreground",
					children: [outOfStock.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: p.name
					}), " has sold out — shoppers cannot buy it."] }, p.id)), lowStock.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: p.name
						}),
						" is down to ",
						p.stock,
						" units."
					] }, p.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					variant: "outline",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/vendor",
						search: { view: "products" },
						children: ["Manage listings ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-[1fr_340px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesChart, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-mh p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Latest orders"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/vendor",
						search: { view: "orders" },
						className: "text-sm text-brand hover:underline",
						children: "View all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-3",
					children: vendorOrders.slice(0, 5).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate font-medium",
								children: o.id
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									o.date,
									" · ",
									inr(o.total)
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: o.status })]
					}, o.id))
				})]
			})]
		})
	] });
}
var nextStatus = (s) => {
	const i = orderFlow.indexOf(s);
	return i >= 0 && i < orderFlow.length - 1 ? orderFlow[i + 1] : null;
};
function Orders() {
	const [rows, setRows] = (0, import_react.useState)(vendorOrders);
	const [filter, setFilter] = (0, import_react.useState)("All");
	const visible = rows.filter((o) => filter === "All" ? true : filter === "Delivered" ? o.status === "Delivered" : filter === "Cancelled" ? o.status === "Cancelled" : o.status !== "Delivered" && o.status !== "Cancelled");
	const advance = (id) => {
		setRows((rs) => rs.map((o) => {
			if (o.id !== id) return o;
			const to = nextStatus(o.status);
			if (!to) return o;
			toast.success(`${id} moved to ${to}`);
			return {
				...o,
				status: to
			};
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			title: "Orders",
			sub: `${rows.length} orders placed with your store.`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-5 flex flex-wrap gap-2",
			children: [
				"All",
				"Open",
				"Delivered",
				"Cancelled"
			].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setFilter(f),
				"aria-pressed": filter === f,
				className: cn("rounded-full border px-4 py-1.5 text-sm font-medium transition", filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground"),
				children: f
			}, f))
		}),
		visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, {}),
			title: `No ${filter.toLowerCase()} orders`,
			body: "Try another filter to see the rest of your orders."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-mh overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[720px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Order"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Items"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Total"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Payment"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Action"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border",
					children: visible.map((o) => {
						const to = nextStatus(o.status);
						const names = o.items.map((i) => getProduct(i.productId)?.name).filter(Boolean).join(", ");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "transition hover:bg-surface/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-5 py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: o.id
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [
											o.date,
											" · ",
											o.address
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "max-w-[220px] px-5 py-4 text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "line-clamp-2",
										children: names || "—"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-4 font-semibold",
									children: inr(o.total)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: o.payment })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: o.status })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-4",
									children: o.status === "Cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Refunded"
									}) : to ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => advance(o.id),
										children: ["Mark ", to]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Complete"
									})
								})
							]
						}, o.id);
					})
				})]
			})
		})
	] });
}
function Listings() {
	const vendor = useMyVendor();
	const mine = products.filter((p) => p.vendorId === vendor.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
		title: "Listings",
		sub: `${mine.length} live product${mine.length === 1 ? "" : "s"} in your store.`,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "brand",
			onClick: () => toast("Listing editor needs a backend", { description: "Creating products requires a catalogue API, which this build does not have." }),
			children: "Add product"
		})
	}), mine.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, {}),
		title: "No listings yet",
		body: "Once your store is verified you can publish products here.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/vendor-register",
				children: "Check application status"
			})
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "card-mh overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-5 py-3.5 font-semibold",
						children: "Product"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-5 py-3.5 font-semibold",
						children: "SKU"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-5 py-3.5 font-semibold",
						children: "Price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-5 py-3.5 font-semibold",
						children: "Stock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-5 py-3.5 font-semibold",
						children: "Rating"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-5 py-3.5 font-semibold",
						children: "Status"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
				className: "divide-y divide-border",
				children: mine.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "transition hover:bg-surface/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/product/$id",
								params: { id: p.id },
								className: "flex items-center gap-3 hover:text-brand",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.image,
									alt: "",
									className: "h-11 w-11 rounded-xl object-cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "line-clamp-2 max-w-[220px] font-medium",
									children: p.name
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-4 font-mono text-xs text-muted-foreground",
							children: p.sku
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-5 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold",
								children: inr(p.price)
							}), p.originalPrice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground line-through",
								children: inr(p.originalPrice)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-5 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: p.stock
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: stockLabel(p.stock) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-5 py-4",
							children: [
								"★ ",
								p.rating,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [
										"(",
										p.reviews,
										")"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: p.status })
						})
					]
				}, p.id))
			})]
		})
	})] });
}
function Payouts() {
	const settled = vendorOrders.filter((o) => o.status === "Delivered");
	const pending = vendorOrders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
	const gross = settled.reduce((s, o) => s + o.total, 0);
	const commission = Math.round(gross * .08);
	const inFlight = pending.reduce((s, o) => s + o.total, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTitle, {
			title: "Payouts",
			sub: "Settled after the buyer's 7-day return window closes."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Ready to pay out",
					value: inr(gross - commission),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Commission (8%)",
					value: inr(commission),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Pending delivery",
					value: inr(inFlight),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, {})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-mh mt-4 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "How settlement works"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 space-y-3 text-sm text-muted-foreground",
					children: [
						"A shopper pays MarketHub at checkout, not the seller directly.",
						"The order is delivered and the 7-day return window starts.",
						"Once the window closes, the order value minus 8% commission is released.",
						"Payouts batch weekly to the bank account verified during onboarding."
					].map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold text-foreground",
							children: i + 1
						}), line]
					}, line))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 flex items-start gap-2 rounded-xl bg-surface px-3.5 py-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "mt-0.5 h-4 w-4 shrink-0 text-success" }), "Bank details are never shown in this dashboard — not even partially masked. There is no read path to them from the browser at all."]
				})
			]
		}),
		settled.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-mh mt-4 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[520px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Order"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Delivered"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Gross"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Commission"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3.5 font-semibold",
							children: "Net"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border",
					children: settled.map((o) => {
						const fee = Math.round(o.total * .08);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-4 font-medium",
								children: o.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-4 text-muted-foreground",
								children: o.eta
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-4",
								children: inr(o.total)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-5 py-4 text-muted-foreground",
								children: ["−", inr(fee)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-4 font-semibold",
								children: inr(o.total - fee)
							})
						] }, o.id);
					})
				})]
			})
		})
	] });
}
//#endregion
export { VendorPage as component };
