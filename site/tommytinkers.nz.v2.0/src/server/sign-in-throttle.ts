// Stores the sign-in lockout state (see src/lib/sign-in-throttle.ts for the
// rule itself). Keyed by the email address typed, whether or not an account
// exists for it, so a locked screen never reveals who has an account.
import "server-only";
import {
  NO_ATTEMPTS,
  type ThrottleState,
  countAttempt,
  isLocked,
  secondsUntilUnlocked,
  triesLeft,
} from "@/lib/sign-in-throttle";
import { db } from "@/server/db";

function normalise(email: string): string {
  return email.trim().toLowerCase();
}

async function readState(email: string): Promise<ThrottleState> {
  const row = await db.signInThrottle.findUnique({ where: { email } });
  return row ?? NO_ATTEMPTS;
}

export type SignInStatus = { locked: boolean; secondsLeft: number; triesLeft: number };

/** What the sign-in form shows: locked or not, and how many tries remain. */
export async function getSignInStatus(rawEmail: string): Promise<SignInStatus> {
  const now = new Date();
  const state = await readState(normalise(rawEmail));
  return {
    locked: isLocked(state, now),
    secondsLeft: secondsUntilUnlocked(state, now),
    triesLeft: triesLeft(state, now),
  };
}

/**
 * Called before every password check. Returns false when sign-in is paused
 * for this address (the attempt must be refused, and isn't counted).
 * Otherwise counts the attempt and returns true.
 */
export async function beginSignInAttempt(rawEmail: string): Promise<boolean> {
  const email = normalise(rawEmail);
  const now = new Date();
  const state = await readState(email);
  if (isLocked(state, now)) return false;

  const next = countAttempt(state, now);
  await db.signInThrottle.upsert({
    where: { email },
    create: { email, ...next },
    update: next,
  });
  return true;
}

/** Called after a correct password: the slate is wiped. */
export async function clearSignInAttempts(rawEmail: string): Promise<void> {
  await db.signInThrottle.deleteMany({ where: { email: normalise(rawEmail) } });
}
