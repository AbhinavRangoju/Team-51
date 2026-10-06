import { createFileRoute } from "@tanstack/react-router";

import { OnboardingContainer } from "@/components/onboarding/Onboarding";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — MarketHub" },
      { name: "description", content: "Set up MarketHub for shopping or selling." },
      { property: "og:title", content: "Welcome — MarketHub" },
      { property: "og:description", content: "Set up MarketHub for shopping or selling." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingContainer,
});
