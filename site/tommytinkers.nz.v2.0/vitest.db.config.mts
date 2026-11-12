import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Database tests: real queries against a real Postgres (DATABASE_URL), for
// rules that live in the data layer. Run with `pnpm test:db` after
// `pnpm db:deploy`. They only touch rows they create themselves.
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": here("./src"),
      "server-only": here("./test/server-only-stub.ts"),
    },
  },
  test: {
    include: ["src/**/*.db.test.ts"],
    // One file at a time: these tests share one database.
    fileParallelism: false,
  },
});
