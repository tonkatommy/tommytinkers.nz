'use client';

import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/*  Hydration                                                           */
/* ------------------------------------------------------------------ */

const noopSubscribe = () => () => {};

/**
 * False during SSR and the hydration render, true from then on. Lets a
 * component read browser-only state (localStorage, location.hash) in a lazy
 * useState initialiser without a hydration mismatch, instead of copying it
 * into state from an effect after mount.
 */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/* ------------------------------------------------------------------ */
/*  Theme                                                               */
/* ------------------------------------------------------------------ */

export type Theme = "dark" | "light";

const THEME_KEY = "tt-theme-v1";

function subscribeTheme(onChange: () => void) {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/**
 * The active theme, read from <html data-theme> (set from localStorage by the
 * inline script in the root layout before hydration). Every caller re-renders
 * when any of them calls setTheme.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, readTheme, () => "dark");
}

export function setTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem(THEME_KEY, next); } catch {}
}
