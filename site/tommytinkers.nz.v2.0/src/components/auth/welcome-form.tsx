"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type WelcomeState, completeWelcomeAction } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field, FieldError } from "@/components/ui/field";

/**
 * The one-step finish for an account made with Google. Unlike the other
 * account forms this one is a server action: it changes our own data (not
 * Better Auth's), and useActionState gives it working validation even
 * before the page's JavaScript has loaded.
 */
export function WelcomeForm({ suggestedName, next }: { suggestedName: string; next: string }) {
  const [state, formAction, pending] = useActionState<WelcomeState, FormData>(completeWelcomeAction, {});

  return (
    <form className="flex flex-col gap-4" noValidate action={formAction}>
      <input type="hidden" name="next" value={next} />
      <Field
        id="welcome-name"
        name="name"
        label="Display name"
        autoComplete="nickname"
        maxLength={40}
        defaultValue={state.name ?? suggestedName}
        error={state.errors?.name}
        help="This is what other members see. You can change it later."
      />
      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="agree"
            className="mt-0.5 size-5 flex-none accent-(--color-accent)"
            aria-invalid={state.errors?.agree ? true : undefined}
            aria-describedby={state.errors?.agree ? "welcome-agree-error" : undefined}
          />
          <span>
            I&apos;m 13 or older, and I&apos;ve read the <Link href="/house-rules">house rules</Link> and the{" "}
            <Link href="/privacy">privacy policy</Link>.
          </span>
        </label>
        {state.errors?.agree ? <FieldError id="welcome-agree-error">{state.errors.agree}</FieldError> : null}
      </div>
      <SubmitButton busy={pending} busyLabel="Saving">
        Finish setting up
      </SubmitButton>
    </form>
  );
}
