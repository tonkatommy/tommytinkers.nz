import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { beginSignInAttempt, clearSignInAttempts, getSignInStatus } from "@/server/sign-in-throttle";

// A made-up address per run, so repeat runs never collide.
const email = `throttle-${Date.now()}@example.test`;

afterAll(async () => {
  await db.signInThrottle.deleteMany({ where: { email } });
  await db.$disconnect();
});

describe("sign-in throttle (database)", () => {
  it("starts unlocked with 5 tries", async () => {
    expect(await getSignInStatus(email)).toEqual({ locked: false, secondsLeft: 0, triesLeft: 5 });
  });

  it("counts attempts, ignoring capitals and spaces in the address", async () => {
    expect(await beginSignInAttempt(`  ${email.toUpperCase()} `)).toBe(true);
    expect((await getSignInStatus(email)).triesLeft).toBe(4);
  });

  it("allows the 5th attempt, then refuses the 6th", async () => {
    for (let attempt = 2; attempt <= 5; attempt++) {
      expect(await beginSignInAttempt(email)).toBe(true);
    }
    const status = await getSignInStatus(email);
    expect(status.locked).toBe(true);
    expect(status.secondsLeft).toBeGreaterThan(14 * 60);
    expect(await beginSignInAttempt(email)).toBe(false);
  });

  it("a refused attempt doesn't extend the lock", async () => {
    const before = await db.signInThrottle.findUniqueOrThrow({ where: { email } });
    await beginSignInAttempt(email);
    const after = await db.signInThrottle.findUniqueOrThrow({ where: { email } });
    expect(after.lockedUntil).toEqual(before.lockedUntil);
  });

  it("clearing (a correct password) wipes the slate", async () => {
    await clearSignInAttempts(email);
    expect(await getSignInStatus(email)).toEqual({ locked: false, secondsLeft: 0, triesLeft: 5 });
  });
});
