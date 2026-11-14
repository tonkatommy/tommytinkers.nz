import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// The browser's way of calling the /api/auth endpoints. Client components
// (the sign-in and sign-up forms) use this.
//
// Why the forms call these endpoints instead of server actions: Better Auth
// rate-limits its endpoints per visitor IP. Calling its functions from a
// server action skips that limiter. The rules themselves (password strength,
// lockout, bot check) are enforced on the server either way.
export const authClient = createAuthClient({
  plugins: [
    // Tells TypeScript that sign-up may send this extra field. It mirrors
    // user.additionalFields in src/server/auth.ts.
    inferAdditionalFields({ user: { ageConfirmedAt: { type: "date", required: false } } }),
  ],
});

/** Where the email verification link lands. */
export const VERIFY_DONE_PATH = "/verify-email/done";

// The email someone just signed up with, kept for this tab only so the
// "check your email" page can show it and resend. sessionStorage rather than
// the address bar, so the address doesn't end up in server logs.
const PENDING_EMAIL_KEY = "tt-pending-email";

export function rememberPendingEmail(email: string) {
  try {
    sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  } catch {
    // Storage blocked: the page falls back to asking for the email again.
  }
}

export function readPendingEmail(): string {
  try {
    return sessionStorage.getItem(PENDING_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

/** A loose check, only to catch typos before sending. The server decides. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
