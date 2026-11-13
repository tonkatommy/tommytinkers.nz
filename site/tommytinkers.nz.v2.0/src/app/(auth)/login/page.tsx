import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCardSkeleton, AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { safeNextPath } from "@/lib/safe-redirect";
import { googleEnabled } from "@/server/auth";
import { getSession } from "@/server/session";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string }> };

// The frame is prerendered. The form waits inside <Suspense> because it
// needs things only a real request has: the address bar and the session.
export default function LoginPage({ searchParams }: Props) {
  return (
    <AuthShell label="> the shed / sign in">
      <Suspense fallback={<AuthCardSkeleton />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function LoginContent({ searchParams }: Props) {
  const next = safeNextPath((await searchParams).next);
  // Already signed in: nothing to do here.
  if (await getSession()) redirect(next);
  return <LoginForm next={next} googleEnabled={googleEnabled} />;
}
