// The sign-in lockout rule: 5 wrong passwords in a row pauses sign-in for
// that email address for 15 minutes.
//
// This file is only the maths, with no database, so it can be unit tested.
// src/server/sign-in-throttle.ts stores the state.

export const MAX_FAILURES = 5;
export const LOCK_MINUTES = 15;
const LOCK_MS = LOCK_MINUTES * 60 * 1000;

export type ThrottleState = {
  failures: number;
  lastFailure: Date | null;
  lockedUntil: Date | null;
};

export const NO_ATTEMPTS: ThrottleState = { failures: 0, lastFailure: null, lockedUntil: null };

export function isLocked(state: ThrottleState, now: Date): boolean {
  return state.lockedUntil !== null && state.lockedUntil > now;
}

/** Whole seconds until sign-in opens again. 0 when it isn't locked. */
export function secondsUntilUnlocked(state: ThrottleState, now: Date): number {
  if (!isLocked(state, now)) return 0;
  return Math.ceil((state.lockedUntil!.getTime() - now.getTime()) / 1000);
}

/** Failures that still count: old ones expire along with a finished lock. */
function liveFailures(state: ThrottleState, now: Date): number {
  // A lock that has run out wipes the slate.
  if (state.lockedUntil !== null && state.lockedUntil <= now) return 0;
  // So does a quiet 15 minutes. "In a row" shouldn't include last week.
  if (state.lastFailure !== null && now.getTime() - state.lastFailure.getTime() > LOCK_MS) return 0;
  return state.failures;
}

/** How many more wrong tries before sign-in pauses. */
export function triesLeft(state: ThrottleState, now: Date): number {
  return Math.max(0, MAX_FAILURES - liveFailures(state, now));
}

/**
 * The state after one more attempt is counted. Every attempt is counted up
 * front, before the password is checked; a correct password then clears the
 * state. The 5th counted attempt sets the lock, so if that one is wrong too,
 * the next try is refused.
 */
export function countAttempt(state: ThrottleState, now: Date): ThrottleState {
  const failures = liveFailures(state, now) + 1;
  return {
    failures,
    lastFailure: now,
    lockedUntil: failures >= MAX_FAILURES ? new Date(now.getTime() + LOCK_MS) : null,
  };
}
