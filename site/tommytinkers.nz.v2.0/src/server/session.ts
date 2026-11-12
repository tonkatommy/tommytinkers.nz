// Who is signed in, and what they are allowed to do.
//
// This is the real security gate. src/proxy.ts only checks that a session
// cookie exists, which is quick but proves nothing. Every data-layer
// function that needs a signed-in person or a permission calls one of the
// require*() functions here, because server actions are public POST
// endpoints: a page hiding a button stops nobody.
import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { type Permission, hasPermission } from "@/lib/permissions";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

/**
 * The current session, or null. Wrapped in React's cache() so that the nav,
 * the page and a data function asking in the same request share one lookup.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  ageConfirmedAt: Date | null;
  roleName: string | null;
  permissions: string[];
};

/**
 * The signed-in user with their role's permissions, or null.
 * Permissions are read from the database on every request (not stored in the
 * cookie), so changing someone's role takes effect on their next click.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session) return null;

  const row = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      ageConfirmedAt: true,
      role: { select: { name: true, permissions: true } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    ageConfirmedAt: row.ageConfirmedAt,
    roleName: row.role?.name ?? null,
    permissions: row.role?.permissions ?? [],
  };
});

/**
 * A signed-in member who has finished sign-up, or a redirect.
 * `returnTo` is where sign-in should send them back to afterwards.
 */
export async function requireUser(returnTo = "/account"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  // Shed accounts are 13 and over. An account made through Google hasn't
  // seen the tick box yet, so it finishes that step before anything else.
  if (!user.ageConfirmedAt) redirect("/welcome");
  return user;
}

/**
 * A signed-in member whose role has this permission.
 * Anyone else gets "page not found" rather than "not allowed", so the admin
 * area doesn't advertise itself.
 */
export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (!hasPermission(user.permissions, permission)) notFound();
  return user;
}
