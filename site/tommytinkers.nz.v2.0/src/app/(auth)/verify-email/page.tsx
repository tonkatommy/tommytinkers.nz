import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyPanel } from "@/components/auth/verify-panel";

export const metadata: Metadata = { title: "Check your email" };

// Where sign-up sends you: "I've sent a link", with a way to send it again.
export default function VerifyEmailPage() {
  return (
    <AuthShell label="> the shed / confirm">
      <VerifyPanel />
    </AuthShell>
  );
}
