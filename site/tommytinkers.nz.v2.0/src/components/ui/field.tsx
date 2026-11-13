import { CheckCircleIcon, InfoIcon, WarningCircleIcon } from "@phosphor-icons/react/ssr";
import type { ComponentProps, ReactNode } from "react";

type FieldProps = {
  /** Must be unique on the page: it links the label, error and help text. */
  id: string;
  label: string;
  /** Shown under the field, and read out with it. */
  error?: string;
  help?: string;
  /** Sits on the label row, e.g. a "Forgot your password?" link. */
  labelAside?: ReactNode;
} & Omit<ComponentProps<"input">, "id">;

/**
 * A labelled text input with its help and error text wired up for screen
 * readers. Works in server and client components.
 */
export function Field({ id, label, error, help, labelAside, className = "", ...input }: FieldProps) {
  const describedBy = [error ? `${id}-error` : null, help ? `${id}-help` : null].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={id}
        className={`tt-input ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...input}
      />
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
      {help ? (
        <p id={`${id}-help`} className="text-sm text-ink-secondary">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/** The red-icon line under a field. Text uses the contrast-safe error colour. */
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-2 text-sm text-(--color-error-text)">
      <WarningCircleIcon size={20} aria-hidden className="flex-none text-error" />
      {children}
    </p>
  );
}

type BannerProps = {
  tone: "error" | "success" | "info";
  title: string;
  children?: ReactNode;
};

/**
 * A message box at the top of a form. Errors use role="alert" so a screen
 * reader says them straight away; the others wait their turn (role="status").
 */
export function Banner({ tone, title, children }: BannerProps) {
  const Icon = tone === "error" ? WarningCircleIcon : tone === "success" ? CheckCircleIcon : InfoIcon;
  const iconColour = tone === "error" ? "text-error" : tone === "success" ? "text-mono" : "text-eyebrow";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border bg-raised px-4 py-3 text-sm ${tone === "error" ? "border-error" : "border-line"}`}
    >
      <Icon size={20} aria-hidden className={`mt-0.5 flex-none ${iconColour}`} />
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{title}</p>
        {children ? <div className="text-ink-secondary">{children}</div> : null}
      </div>
    </div>
  );
}
