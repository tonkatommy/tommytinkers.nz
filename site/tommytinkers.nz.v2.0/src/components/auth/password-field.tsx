"use client";

import { CheckCircleIcon, EyeIcon, EyeSlashIcon, MinusCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { type ComponentProps, type ReactNode, useState } from "react";
import { FieldError } from "@/components/ui/field";
import type { PasswordCheck } from "@/lib/password";

type PasswordFieldProps = {
  id: string;
  label: string;
  error?: string;
  labelAside?: ReactNode;
  /** The live rule checklist, for fields where a new password is chosen. */
  checks?: PasswordCheck[];
  /** True once the form has been submitted, so unmet rules turn into crosses. */
  showUnmet?: boolean;
} & Omit<ComponentProps<"input">, "id" | "type">;

/** A password input with a show/hide button and, optionally, the rules. */
export function PasswordField({ id, label, error, labelAside, checks, showUnmet, ...input }: PasswordFieldProps) {
  const [shown, setShown] = useState(false);
  const describedBy = [error ? `${id}-error` : null, checks ? `${id}-rules` : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          className="tt-input pr-[52px]"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...input}
        />
        <button
          type="button"
          className="absolute top-1/2 right-1 grid h-10 w-11 -translate-y-1/2 place-items-center rounded-md text-ink-secondary hover:bg-raised hover:text-ink"
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          onClick={() => setShown((wasShown) => !wasShown)}
        >
          {shown ? <EyeSlashIcon size={20} aria-hidden /> : <EyeIcon size={20} aria-hidden />}
        </button>
      </div>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
      {checks ? (
        <ul id={`${id}-rules`} className="flex flex-col gap-1 text-[13px]">
          {checks.map((check) => {
            const Icon = check.ok ? CheckCircleIcon : showUnmet ? XCircleIcon : MinusCircleIcon;
            return (
              <li key={check.label} className={`flex items-center gap-2 ${check.ok ? "text-ink" : "text-ink-secondary"}`}>
                <Icon size={16} aria-hidden className={check.ok ? "text-mono" : ""} />
                {check.label}
                {/* The icon alone says done or not; this says it in words. */}
                <span className="sr-only">{check.ok ? " (done)" : " (not yet)"}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
