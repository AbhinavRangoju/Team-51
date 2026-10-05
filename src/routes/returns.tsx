import { createFileRoute, Link } from "@tanstack/react-router";

import { bullets, LegalPage, prose, type LegalSection } from "@/components/mh/LegalPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns Policy — MarketHub" },
      { name: "description", content: "How MarketHub's 7-day returns, refunds, replacements and cancellations work." },
      { property: "og:title", content: "Returns Policy — MarketHub" },
    ],
  }),
  component: ReturnsPage,
});

const sections: LegalSection[] = [
  {
    id: "window",
    heading: "The 7-day window",
    body: (
      <div className={prose}>
        <p>
          Every MarketHub order carries <strong>7 days of returns from the delivery date</strong>,
          on every item, from every verified seller. You do not need to give a reason.
        </p>
        <p>
          Start a return from{" "}
          <Link to="/orders" className="font-semibold text-brand hover:underline">My orders</Link>{" "}
          once the order shows as Delivered. Pickup is arranged from the delivery address, and return
          shipping is free.
        </p>
      </div>
    ),
  },
  {
    id: "condition",
    heading: "What makes an item returnable",
    body: (
      <div className={prose}>
        <p>Send it back the way it arrived:</p>
        <ul className={bullets}>
          <li>Unused and undamaged, with tags attached where they came with tags.</li>
          <li>In the original packaging, with any accessories, manuals and free gifts included.</li>
          <li>For electronics, with the serial number intact and matching the one delivered.</li>
        </ul>
        <p>A few things cannot come back for hygiene or safety reasons:</p>
        <ul className={bullets}>
          <li>Opened skincare, cosmetics and personal care items.</li>
          <li>Opened food and grocery items, including coffee and perishables.</li>
          <li>Innerwear and anything made to order or personalised.</li>
        </ul>
        <p>
          If one of these arrives <strong>damaged, wrong or faulty</strong>, the exclusion does not
          apply. Report it within 48 hours of delivery and it will be replaced or refunded.
        </p>
      </div>
    ),
  },
  {
    id: "refunds",
    heading: "Refunds and timelines",
    body: (
      <div className={prose}>
        <p>
          Refunds are issued once the returned item reaches the seller and passes a quality check,
          usually within 2 business days of arrival. The money goes back to the original payment
          method:
        </p>
        <ul className={bullets}>
          <li><strong>Card</strong> — 5 to 7 business days, depending on your bank.</li>
          <li><strong>UPI</strong> — 1 to 3 business days.</li>
          <li><strong>MarketHub Wallet</strong> — immediately on approval.</li>
          <li><strong>Cash on delivery</strong> — to a bank account you nominate at the time of the return.</li>
        </ul>
        <p>
          Delivery charges are refunded when the return is our fault or the seller's — wrong,
          damaged or faulty goods. For a change of mind, the ₹79 delivery charge on sub-₹999 orders
          and any ₹149 express fee are not refunded, since the delivery was performed as ordered.
        </p>
      </div>
    ),
  },
  {
    id: "replacements",
    heading: "Replacements and exchanges",
    body: (
      <div className={prose}>
        <p>
          Prefer a replacement to a refund? If the seller has the item in stock, a replacement ships
          as soon as the return is collected. Size and colour exchanges work the same way, subject to
          availability. Where the seller cannot restock, the return becomes a refund automatically
          and you are told why.
        </p>
      </div>
    ),
  },
  {
    id: "cancellations",
    heading: "Cancelling before it ships",
    body: (
      <div className={prose}>
        <p>
          You can cancel an order yourself while it is still in <strong>Order Placed</strong>,{" "}
          <strong>Confirmed</strong> or <strong>Processing</strong>, straight from{" "}
          <Link to="/orders" className="font-semibold text-brand hover:underline">My orders</Link>.
          A cancellation is refunded in full, including delivery charges, because nothing has
          shipped.
        </p>
        <p>
          Once an order reaches <strong>Shipped</strong> the cancel option disappears, and a return
          after delivery is the right route.
        </p>
      </div>
    ),
  },
  {
    id: "protection",
    heading: "Buyer protection",
    body: (
      <div className={prose}>
        <p>
          Buyer protection covers every order. If an item never arrives, arrives broken, or is
          materially different from its listing, MarketHub steps in: you get a refund or replacement
          regardless of how the seller responds. MarketHub holds the payment until the return window
          closes, which is what makes that possible — see the{" "}
          <Link to="/seller-policy" className="font-semibold text-brand hover:underline">Seller Policy</Link>{" "}
          for the settlement side of it.
        </p>
      </div>
    ),
  },
];

function ReturnsPage() {
  return (
    <LegalPage
      title="Returns Policy"
      summary="Seven days to change your mind on everything, with free return pickup and refunds to your original payment method."
      updated="5 October 2026"
      current="/returns"
      sections={sections}
    />
  );
}
