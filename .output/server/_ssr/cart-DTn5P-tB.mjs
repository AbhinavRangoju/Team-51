import { getProduct, getVendor, inr, vendors } from "./data-B5ji5bfz.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { useStore } from "./store-Bi6xghwA.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { toast } from "../_libs/sonner.mjs";
import { BadgeCheck, Minus, Plus, ShoppingBag, Trash } from "../_libs/lucide-react.mjs";
import { EmptyState } from "./ui-JZvfr52Y.mjs";
import { Button } from "./button-B2WEFLZt.mjs";
import { StoreLayout } from "./StoreLayout-BkQggy5A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-DTn5P-tB.js
var import_jsx_runtime = require_jsx_runtime();
function useCartTotals() {
	const { cart } = useStore();
	const lines = cart.filter((l) => !l.saved).map((l) => ({
		...l,
		product: getProduct(l.productId)
	})).filter((l) => l.product);
	const mrp = lines.reduce((s, l) => s + (l.product.originalPrice ?? l.product.price) * l.qty, 0);
	const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
	const discount = mrp - subtotal;
	const delivery = subtotal === 0 || subtotal >= 999 ? 0 : 79;
	const tax = Math.round(subtotal * .05);
	return {
		lines,
		mrp,
		subtotal,
		discount,
		delivery,
		tax,
		total: subtotal + delivery + tax
	};
}
function SummaryRows({ t }) {
	const row = "flex justify-between text-sm";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: row,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Subtotal (MRP)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(t.mrp) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: row,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Discounts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-success",
					children: ["−", inr(t.discount)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: row,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Delivery"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.delivery === 0 ? "Free" : inr(t.delivery) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: row,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "GST (5%)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(t.tax) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between border-t border-border pt-4 font-display text-lg font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(t.total) })]
			})
		]
	});
}
function CartPage() {
	const { cart, setQty, removeFromCart, toggleSaved } = useStore();
	const t = useCartTotals();
	const saved = cart.filter((l) => l.saved);
	const groups = vendors.map((v) => ({
		vendor: v,
		lines: t.lines.filter((l) => l.product.vendorId === v.id)
	})).filter((g) => g.lines.length);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-mh pt-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold md:text-4xl",
			children: "Your cart"
		}), t.lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {}),
				title: "Your cart is empty",
				body: "Looks like you haven't added anything yet. Explore thousands of products from verified sellers.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "brand",
					size: "lg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/shop",
						children: "Start shopping"
					})
				})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-8 lg:grid-cols-[1fr_380px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [groups.map(({ vendor, lines }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-mh overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b border-border bg-surface/60 px-5 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 font-semibold",
							children: [vendor.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-4 w-4 text-brand" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: ["Ships from ", vendor.city]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border",
						children: lines.map(({ product: p, qty }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-4 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/product/$id",
								params: { id: p.id },
								className: "shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.image,
									alt: "",
									className: "h-24 w-24 rounded-2xl object-cover"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-1 flex-col",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/product/$id",
											params: { id: p.id },
											className: "font-medium hover:text-brand",
											children: p.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: inr(p.price * qty)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: [inr(p.price), " each"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-auto flex flex-wrap items-center gap-3 pt-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex h-9 items-center rounded-full border border-border",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														className: "grid h-9 w-9 place-items-center disabled:opacity-40",
														disabled: qty <= 1,
														onClick: () => setQty(p.id, qty - 1),
														"aria-label": "Decrease",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3.5 w-3.5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "w-6 text-center text-sm font-semibold",
														children: qty
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														className: "grid h-9 w-9 place-items-center disabled:opacity-40",
														disabled: qty >= p.stock,
														onClick: () => setQty(p.id, qty + 1),
														"aria-label": "Increase",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => {
													toggleSaved(p.id);
													toast("Saved for later");
												},
												className: "text-xs font-semibold text-muted-foreground hover:text-foreground",
												children: "Save for later"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => {
													removeFromCart(p.id);
													toast("Removed from cart");
												},
												className: "flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { className: "h-3.5 w-3.5" }), "Remove"]
											})
										]
									})
								]
							})]
						}, p.id))
					})]
				}, vendor.id)), saved.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "mb-3 mt-8 font-semibold",
					children: [
						"Saved for later (",
						saved.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: saved.map((l) => {
						const p = getProduct(l.productId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-mh flex items-center gap-3 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.image,
									alt: "",
									className: "h-16 w-16 rounded-xl object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate text-sm font-medium",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: getVendor(p.vendorId)?.name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => toggleSaved(p.id),
									children: "Move to cart"
								})
							]
						}, p.id);
					})
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "card-mh h-fit p-6 lg:sticky lg:top-28",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-5 text-lg font-semibold",
						children: "Order summary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryRows, { t }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "brand",
						size: "lg",
						className: "mt-6 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/checkout",
							children: "Proceed to Checkout"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-center text-xs text-muted-foreground",
						children: [
							groups.length,
							" seller",
							groups.length > 1 ? "s" : "",
							" · protected by MarketHub Buyer Guarantee"
						]
					})
				]
			})]
		})]
	}) });
}
//#endregion
export { SummaryRows, CartPage as component, useCartTotals };
