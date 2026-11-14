"use client";

import { type ReactNode, useSyncExternalStore } from "react";

// A client component only because it has to watch the scroll position.
// Everything inside the nav is passed in as children, so it is still
// rendered on the server.

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/**
 * The 64px sticky bar. Solid at the top of the page; after 8px of scroll it
 * becomes a blurred overlay (styled by .tt-nav[data-scrolled="true"]).
 */
export function NavShell({ children }: { children: ReactNode }) {
  // useSyncExternalStore reads a value that lives outside React (here the
  // scroll position) and re-renders only when the answer changes. The last
  // argument is what the server renders: not scrolled.
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  );

  return (
    <header className="tt-nav" data-scrolled={scrolled}>
      {children}
    </header>
  );
}
