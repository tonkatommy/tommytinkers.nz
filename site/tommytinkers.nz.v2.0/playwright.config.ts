import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// End-to-end tests: a real browser against the real production build and a
// real (seeded) database. Before running: `pnpm build` and `pnpm db:seed`.
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // A stray test.only would silently skip everything else in CI.
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    // Record a trace only when a test had to be retried, to debug flakes.
    trace: "on-first-retry",
  },
  // The two sizes the design is drawn at.
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  // Playwright starts the site itself and waits until it answers.
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: !isCI,
    timeout: 60_000,
    // Test-only settings. None of these are real secrets.
    env: {
      BETTER_AUTH_SECRET: "e2e-only-secret-not-used-anywhere-real",
      BETTER_AUTH_URL: "http://localhost:3000",
      // Write emails to a folder instead of sending them, so tests can
      // follow the links (see e2e/helpers.ts and src/server/email.ts).
      EMAIL_TO_FILE: "1",
      // Absolute, because the standalone server changes its working folder.
      EMAIL_FILE_DIR: path.join(process.cwd(), ".tmp", "e2e-emails"),
    },
  },
});
