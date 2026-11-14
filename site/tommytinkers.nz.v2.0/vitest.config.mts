import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests: fast, no browser, no database. They live next to the code
// they test as *.test.ts. Browser tests are Playwright's job (see e2e/).
export default defineConfig({
  resolve: {
    // Same "@/..." shortcut the app uses (tsconfig.json "paths").
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // The real "server-only" throws outside a Next server build. This
      // empty stand-in lets a server file with no database (email.ts) be
      // unit tested; see test/server-only-stub.ts.
      "server-only": fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    // Database tests have their own config and command (pnpm test:db).
    exclude: ["src/**/*.db.test.ts"],
  },
});
