"use client";

import { ListIcon, XIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";

// Tailwind's "lg" breakpoint, where the desktop nav takes over (lg:hidden
// below). Keep the two in step.
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * The menu button and full-height panel used below 1024px.
 * The links themselves are passed in as children, so they are rendered on
 * the server; this component only owns "open or closed".
 *
 * Why not a native <dialog> like the cart drawer? A modal dialog switches
 * off everything outside itself, and here the nav bar (logo, cart, this
 * button) stays in view and in use above the panel. So the panel does the
 * same job by hand: the page under it is made inert while it is open.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Closing removes the link that had focus, and the browser would drop
      // focus back to the top of the page. Put it on the button that opened
      // the menu, so a keyboard user carries on from where they were.
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);

    // The panel and its close button vanish at desktop width (lg:hidden),
    // so close the menu there too. Otherwise it would stay "open" unseen,
    // with the page still locked.
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onDesktopChange = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", onDesktopChange);

    // Stop the page behind the panel from scrolling while it is open.
    document.body.style.overflow = "hidden";

    // The panel covers everything below the nav bar. "inert" takes those
    // covered parts (skip link, main, footer) out of the Tab order and away
    // from screen readers, so nobody lands on a link they can't see. Only
    // the header, which holds this menu, stays live.
    const header = rootRef.current?.closest("header");
    const covered = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== header && !element.inert,
    );
    for (const element of covered) element.inert = true;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktopChange);
      document.body.style.overflow = "";
      for (const element of covered) element.inert = false;
    };
  }, [open]);

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        className={buttonClass({ variant: "ghost", iconOnly: true })}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {open ? <XIcon size={24} aria-hidden /> : <ListIcon size={24} aria-hidden />}
      </button>

      {open ? (
        // Positioned against the nav bar (absolute), not the window (fixed):
        // the blurred nav uses backdrop-filter, and that makes "fixed"
        // children measure from the nav instead of the screen.
        <nav
          id={panelId}
          aria-label="Main"
          className="absolute top-full right-0 left-0 flex h-[calc(100dvh-var(--nav-height))] flex-col gap-2 overflow-auto border-t border-line-subtle bg-canvas px-6 pt-4 pb-8"
          // Tapping any link inside closes the menu, so the new page isn't
          // hidden behind it.
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </nav>
      ) : null}
    </div>
  );
}
