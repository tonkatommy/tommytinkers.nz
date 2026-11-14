import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PASSWORD, signIn, signOut, signUp, signUpAndVerify, uniqueEmail, useOwnIp, waitForEmail } from "./helpers";

test.beforeEach(async ({ page }) => {
  await useOwnIp(page);
});

test.describe("sign up", () => {
  test("sign up, confirm by email, see the account, sign out", async ({ page, isMobile }) => {
    const email = uniqueEmail("signup");
    await signUp(page, email, "Sam Tester");

    // The page shows the address masked, never in full.
    await expect(page.getByText(`${email[0]}•••@example.test`)).toBeVisible();

    const mail = await waitForEmail(email, "Confirm your email");
    await page.goto(mail.action!.url);
    await expect(page.getByRole("heading", { name: "You're in" })).toBeVisible();

    // Signed in: the protected page opens and knows who it is.
    await page.goto("/account");
    await expect(page.getByText("Signed in as")).toContainText("Sam Tester");

    await signOut(page, isMobile);

    // Signed out again: the protected page sends you to sign in, and
    // remembers where you were going.
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
  });

  test("shows what's missing, including the 13-or-older tick box", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "Create my account" }).click();

    await expect(page.getByText("A few things to sort before I can set you up")).toBeVisible();
    await expect(page.getByText("Pick a name other members will see.")).toBeVisible();
    await expect(page.getByText("Tick this to carry on.")).toBeVisible();
    await expect(page.getByLabel("Display name")).toHaveAttribute("aria-invalid", "true");
  });

  test("the password checklist ticks off as you type", async ({ page }) => {
    await page.goto("/signup");
    const password = page.getByLabel("Password", { exact: true });
    await password.fill("short");
    await expect(page.getByText("At least 10 characters (not yet)")).toBeAttached();
    await password.fill(PASSWORD);
    await expect(page.getByText("At least 10 characters (done)")).toBeAttached();
    await expect(page.getByText("A symbol, like ! or # (done)")).toBeAttached();
  });

  test("signing up twice with one address looks the same, and emails the owner", async ({ page }) => {
    const email = uniqueEmail("twice");
    await signUpAndVerify(page, email);
    await page.context().clearCookies();

    // Same "check your email" screen as a brand new address...
    await signUp(page, email, "Someone Else");
    // ...and the real owner is told someone tried.
    await waitForEmail(email, "You already have");
  });

  test("the server refuses a weak password even if the form is skipped", async ({ page }) => {
    const response = await page.request.post("/api/auth/sign-up/email", {
      headers: { origin: "http://localhost:3000" },
      data: { name: "Sneaky", email: uniqueEmail("weak"), password: "password" },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).code).toBe("WEAK_PASSWORD");
  });
});

test.describe("sign in", () => {
  test("signs in and goes back to where you were headed", async ({ page }) => {
    const email = uniqueEmail("signin");
    await signUpAndVerify(page, email);
    await page.context().clearCookies();

    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/account");
    await expect(page.getByText("Signed in as")).toBeVisible();
  });

  test("the account menu shows who is signed in", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop menu");
    const email = uniqueEmail("menu");
    await signUpAndVerify(page, email, "Menu Tester");
    await page.goto("/");

    await page.getByRole("button", { name: "Account menu" }).click();
    await expect(page.getByText("Menu Tester")).toBeVisible();
    await expect(page.getByRole("link", { name: "Account settings" })).toBeVisible();
    // A plain member is not marked as an admin.
    await expect(page.getByText("Admin", { exact: true })).toBeHidden();
  });

  test("a wrong password counts down, then pauses sign-in after 5", async ({ page }) => {
    // An address with NO account: it must lock exactly like a real one, or
    // the lock screen would reveal who has an account.
    const email = uniqueEmail("nobody");
    await signIn(page, email, "wrong-password-1");
    await expect(page.getByText("That email and password don't match")).toBeVisible();
    await expect(page.getByText("You've got 4 tries left")).toBeVisible();

    for (const left of [3, 2]) {
      await page.getByLabel("Password", { exact: true }).fill("wrong-password-1");
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByText(`You've got ${left} tries left`)).toBeVisible();
    }

    await page.getByLabel("Password", { exact: true }).fill("wrong-password-1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("One more wrong try and sign-in pauses")).toBeVisible();

    await page.getByLabel("Password", { exact: true }).fill("wrong-password-1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Sign-in paused" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reset my password instead" })).toBeVisible();
  });

  test("while paused, even the right password is refused", async ({ page }) => {
    const email = uniqueEmail("locked");
    await signUpAndVerify(page, email);
    await page.context().clearCookies();

    for (let attempt = 0; attempt < 5; attempt++) {
      await page.request.post("/api/auth/sign-in/email", {
        headers: { origin: "http://localhost:3000" },
        data: { email, password: "wrong-password-1" },
      });
    }
    await signIn(page, email, PASSWORD);
    await expect(page.getByRole("heading", { name: "Sign-in paused" })).toBeVisible();
  });

  test("signing in before confirming sends you to check your email", async ({ page }) => {
    const email = uniqueEmail("unverified");
    await signUp(page, email);
    await signIn(page, email);
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  });
});

