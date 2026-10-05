import { createFileRoute, Link } from "@tanstack/react-router";

import { bullets, LegalPage, prose, type LegalSection } from "@/components/mh/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — MarketHub" },
      { name: "description", content: "The rules for using MarketHub as a shopper: accounts, orders, pricing, payments and acceptable use." },
      { property: "og:title", content: "Terms of Use — MarketHub" },
    ],
  }),
  component: TermsPage,
});

const sections: LegalSection[] = [
  {
    id: "marketplace",
    heading: "MarketHub is a marketplace",
    body: (
      <div className={prose}>
        <p>
          MarketHub connects shoppers with independent sellers. Each product is listed, priced,
          packed and shipped by the seller named on the listing. MarketHub verifies sellers before
          their listings go live and handles payment, but it is{" "}
          <strong>not the seller of record</strong> for the items you buy.
        </p>
        <p>
          That means product descriptions, specifications and stock levels come from the seller.
          MarketHub reviews listings for accuracy but cannot guarantee every detail.
        </p>
      </div>
    ),
  },
  {
    id: "accounts",
    heading: "Your account",
    body: (
      <ul className={bullets}>
        <li>One person, one account. Keep your sign-in details to yourself.</li>
        <li>The details on your account are used for order confirmations and delivery, so keep them current.</li>
        <li>Shopper accounts cannot list products. Selling requires an application at <Link to="/vendor-register" className="font-semibold text-brand hover:underline">Become a vendor</Link> and passing verification.</li>
        <li>
          <strong>In this build</strong> sign-in does not check a password and your session lives
          only in your browser, so it protects nothing. Do not reuse a real password here.
        </li>
      </ul>
    ),
  },
  {
    id: "pricing",
    heading: "Prices, charges and taxes",
    body: (
      <div className={prose}>
        <p>These are the actual figures the application uses:</p>
        <ul className={bullets}>
          <li>All prices are in <strong>Indian Rupees</strong> and product page prices are inclusive of all taxes.</li>
          <li><strong>Delivery is free</strong> on cart subtotals of ₹999 or more. Below that, delivery is ₹79.</li>
          <li><strong>GST of 5%</strong> is applied to the cart subtotal and shown as a separate line.</li>
          <li>Standard delivery is free and takes 3 to 5 business days. <strong>Express delivery is ₹149</strong> and takes 1 to 2 business days, charged on top of the cart total.</li>
          <li>Deal prices during a campaign such as Festive Week are time-limited and can change daily.</li>
        </ul>
        <p>
          If a listing shows an obviously wrong price, MarketHub may cancel the affected order and
          refund it in full rather than fulfil it.
        </p>
      </div>
    ),
  },
  {
    id: "orders",
    heading: "Orders and payment",
    body: (
      <div className={prose}>
        <p>
          Placing an order is an offer to buy. The order is accepted when the seller confirms it,
          which is the point the contract forms. You can pay by card, UPI, MarketHub Wallet, or cash
          on delivery; cash orders stay in a pending payment state until the courier collects.
        </p>
        <p>
          You can cancel an order yourself while it is still in <strong>Order Placed</strong>,{" "}
          <strong>Confirmed</strong> or <strong>Processing</strong>. Once it ships, use the{" "}
          <Link to="/returns" className="font-semibold text-brand hover:underline">Returns Policy</Link>{" "}
          instead.
        </p>
        <p>
          <strong>In this build</strong> no payment processor is contacted. Nothing is charged and no
          card data is transmitted or stored.
        </p>
      </div>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: (
      <div className={prose}>
        <p>Please do not:</p>
        <ul className={bullets}>
          <li>Scrape the catalogue, seller directory or any page in bulk.</li>
          <li>Attempt to reach another shopper's or seller's data, or to escalate your own account's permissions.</li>
          <li>Probe, overload or interfere with the service, including automating the shopping assistant to exhaust its quota.</li>
          <li>Post reviews you did not earn through a real purchase, or impersonate a seller.</li>
        </ul>
        <p>
          Found a genuine security flaw? Report it rather than exploiting it. Good-faith reports are
          welcome.
        </p>
      </div>
    ),
  },
  {
    id: "assistant",
    heading: "The shopping assistant",
    body: (
      <div className={prose}>
        <p>
          Hubby suggests products from the live catalogue using an AI model. It is a shopping aid,
          not advice. It can be wrong, and the product page is always the authority on price,
          specification and availability. Hubby cannot place, change or cancel orders, and it has no
          access to your account.
        </p>
      </div>
    ),
  },
  {
    id: "liability",
    heading: "Liability",
    body: (
      <div className={prose}>
        <p>
          MarketHub provides the marketplace as-is. For disputes about an item itself — condition,
          description or fitness for purpose — the seller is responsible, and MarketHub's buyer
          protection is the route to a resolution. MarketHub's responsibility is limited to the value
          of the affected order.
        </p>
        <p>
          Since this build is a demonstration and processes no real transactions, nothing on this
          page creates an enforceable obligation on anyone.
        </p>
      </div>
    ),
  },
];

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      summary="The rules for shopping on MarketHub, written to match what the application actually does."
      updated="5 October 2026"
      current="/terms"
      sections={sections}
    />
  );
}
