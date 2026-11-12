import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCardSkeleton, AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import { WelcomeForm } from "@/components/auth/welcome-form";
import { safeNextPath } from "@/lib/safe-redirect";
import { getCurrentUser } from "@/server/session";

export const metadata: Metadata = { title: "One last thing" };

type Props = { searchParams: Promise<{ next?: string }> };

// The finish line for an account made with Google. Google creates the account
// before anyone has seen the "13 or older" tick box, so it gets asked here.
export default function WelcomePage({ searchParams }: Props) {
  return (
    <AuthShell label="> the shed / welcome">
      <Suspense fallback={<AuthCardSkeleton />}>
        <WelcomeContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function WelcomeContent({ searchParams }: Props) {
  const next = safeNextPath((await searchParams).next);
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Already done: this page has nothing to ask.
  if (user.ageConfirmedAt) redirect(next);

  return (
    <>
      <AuthHeading title="One last thing">
        You&apos;re signed in as {user.email}. Pick the name other members will see, and tick the box below.
      </AuthHeading>
      <WelcomeForm suggestedName={user.name} next={next} />
    </>
  );
}
