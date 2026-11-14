import { connection } from "next/server";
import { db } from "@/server/db";

// Docker's healthcheck calls this. It must run on every request, never from
// a cache, otherwise a dead database would still report healthy.
export async function GET() {
  // connection() tells Next "wait for a real request". Without it, Cache
  // Components could run this once at build time and serve that answer.
  await connection();
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch {
    // Don't echo the error: it can contain connection details.
    return Response.json({ status: "db_unreachable" }, { status: 503 });
  }
}
