import { __toESM } from "../_runtime.mjs";
import { categories, discountPct, getVendor, inr, products } from "./data-B5ji5bfz.mjs";
import { require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { useStore } from "./store-Bi6xghwA.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { toast } from "../_libs/sonner.mjs";
import { ArrowRight, Flame, Plus, SearchX, Tag, Timer, TrendingDown } from "../_libs/lucide-react.mjs";
import { EmptyState, Price, SectionHeader, Stars, cn } from "./ui-JZvfr52Y.mjs";
import { ProductCard } from "./ProductCard-CQ7_OnWg.mjs";
import { Button } from "./button-B2WEFLZt.mjs";
import { StoreLayout } from "./StoreLayout-BkQggy5A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deals-fsLscSPA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var sorts = [
	"Biggest discount",
	"Biggest saving",
	"Price: Low to High",
	"Price: High to Low",
	"Top rated"
];
var tiers = [
	{
		label: "All offers",
		min: 0
	},
	{
		label: "20% & up",
		min: 20
	},
	{
		label: "30% & up",
		min: 30
	},
	{
		label: "40% & up",
		min: 40
	}
];
var saving = (p) => (p.originalPrice ?? p.price) - p.price;
/** Festive Week runs to the end of the coming Sunday, so the countdown stays
*  meaningful whenever the page is opened instead of expiring on a fixed date. */
function endOfFestiveWeek(from) {
	const end = new Date(from);
	end.setDate(end.getDate() + (7 - end.getDay()) % 7);
	end.setHours(23, 59, 59, 999);
	if (end.getTime() <= from.getTime()) end.setDate(end.getDate() + 7);
	return end;
}
/** Ticks only after mount. The server has no business rendering a clock — doing
*  so would hydrate into a mismatch the moment the two differ by a second. */
function useCountdown() {
	const [left, setLeft] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const tick = () => {
			const now = /* @__PURE__ */ new Date();
			let ms = endOfFestiveWeek(now).getTime() - now.getTime();
			if (ms < 0) ms = 0;
			const secs = Math.floor(ms / 1e3);
			setLeft({
				days: Math.floor(secs / 86400),
				hours: Math.floor(secs % 86400 / 3600),
				mins: Math.floor(secs % 3600 / 60),
				secs: secs % 60
			});
		};
		tick();
		const id = setInterval(tick, 1e3);
		return () => clearInterval(id);
	}, []);
	return left;
}
function CountdownTiles() {
	const left = useCountdown();
	const pad = (n) => String(n).padStart(2, "0");
	const tiles = [
		[left ? pad(left.days) : "--", "Days"],
		[left ? pad(left.hours) : "--", "Hours"],
		[left ? pad(left.mins) : "--", "Mins"],
		[left ? pad(left.secs) : "--", "Secs"]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-4 gap-3",
		role: "timer",
		"aria-live": "off",
		"aria-label": left ? `${left.days} days ${left.hours} hours ${left.mins} minutes remaining` : "Loading time remaining",
		children: tiles.map(([n, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-primary-foreground/10 p-4 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display text-3xl font-semibold tabular-nums md:text-4xl",
				children: n
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-primary-foreground/60",
				children: l
			})]
		}, l))
	});
}
function Spotlight({ product }) {
	const { addToCart } = useStore();
	const vendor = getVendor(product.vendorId);
	const out = product.stock === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-mh grid gap-0 overflow-hidden md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/product/$id",
			params: { id: product.id },
			className: "relative block aspect-[4/3] overflow-hidden bg-surface md:aspect-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: product.image,
				alt: product.name,
				className: "h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-brand-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-3.5 w-3.5" }), "Deal of the day"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col justify-center p-6 md:p-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold uppercase tracking-[0.14em] text-brand",
					children: vendor?.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-2xl font-semibold md:text-3xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/product/$id",
						params: { id: product.id },
						className: "hover:text-brand",
						children: product.name
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
						value: product.rating,
						reviews: product.reviews
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Price, {
						price: product.price,
						original: product.originalPrice,
						size: "lg"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm font-semibold text-success",
					children: ["You save ", inr(saving(product))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-md text-sm text-muted-foreground",
					children: product.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-7 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						size: "lg",
						disabled: out,
						onClick: () => {
							addToCart(product.id);
							toast.success("Added to cart", { description: product.name });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), out ? "Sold out" : "Add to cart"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/product/$id",
							params: { id: product.id },
							children: "View details"
						})
					})]
				}),
				!out && product.stock < 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-xs font-semibold text-warning",
					children: [
						"Only ",
						product.stock,
						" left at this price"
					]
				})
			]
		})]
	});
}
function Deals() {
	const [tier, setTier] = (0, import_react.useState)(0);
	const [cat, setCat] = (0, import_react.useState)(null);
	const [sort, setSort] = (0, import_react.useState)("Biggest discount");
	const all = (0, import_react.useMemo)(() => products.filter((p) => discountPct(p) > 0), []);
	const topPct = (0, import_react.useMemo)(() => all.reduce((m, p) => Math.max(m, discountPct(p)), 0), [all]);
	const totalSaving = (0, import_react.useMemo)(() => all.reduce((s, p) => s + saving(p), 0), [all]);
	const spotlight = (0, import_react.useMemo)(() => [...all].sort((a, b) => discountPct(b) - discountPct(a)).find((p) => p.stock > 0) ?? all[0], [all]);
	const dealCats = (0, import_react.useMemo)(() => categories.filter((c) => all.some((p) => p.category === c.slug)), [all]);
	const list = (0, import_react.useMemo)(() => {
		const min = tiers[tier]?.min ?? 0;
		const l = all.filter((p) => discountPct(p) >= min && (!cat || p.category === cat));
		switch (sort) {
			case "Biggest saving": return [...l].sort((a, b) => saving(b) - saving(a));
			case "Price: Low to High": return [...l].sort((a, b) => a.price - b.price);
			case "Price: High to Low": return [...l].sort((a, b) => b.price - a.price);
			case "Top rated": return [...l].sort((a, b) => b.rating - a.rating);
			default: return [...l].sort((a, b) => discountPct(b) - discountPct(a));
		}
	}, [
		all,
		tier,
		cat,
		sort
	]);
	const endingSoon = (0, import_react.useMemo)(() => all.filter((p) => p.stock > 0 && p.stock < 10), [all]);
	const reset = () => {
		setTier(0);
		setCat(null);
	};
	const chip = (active) => cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold transition", active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StoreLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					" ",
					"/ ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: "Deals"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid items-center gap-8 rounded-[2rem] bg-primary p-8 text-primary-foreground md:grid-cols-2 md:p-14",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-[0.14em] text-brand",
							children: "Deals of the week"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-2 text-3xl font-semibold md:text-5xl",
							children: [
								"Festive Week. Up to ",
								topPct,
								"% off."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 max-w-md text-primary-foreground/70",
							children: [all.length, " live offers from verified sellers. Prices drop daily at noon and the week closes Sunday night."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-7 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "brand",
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/shop",
									children: ["Shop all products ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/categories",
									children: "Browse categories"
								})
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2 text-xs font-semibold text-primary-foreground/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "h-4 w-4" }), "Festive Week ends in"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownTiles, {})] })]
				})
			}),
			spotlight && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					eyebrow: "Biggest markdown",
					title: "Today's headline offer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spotlight, { product: spotlight })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						eyebrow: "Every offer",
						title: "All Festive Week deals",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: sort,
							onChange: (e) => setSort(e.target.value),
							"aria-label": "Sort deals",
							className: "h-10 rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-brand",
							children: sorts.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 border-b border-border pb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mr-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-4 w-4" }), "Discount"]
							}), tiers.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setTier(i),
								className: chip(tier === i),
								children: t.label
							}, t.label))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mr-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4" }), "Category"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setCat(null),
									className: chip(cat === null),
									children: "All"
								}),
								dealCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setCat(c.slug),
									className: chip(cat === c.slug),
									children: c.name
								}, c.slug))
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-sm text-muted-foreground",
						children: [
							list.length,
							" offer",
							list.length === 1 ? "" : "s",
							list.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								" · save up to ",
								inr(Math.max(...list.map(saving))),
								" on a single item"
							] })
						]
					}),
					list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchX, {}),
							title: "No deals in that range",
							body: "Nothing is discounted that deeply in this category right now. Widen the discount filter or browse the full catalogue.",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap justify-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: reset,
									children: "Show all offers"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/shop",
										children: "Open full shop"
									})
								})]
							})
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4",
						children: list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
					})
				]
			}),
			endingSoon.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					eyebrow: "Low stock",
					title: "Going fast at this price"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: endingSoon.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/product/$id",
						params: { id: p.id },
						className: "card-mh flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lift",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: p.image,
							alt: "",
							loading: "lazy",
							className: "h-20 w-20 shrink-0 rounded-xl object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-medium",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-0.5 text-xs font-semibold text-warning",
									children: [
										"Only ",
										p.stock,
										" left"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1.5 flex items-baseline gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display font-semibold",
											children: inr(p.price)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground line-through",
											children: inr(p.originalPrice ?? p.price)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs font-semibold text-success",
											children: [
												"-",
												discountPct(p),
												"%"
											]
										})
									]
								})
							]
						})]
					}, p.id))
				})]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "container-mh mt-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-mh flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-success-soft text-success",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-semibold",
					children: [inr(totalSaving), " off across every live offer"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-sm text-muted-foreground",
					children: [
						"Combined markdown on all ",
						all.length,
						" discounted items, from ",
						new Set(all.map((p) => p.vendorId)).size,
						" sellers."
					]
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/cart",
					children: "Review your cart"
				})
			})]
		})
	})] });
}
//#endregion
export { Deals as component };
