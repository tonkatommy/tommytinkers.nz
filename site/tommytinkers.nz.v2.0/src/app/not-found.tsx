import { CompassIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { StateCard } from "@/components/ui/state-card";

export const metadata: Metadata = { title: "Page not found" };

// Shown for any address the site doesn't have. While v2 is being built that
// includes pages still on the way (shop, Codebench, the Shed), so the copy
// covers both cases honestly.
export default function NotFound() {
  return (
    <div className="tt-container flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-[560px]">
        <h1 className="sr-only">Page not found</h1>
        <StateCard
          icon={<CompassIcon size={24} aria-hidden />}
          title="That page isn't here"
          actions={
            <LinkButton href="/" variant="primary">
              Back to the workshop
            </LinkButton>
          }
        >
          It may have moved, or I might still be building it. The home page is a good place to start again.
        </StateCard>
      </div>
    </div>
  );
}
