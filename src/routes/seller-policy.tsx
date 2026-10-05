import { createFileRoute, Link } from "@tanstack/react-router";

import { bullets, LegalPage, prose, type LegalSection } from "@/components/mh/LegalPage";

export const Route = createFileRoute("/seller-policy")({
  head: () => ({
    meta: [
      { title: "Seller Policy — MarketHub" },
      { name: "description", content: "Verification, listing standards, commission, payouts and performance expectations for MarketHub sellers." },
      { property: "og:title", content: "Seller Policy — MarketHub" },
    ],
  }),
  component: SellerPolicyPage,
});

const sections: LegalSection[] = [
  {
    id: "verification",
    heading: "Getting verified",
    body: (
      <div className={prose}>
        <p>
          Every seller is checked before their listings go live. Apply at{" "}
          <Link to="/vendor-register" className="font-semibold text-brand hover:underline">Become a vendor</Link>{" "}
          with your registered business name, GSTIN and PAN. Until the check completes your store
          appears in the public directory as <strong>Pending Verification</strong> and cannot
          publish products.
        </p>
        <ul className={bullets}>
          <li>GSTIN and PAN are validated against the registries, not just checked for format.</li>
          <li>A short verification call confirms the business details.</li>
          <li>Most reviews finish within two business days.</li>
          <li>Only verified sellers appear in the shopper-facing seller filter.</li>
        </ul>
        <p>
          <strong>Payout details are collected separately</strong>, over a verified channel, after
          approval. The application form never asks for a bank account, and bank details are never
          readable from the vendor dashboard.
        </p>
      </div>
    ),
  },
  {
    id: "listings",
    heading: "Listing standards",
    body: (
      <div className={prose}>
        <p>Your listing is what a shopper is deciding from, so it has to be true:</p>
        <ul className={bullets}>
          <li>Describe the actual item, with photographs of the actual item.</li>
          <li>Specifications must be accurate. Battery life, materials and dimensions get checked against reality when disputes arise.</li>
          <li>Keep stock counts current. Overselling and then cancelling is the fastest way to lose your badge.</li>
          <li>No counterfeits, replicas, or goods you are not authorised to resell.</li>
          <li>No prohibited items: weapons, controlled substances, or anything requiring a licence you do not hold.</li>
          <li>
            Any <strong>struck-through original price must be a price you genuinely charged</strong>.
            Inflating it to manufacture a discount is prohibited.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "commission",
    heading: "Commission and fees",
    body: (
      <div className={prose}>
        <ul className={bullets}>
          <li><strong>No listing fees.</strong> Publishing products costs nothing.</li>
          <li><strong>8% commission</strong> on the order value of delivered orders.</li>
          <li>No commission on cancelled orders or on anything returned within the 7-day window.</li>
          <li>No monthly subscription, and no charge for the verification process.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "payouts",
    heading: "How payouts work",
    body: (
      <div className={prose}>
        <p>
          Shoppers pay MarketHub at checkout, not you directly. MarketHub holds the money until the
          buyer's return window closes, which is what backs buyer protection:
        </p>
        <ul className={bullets}>
          <li>The order is delivered and the <strong>7-day return window</strong> starts.</li>
          <li>When the window closes with no return, the order value minus 8% commission is released.</li>
          <li>Payouts batch weekly to the bank account verified during onboarding.</li>
          <li>Cash-on-delivery orders settle once the courier remits the collection.</li>
        </ul>
        <p>
          Your current position is visible under{" "}
          <Link to="/vendor" search={{ view: "payouts" }} className="font-semibold text-brand hover:underline">Payouts</Link>{" "}
          in the vendor dashboard.
        </p>
      </div>
    ),
  },
  {
    id: "fulfilment",
    heading: "Fulfilment expectations",
    body: (
      <div className={prose}>
        <p>
          Orders move through Order Placed, Confirmed, Processing, Shipped, Out for Delivery and
          Delivered. You are expected to:
        </p>
        <ul className={bullets}>
          <li>Confirm new orders within 24 hours.</li>
          <li>Hand over to the courier within 2 business days of confirming.</li>
          <li>Keep the status current — shoppers track against it, and so does buyer protection.</li>
          <li>Accept returns that meet the <Link to="/returns" className="font-semibold text-brand hover:underline">Returns Policy</Link> without arguing the toss.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "performance",
    heading: "Performance and suspension",
    body: (
      <div className={prose}>
        <p>Stores are reviewed on the things shoppers feel:</p>
        <ul className={bullets}>
          <li>Seller-initiated cancellation rate — the main signal of stock hygiene.</li>
          <li>On-time dispatch rate.</li>
          <li>Return rate for "not as described".</li>
          <li>Shopper rating and review content.</li>
        </ul>
        <p>
          Sustained problems lead to reduced visibility, then suspension of listings, then removal of
          the verified badge. Counterfeits, fake reviews or falsified pricing are grounds for
          immediate removal with payouts held pending investigation.
        </p>
      </div>
    ),
  },
  {
    id: "data",
    heading: "Shopper data you receive",
    body: (
      <div className={prose}>
        <p>
          You get only what you need to fulfil the order. The vendor dashboard shows the order's
          destination and contents, not a shopper's full profile or purchase history elsewhere on
          MarketHub. Use it for fulfilment and nothing else: no marketing lists, no retargeting, no
          passing it on. Shopper data stays inside the order it came from.
        </p>
      </div>
    ),
  },
];

function SellerPolicyPage() {
  return (
    <LegalPage
      title="Seller Policy"
      summary="What MarketHub expects from sellers, and what sellers get in return: verification, listing standards, 8% commission and protected weekly payouts."
      updated="5 October 2026"
      current="/seller-policy"
      sections={sections}
    />
  );
}
