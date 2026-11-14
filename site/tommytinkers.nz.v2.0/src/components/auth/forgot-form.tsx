"use client";

import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { AuthHeading } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { LinkButton } from "@/components/ui/button";
import { Banner, Field } from "@/components/ui/field";
import { authClient, looksLikeEmail } from "@/lib/auth-client";
import { maskEmail } from "@/lib/safe-redirect";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [tooMany, setTooMany] = useState(false);

  const emailError = tried && !looksLikeEmail(email) ? "That email is missing its ending, like .co.nz" : undefined;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (busy || !looksLikeEmail(email)) return;

    setBusy(true);
    setTooMany(false);
    const { error } = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: "/reset-password" });
    setBusy(false);

    if (error?.status === 429) {
      setTooMany(true);
      return;
    }
    // Any other answer shows the same "sent" screen. Saying "no such
    // account" here would let anyone check who has one.
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <>
        <span className="grid size-16 place-items-center rounded-full border border-line bg-raised">
          <EnvelopeSimpleIcon size={28} aria-hidden />
        </span>
        <AuthHeading title="Check your email">
          If there&apos;s an account for <strong className="text-ink">{maskEmail(sentTo)}</strong>, a reset link is
          on its way. It works for 1 hour.
        </AuthHeading>
        <p className="text-sm text-ink-secondary">
          I say &quot;if&quot; on purpose, so nobody can use this page to find out who has an account.
        </p>
        <LinkButton href="/login" variant="secondary" block>
          Back to sign in
        </LinkButton>
      </>
    );
  }

  return (
    <>
      <AuthHeading title="Forgot your password?">
        No worries. Pop your email in and I&apos;ll send a link to set a new one.
      </AuthHeading>
      {tooMany ? (
        <Banner tone="error" title="One at a time">
          I&apos;ve just sent one. Give it a minute before asking for another.
        </Banner>
      ) : null}
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <Field
          id="forgot-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          error={emailError}
        />
        <SubmitButton busy={busy} busyLabel="Sending">
          Send reset link
        </SubmitButton>
      </form>
      <p className="text-sm text-ink-secondary">
        Remembered it? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
