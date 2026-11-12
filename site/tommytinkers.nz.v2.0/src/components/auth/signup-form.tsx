"use client";

import { GoogleLogoIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthHeading, OrDivider } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { Turnstile } from "@/components/auth/turnstile";
import { buttonClass } from "@/components/ui/button";
import { Banner, Field, FieldError } from "@/components/ui/field";
import { VERIFY_DONE_PATH, authClient, looksLikeEmail, rememberPendingEmail } from "@/lib/auth-client";
import { isPasswordOk, passwordChecks } from "@/lib/password";

type SignupFormProps = {
  googleEnabled: boolean;
  /** Null when Turnstile isn't set up (local dev, tests). */
  turnstileSiteKey: string | null;
};

export function SignupForm({ googleEnabled, turnstileSiteKey }: SignupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const nameError = tried && !name.trim() ? "Pick a name other members will see." : undefined;
  const emailError = tried && !looksLikeEmail(email) ? "That email is missing its ending, like .co.nz" : undefined;
  const passwordOk = isPasswordOk(password, email);
  const agreeError = tried && !agree;
  const anyError = Boolean(nameError || emailError || (tried && !passwordOk) || agreeError);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setTried(true);
    setFailure(null);
    if (!name.trim() || !looksLikeEmail(email) || !passwordOk || !agree) return;
    if (turnstileSiteKey && !captchaToken) {
      setFailure("The quick human check hasn't finished yet. Give it a second and try again.");
      return;
    }

    setBusy(true);
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      // Only means "the box is ticked". The server saves its own time.
      ageConfirmedAt: new Date(),
      callbackURL: VERIFY_DONE_PATH,
      fetchOptions: turnstileSiteKey ? { headers: { "x-captcha-response": captchaToken } } : undefined,
    });

    if (!error) {
      rememberPendingEmail(email.trim());
      router.push("/verify-email");
      return;
    }

    setFailure(
      error.status === 429
        ? "That's a lot of sign-ups from one place. Give it a few minutes."
        : error.code === "WEAK_PASSWORD"
          ? "That password doesn't meet the rules below yet."
          : "Something went wrong on my end. Check your connection and try again.",
    );
    setBusy(false);
  }

  return (
    <>
      <AuthHeading title="Pull up a stool">
        A free account lets you pin to the Pinboard, post in the Workshop and keep track of your orders.
      </AuthHeading>

      {failure ? (
        <Banner tone="error" title="Couldn't set you up">
          {failure}
        </Banner>
      ) : anyError ? (
        <Banner tone="error" title="A few things to sort before I can set you up">
          They&apos;re marked below.
        </Banner>
      ) : null}

      {googleEnabled ? (
        <>
          <button
            type="button"
            className={buttonClass({ variant: "secondary", block: true })}
            // A new Google account lands on /welcome, which has the same
            // 13-or-older tick box as this form.
            onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/", newUserCallbackURL: "/welcome" })}
          >
            <GoogleLogoIcon size={20} aria-hidden />
            Sign up with Google
          </button>
          <OrDivider>or use your email</OrDivider>
        </>
      ) : null}

      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <Field
          id="signup-name"
          label="Display name"
          autoComplete="nickname"
          maxLength={40}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
          error={nameError}
          help="This is what other members see. You can change it later."
        />
        <Field
          id="signup-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          error={emailError}
        />
        <PasswordField
          id="signup-password"
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
          checks={passwordChecks(password, email)}
          showUnmet={tried}
          aria-invalid={tried && !passwordOk ? true : undefined}
        />

        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-5 flex-none accent-(--color-accent)"
              checked={agree}
              onChange={(event) => setAgree(event.target.checked)}
              disabled={busy}
              aria-invalid={agreeError ? true : undefined}
              aria-describedby={agreeError ? "signup-agree-error" : undefined}
            />
            <span>
              I&apos;m 13 or older, and I&apos;ve read the <Link href="/house-rules">house rules</Link> and the{" "}
              <Link href="/privacy">privacy policy</Link>.
            </span>
          </label>
          {agreeError ? (
            <FieldError id="signup-agree-error">
              Tick this to carry on. Shed accounts are for people 13 and over.
            </FieldError>
          ) : null}
        </div>

        {turnstileSiteKey ? <Turnstile siteKey={turnstileSiteKey} onToken={setCaptchaToken} /> : null}

        <SubmitButton busy={busy} busyLabel="Setting you up">
          Create my account
        </SubmitButton>
      </form>

      <p className="text-sm text-ink-secondary">
        Already got one? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
