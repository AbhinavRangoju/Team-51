import { discountPct, getVendor, inr } from "./data-B5ji5bfz.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { useStore } from "./store-Bi6xghwA.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { toast } from "../_libs/sonner.mjs";
import { Heart, Plus } from "../_libs/lucide-react.mjs";
import { Stars, cn } from "./ui-JZvfr52Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ProductCard-CQ7_OnWg.js
var import_jsx_runtime = require_jsx_runtime();
function ProductCard({ product }) {
	const { addToCart, wishlist, toggleWish } = useStore();
	const vendor = getVendor(product.vendorId);
	const wished = wishlist.includes(product.id);
	const pct = discountPct(product);
	const out = product.stock === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/product/$id",
				params: { id: product.id },
				className: "relative block aspect-square overflow-hidden rounded-2xl bg-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: product.image,
					alt: product.name,
					loading: "lazy",
					width: 816,
					height: 816,
					className: cn("h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]", out && "opacity-60")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute left-3 top-3 flex flex-col gap-1.5",
					children: [pct > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-brand-foreground",
						children: [
							"-",
							pct,
							"%"
						]
					}), out ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold",
						children: "Sold out"
					}) : product.stock < 10 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-warning",
						children: [
							"Only ",
							product.stock,
							" left"
						]
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": wished ? "Remove from wishlist" : "Add to wishlist",
				onClick: () => {
					toggleWish(product.id);
					toast(wished ? "Removed from wishlist" : "Saved to wishlist");
				},
				className: "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 backdrop-blur transition hover:scale-105",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("h-4 w-4", wished ? "fill-brand text-brand" : "text-foreground") })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: vendor?.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/product/$id",
						params: { id: product.id },
						className: "mt-0.5 line-clamp-1 font-medium hover:text-brand",
						children: product.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
							value: product.rating,
							reviews: product.reviews
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg font-semibold",
								children: inr(product.price)
							}), product.originalPrice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground line-through",
								children: inr(product.originalPrice)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: out,
							onClick: () => {
								addToCart(product.id);
								toast.success("Added to cart", { description: product.name });
							},
							"aria-label": "Add to cart",
							className: "flex h-9 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add"]
						})]
					})
				]
			})
		]
	});
}
function ProductCardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-pulse",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square rounded-2xl bg-surface" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-3 w-1/3 rounded bg-surface" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2 h-4 w-3/4 rounded bg-surface" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-5 w-1/2 rounded bg-surface" })
		]
	});
}
//#endregion
export { ProductCard, ProductCardSkeleton };
