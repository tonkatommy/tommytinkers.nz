"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/safe-redirect";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { getSession } from "@/server/session";
import { type SignInStatus, getSignInStatus } from "@/server/sign-in-throttle";

/**
 * How sign-in stands for an email address: paused or not, and tries left.
 * Safe to answer for anyone, because it is counted per address typed and
 * says nothing about whether an account exists.
 */
export async function signInStatusAction(email: string): Promise<SignInStatus> {
  const parsed = z.string().trim().max(320).safeParse(email);
  if (!parsed.success) return { locked: false, secondsLeft: 0, triesLeft: 5 };
  return getSignInStatus(parsed.data);
}

/** Signs out this device and goes home. Used by the account menus. */
export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

const welcomeSchema = z.object({
  name: z.string().trim().min(1, "Pick a name other members will see.").max(40, "Keep it to 40 characters."),
  // A ticked checkbox arrives as "on"; unticked doesn't arrive at all.
  agree: z.literal("on", { error: "Tick this to carry on. Shed accounts are for people 13 and over." }),
  next: z.string().optional(),
});

export type WelcomeState = { errors?: { name?: string; agree?: string }; name?: string };

/**
 * The last step for an account made with Google: choose a display name and
 * tick the 13-or-older box. Until this is done, requireUser() sends the
 * account back here.
 */
export async function completeWelcomeAction(_previous: WelcomeState, formData: FormData): Promise<WelcomeState> {
  // Server actions are public endpoints, so check the session here too.
  const session = await getSession();
  if (!session) redirect("/login");

  const parsed = welcomeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fields = z.flattenError(parsed.error).fieldErrors;
    return {
      errors: { name: fields.name?.[0], agree: fields.agree?.[0] },
      name: String(formData.get("name") ?? ""),
    };
  }

  await db.user.update({
    where: { id: session.user.id },
    // The consent time is the server's clock at the moment they agreed.
    data: { name: parsed.data.name, ageConfirmedAt: new Date() },
  });

  redirect(safeNextPath(parsed.data.next));
}
