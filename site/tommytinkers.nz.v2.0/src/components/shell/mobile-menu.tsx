"use client";

import { ListIcon, XIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useId, useState } from "react";
import { buttonClass } from "@/components/ui/button";

/**
 * The menu button and full-height panel used below 1024px.
 * The links themselves are passed in as children, so they are rendered on
 * the server; this component only owns "open or closed".
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    // Stop the page behind the panel from scrolling while it is open.
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
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
