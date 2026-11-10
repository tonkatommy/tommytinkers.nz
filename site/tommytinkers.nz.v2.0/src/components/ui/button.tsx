import Link from "next/link";
import type { ComponentProps } from "react";

// The button styles live in globals.css (.tt-btn...) because the site FX
// hook onto those class names. This file just picks the right ones, so pages
// never spell the class names out by hand.
type ButtonStyle = {
  variant?: "primary" | "secondary" | "ghost" | "ink";
  size?: "md" | "sm";
  /** Full width of its container. */
  block?: boolean;
  /** Square 44px button holding only an icon. Needs an aria-label. */
  iconOnly?: boolean;
};

export function buttonClass(
  { variant = "primary", size = "md", block = false, iconOnly = false }: ButtonStyle = {},
  extra = "",
): string {
  return [
    "tt-btn",
    `tt-btn-${variant}`,
    size === "sm" && "tt-btn-sm",
    block && "tt-btn-block",
    iconOnly && "tt-btn-icon",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ButtonStyle & ComponentProps<"button">;

/** Something that does an action on this page. */
export function Button({ variant, size, block, iconOnly, className, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass({ variant, size, block, iconOnly }, className)} {...rest} />
  );
}

type LinkButtonProps = ButtonStyle & ComponentProps<typeof Link>;

/** Something that goes to another page, styled as a button. */
export function LinkButton({ variant, size, block, iconOnly, className, ...rest }: LinkButtonProps) {
  return <Link className={buttonClass({ variant, size, block, iconOnly }, className)} {...rest} />;
}
