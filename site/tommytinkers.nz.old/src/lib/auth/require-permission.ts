import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import type { PermissionKey } from "./permissions";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requirePermission(permission: PermissionKey) {
  const session = await requireSession();
  const perms = session.user.permissions ?? [];
  if (!perms.includes(permission)) redirect("/");
  return session;
}

export async function requirePermissionApi(permission: PermissionKey) {
  const session = await auth();
  const perms = session?.user?.permissions ?? [];
  if (!session?.user || !perms.includes(permission)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true as const, session };
}
