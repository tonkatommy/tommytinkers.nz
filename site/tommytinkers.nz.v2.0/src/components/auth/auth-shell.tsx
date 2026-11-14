import { ChatsCircleIcon, PushPinIcon, ReceiptIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The frame every account screen sits in: the gradient panel on the left
 * (desktop only, and this page's one gradient surface) and the form on the
 * right.
 */
export function AuthShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid flex-1 lg:grid-cols-[5fr_7fr]">
      {/* Decoration: everything it says is also on the form side or the home
          page, so it's hidden from screen readers. */}
      <aside aria-hidden className="tt-warm hidden flex-col justify-between gap-8 p-12 lg:flex">
        <span className="tt-label">{label}</span>
        <div className="flex flex-col gap-6">
          <Image src="/assets/logo.png" alt="" width={120} height={120} className="size-[120px] rounded-full shadow-lg" />
          <p className="text-4xl leading-tight font-bold tracking-tight">The Shed&apos;s open.</p>
          <ul className="flex flex-col gap-3 text-[17px]">
            <li className="flex items-center gap-3">
              <PushPinIcon size={24} />
              Pin your builds to the Pinboard
            </li>
            <li className="flex items-center gap-3">
              <ChatsCircleIcon size={24} />
              Ask and answer in the Workshop
            </li>
            <li className="flex items-center gap-3">
              <ReceiptIcon size={24} />
              Keep track of your orders
            </li>
          </ul>
        </div>
        <p className="text-sm">Accounts are free. Looking around never needs one.</p>
      </aside>

      <div className="flex items-start justify-center px-6 pt-10 pb-16 md:items-center md:px-12 md:py-16">
        <div className="flex w-full max-w-[440px] flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}

/** The heading block at the top of each account screen. */
export function AuthHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      {/* An h1 for the page outline, at the h2 size the design uses here. */}
      <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
      {children ? <p className="text-sm text-ink-secondary">{children}</p> : null}
    </header>
  );
}

/** Shown while the form's part of the page streams in. */
export function AuthCardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="tt-skel h-10 w-2/3" />
      <div className="tt-skel h-4 w-full" />
      <div className="tt-skel h-11 w-full rounded-md" />
      <div className="tt-skel h-11 w-full rounded-md" />
      <div className="tt-skel h-11 w-full rounded-md" />
      <p className="sr-only" role="status">
        Loading
      </p>
    </div>
  );
}

/** "or use your email": a line, the words, a line. */
export function OrDivider({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[13px] text-ink-secondary before:h-px before:flex-1 before:bg-line-subtle after:h-px after:flex-1 after:bg-line-subtle">
      {children}
    </p>
  );
}