test.describe("password reset", () => {
  test("asks, follows the link, sets a new password and signs in with it", async ({ page }) => {
    const email = uniqueEmail("reset");
    await signUpAndVerify(page, email);
    await page.context().clearCookies();

    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

    const mail = await waitForEmail(email, "Set a new password");
    await page.goto(mail.action!.url);

    const newPassword = "another-long-one-2!";
    await page.getByLabel("New password").fill(newPassword);
    await page.getByLabel("Type it again").fill("not-the-same-3!");
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page.getByText("Those two don't match yet.")).toBeVisible();

    await page.getByLabel("Type it again").fill(newPassword);
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page.getByRole("heading", { name: "Password changed" })).toBeVisible();

    // The old password is dead, the new one works.
    await signIn(page, email, PASSWORD);
    await expect(page.getByText("That email and password don't match")).toBeVisible();
    await signIn(page, email, newPassword);
    await expect(page).toHaveURL("/");

    // The link only works once.
    await page.context().clearCookies();
    await page.goto(mail.action!.url);
    await expect(page.getByRole("heading", { name: "That reset link has expired" })).toBeVisible();
  });

  test("says the same thing for an address with no account", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(uniqueEmail("ghost"));
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.getByText("If there's an account for")).toBeVisible();
  });
});

test.describe("the 13-or-older step", () => {
  test("an account that skipped the tick box must finish it before anything else", async ({ page }) => {
    // Sign up straight through the API with no tick, the way an account made
    // with Google arrives.
    const email = uniqueEmail("welcome");
    await page.request.post("/api/auth/sign-up/email", {
      headers: { origin: "http://localhost:3000" },
      data: { name: "Skipper", email, password: PASSWORD, callbackURL: "/verify-email/done" },
    });
    const mail = await waitForEmail(email, "Confirm your email");
    await page.goto(mail.action!.url);

    await page.goto("/account");
    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.getByRole("heading", { name: "One last thing" })).toBeVisible();

    // Submitting without the tick is refused.
    await page.getByRole("button", { name: "Finish setting up" }).click();
    await expect(page.getByText("Tick this to carry on.")).toBeVisible();

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Finish setting up" }).click();
    // Wait for the save to finish (it redirects home) before moving on.
    await expect(page).toHaveURL("/");
    await page.goto("/account");
    await expect(page.getByText("Signed in as")).toBeVisible();
  });
});

test.describe("accessibility", () => {
  for (const theme of ["dark", "light"] as const) {
    for (const path of ["/login", "/signup", "/forgot-password", "/verify-email"]) {
      test(`${path} has no serious problems (${theme})`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.context().addCookies([{ name: "tt-theme", value: theme, url: "http://localhost:3000" }]);
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        const results = await new AxeBuilder({ page }).analyze();
        const serious = results.violations.filter(
          (violation) => violation.impact === "serious" || violation.impact === "critical",
        );
        expect(serious.map((violation) => `${violation.id}: ${violation.nodes[0]?.html}`)).toEqual([]);
      });
    }
  }

  test("sign-up errors are announced and tied to their fields", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/signup");
    await page.getByRole("button", { name: "Create my account" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    expect(serious.map((violation) => `${violation.id}: ${violation.nodes[0]?.html}`)).toEqual([]);
  });
});
