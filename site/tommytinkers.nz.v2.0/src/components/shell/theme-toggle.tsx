"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";
import { buttonClass } from "@/components/ui/button";
import { DEFAULT_THEME, type Theme, parseTheme, themeCookie } from "@/lib/theme";

// The current theme is the data-theme attribute on <html>. The script in
// layout.tsx sets it from the cookie before first paint, and this button
// changes it. Reading it from the page (not from React state) means every
// toggle on the page, nav, footer and mobile menu, stays in step.

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => parseTheme(document.documentElement.getAttribute("data-theme")),
    // The server can't see the cookie (see lib/theme.ts), so it renders the
    // default and React corrects the label right after loading.
    () => DEFAULT_THEME,
  );
}

function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = themeCookie(theme, window.location.protocol === "https:");
}

type ThemeToggleProps = {
  /** "icon" is the square nav button; "labelled" shows the words too. */
  variant: "icon" | "labelled";
  /** Labelled only: outlined (mobile menu) or plain (footer). */
  look?: "secondary" | "ghost";
};

export function ThemeToggle({ variant, look = "ghost" }: ThemeToggleProps) {
  const theme = useTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";
  // The label says what pressing it will do.
  const label = next === "light" ? "Light theme" : "Dark theme";
  const Icon = next === "light" ? SunIcon : MoonIcon;

  if (variant === "icon") {
    return (
      <button
        type="button"
        className={buttonClass({ variant: "ghost", iconOnly: true })}
        aria-label={label}
        title={label}
        onClick={() => setTheme(next)}
      >
        <Icon size={20} aria-hidden />
      </button>
    );
  }

  return (
    <button type="button" className={buttonClass({ variant: look, size: "sm" })} onClick={() => setTheme(next)}>
      <Icon size={16} aria-hidden />
      {label}
    </button>
  );
}
