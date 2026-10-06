import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts so the app build never has to load vitest,
// and so the test run skips the Start/nitro server plugins it does not need.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["**/*.live.test.ts"],
  },
});
