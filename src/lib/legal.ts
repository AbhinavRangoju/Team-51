/**
 * The policy documents, in the order they appear in the footer.
 *
 * Lives in lib rather than beside the LegalPage component because StoreLayout
 * needs it for the footer, and LegalPage renders inside StoreLayout — importing
 * it from there would make the two modules circular.
 */
export const LEGAL_PAGES = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Use" },
  { to: "/returns", label: "Returns Policy" },
  { to: "/seller-policy", label: "Seller Policy" },
] as const;
