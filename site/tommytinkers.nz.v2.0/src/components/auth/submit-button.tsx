"use client";

import { CircleNotchIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";

type SubmitButtonProps = {
  busy: boolean;
  /** What the button says while it works, e.g. "Signing in". */
  busyLabel: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

/** A form's main button, with a spinner and new words while it's working. */
export function SubmitButton({ busy, busyLabel, children, variant = "primary" }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className={buttonClass({ variant, block: true })}
      // Not `disabled` while busy: that would drop keyboard focus. The
      // form's own handler ignores a second press instead.
      aria-busy={busy}
    >
      {busy ? (
        <>
          <CircleNotchIcon size={20} aria-hidden className="animate-spin" />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
