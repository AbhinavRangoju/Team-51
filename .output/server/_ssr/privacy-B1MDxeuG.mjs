import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { LegalPage, bullets, prose } from "./LegalPage-Bxwl6sC3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privacy-B1MDxeuG.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Describes what the application genuinely does rather than boilerplate.
*
* Everything claimed here is checkable against the code: the localStorage key
* in src/lib/store.tsx, the Gemini request in src/lib/hubby/gemini.ts, and the
* grounding snapshot in src/lib/hubby/catalog.ts that deliberately excludes
* seller contact details.
*/
var sections = [
	{
		id: "what-we-store",
		heading: "What we store, and where",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"MarketHub keeps your data in ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "your own browser" }),
					", under a single local storage key. There is no account database and no server-side profile. That covers:"
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Session" }), " — the name, email and role you signed in with."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Delivery addresses" }), " — recipient name, phone, street address, city and PIN code."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Cart and wishlist" }), " — the products you have added or saved."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Orders" }), " — what you ordered, the total, and the delivery address on the order."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Read notifications" }), " — which updates you have already seen."] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Because this lives in your browser, clearing site data removes all of it, and anyone with access to your device and browser profile can read it. Signing out clears your session and your saved addresses." })
			]
		})
	},
	{
		id: "no-tracking",
		heading: "What we do not do",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: bullets,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No analytics, advertising or third-party tracking scripts." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No cookies for profiling. The app does not set a tracking cookie at all." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No selling, renting or sharing of personal data — there is no recipient to share it with." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No marketing email or SMS. The notifications page is generated from your own activity in this browser." })
			]
		})
	},
	{
		id: "assistant",
		heading: "The shopping assistant",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: prose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Hubby, the in-app assistant, sends your typed question to Google's Gemini API to generate a reply. Two things are worth knowing:" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: bullets,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "What is sent:" }), " your message, the recent messages in that chat, and a snapshot of the public product catalogue. Nothing else — not your session, not your cart, not your orders, not your addresses."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "What is never sent:" }), " seller contact details are deliberately excluded from the catalogue snapshot, so they cannot be disclosed by the assistant under any prompt."] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Treat the chat box like any third-party service: do not type anything into it you would not want leaving the page. Google's handling of API requests is governed by their own terms, not ours." })
			]
		})
	},
	{
		id: "sellers",
		heading: "Seller information",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: prose,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Seller pages show business-level information only: store name, city, year established, rating and listings. Owner names and seller email addresses are held in the catalogue data but are ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "never rendered on any public page" }),
				" and are never included in assistant prompts, because publishing them would create a scrapeable list for targeted phishing of the marketplace's own sellers."
			] })
		})
	},
	{
		id: "your-control",
		heading: "Your control over your data",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: prose,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"You can view and edit everything from",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/account",
					className: "font-semibold text-brand hover:underline",
					children: "your account"
				}),
				": change your profile, add or remove addresses, clear your wishlist. To erase everything at once, clear site data for this domain in your browser settings — no request to us is needed, because we hold nothing to delete."
			] })
		})
	},
	{
		id: "honest-limits",
		heading: "Honest limits of this build",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: prose,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sign-in does not verify a password and there is no server-side session, so the role gates on the account and vendor pages are navigation conveniences rather than access controls. Payment forms do not contact a payment processor and no card details are transmitted or retained. A production deployment would need real authentication, server-side authorisation and a PCI-compliant payment integration before handling anyone's actual data." })
		})
	}
];
function PrivacyPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegalPage, {
		title: "Privacy Policy",
		summary: "MarketHub stores very little, and what it does store stays in your browser. This page explains exactly what that means.",
		updated: "5 October 2026",
		current: "/privacy",
		sections
	});
}
//#endregion
export { PrivacyPage as component };
