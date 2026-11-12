import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCardSkeleton, AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { googleEnabled } from "@/server/auth";
import { getSession } from "@/server/session";

export const metadata: Metadata = { title: "Create a free account" };

export default function SignupPage() {
  return (
    <AuthShell label="> the shed / sign up">
      <Suspense fallback={<AuthCardSkeleton />}>
        <SignupContent />
      </Suspense>
    </AuthShell>
  );
}

async function SignupContent() {
  if (await getSession()) redirect("/");
  // Read at request time (after getSession), so the key comes from the
  // running server's environment, not from whatever was set during the build.
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || null;
  return <SignupForm googleEnabled={googleEnabled} turnstileSiteKey={turnstileSiteKey} />;
}
