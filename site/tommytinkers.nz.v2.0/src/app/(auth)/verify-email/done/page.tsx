import { CheckCircleIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCardSkeleton, AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import { VerifyPanel } from "@/components/auth/verify-panel";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Email confirmed" };

type Props = { searchParams: Promise<{ error?: string }> };

// Where the link in the verification email lands. Better Auth checks the
// token first (at /api/auth/verify-email) and then redirects here, adding
// ?error=... if the link had expired or been used already.
export default function VerifyDonePage({ searchParams }: Props) {
  return (
    <AuthShell label="> the shed / confirm">
      <Suspense fallback={<AuthCardSkeleton />}>
        <VerifyDoneContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function VerifyDoneContent({ searchParams }: Props) {
  const { error } = await searchParams;
  if (error) return <VerifyPanel expired />;

  return (
    <>
      <span className="grid size-16 place-items-center rounded-full border border-line bg-raised text-mono">
        <CheckCircleIcon size={28} aria-hidden />
      </span>
      <AuthHeading title="You're in">Your email&apos;s confirmed and you&apos;re signed in.</AuthHeading>
      <LinkButton href="/shed" variant="primary" block>
        Go to the Shed
      </LinkButton>
      <LinkButton href="/shop" variant="ghost" block>
        Back to the shop
      </LinkButton>
    </>
  );
}
