"use client";

import { GearSixIcon, SignInIcon, SignOutIcon, UserCircleIcon, UserIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { signOutAction } from "@/app/(auth)/actions";
import { buttonClass } from "@/components/ui/button";

const itemClass =
  "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-ink no-underline hover:bg-raised hover:text-ink";

/** What the menus need to know about whoever is signed in. */
export type MenuUser = { name: string; email: string; isAdmin: boolean };

/**
 * The account button and its dropdown (desktop).
 * `user` is null for a signed-out visitor. Orders and Shed profile links
 * join the signed-in menu when those pages exist (Phases 4 and 5), and the
 * admin links arrive with the admin area in Phase 3.
 */
export function AccountMenu({ user }: { user: MenuUser | null }) {
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
        // navigation, and Tab through a few links is simpler and just as clear.
        <div
          id={panelId}
          className="absolute top-[52px] right-0 z-[110] min-w-60 rounded-lg border border-line bg-surface p-2 shadow-lg"
        >
          {user ? (
            <>
              <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-3">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">{user.name}</span>
                  <span className="truncate text-sm text-ink-secondary">{user.email}</span>
                </span>
                {user.isAdmin ? (
                  <span className="tt-pill bg-(image:--gradient-brand) text-on-warm">Admin</span>
                ) : null}
              </div>
              <Link href="/account" className={itemClass} onClick={() => setOpen(false)}>
                <GearSixIcon size={20} aria-hidden className="text-ink-secondary" />
                Account settings
              </Link>
              <div role="separator" className="my-2 h-px bg-line-subtle" />
              {/* Signing out changes something, so it's a form that POSTs
                  (a server action), never a plain link. */}
              <form action={signOutAction}>
                <button type="submit" className={itemClass}>
                  <SignOutIcon size={20} aria-hidden className="text-ink-secondary" />
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
