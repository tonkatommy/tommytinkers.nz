// The theme lives in a cookie, and dark is the default.
//
// Why the cookie is read by a script and not by the server: reading cookies
// in the root layout would make Next render every page per request, so
// nothing could be prerendered or cached. Instead a tiny script in <head>
// sets data-theme before the first paint (see layout.tsx). No flash, and the
// HTML stays the same for everyone.

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "dark";
export const THEME_COOKIE = "tt-theme";
// One year, in seconds.
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Anything that isn't exactly "light" or "dark" falls back to dark. */
export function parseTheme(value: string | null | undefined): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : DEFAULT_THEME;
}

/** Pulls the theme out of a `document.cookie` style string. */
export function themeFromCookieString(cookies: string): Theme {
  const match = cookies.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`));
  return parseTheme(match?.[1]);
}

/** The value to assign to `document.cookie` to remember a theme. */
export function themeCookie(theme: Theme, secure: boolean): string {
  const parts = [`${THEME_COOKIE}=${theme}`, "Path=/", `Max-Age=${THEME_COOKIE_MAX_AGE}`, "SameSite=Lax"];
  // Secure cookies are dropped on plain http, which is what local dev uses.
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
