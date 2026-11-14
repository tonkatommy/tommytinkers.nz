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
 *
 * Read, decide and write happen one address at a time. Without that, twenty
 * requests sent at the same instant would all read "0 failures" and all be
 * let through, which is twenty guesses instead of five.
 */
export async function beginSignInAttempt(rawEmail: string): Promise<boolean> {
  const email = normalise(rawEmail);

  return db.$transaction(async (tx) => {
    // A Postgres advisory lock: a named lock that isn't tied to a row, so it
    // works even before this address has a row to lock. Requests for the
    // same address queue here; other addresses aren't held up. The "xact"
    // kind lets go by itself when the transaction ends, error or not.
    // hashtextextended turns the address into the number the lock is named by.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${email}, 0))`;

    // Taken after the wait, so a queued request sees the real time.
    const now = new Date();
    const state = (await tx.signInThrottle.findUnique({ where: { email } })) ?? NO_ATTEMPTS;
    if (isLocked(state, now)) return false;

    const next = countAttempt(state, now);
    await tx.signInThrottle.upsert({
      where: { email },
      create: { email, ...next },
      update: next,
    });
    return true;
  });
}

/** Called after a correct password: the slate is wiped. */
export async function clearSignInAttempts(rawEmail: string): Promise<void> {
  await db.signInThrottle.deleteMany({ where: { email: normalise(rawEmail) } });
}
