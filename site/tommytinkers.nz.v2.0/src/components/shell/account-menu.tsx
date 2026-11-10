"use client";

import { SignInIcon, UserCircleIcon, UserIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";

const itemClass =
  "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-ink no-underline hover:bg-raised hover:text-ink";

/**
 * The account button and its dropdown (desktop).
 * Phase 1 only has the signed-out state. Phase 2 adds the signed-in menus
 * (orders, Shed profile, settings, sign out, and the admin links).
 */
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // While open, a click anywhere else or the Esc key closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className={buttonClass({ variant: "ghost", iconOnly: true })}
        aria-label="Account menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <UserCircleIcon size={20} aria-hidden />
      </button>

      {open ? (
        // A plain list of links, not role="menu": that role promises arrow-key
        // navigation, and Tab through two links is simpler and just as clear.
        <div
          id={panelId}
          className="absolute top-[52px] right-0 z-[110] min-w-60 rounded-lg border border-line bg-surface p-2 shadow-lg"
        >
          <p className="max-w-60 px-3 pt-2 pb-3 text-sm text-ink-secondary">
            Sign in to post in the Shed and see your orders.
          </p>
          <Link href="/login" className={itemClass} onClick={() => setOpen(false)}>
            <SignInIcon size={20} aria-hidden className="text-ink-secondary" />
            Sign in
          </Link>
          <Link href="/signup" className={itemClass} onClick={() => setOpen(false)}>
            <UserIcon size={20} aria-hidden className="text-ink-secondary" />
            Create a free account
          </Link>
        </div>
      ) : null}
    </div>
  );
}
