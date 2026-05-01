import path from "node:path";
import { defineConfig } from "vitest/config";

/** Inline PostCSS avoids loading Tailwind's LightningCSS native bindings during Vitest. */
export default defineConfig({
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
