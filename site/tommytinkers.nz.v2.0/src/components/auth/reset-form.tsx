"use client";

import { CheckCircleIcon } from "@phosphor-icons/react";
import { type FormEvent, useState } from "react";
import { AuthHeading } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { LinkButton } from "@/components/ui/button";
import { Banner } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { isPasswordOk, passwordChecks } from "@/lib/password";

/** Shown for a reset link that is missing, expired or already used. */
export function ResetExpired() {
  return (
    <>
      <AuthHeading title="That reset link has expired">
        Reset links only work for 1 hour, and only once. Ask for a new one and use it straight away.
      </AuthHeading>
      <LinkButton href="/forgot-password" variant="primary" block>
        Send me a new link
      </LinkButton>
    </>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<"form" | "done" | "expired" | "failed">("form");

  const passwordOk = isPasswordOk(password);
  const mismatch = tried && again !== password;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (busy || !passwordOk || again !== password) return;

    setBusy(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setBusy(false);

    if (!error) setOutcome("done");
    else if (error.code === "INVALID_TOKEN") setOutcome("expired");
    else setOutcome("failed");
  }

  if (outcome === "expired") return <ResetExpired />;

  if (outcome === "done") {
    return (
      <>
        <span className="grid size-16 place-items-center rounded-full border border-line bg-raised text-mono">
          <CheckCircleIcon size={28} aria-hidden />
        </span>
        <AuthHeading title="Password changed">
          Your new password works from now on. To be safe, I&apos;ve signed every device out, so each one will
          need the new password.
        </AuthHeading>
        <LinkButton href="/login" variant="primary" block>
          Sign in
        </LinkButton>
      </>
    );
  }

  return (
    <>
      <AuthHeading title="Set a new password">Make it one you don&apos;t use anywhere else.</AuthHeading>
      {outcome === "failed" ? (
        <Banner tone="error" title="Couldn't save that">
          Something went wrong on my end. Try again in a moment.
        </Banner>
      ) : null}
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <PasswordField
          id="reset-password"
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
          checks={passwordChecks(password)}
          showUnmet={tried}
          aria-invalid={tried && !passwordOk ? true : undefined}
        />
        <PasswordField
          id="reset-password-again"
          label="Type it again"
          autoComplete="new-password"
          value={again}
          onChange={(event) => setAgain(event.target.value)}
          disabled={busy}
          error={mismatch ? "Those two don't match yet." : undefined}
        />
        <SubmitButton busy={busy} busyLabel="Saving">
          Save new password
        </SubmitButton>
      </form>
    </>
  );
}
