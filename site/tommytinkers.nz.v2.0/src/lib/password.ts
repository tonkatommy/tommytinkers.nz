// The password rules, in one place. The sign-up and reset forms use them to
// show the live checklist, and the server (src/server/auth.ts) uses the same
// functions to enforce them, so the two can never disagree.

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 128;

export type PasswordCheck = { label: string; ok: boolean };

/**
 * Each rule with whether this password meets it.
 * `email` is optional: when a password is being reset we don't have it in
 * the browser, so that rule is left off the list.
 */
export function passwordChecks(password: string, email?: string): PasswordCheck[] {
  const checks: PasswordCheck[] = [
    { label: `At least ${MIN_PASSWORD_LENGTH} characters`, ok: password.length >= MIN_PASSWORD_LENGTH },
    { label: "A number", ok: /[0-9]/.test(password) },
    { label: "A symbol, like ! or #", ok: /[^A-Za-z0-9\s]/.test(password) },
  ];
  if (email !== undefined) {
    checks.push({
      label: "Not the same as your email",
      ok: password.length > 0 && password.toLowerCase() !== email.trim().toLowerCase(),
    });
  }
  return checks;
}

export function isPasswordOk(password: string, email?: string): boolean {
  return password.length <= MAX_PASSWORD_LENGTH && passwordChecks(password, email).every((check) => check.ok);
}
