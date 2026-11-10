"use client";

import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Button, LinkButton } from "@/components/ui/button";
import { StateCard } from "@/components/ui/state-card";

// Next shows this when a page throws while rendering. Error boundaries have
// to be client components, because "Try again" re-renders in the browser.
//
// The error itself is never shown: it can hold details (queries, file paths)
// that visitors shouldn't see. Next has already logged it on the server.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="tt-container flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-[560px]">
        <h1 className="sr-only">Something went wrong</h1>
        <StateCard
          tone="error"
          icon={<WarningCircleIcon size={24} aria-hidden />}
          title="Something went wrong"
          actions={
            <>
              <Button variant="primary" onClick={reset}>
                <ArrowClockwiseIcon size={20} aria-hidden />
                Try again
              </Button>
              <LinkButton href="/" variant="ghost">
                Back to the workshop
              </LinkButton>
            </>
          }
        >
          That&apos;s on my end, not yours. Give it another go in a moment.
        </StateCard>
      </div>
    </div>
  );
}
