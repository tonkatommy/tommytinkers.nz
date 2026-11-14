/**
 * Where to send someone after signing in. The "next" value comes from the
 * address bar, so anyone can put anything there. Only a path on this site is
 * allowed; otherwise a crafted link could bounce a visitor from our sign-in
 * page to a look-alike site (an "open redirect").
 */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  // Must be a plain path: "/account". Not "//evil.com", and nothing with a
  // scheme.
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  // Browsers tidy a URL before reading it: tabs and newlines are deleted and
  // "\" counts as "/". So "/<tab>/evil.com" and "/\evil.com" both end up as
  // "//evil.com", another site. Neither character belongs in a real path.
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback;

  // Then ask the same question the browser will: resolved against a made-up
  // site, does this still point at that site? Checking the answer, not the
  // spelling, covers tricks the checks above didn't think of.
  let url: URL;
  try {
    url = new URL(next, PLACEHOLDER_ORIGIN);
  } catch {
    return fallback;
  }
  if (url.origin !== PLACEHOLDER_ORIGIN) return fallback;

  // The parser has also resolved any "..", so "/shop/../login" is "/login"
  // by now and can't slip past the next check.
  const path = url.pathname + url.search + url.hash;
  // No sending people back into the sign-in screens.
  if (/^\/(login|signup|welcome|verify-email|forgot-password|reset-password)(\/|\?|#|$)/.test(path)) return fallback;
  return path;
}

// Only used to resolve a path against. ".invalid" can never be a real site.
const PLACEHOLDER_ORIGIN = "https://tt.invalid";

/** "sam@example.co.nz" -> "s•••@example.co.nz", for "I've sent a link to..." */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user.slice(0, 1)}•••@${domain}`;
}
