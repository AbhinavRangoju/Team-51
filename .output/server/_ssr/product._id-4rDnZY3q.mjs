import { __toESM } from "../_runtime.mjs";
import { getVendor, inr, products } from "./data-B5ji5bfz.mjs";
import { require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { useStore } from "./store-Bi6xghwA.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { toast } from "../_libs/sonner.mjs";
import { Route } from "./router-C8aofr3U.mjs";
import { BadgeCheck, Heart, Minus, Plus, RotateCcw, ShieldCheck, Truck } from "../_libs/lucide-react.mjs";
import { Price, SectionHeader, Stars, StatusBadge, cn } from "./ui-JZvfr52Y.mjs";
import { ProductCard } from "./ProductCard-CQ7_OnWg.mjs";
import { Button } from "./button-B2WEFLZt.mjs";
import { StoreLayout } from "./StoreLayout-BkQggy5A.mjs";
import { Content, List, Root2, Trigger } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/product._id-4rDnZY3q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var reviews = [
	{
		name: "Aditi R.",
		rating: 5,
		date: "Sep 21, 2026",
		text: "Exactly as described and arrived two days early. Packaging was thoughtful."
	},
	{
		name: "Vikram S.",
		rating: 4,
		date: "Sep 12, 2026",
		text: "Great quality for the price. The seller answered my questions quickly."
	},
	{
		name: "Lena M.",
		rating: 5,
		date: "Aug 30, 2026",
		text: "Second purchase from this vendor. Consistently excellent."
	}
];
function ProductPage() {
	const { product: p } = Route.useLoaderData();
	const vendor = getVendor(p.vendorId);
	const { addToCart, wishlist, toggleWish } = useStore();
	const navigate = useNavigate();
	const [qty, setQty] = (0, import_react.useState)(1);
	const [img, setImg] = (0, import_react.useState)(0);
	const [zoom, setZoom] = (0, import_react.useState)(false);
	const gallery = [
		p.image,
		...products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 2).map((x) => x.image),
		p.image
	];
	const out = p.stock === 0;
	const wished = wishlist.includes(p.id);
	const related = products.filter((x) => x.id !== p.id && (x.category === p.category || x.vendorId === p.vendorId)).slice(0, 4);
	const bundle = products.filter((x) => x.id !== p.id && x.stock > 0).slice(0, 2);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/shop",
						search: { cat: p.category },
						className: "capitalize hover:text-foreground",
						children: p.category
					}),
					" / ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: p.name
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-10 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-surface",
					onMouseEnter: () => setZoom(true),
					onMouseLeave: () => setZoom(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: gallery[img],
						alt: p.name,
						className: cn("h-full w-full object-cover transition duration-500", zoom && "scale-125")
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-4 gap-3",
					children: gallery.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setImg(i),
						"aria-label": `View image ${i + 1}`,
						className: cn("aspect-square overflow-hidden rounded-2xl border-2 bg-surface transition", img === i ? "border-primary" : "border-transparent hover:border-border"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: g,
							alt: "",
							className: "h-full w-full object-cover"
						})
					}, i))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/vendors",
						className: "inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-accent",
						children: [
							"Sold by ",
							vendor.name,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-3.5 w-3.5 text-brand" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-3xl font-semibold leading-tight md:text-4xl",
						children: p.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
							value: p.rating,
							reviews: p.reviews,
							size: "md"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Price, {
							price: p.price,
							original: p.originalPrice,
							size: "lg"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Inclusive of all taxes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							status: out ? "Out of stock" : p.stock < 10 ? `Only ${p.stock} left` : "In stock",
							toneOverride: out ? "danger" : p.stock < 10 ? "warning" : "success"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-muted-foreground",
						children: p.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-12 items-center rounded-full border border-border bg-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "grid h-12 w-12 place-items-center disabled:opacity-40",
										disabled: qty <= 1,
										onClick: () => setQty(qty - 1),
										"aria-label": "Decrease",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-8 text-center font-semibold",
										children: qty
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "grid h-12 w-12 place-items-center disabled:opacity-40",
										disabled: qty >= p.stock,
										onClick: () => setQty(qty + 1),
										"aria-label": "Increase",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								variant: "default",
								disabled: out,
								className: "flex-1",
								onClick: () => {
									addToCart(p.id, qty);
									toast.success("Added to cart", { description: `${qty} × ${p.name}` });
								},
								children: "Add to Cart"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								variant: "brand",
								disabled: out,
								className: "flex-1",
								onClick: () => {
									addToCart(p.id, qty);
									navigate({ to: "/checkout" });
								},
								children: "Buy Now"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "outline",
								className: "h-12 w-12",
								"aria-label": "Wishlist",
								onClick: () => {
									toggleWish(p.id);
									toast(wished ? "Removed from wishlist" : "Saved to wishlist");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn(wished && "fill-brand text-brand") })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 grid gap-3 rounded-2xl border border-border p-5 text-sm sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-5 w-5 shrink-0 text-brand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: "Free delivery"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted-foreground",
									children: "By Oct 9"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-5 w-5 shrink-0 text-brand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: "7-day returns"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted-foreground",
									children: "No questions"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 shrink-0 text-brand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: "Buyer protection"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted-foreground",
									children: "On every order"
								})] })]
							})
						]
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "desc",
				className: "mt-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
						className: "h-auto gap-1 rounded-full bg-surface p-1",
						children: [
							["desc", "Description"],
							["specs", "Specifications"],
							["seller", "Seller"],
							["reviews", `Reviews (${p.reviews})`]
						].map(([v, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: v,
							className: "rounded-full px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-card",
							children: l
						}, v))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "desc",
						className: "mt-6 max-w-3xl text-muted-foreground",
						children: [p.description, " Every MarketHub listing is reviewed for accuracy, and the seller ships directly from their own studio or warehouse."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "specs",
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "card-mh max-w-2xl divide-y divide-border",
							children: Object.entries(p.specs).concat([["SKU", p.sku], ["Brand", p.brand]]).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 px-5 py-3.5 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: k
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: v
								})]
							}, k))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "seller",
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-mh flex max-w-2xl flex-col gap-5 p-6 sm:flex-row sm:items-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-16 w-16 place-items-center rounded-full bg-surface font-display text-2xl font-semibold",
									children: vendor.name[0]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5 text-lg font-semibold",
											children: [vendor.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-5 w-5 text-brand" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-sm text-muted-foreground",
											children: [
												vendor.tagline,
												" · ",
												vendor.city,
												" · Selling since ",
												vendor.since
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 text-sm",
											children: [
												"★ ",
												vendor.rating,
												" seller rating · ",
												vendor.products,
												" products"
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/vendors",
										children: "Visit store"
									})
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "reviews",
						className: "mt-6 grid max-w-3xl gap-4",
						children: reviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-mh p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: r.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: r.date
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: r.rating })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: r.text
								})
							]
						}, r.name))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Frequently bought together" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-mh flex flex-col items-center gap-6 p-6 md:flex-row",
					children: [[p, ...bundle].map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-6",
						children: [i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-32 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: b.image,
									alt: "",
									className: "aspect-square w-full rounded-2xl object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 line-clamp-1 text-sm",
									children: b.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold",
									children: inr(b.price)
								})
							]
						})]
					}, b.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:ml-auto md:text-right",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: "Bundle total"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-2xl font-semibold",
								children: inr([p, ...bundle].reduce((s, b) => s + b.price, 0))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								disabled: out,
								onClick: () => {
									[p, ...bundle].forEach((b) => addToCart(b.id));
									toast.success("Bundle added to cart");
								},
								children: "Add all to cart"
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "You may also like" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4",
					children: related.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: r }, r.id))
				})]
			})
		]
	}) });
}
//#endregion
export { ProductPage as component };
