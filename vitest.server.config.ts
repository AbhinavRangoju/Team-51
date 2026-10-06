import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Server-only tests must run under Node, not jsdom. The storefront config uses
 * jsdom for route rendering; loading node:fs/node:crypto through that browser
 * transform in a linked worktree externalizes the built-ins. Keep backend tests
 * in the runtime they are actually written for.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: [
      "src/test/backend.test.ts",
      "src/test/products.test.ts",
      "src/test/cart.test.ts",
      "src/test/addresses.test.ts",
      "src/test/vendor-registration.test.ts",
    ],
  },
});
