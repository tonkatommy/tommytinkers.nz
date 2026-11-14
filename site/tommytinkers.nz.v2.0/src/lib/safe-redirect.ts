/**
 * Where to send someone after signing in. The "next" value comes from the
 * address bar, so anyone can put anything there. Only a path on this site is
 * allowed; otherwise a crafted link could bounce a visitor from our sign-in
 * page to a look-alike site (an "open redirect").
 */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  // Must be a plain path: "/account". Not "//evil.com" or "/\evil.com", which
  // browsers treat as another site, and nothing with a scheme.
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  // No sending people back into the sign-in screens.
  if (/^\/(login|signup|welcome|verify-email|forgot-password|reset-password)(\/|\?|$)/.test(next)) return fallback;
  return next;
}

/** "sam@example.co.nz" -> "s•••@example.co.nz", for "I've sent a link to..." */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user.slice(0, 1)}•••@${domain}`;
}
