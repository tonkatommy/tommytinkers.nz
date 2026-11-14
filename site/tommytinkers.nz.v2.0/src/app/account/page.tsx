import type { Metadata } from "next";
import { Suspense } from "react";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Account settings" };

// A holding page: it proves the sign-in gate works. The full settings screen
// (profile, security, emails, your data, delete account) replaces it in the
// next PR.
export default function AccountPage() {
  return (
    <div className="tt-container flex flex-1 flex-col gap-6 py-12">
      <h1 className="text-3xl font-semibold md:text-4xl">Account settings</h1>
      <Suspense fallback={<div className="tt-skel h-24 w-full max-w-[560px] rounded-xl" aria-busy="true" />}>
        <AccountSummary />
      </Suspense>
    </div>
  );
}

async function AccountSummary() {
  // The real gate. src/proxy.ts already turned away visitors with no session
  // cookie, but only this check looks the session up.
  const user = await requireUser("/account");

  return (
    <section className="tt-card flex max-w-[560px] flex-col gap-4">
      <p>
        Signed in as <strong>{user.name}</strong> ({user.email}).
      </p>
      <p className="text-sm text-ink-secondary">
        Profile, password and email settings are on their way. For now you can sign out here.
      </p>
      <form action={signOutAction}>
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </section>
  );
}
