import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  // Mirrors the `@/*` -> `./src/*` mapping declared in tsconfig.json. Declared
  // explicitly rather than via resolve.tsconfigPaths so the dev server, the
  // nitro build, and vitest all resolve it identically.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart({ srcDirectory: "src" }),
    viteReact(),
    nitro(),
  ],
});
