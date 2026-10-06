import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { LegalPage, bullets, prose } from "./LegalPage-Bxwl6sC3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terms-Uc9ZVX2Z.js
var import_jsx_runtime = require_jsx_runtime();
var sections = [
	{
		id: "marketplace",
		heading: "MarketHub is a marketplace",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"MarketHub connects shoppers with independent sellers. Each product is listed, priced, packed and shipped by the seller named on the listing. MarketHub verifies sellers before their listings go live and handles payment, but it is",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "not the seller of record" }),
				" for the items you buy."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "That means product descriptions, specifications and stock levels come from the seller. MarketHub reviews listings for accuracy but cannot guarantee every detail." })]
		})
	},
	{
		id: "accounts",
		heading: "Your account",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: bullets,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "One person, one account. Keep your sign-in details to yourself." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The details on your account are used for order confirmations and delivery, so keep them current." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"Shopper accounts cannot list products. Selling requires an application at ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/vendor-register",
						className: "font-semibold text-brand hover:underline",
						children: "Become a vendor"
					}),
					" and passing verification."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "In this build" }), " sign-in does not check a password and your session lives only in your browser, so it protects nothing. Do not reuse a real password here."] })
			]
		})
	},
	{
		id: "pricing",
		heading: "Prices, charges and taxes",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "These are the actual figures the application uses:" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"All prices are in ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Indian Rupees" }),
							" and product page prices are inclusive of all taxes."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Delivery is free" }), " on cart subtotals of ₹999 or more. Below that, delivery is ₹79."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GST of 5%" }), " is applied to the cart subtotal and shown as a separate line."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Standard delivery is free and takes 3 to 5 business days. ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Express delivery is ₹149" }),
							" and takes 1 to 2 business days, charged on top of the cart total."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Deal prices during a campaign such as Festive Week are time-limited and can change daily." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "If a listing shows an obviously wrong price, MarketHub may cancel the affected order and refund it in full rather than fulfil it." })
			]
		})
	},
	{
		id: "orders",
		heading: "Orders and payment",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Placing an order is an offer to buy. The order is accepted when the seller confirms it, which is the point the contract forms. You can pay by card, UPI, MarketHub Wallet, or cash on delivery; cash orders stay in a pending payment state until the courier collects." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"You can cancel an order yourself while it is still in ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Order Placed" }),
					",",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Confirmed" }),
					" or ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Processing" }),
					". Once it ships, use the",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/returns",
						className: "font-semibold text-brand hover:underline",
						children: "Returns Policy"
					}),
					" ",
					"instead."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "In this build" }), " no payment processor is contacted. Nothing is charged and no card data is transmitted or stored."] })
			]
		})
	},
	{
		id: "acceptable-use",
		heading: "Acceptable use",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Please do not:" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Scrape the catalogue, seller directory or any page in bulk." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Attempt to reach another shopper's or seller's data, or to escalate your own account's permissions." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Probe, overload or interfere with the service, including automating the shopping assistant to exhaust its quota." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Post reviews you did not earn through a real purchase, or impersonate a seller." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Found a genuine security flaw? Report it rather than exploiting it. Good-faith reports are welcome." })
			]
		})
	},
	{
		id: "assistant",
		heading: "The shopping assistant",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: prose,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Hubby suggests products from the live catalogue using an AI model. It is a shopping aid, not advice. It can be wrong, and the product page is always the authority on price, specification and availability. Hubby cannot place, change or cancel orders, and it has no access to your account." })
		})
	},
	{
		id: "liability",
		heading: "Liability",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "MarketHub provides the marketplace as-is. For disputes about an item itself — condition, description or fitness for purpose — the seller is responsible, and MarketHub's buyer protection is the route to a resolution. MarketHub's responsibility is limited to the value of the affected order." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Since this build is a demonstration and processes no real transactions, nothing on this page creates an enforceable obligation on anyone." })]
		})
	}
];
function TermsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegalPage, {
		title: "Terms of Use",
		summary: "The rules for shopping on MarketHub, written to match what the application actually does.",
		updated: "5 October 2026",
		current: "/terms",
		sections
	});
}
//#endregion
export { TermsPage as component };
