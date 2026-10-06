import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { LegalPage, bullets, prose } from "./LegalPage-Bxwl6sC3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/returns-g9V7ynOW.js
var import_jsx_runtime = require_jsx_runtime();
var sections = [
	{
		id: "window",
		heading: "The 7-day window",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Every MarketHub order carries ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "7 days of returns from the delivery date" }),
				", on every item, from every verified seller. You do not need to give a reason."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Start a return from",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/orders",
					className: "font-semibold text-brand hover:underline",
					children: "My orders"
				}),
				" ",
				"once the order shows as Delivered. Pickup is arranged from the delivery address, and return shipping is free."
			] })]
		})
	},
	{
		id: "condition",
		heading: "What makes an item returnable",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Send it back the way it arrived:" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Unused and undamaged, with tags attached where they came with tags." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "In the original packaging, with any accessories, manuals and free gifts included." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "For electronics, with the serial number intact and matching the one delivered." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A few things cannot come back for hygiene or safety reasons:" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Opened skincare, cosmetics and personal care items." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Opened food and grocery items, including coffee and perishables." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Innerwear and anything made to order or personalised." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"If one of these arrives ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "damaged, wrong or faulty" }),
					", the exclusion does not apply. Report it within 48 hours of delivery and it will be replaced or refunded."
				] })
			]
		})
	},
	{
		id: "refunds",
		heading: "Refunds and timelines",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Refunds are issued once the returned item reaches the seller and passes a quality check, usually within 2 business days of arrival. The money goes back to the original payment method:" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Card" }), " — 5 to 7 business days, depending on your bank."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "UPI" }), " — 1 to 3 business days."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "MarketHub Wallet" }), " — immediately on approval."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Cash on delivery" }), " — to a bank account you nominate at the time of the return."] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Delivery charges are refunded when the return is our fault or the seller's — wrong, damaged or faulty goods. For a change of mind, the ₹79 delivery charge on sub-₹999 orders and any ₹149 express fee are not refunded, since the delivery was performed as ordered." })
			]
		})
	},
	{
		id: "replacements",
		heading: "Replacements and exchanges",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: prose,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Prefer a replacement to a refund? If the seller has the item in stock, a replacement ships as soon as the return is collected. Size and colour exchanges work the same way, subject to availability. Where the seller cannot restock, the return becomes a refund automatically and you are told why." })
		})
	},
	{
		id: "cancellations",
		heading: "Cancelling before it ships",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"You can cancel an order yourself while it is still in ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Order Placed" }),
				",",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Confirmed" }),
				" or ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Processing" }),
				", straight from",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/orders",
					className: "font-semibold text-brand hover:underline",
					children: "My orders"
				}),
				". A cancellation is refunded in full, including delivery charges, because nothing has shipped."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Once an order reaches ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Shipped" }),
				" the cancel option disappears, and a return after delivery is the right route."
			] })]
		})
	},
	{
		id: "protection",
		heading: "Buyer protection",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: prose,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Buyer protection covers every order. If an item never arrives, arrives broken, or is materially different from its listing, MarketHub steps in: you get a refund or replacement regardless of how the seller responds. MarketHub holds the payment until the return window closes, which is what makes that possible — see the",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/seller-policy",
					className: "font-semibold text-brand hover:underline",
					children: "Seller Policy"
				}),
				" ",
				"for the settlement side of it."
			] })
		})
	}
];
function ReturnsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegalPage, {
		title: "Returns Policy",
		summary: "Seven days to change your mind on everything, with free return pickup and refunds to your original payment method.",
		updated: "5 October 2026",
		current: "/returns",
		sections
	});
}
//#endregion
export { ReturnsPage as component };
