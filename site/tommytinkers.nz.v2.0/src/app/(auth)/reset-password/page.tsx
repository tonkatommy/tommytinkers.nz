import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCardSkeleton, AuthShell } from "@/components/auth/auth-shell";
import { ResetExpired, ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = {
  title: "Set a new password",
  // The address holds a one-time token. Don't let it leak to other sites in
  // the Referer header when a link on this page is followed.
  referrer: "no-referrer",
};

type Props = { searchParams: Promise<{ token?: string; error?: string }> };

// Where the link in the reset email lands. Better Auth checks the token and
// redirects here with ?token=..., or ?error=... if it's no good.
export default function ResetPasswordPage({ searchParams }: Props) {
  return (
    <AuthShell label="> the shed / reset">
      <Suspense fallback={<AuthCardSkeleton />}>
        <ResetContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function ResetContent({ searchParams }: Props) {
  const { token, error } = await searchParams;
  if (error || !token) return <ResetExpired />;
  return <ResetForm token={token} />;
}
