import { createFileRoute, Link } from "@tanstack/react-router";

import { bullets, LegalPage, prose, type LegalSection } from "@/components/mh/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MarketHub" },
      { name: "description", content: "What MarketHub stores, where it is stored, and what it is never used for." },
      { property: "og:title", content: "Privacy Policy — MarketHub" },
    ],
  }),
  component: PrivacyPage,
});

/**
 * Describes what the application genuinely does rather than boilerplate.
 *
 * Everything claimed here is checkable against the code: the localStorage key
 * in src/lib/store.tsx, the Gemini request in src/lib/hubby/gemini.ts, and the
 * grounding snapshot in src/lib/hubby/catalog.ts that deliberately excludes
 * seller contact details.
 */
const sections: LegalSection[] = [
  {
    id: "what-we-store",
    heading: "What we store, and where",
    body: (
      <div className={prose}>
        <p>
          MarketHub keeps your data in <strong>your own browser</strong>, under a single local storage
          key. There is no account database and no server-side profile. That covers:
        </p>
        <ul className={bullets}>
          <li><strong>Session</strong> — the name, email and role you signed in with.</li>
          <li><strong>Delivery addresses</strong> — recipient name, phone, street address, city and PIN code.</li>
          <li><strong>Cart and wishlist</strong> — the products you have added or saved.</li>
          <li><strong>Orders</strong> — what you ordered, the total, and the delivery address on the order.</li>
          <li><strong>Read notifications</strong> — which updates you have already seen.</li>
        </ul>
        <p>
          Because this lives in your browser, clearing site data removes all of it, and anyone with
          access to your device and browser profile can read it. Signing out clears your session and
          your saved addresses.
        </p>
      </div>
    ),
  },
  {
    id: "no-tracking",
    heading: "What we do not do",
    body: (
      <ul className={bullets}>
        <li>No analytics, advertising or third-party tracking scripts.</li>
        <li>No cookies for profiling. The app does not set a tracking cookie at all.</li>
        <li>No selling, renting or sharing of personal data — there is no recipient to share it with.</li>
        <li>No marketing email or SMS. The notifications page is generated from your own activity in this browser.</li>
      </ul>
    ),
  },
  {
    id: "assistant",
    heading: "The shopping assistant",
    body: (
      <div className={prose}>
        <p>
          Hubby, the in-app assistant, sends your typed question to Google's Gemini API to generate a
          reply. Two things are worth knowing:
        </p>
        <ul className={bullets}>
          <li>
            <strong>What is sent:</strong> your message, the recent messages in that chat, and a
            snapshot of the public product catalogue. Nothing else — not your session, not your
            cart, not your orders, not your addresses.
          </li>
          <li>
            <strong>What is never sent:</strong> seller contact details are deliberately excluded
            from the catalogue snapshot, so they cannot be disclosed by the assistant under any
            prompt.
          </li>
        </ul>
        <p>
          Treat the chat box like any third-party service: do not type anything into it you would
          not want leaving the page. Google's handling of API requests is governed by their own
          terms, not ours.
        </p>
      </div>
    ),
  },
  {
    id: "sellers",
    heading: "Seller information",
    body: (
      <div className={prose}>
        <p>
          Seller pages show business-level information only: store name, city, year established,
          rating and listings. Owner names and seller email addresses are held in the catalogue data
          but are <strong>never rendered on any public page</strong> and are never included in
          assistant prompts, because publishing them would create a scrapeable list for targeted
          phishing of the marketplace's own sellers.
        </p>
      </div>
    ),
  },
  {
    id: "your-control",
    heading: "Your control over your data",
    body: (
      <div className={prose}>
        <p>
          You can view and edit everything from{" "}
          <Link to="/account" className="font-semibold text-brand hover:underline">your account</Link>:
          change your profile, add or remove addresses, clear your wishlist. To erase everything at
          once, clear site data for this domain in your browser settings — no request to us is
          needed, because we hold nothing to delete.
        </p>
      </div>
    ),
  },
  {
    id: "honest-limits",
    heading: "Honest limits of this build",
    body: (
      <div className={prose}>
        <p>
          Sign-in does not verify a password and there is no server-side session, so the role gates
          on the account and vendor pages are navigation conveniences rather than access controls.
          Payment forms do not contact a payment processor and no card details are transmitted or
          retained. A production deployment would need real authentication, server-side
          authorisation and a PCI-compliant payment integration before handling anyone's actual
          data.
        </p>
      </div>
    ),
  },
];

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary="MarketHub stores very little, and what it does store stays in your browser. This page explains exactly what that means."
      updated="5 October 2026"
      current="/privacy"
      sections={sections}
    />
  );
}
