"use client";

import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { type FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { AuthHeading } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { buttonClass } from "@/components/ui/button";
import { Banner, Field } from "@/components/ui/field";
import { VERIFY_DONE_PATH, authClient, looksLikeEmail, readPendingEmail, rememberPendingEmail } from "@/lib/auth-client";
import { maskEmail } from "@/lib/safe-redirect";

// The server allows one "send it again" a minute, so the button waits too.
const COOLDOWN_SECONDS = 60;

// sessionStorage doesn't change by itself, so there is nothing to subscribe to.
const subscribeToNothing = () => () => {};

type VerifyPanelProps = {
  /** True when the link they followed had expired or was already used. */
  expired?: boolean;
};

/**
 * "Check your email", with a way to send the link again. Also the screen for
 * an expired link, which asks for the address and sends a fresh one.
 */
export function VerifyPanel({ expired = false }: VerifyPanelProps) {
  // The address they signed up with, remembered for this tab. The server
  // can't see sessionStorage, so it renders as if there were none.
  const pendingEmail = useSyncExternalStore(subscribeToNothing, readPendingEmail, () => "");
  const [typedEmail, setTypedEmail] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sentAgain, setSentAgain] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const cooling = cooldown > 0;
  useEffect(() => {
    if (!cooling) return;
    const timer = setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooling]);

  async function send(email: string) {
    setBusy(true);
    // The answer is the same whether or not the address has an account, so
    // there's nothing to branch on. A failure just means "try again".
    await authClient.sendVerificationEmail({ email, callbackURL: VERIFY_DONE_PATH });
    setBusy(false);
    setSentAgain(true);
    setCooldown(COOLDOWN_SECONDS);
  }

  // Know the address and the link is still good: the simple screen.
  if (pendingEmail && !expired) {
    return (
      <>
        <span className="grid size-16 place-items-center rounded-full border border-line bg-raised">
          <EnvelopeSimpleIcon size={28} aria-hidden />
        </span>
        <AuthHeading title="Check your email">
          I&apos;ve sent a link to <strong className="text-ink">{maskEmail(pendingEmail)}</strong>. Click it to
          finish setting up your account. It works for 24 hours.
        </AuthHeading>
        {sentAgain ? (
          <Banner tone="success" title="Sent again">
            If it&apos;s not there in a few minutes, check your spam folder.
          </Banner>
        ) : null}
        <button
          type="button"
          className={buttonClass({ variant: "secondary", block: true })}
          disabled={cooling || busy}
          onClick={() => send(pendingEmail)}
        >
          {cooling ? `Send it again in 0:${String(cooldown).padStart(2, "0")}` : "Send it again"}
        </button>
        <p className="text-sm text-ink-secondary">
          Wrong email? <Link href="/signup">Go back and fix it</Link>
        </p>
      </>
    );
  }

  // Otherwise ask for the address: an expired link, or a fresh tab.
  const emailError = tried && !looksLikeEmail(typedEmail) ? "That email is missing its ending, like .co.nz" : undefined;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (busy || cooling || !looksLikeEmail(typedEmail)) return;
    rememberPendingEmail(typedEmail.trim());
    void send(typedEmail.trim());
  }

  return (
    <>
      <AuthHeading title={expired ? "That link has expired" : "Confirm your email"}>
        {expired
          ? "Links only work for 24 hours, and only once. Pop your email in and I'll send a fresh one."
          : "Pop your email in and I'll send you a link to confirm it."}
      </AuthHeading>
      {sentAgain ? (
        <Banner tone="success" title="On its way">
          If that address has an account waiting, a new link is in its inbox. Check spam if it&apos;s not there in
          a few minutes.
        </Banner>
      ) : null}
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <Field
          id="verify-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={typedEmail}
          onChange={(event) => setTypedEmail(event.target.value)}
          disabled={busy}
          error={emailError}
        />
        <SubmitButton busy={busy} busyLabel="Sending">
          {cooling ? `Send another in 0:${String(cooldown).padStart(2, "0")}` : "Send a new link"}
        </SubmitButton>
      </form>
      <p className="text-sm text-ink-secondary">
        <Link href="/login">Back to sign in</Link>
      </p>
    </>
  );
}
