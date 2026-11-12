"use client";

import { GoogleLogoIcon, LockSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { signInStatusAction } from "@/app/(auth)/actions";
import { AuthHeading, OrDivider } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { Banner, Field } from "@/components/ui/field";
import { authClient, looksLikeEmail, rememberPendingEmail } from "@/lib/auth-client";
import { LOCK_MINUTES, MAX_FAILURES } from "@/lib/sign-in-throttle";

type Problem =
  | { kind: "wrong"; triesLeft: number }
  | { kind: "busy-site" } // rate limited
  | { kind: "failed" }; // network or server trouble

function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function LoginForm({ next, googleEnabled }: { next: string; googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Field errors only show after the first attempt to submit.
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  // Seconds until sign-in opens again. Above 0 shows the "paused" screen.
  const [lockSeconds, setLockSeconds] = useState(0);

  const locked = lockSeconds > 0;
  useEffect(() => {
    if (!locked) return;
    const timer = setInterval(() => setLockSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [locked]);

  const emailError = tried && !looksLikeEmail(email) ? "Pop your email in here." : undefined;
  const passwordError = tried && !password ? "And your password." : undefined;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setTried(true);
    if (!looksLikeEmail(email) || !password) return;

    setBusy(true);
    setProblem(null);
    const { error } = await authClient.signIn.email({ email: email.trim(), password });

    if (!error) {
      // A full page load, not a client-side navigation: the whole shell
      // (nav menus, anything cached for a signed-out visitor) starts fresh.
      window.location.assign(next);
      return;
    }

    if (error.code === "EMAIL_NOT_VERIFIED") {
      // Right password, email not confirmed yet. A fresh link was just sent.
      rememberPendingEmail(email.trim());
      router.push("/verify-email");
      return;
    }

    if (error.code === "INVALID_EMAIL_OR_PASSWORD" || error.code === "SIGN_IN_PAUSED") {
      const status = await signInStatusAction(email);
      if (status.locked) setLockSeconds(status.secondsLeft);
      else setProblem({ kind: "wrong", triesLeft: status.triesLeft });
      setPassword("");
    } else if (error.status === 429) {
      setProblem({ kind: "busy-site" });
    } else {
      setProblem({ kind: "failed" });
    }
    setBusy(false);
  }

  if (locked) {
    return (
      <>
        <span className="grid size-16 place-items-center rounded-full border border-line bg-raised">
          <LockSimpleIcon size={28} aria-hidden />
        </span>
        <AuthHeading title="Sign-in paused">
          That&apos;s {MAX_FAILURES} wrong passwords in a row, so I&apos;ve paused sign-in for this account for{" "}
          {LOCK_MINUTES} minutes. It keeps guessers out.
        </AuthHeading>
        <p className="flex items-baseline gap-3">
          {/* The ticking number is hidden from screen readers (it would be
              read every second); they get one plain sentence instead. */}
          <span aria-hidden className="font-display text-4xl font-semibold tracking-widest">
            {formatCountdown(lockSeconds)}
          </span>
          <span aria-hidden className="text-sm text-ink-secondary">
            until you can try again
          </span>
          <span className="sr-only">
            About {Math.max(1, Math.ceil(lockSeconds / 60))} minutes until you can try again.
          </span>
        </p>
        <LinkButton href="/forgot-password" variant="primary" block>
          Reset my password instead
        </LinkButton>
        <LinkButton href="/" variant="ghost" block>
          Back to the home page
        </LinkButton>
        <p className="text-sm text-ink-secondary">
          Wasn&apos;t you? Nobody got in. If it keeps happening, reset your password and{" "}
          <Link href="/contact">let me know</Link>.
        </p>
      </>
    );
  }

  return (
    <>
      <AuthHeading title="Welcome back">Sign in to post in the Shed and see your orders.</AuthHeading>

      {problem?.kind === "wrong" ? (
        <Banner tone="error" title="That email and password don't match">
          {problem.triesLeft === 1
            ? `One more wrong try and sign-in pauses for ${LOCK_MINUTES} minutes.`
            : `You've got ${problem.triesLeft} tries left before sign-in pauses for ${LOCK_MINUTES} minutes.`}
        </Banner>
      ) : null}
      {problem?.kind === "busy-site" ? (
        <Banner tone="error" title="That's a lot of tries">
          Give it a minute, then have another go.
        </Banner>
      ) : null}
      {problem?.kind === "failed" ? (
        <Banner tone="error" title="Couldn't sign you in">
          Something went wrong on my end. Check your connection and try again.
        </Banner>
      ) : null}

      {googleEnabled ? (
        <>
          <button
            type="button"
            className={buttonClass({ variant: "secondary", block: true })}
            onClick={() =>
              authClient.signIn.social({ provider: "google", callbackURL: next, newUserCallbackURL: "/welcome" })
            }
          >
            <GoogleLogoIcon size={20} aria-hidden />
            Continue with Google
          </button>
          <OrDivider>or use your email</OrDivider>
        </>
      ) : null}

      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <Field
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          error={emailError}
        />
        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
          error={passwordError}
          labelAside={
            <Link href="/forgot-password" className="text-sm">
              Forgot your password?
            </Link>
          }
        />
        <SubmitButton busy={busy} busyLabel="Signing in">
          Sign in
        </SubmitButton>
      </form>

      <p className="text-sm text-ink-secondary">
        New here? <Link href="/signup">Create a free account</Link>
      </p>
    </>
  );
}
