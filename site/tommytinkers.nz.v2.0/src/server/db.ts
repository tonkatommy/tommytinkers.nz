// "server-only" makes the build fail if a client component ever imports this
// file, so the database client (and DATABASE_URL) can never leak to the browser.
import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// In dev, Next reloads modules on every edit. Without this cache each reload
// would open a new connection pool and Postgres would run out of connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
