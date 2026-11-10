"use client";

import { ShoppingCartSimpleIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRef } from "react";
import { buttonClass } from "@/components/ui/button";

/**
 * The cart button and its drawer.
 *
 * Phase 1 ships the drawer with its empty state only, so the button works.
 * The cart itself (lines, quantities, subtotal, the count badge) is built
 * with the catalogue in Phase 3.
 *
 * The drawer is a native <dialog> opened with showModal(). The browser then
 * does the hard parts for us: it traps focus inside, closes on Esc, hides
 * the rest of the page from screen readers and returns focus to this button
 * when it closes.
 */
export function CartButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        className={buttonClass({ variant: "ghost", iconOnly: true })}
        aria-label="Cart, 0 items"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <ShoppingCartSimpleIcon size={24} aria-hidden />
      </button>

      <dialog
        ref={dialogRef}
        className="tt-drawer"
        aria-labelledby="cart-heading"
        // A click that lands on the dialog element itself is a click on the
        // dimmed backdrop (clicks on content land on the content).
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="flex min-h-(--nav-height) items-center justify-between gap-4 border-b border-line-subtle py-3 pr-3 pl-6">
          <h2 id="cart-heading" className="text-xl font-semibold">
            Your cart <span className="font-medium text-ink-secondary">(0)</span>
          </h2>
          <button
            type="button"
            className={buttonClass({ variant: "ghost", iconOnly: true })}
            aria-label="Close cart"
            onClick={close}
          >
            <XIcon size={24} aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-2 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-raised text-ink-secondary">
            <ShoppingCartSimpleIcon size={24} aria-hidden />
          </span>
          <h3 className="text-xl font-semibold">Your cart is empty</h3>
          <p className="max-w-[280px] text-sm text-ink-secondary">
            Have a look around the shop. Something will catch your eye.
          </p>
          <Link href="/shop" className={buttonClass({ variant: "primary" })} onClick={close}>
            Browse the shop
          </Link>
        </div>
      </dialog>
    </>
  );
}
