import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { type Page, expect } from "@playwright/test";

// Shared by the browser tests.
//
// Emails: the test server is started with EMAIL_TO_FILE=1 (see
// playwright.config.ts), so instead of sending, it writes each email to this
// folder as a JSON file. Tests read the link straight out of it.
export const EMAIL_DIR = path.join(process.cwd(), ".tmp", "e2e-emails");

export const PASSWORD = "a-long-password-1";

/** A fresh address per test, so tests never trip over each other's accounts. */
export function uniqueEmail(label: string): string {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
}

/**
 * Better Auth rate-limits per visitor IP, read from Cloudflare's header. All
 * tests come from one machine, so each one claims its own made-up address
 * (from a range reserved for documentation) to avoid sharing a limit.
 */
export async function useOwnIp(page: Page) {
  const octet = () => Math.floor(Math.random() * 254) + 1;
  await page.context().setExtraHTTPHeaders({ "cf-connecting-ip": `203.0.113.${octet()}`, "x-test-run": `${octet()}` });
}

type SavedEmail = { to: string; subject: string; text: string; action?: { label: string; url: string } };

/** Waits for an email to this address whose subject contains `subject`. */
export async function waitForEmail(to: string, subject: string): Promise<SavedEmail> {
  let found: SavedEmail | undefined;
  await expect
    .poll(
      async () => {
        const names = await readdir(EMAIL_DIR).catch(() => [] as string[]);
        // Newest first: file names start with a timestamp.
        for (const name of names.sort().reverse()) {
          const email = JSON.parse(await readFile(path.join(EMAIL_DIR, name), "utf8")) as SavedEmail;
          if (email.to === to && email.subject.includes(subject)) {
            found = email;
            return true;
          }
        }
        return false;
      },
      { message: `an email to ${to} about "${subject}"`, timeout: 10_000 },
    )
    .toBe(true);
  return found!;
}

/** Fills in and submits the sign-up form. */
export async function signUp(page: Page, email: string, name = "Sam Tester") {
  await page.goto("/signup");
  await page.getByLabel("Display name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
}

/** Signs up and follows the emailed link, ending signed in. */
export async function signUpAndVerify(page: Page, email: string, name = "Sam Tester") {
  await signUp(page, email, name);
  const mail = await waitForEmail(email, "Confirm your email");
  await page.goto(mail.action!.url);
  await expect(page.getByRole("heading", { name: "You're in" })).toBeVisible();
}

export async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** Signs out through the menu that fits the screen size. */
export async function signOut(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  else await page.getByRole("button", { name: "Account menu" }).click();
  // Scoped to the nav: the account page has its own Sign out button too.
  await page.getByRole("banner").getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/");
}
