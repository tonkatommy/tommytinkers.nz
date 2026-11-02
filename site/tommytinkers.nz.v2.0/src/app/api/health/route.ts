import { db } from "@/server/db";

// Docker's healthcheck calls this. It must run on every request (never cached),
// otherwise a dead database would still report healthy.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch {
    // Don't echo the error: it can contain connection details.
    return Response.json({ status: "db_unreachable" }, { status: 503 });
  }
}
