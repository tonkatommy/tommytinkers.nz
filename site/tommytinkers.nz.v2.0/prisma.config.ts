import { defineConfig } from "prisma/config";

// DATABASE_URL is only needed by commands that talk to the database
// (migrate, studio). `prisma generate` runs during install and the Docker
// build with no database around, so we read the variable without requiring it.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
