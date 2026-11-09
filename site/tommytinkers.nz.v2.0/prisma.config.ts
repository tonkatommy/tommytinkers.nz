import { defineConfig } from "prisma/config";

// Prisma 7 no longer reads .env by itself, and the db:* scripts run Prisma
// directly (not through Next, which would load it). Node's built-in loader
// reads .env when it exists; in Docker and CI there is no .env, so a missing
// file is fine and the real environment is used instead.
try {
  process.loadEnvFile();
} catch {
  // No .env file: nothing to load.
}

// DATABASE_URL is only needed by commands that talk to the database
// (migrate, studio). `prisma generate` runs during install and the Docker
// build with no database around, so we read the variable without requiring it.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    // Only CI sets this. `prisma migrate diff --from-migrations` replays every
    // migration into this throwaway database to compare it with schema.prisma.
    // It must never point at a real database: Prisma wipes it on each run.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
