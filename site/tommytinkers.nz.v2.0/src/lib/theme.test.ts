import { describe, expect, it } from "vitest";
import { headScript } from "@/lib/head-script";
import { parseTheme, themeCookie, themeFromCookieString } from "@/lib/theme";

describe("parseTheme", () => {
  it("accepts the two themes", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
  });

  it("falls back to dark for anything else", () => {
    expect(parseTheme(undefined)).toBe("dark");
    expect(parseTheme(null)).toBe("dark");
    expect(parseTheme("")).toBe("dark");
    expect(parseTheme("LIGHT")).toBe("dark");
    expect(parseTheme('"><script>')).toBe("dark");
  });
});

describe("themeFromCookieString", () => {
  it("finds the theme among other cookies", () => {
    expect(themeFromCookieString("a=1; tt-theme=light; b=2")).toBe("light");
    expect(themeFromCookieString("tt-theme=light")).toBe("light");
  });

  it("is not fooled by a cookie whose name merely ends the same way", () => {
    expect(themeFromCookieString("not-tt-theme=light")).toBe("dark");
  });

  it("defaults to dark with no cookie", () => {
    expect(themeFromCookieString("")).toBe("dark");
  });
});

describe("themeCookie", () => {
  it("lasts a year, covers the whole site and is SameSite=Lax", () => {
    expect(themeCookie("light", false)).toBe("tt-theme=light; Path=/; Max-Age=31536000; SameSite=Lax");
  });

  it("adds Secure on https", () => {
    expect(themeCookie("dark", true)).toMatch(/; Secure$/);
  });
});

describe("headScript", () => {
  it("reads the same cookie and storage key the rest of the app writes", () => {
    expect(headScript).toContain("tt-theme=");
    expect(headScript).toContain('"tt-fx-v1"');
  });

  it("is valid JavaScript", () => {
    // new Function parses the code without running it.
    expect(() => new Function(headScript)).not.toThrow();
  });
});
