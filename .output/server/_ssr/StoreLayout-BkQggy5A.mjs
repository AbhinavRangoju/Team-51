import { __toESM } from "../_runtime.mjs";
import { discountPct, getProduct, getVendor, inr, products } from "./data-B5ji5bfz.mjs";
import { require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { useStore } from "./store-Bi6xghwA.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Bell, Check, ChevronRight, Circle, Heart, House, LayoutGrid, LogOut, Menu, Package, Search, Send, ShoppingBag, Sparkles, Store, TriangleAlert, User, X } from "../_libs/lucide-react.mjs";
import { Logo, cn } from "./ui-JZvfr52Y.mjs";
import { TSS_SERVER_FUNCTION, createServerFn, getServerFnById } from "./server-Bx1B7msm.mjs";
import { HUBBY_LIMITS } from "./contract-BDcWnoDF.mjs";
import { CheckboxItem2, Content2, Item2, ItemIndicator2, Label2, Portal2, RadioItem2, Root2, Separator2, SubContent2, SubTrigger2, Trigger } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StoreLayout-BkQggy5A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* The policy documents, in the order they appear in the footer.
*
* Lives in lib rather than beside the LegalPage component because StoreLayout
* needs it for the footer, and LegalPage renders inside StoreLayout — importing
* it from there would make the two modules circular.
*/
var LEGAL_PAGES = [
	{
		to: "/privacy",
		label: "Privacy Policy"
	},
	{
		to: "/terms",
		label: "Terms of Use"
	},
	{
		to: "/returns",
		label: "Returns Policy"
	},
	{
		to: "/seller-policy",
		label: "Seller Policy"
	}
];
/**
* Notifications are derived, not stored.
*
* There is no notification service behind MarketHub, so rather than ship a
* hardcoded feed that says the same three things forever, this reads the
* shopper's actual state — their orders, their wishlist, the live catalogue —
* and reports what is genuinely true right now. Mark an order delivered and the
* feed changes. Wishlist a discounted product and it appears.
*
* Everything here is a pure function of (orders, wishlist), which also means the
* unread badge in the header cannot drift out of sync with the list.
*/
var ORDER_COPY = {
	Confirmed: (o) => `The seller has confirmed ${o.id}. It will be packed shortly.`,
	Processing: (o) => `${o.id} is being packed and will ship soon.`,
	Shipped: (o) => `${o.id} has shipped and should arrive by ${o.eta}.`,
	"Out for Delivery": (o) => `${o.id} is out for delivery today. Keep your phone handy.`,
	Delivered: (o) => `${o.id} was delivered. Returns stay open for 7 days.`,
	Cancelled: (o) => `${o.id} was cancelled and ${inr(o.total)} refunded to your original payment method.`
};
function buildNotices(orders, wishlist) {
	const out = [];
	for (const o of orders) {
		const copy = ORDER_COPY[o.status];
		if (!copy) continue;
		out.push({
			id: `order:${o.id}:${o.status}`,
			kind: o.status === "Cancelled" ? "order" : "order",
			title: o.status === "Delivered" ? "Order delivered" : o.status === "Cancelled" ? "Order cancelled" : o.status === "Out for Delivery" ? "Arriving today" : o.status === "Shipped" ? "Order shipped" : "Order update",
			body: copy(o),
			date: o.date,
			target: { to: "/orders" }
		});
	}
	for (const id of wishlist) {
		const p = getProduct(id);
		if (!p) continue;
		const off = discountPct(p);
		if (off > 0) out.push({
			id: `price:${p.id}:${p.price}`,
			kind: "price",
			title: `${off}% off something you saved`,
			body: `${p.name} from ${getVendor(p.vendorId)?.name ?? "a verified seller"} is down to ${inr(p.price)}.`,
			date: p.createdAt,
			target: {
				to: "/product/$id",
				params: { id: p.id }
			}
		});
		if (p.stock === 0) out.push({
			id: `stock:${p.id}:out`,
			kind: "stock",
			title: "Saved item out of stock",
			body: `${p.name} has sold out. We'll keep it on your wishlist in case it returns.`,
			date: p.createdAt,
			target: {
				to: "/account",
				search: { tab: "wishlist" }
			}
		});
		else if (p.stock < 10) out.push({
			id: `stock:${p.id}:${p.stock}`,
			kind: "stock",
			title: "Saved item running low",
			body: `Only ${p.stock} left of ${p.name}.`,
			date: p.createdAt,
			target: {
				to: "/product/$id",
				params: { id: p.id }
			}
		});
	}
	out.push({
		id: "promo:festive-week",
		kind: "promo",
		title: "Festive Week is live",
		body: "Discounts from verified sellers, with prices dropping daily at noon.",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		target: { to: "/deals" }
	});
	return out.sort((a, b) => b.date.localeCompare(a.date));
}
function unreadCount(notices, read) {
	const seen = new Set(read);
	return notices.reduce((n, x) => seen.has(x.id) ? n : n + 1, 0);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* `askHubby` — the only thing the chat UI calls.
*
* A POST server function, so it inherits the CSRF middleware registered in
* src/start.ts and cannot be driven from another origin. The Gemini key is read
* inside the handler and the transport is pulled in by dynamic import, which
* keeps both out of the browser bundle.
*
* The handler never trusts the model. Every product ID Gemini returns is
* re-resolved against the real catalogue, deduplicated and capped before it
* reaches the client, so a hallucinated or injected ID becomes nothing at all
* rather than a broken link or a fabricated price. Prices, images and seller
* names are never taken from the model — the client renders those from
* `@/lib/data` using the validated IDs.
*/
/** Strips control characters, which have no place in a shopping question and
*  would otherwise land in server logs and in the prompt verbatim. */
function clean(text) {
	return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}
function validateAsk(raw) {
	if (typeof raw !== "object" || raw === null) throw new Error("Invalid request body");
	const { message, history } = raw;
	if (typeof message !== "string") throw new Error("`message` must be a string");
	const cleaned = clean(message);
	if (!cleaned) throw new Error("`message` must not be empty");
	if (cleaned.length > HUBBY_LIMITS.message) throw new Error(`\`message\` must be ${HUBBY_LIMITS.message} characters or fewer`);
	const turns = [];
	if (Array.isArray(history)) for (const entry of history.slice(-HUBBY_LIMITS.history)) {
		if (typeof entry !== "object" || entry === null) continue;
		const { role, text } = entry;
		if (role !== "user" && role !== "bot") continue;
		if (typeof text !== "string") continue;
		const body = clean(text).slice(0, HUBBY_LIMITS.historyTurn);
		if (body) turns.push({
			role,
			text: body
		});
	}
	return {
		message: cleaned,
		history: turns
	};
}
/**
* Fixed-window rate limit, per client, in process memory.
*
* Every call spends real money against the Gemini key, and the endpoint is
* reachable by anyone who can load the site. This is deliberately the simplest
* thing that removes the "hold enter and drain the quota" problem. It resets on
* restart and is not shared between instances — if MarketHub is ever scaled
* past one process this needs to move to Redis or a durable counter.
*/
/** Keeps only IDs that exist in the catalogue, deduplicated, best 3 first. */
var askHubby = createServerFn({ method: "POST" }).validator(validateAsk).handler(createSsrRpc("6f9c7360e2f408f3ed4715639b194907e252e7ca73132c0798bae8b48e4b5839"));
var GREETING = {
	id: 0,
	role: "bot",
	text: "Hi, I'm Hubby. I know every product on MarketHub, what it costs and who sells it. Tell me what you're after — a budget helps."
};
var OPENERS = [
	"Running shoes under ₹3000",
	"A laptop for a student",
	"Best rated headphones",
	"What's discounted right now?"
];
function AIAssistant() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [msgs, setMsgs] = (0, import_react.useState)([GREETING]);
	const [input, setInput] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [followUps, setFollowUps] = (0, import_react.useState)([]);
	const nextId = (0, import_react.useRef)(1);
	const scroller = (0, import_react.useRef)(null);
	/** Guards against a slow reply landing after a newer one. */
	const inFlight = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		scroller.current?.scrollTo({
			top: scroller.current.scrollHeight,
			behavior: "smooth"
		});
	}, [msgs, pending]);
	const send = async (raw) => {
		const question = raw.trim().slice(0, HUBBY_LIMITS.message);
		if (!question || pending) return;
		const turn = ++inFlight.current;
		const history = msgs.slice(1).slice(-HUBBY_LIMITS.history).map((m) => ({
			role: m.role,
			text: m.text
		}));
		setMsgs((m) => [...m, {
			id: nextId.current++,
			role: "user",
			text: question
		}]);
		setInput("");
		setPending(true);
		try {
			const answer = await askHubby({ data: {
				message: question,
				history
			} });
			if (turn !== inFlight.current) return;
			setMsgs((m) => [...m, {
				id: nextId.current++,
				role: "bot",
				text: answer.reply,
				productIds: answer.productIds,
				notice: answer.notice
			}]);
			setFollowUps(answer.followUps);
		} catch (error) {
			console.error(error);
			if (turn !== inFlight.current) return;
			setMsgs((m) => [...m, {
				id: nextId.current++,
				role: "bot",
				text: "I couldn't reach the catalogue just then. Try asking again in a moment."
			}]);
			setFollowUps([]);
		} finally {
			if (turn === inFlight.current) setPending(false);
		}
	};
	const chips = msgs.length === 1 ? OPENERS : followUps;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => setOpen((o) => !o),
		"aria-label": open ? "Close shopping assistant" : "Open shopping assistant",
		"aria-expanded": open,
		className: "fixed bottom-20 right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-primary pl-4 pr-5 text-sm font-semibold text-primary-foreground shadow-lift transition hover:scale-[1.03] md:bottom-6 md:right-6",
		children: [open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-brand" }), open ? "Close" : "Ask Hubby"]
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "dialog",
		"aria-label": "Hubby, the MarketHub shopping assistant",
		className: "fixed inset-x-3 bottom-36 z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lift animate-in fade-in slide-in-from-bottom-4 md:inset-x-auto md:bottom-22 md:right-6 md:w-[380px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 border-b border-border px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-brand",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display font-semibold",
					children: "Hubby · AI assistant"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: [
						"Knows all ",
						products.length,
						" live listings, prices and sellers"
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scroller,
				className: "flex-1 space-y-3 overflow-y-auto p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"aria-live": "polite",
						className: "space-y-3",
						children: msgs.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: m.role === "user" ? "flex justify-end" : "",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: m.role === "user" ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground" : "max-w-[90%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2 text-sm",
									children: m.text
								}),
								m.notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 h-3 w-3 shrink-0 text-warning" }), m.notice]
								}),
								!!m.productIds?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 space-y-2",
									children: m.productIds.map((id) => {
										const p = getProduct(id);
										if (!p) return null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/product/$id",
											params: { id: p.id },
											onClick: () => setOpen(false),
											className: "flex items-center gap-3 rounded-2xl border border-border p-2 transition hover:border-brand",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: p.image,
													alt: "",
													className: "h-12 w-12 rounded-xl object-cover"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0 flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "truncate text-sm font-medium",
														children: p.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-xs text-muted-foreground",
														children: [
															getVendor(p.vendorId)?.name,
															" · ★ ",
															p.rating,
															p.stock === 0 && " · out of stock"
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-sm font-semibold",
													children: inr(p.price)
												})
											]
										}, id);
									})
								})
							]
						}, m.id))
					}),
					pending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-fit gap-1 rounded-2xl rounded-bl-md bg-surface px-3.5 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Hubby is typing"
						}), [
							0,
							150,
							300
						].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground",
							style: { animationDelay: `${d}ms` }
						}, d))]
					}),
					!pending && chips.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2 pt-1",
						children: chips.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => send(s),
							className: "rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-brand hover:text-brand",
							children: s
						}, s))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					send(input);
				},
				className: "flex gap-2 border-t border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: input,
					onChange: (e) => setInput(e.target.value),
					maxLength: HUBBY_LIMITS.message,
					disabled: pending,
					"aria-label": "Ask Hubby about a product",
					placeholder: "e.g. headphones under ₹10000",
					className: "h-10 flex-1 rounded-full bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: pending || !input.trim(),
					"aria-label": "Send",
					className: "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition disabled:opacity-40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
				})]
			})
		]
	})] });
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var nav = [
	{
		to: "/",
		label: "Home"
	},
	{
		to: "/shop",
		label: "Shop"
	},
	{
		to: "/categories",
		label: "Categories"
	},
	{
		to: "/vendors",
		label: "Vendors"
	},
	{
		to: "/deals",
		label: "Deals"
	}
];
function SearchBox({ className, onDone }) {
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		className,
		onSubmit: (e) => {
			e.preventDefault();
			navigate({
				to: "/shop",
				search: { q }
			});
			onDone?.();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search products, brands, sellers",
				"aria-label": "Search",
				className: "h-10 w-full rounded-full border border-transparent bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:bg-card focus:ring-4 focus:ring-brand/10"
			})]
		})
	});
}
function Header() {
	const { cart, wishlist, user, logout, orders, readNotices } = useStore();
	const [menu, setMenu] = (0, import_react.useState)(false);
	const count = cart.filter((l) => !l.saved).reduce((s, l) => s + l.qty, 0);
	const unread = (0, import_react.useMemo)(() => {
		if (!user) return 0;
		return unreadCount(buildNotices(orders.filter((o) => o.customer.trim().toLowerCase() === user.name.trim().toLowerCase()), wishlist), readNotices);
	}, [
		user,
		orders,
		wishlist,
		readNotices
	]);
	const iconBtn = "relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-surface";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-primary py-2 text-center text-xs text-primary-foreground",
				children: [
					"Free delivery on orders over ₹999 · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-brand",
						children: "Festive Week"
					}),
					" up to 40% off"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-mh flex h-16 items-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `${iconBtn} md:hidden`,
						onClick: () => setMenu(true),
						"aria-label": "Open menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "ml-6 hidden items-center gap-1 lg:flex",
						children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: n.to,
							activeOptions: { exact: n.to === "/" },
							className: "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground",
							activeProps: { className: "!text-foreground bg-surface" },
							children: n.label
						}, n.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, { className: "ml-auto hidden w-full max-w-xs md:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-0.5 md:ml-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/notifications",
								className: `${iconBtn} hidden sm:grid`,
								"aria-label": unread > 0 ? `Notifications, ${unread} unread` : "Notifications",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-[18px] w-[18px]" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/account",
								search: { tab: "wishlist" },
								className: `${iconBtn} hidden sm:grid`,
								"aria-label": "Wishlist",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-[18px] w-[18px]" }), wishlist.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground",
									children: wishlist.length
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/cart",
								className: iconBtn,
								"aria-label": `Cart, ${count} items`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-[18px] w-[18px]" }), count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground",
									children: count
								})]
							}),
							user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								className: "ml-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand",
								children: user.name[0]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								className: "w-56 rounded-xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm",
										children: user.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs font-normal capitalize text-muted-foreground",
										children: [user.role, " account"]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/account",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "mr-2 h-4 w-4" }), "My account"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/orders",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "mr-2 h-4 w-4" }), "My orders"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/notifications",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "mr-2 h-4 w-4" }), "Notifications"]
										})
									}),
									user.role === "vendor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/vendor",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "mr-2 h-4 w-4" }), "Vendor dashboard"]
										})
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/vendor-register",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "mr-2 h-4 w-4" }), "Sell on MarketHub"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: logout,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-2 h-4 w-4" }), "Log out"]
									})
								]
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "ml-2 hidden h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 sm:flex",
								children: "Sign in"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "container-mh pb-3 md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {})
			}),
			menu && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 bg-foreground/30 md:hidden",
				onClick: () => setMenu(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-full w-72 bg-background p-5 animate-in slide-in-from-left",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setMenu(false),
							"aria-label": "Close menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex flex-col gap-1",
						children: [
							nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: n.to,
								onClick: () => setMenu(false),
								className: "rounded-xl px-3 py-3 font-medium hover:bg-surface",
								children: n.label
							}, n.to)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/vendor-register",
								onClick: () => setMenu(false),
								className: "rounded-xl px-3 py-3 font-medium text-brand hover:bg-surface",
								children: "Sell on MarketHub"
							}),
							!user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								onClick: () => setMenu(false),
								className: "mt-4 rounded-full bg-primary px-4 py-3 text-center font-semibold text-primary-foreground",
								children: "Sign in"
							})
						]
					})]
				})
			})
		]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-24 border-t border-border bg-card pb-24 md:pb-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-mh grid gap-10 py-14 md:grid-cols-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xs text-sm text-muted-foreground",
						children: "One marketplace, thousands of verified independent sellers. Every order protected end to end."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 flex gap-2 text-xs font-semibold text-muted-foreground",
						children: [
							"Instagram",
							"X",
							"LinkedIn",
							"YouTube"
						].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full border border-border px-3 py-1.5",
							children: s
						}, s))
					})
				]
			}), [
				{
					title: "Marketplace",
					links: [
						["Shop all", "/shop"],
						["Categories", "/categories"],
						["Deals", "/deals"],
						["Vendors", "/vendors"]
					]
				},
				{
					title: "Support",
					links: [
						["My orders", "/orders"],
						["My account", "/account"],
						["Notifications", "/notifications"],
						["Returns policy", "/returns"]
					]
				},
				{
					title: "Sell",
					links: [
						["Become a vendor", "/vendor-register"],
						["Vendor dashboard", "/vendor"],
						["Seller policy", "/seller-policy"],
						["Sign in", "/login"]
					]
				}
			].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 text-sm font-semibold",
				children: c.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2.5 text-sm text-muted-foreground",
				children: c.links.map(([l, to]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to,
					className: "hover:text-foreground",
					children: l
				}) }, l))
			})] }, c.title))]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-mh flex flex-col justify-between gap-3 py-5 text-xs text-muted-foreground md:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 MarketHub Technologies Pvt. Ltd." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Legal",
					className: "flex flex-wrap gap-x-1.5 gap-y-1",
					children: LEGAL_PAGES.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex gap-1.5",
						children: [i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							children: "·"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: p.to,
							className: "hover:text-foreground",
							children: p.label
						})]
					}, p.to))
				})]
			})
		})]
	});
}
function BottomNav() {
	const { cart } = useStore();
	const count = cart.filter((l) => !l.saved).reduce((s, l) => s + l.qty, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur md:hidden",
		children: [
			{
				to: "/",
				icon: House,
				label: "Home"
			},
			{
				to: "/shop",
				icon: LayoutGrid,
				label: "Shop"
			},
			{
				to: "/cart",
				icon: ShoppingBag,
				label: "Cart"
			},
			{
				to: "/orders",
				icon: Package,
				label: "Orders"
			},
			{
				to: "/account",
				icon: User,
				label: "Account"
			}
		].map(({ to, icon: Icon, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to,
			activeOptions: { exact: to === "/" },
			className: "relative flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground",
			activeProps: { className: "!text-foreground font-semibold" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" }),
				label,
				to === "/cart" && count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-[28%] top-1.5 h-2 w-2 rounded-full bg-brand" })
			]
		}, to))
	});
}
function StoreLayout({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIAssistant, {})
		]
	});
}
//#endregion
export { LEGAL_PAGES, StoreLayout, buildNotices };
