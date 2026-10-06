import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { LegalPage, bullets, prose } from "./LegalPage-Bxwl6sC3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller-policy-4f5_AEQN.js
var import_jsx_runtime = require_jsx_runtime();
var sections = [
	{
		id: "verification",
		heading: "Getting verified",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Every seller is checked before their listings go live. Apply at",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/vendor-register",
						className: "font-semibold text-brand hover:underline",
						children: "Become a vendor"
					}),
					" ",
					"with your registered business name, GSTIN and PAN. Until the check completes your store appears in the public directory as ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pending Verification" }),
					" and cannot publish products."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "GSTIN and PAN are validated against the registries, not just checked for format." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "A short verification call confirms the business details." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Most reviews finish within two business days." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Only verified sellers appear in the shopper-facing seller filter." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Payout details are collected separately" }), ", over a verified channel, after approval. The application form never asks for a bank account, and bank details are never readable from the vendor dashboard."] })
			]
		})
	},
	{
		id: "listings",
		heading: "Listing standards",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your listing is what a shopper is deciding from, so it has to be true:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: bullets,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Describe the actual item, with photographs of the actual item." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Specifications must be accurate. Battery life, materials and dimensions get checked against reality when disputes arise." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Keep stock counts current. Overselling and then cancelling is the fastest way to lose your badge." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No counterfeits, replicas, or goods you are not authorised to resell." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No prohibited items: weapons, controlled substances, or anything requiring a licence you do not hold." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Any ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "struck-through original price must be a price you genuinely charged" }),
						". Inflating it to manufacture a discount is prohibited."
					] })
				]
			})]
		})
	},
	{
		id: "commission",
		heading: "Commission and fees",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: prose,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: bullets,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "No listing fees." }), " Publishing products costs nothing."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "8% commission" }), " on the order value of delivered orders."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No commission on cancelled orders or on anything returned within the 7-day window." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No monthly subscription, and no charge for the verification process." })
				]
			})
		})
	},
	{
		id: "payouts",
		heading: "How payouts work",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Shoppers pay MarketHub at checkout, not you directly. MarketHub holds the money until the buyer's return window closes, which is what backs buyer protection:" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"The order is delivered and the ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "7-day return window" }),
							" starts."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "When the window closes with no return, the order value minus 8% commission is released." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Payouts batch weekly to the bank account verified during onboarding." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Cash-on-delivery orders settle once the courier remits the collection." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Your current position is visible under",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/vendor",
						search: { view: "payouts" },
						className: "font-semibold text-brand hover:underline",
						children: "Payouts"
					}),
					" ",
					"in the vendor dashboard."
				] })
			]
		})
	},
	{
		id: "fulfilment",
		heading: "Fulfilment expectations",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Orders move through Order Placed, Confirmed, Processing, Shipped, Out for Delivery and Delivered. You are expected to:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: bullets,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Confirm new orders within 24 hours." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Hand over to the courier within 2 business days of confirming." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Keep the status current — shoppers track against it, and so does buyer protection." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Accept returns that meet the ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/returns",
							className: "font-semibold text-brand hover:underline",
							children: "Returns Policy"
						}),
						" without arguing the toss."
					] })
				]
			})]
		})
	},
	{
		id: "performance",
		heading: "Performance and suspension",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Stores are reviewed on the things shoppers feel:" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Seller-initiated cancellation rate — the main signal of stock hygiene." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "On-time dispatch rate." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Return rate for \"not as described\"." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Shopper rating and review content." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sustained problems lead to reduced visibility, then suspension of listings, then removal of the verified badge. Counterfeits, fake reviews or falsified pricing are grounds for immediate removal with payouts held pending investigation." })
			]
		})
	},
	{
		id: "data",
		heading: "Shopper data you receive",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: prose,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "You get only what you need to fulfil the order. The vendor dashboard shows the order's destination and contents, not a shopper's full profile or purchase history elsewhere on MarketHub. Use it for fulfilment and nothing else: no marketing lists, no retargeting, no passing it on. Shopper data stays inside the order it came from." })
		})
	}
];
function SellerPolicyPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegalPage, {
		title: "Seller Policy",
		summary: "What MarketHub expects from sellers, and what sellers get in return: verification, listing standards, 8% commission and protected weekly payouts.",
		updated: "5 October 2026",
		current: "/seller-policy",
		sections
	});
}
//#endregion
export { SellerPolicyPage as component };
