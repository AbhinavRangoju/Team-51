import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/** Live Neon tests only — loads .env via `npm run test:db`, no setupFiles wipe. */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["src/test/**/*.live.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
