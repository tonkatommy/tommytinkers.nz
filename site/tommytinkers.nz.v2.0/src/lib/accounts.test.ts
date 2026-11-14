import { describe, expect, it } from "vitest";
import { isPasswordOk, passwordChecks } from "@/lib/password";
import { PERMISSIONS, SEED_ROLES, hasPermission } from "@/lib/permissions";
import { maskEmail, safeNextPath } from "@/lib/safe-redirect";
import {
  LOCK_MINUTES,
  MAX_FAILURES,
  NO_ATTEMPTS,
  type ThrottleState,
  countAttempt,
  isLocked,
  secondsUntilUnlocked,
  triesLeft,
} from "@/lib/sign-in-throttle";

describe("password rules", () => {
  it("accepts a password that meets every rule", () => {
    expect(isPasswordOk("a-long-password-1", "sam@example.co.nz")).toBe(true);
  });

  it("needs 10 characters, a number and a symbol", () => {
    expect(isPasswordOk("short-1!")).toBe(false);
    expect(isPasswordOk("no-number-here!")).toBe(false);
    expect(isPasswordOk("nosymbolhere123")).toBe(false);
  });

  it("refuses the email address as the password, whatever the capitals", () => {
    expect(isPasswordOk("Sam.1@example.co.nz", "sam.1@example.co.nz")).toBe(false);
  });

  it("refuses anything over 128 characters", () => {
    expect(isPasswordOk(`${"a".repeat(127)}1!`)).toBe(false);
  });

  it("leaves the email rule off the list when there is no email to compare", () => {
    expect(passwordChecks("x")).toHaveLength(3);
    expect(passwordChecks("x", "sam@example.co.nz")).toHaveLength(4);
  });
});

describe("sign-in lockout", () => {
  const start = new Date("2026-11-13T00:00:00Z");
  const after = (minutes: number) => new Date(start.getTime() + minutes * 60_000);

  /** Counts `count` attempts in a row, one second apart. */
  function attempts(count: number, from: ThrottleState = NO_ATTEMPTS): ThrottleState {
    let state = from;
    for (let i = 0; i < count; i++) state = countAttempt(state, new Date(start.getTime() + i * 1000));
    return state;
  }

  it("starts with 5 tries and no lock", () => {
    expect(triesLeft(NO_ATTEMPTS, start)).toBe(MAX_FAILURES);
    expect(isLocked(NO_ATTEMPTS, start)).toBe(false);
  });

  it("counts down the tries left", () => {
    expect(triesLeft(attempts(1), after(1))).toBe(4);
    expect(triesLeft(attempts(4), after(1))).toBe(1);
  });

  it("is not locked after 4 attempts", () => {
    expect(isLocked(attempts(4), after(1))).toBe(false);
  });

  it("locks for 15 minutes on the 5th attempt", () => {
    const state = attempts(5);
    expect(isLocked(state, after(1))).toBe(true);
    expect(isLocked(state, after(LOCK_MINUTES - 1))).toBe(true);
    expect(isLocked(state, after(LOCK_MINUTES + 1))).toBe(false);
  });

  it("reports the seconds left, and 0 once it is over", () => {
    const state = attempts(5);
    expect(secondsUntilUnlocked(state, after(14))).toBeGreaterThan(0);
    expect(secondsUntilUnlocked(state, after(14))).toBeLessThanOrEqual(64);
    expect(secondsUntilUnlocked(state, after(16))).toBe(0);
  });

  it("gives a full set of tries back once the lock has run out", () => {
    const state = attempts(5);
    expect(triesLeft(state, after(16))).toBe(MAX_FAILURES);
    expect(countAttempt(state, after(16)).failures).toBe(1);
  });

  it("forgets failures after a quiet 15 minutes", () => {
    const state = attempts(4);
    expect(triesLeft(state, after(16))).toBe(MAX_FAILURES);
    expect(countAttempt(state, after(16)).lockedUntil).toBeNull();
  });
});

describe("permissions", () => {
  it("checks for one permission in a role's list", () => {
    expect(hasPermission(["access_admin", "manage_orders"], "manage_orders")).toBe(true);
    expect(hasPermission(["access_admin"], "manage_users")).toBe(false);
    expect(hasPermission([], "access_admin")).toBe(false);
  });

  it("gives the owner everything and a member nothing", () => {
    const role = (name: string) => SEED_ROLES.find((seed) => seed.name === name)!;
    expect([...role("owner").permissions].sort()).toEqual([...PERMISSIONS].sort());
    expect(role("member").permissions).toEqual([]);
  });

  it("gives the shopkeeper discounts but not users or moderation", () => {
    const shopkeeper = SEED_ROLES.find((seed) => seed.name === "shopkeeper")!.permissions as readonly string[];
    expect(shopkeeper).toContain("manage_discounts");
    expect(shopkeeper).not.toContain("manage_users");
    expect(shopkeeper).not.toContain("moderate_community");
  });
});

describe("safeNextPath", () => {
  it("keeps a path on this site", () => {
    expect(safeNextPath("/account")).toBe("/account");
    expect(safeNextPath("/shop/thing?size=a4")).toBe("/shop/thing?size=a4");
  });

  it("refuses anything that could leave the site", () => {
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("/\\evil.example")).toBe("/");
    expect(safeNextPath("javascript:alert(1)")).toBe("/");
  });

  it("falls back when there is nothing, or it points at a sign-in screen", () => {
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("", "/shed")).toBe("/shed");
    expect(safeNextPath("/login?next=/login")).toBe("/");
    expect(safeNextPath("/welcome")).toBe("/");
  });
});

describe("maskEmail", () => {
  it("hides all but the first letter of the name", () => {
    expect(maskEmail("sam@example.co.nz")).toBe("s•••@example.co.nz");
  });
});
