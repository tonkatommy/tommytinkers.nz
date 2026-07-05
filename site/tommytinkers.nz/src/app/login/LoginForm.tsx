"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authenticate, googleLogin } from "./actions";

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [errorMessage, formAction, pending] = useActionState(authenticate, undefined);

  return (
    <div className="tt-card">
      <form action={formAction} style={{ display: "grid", gap: 12 }}>
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
        <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
          Email
          <input className="tt-input" type="email" name="email" required autoComplete="email" />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
          Password
          <input className="tt-input" type="password" name="password" required autoComplete="current-password" />
        </label>
        {errorMessage && (
          <p role="alert" style={{ color: "var(--color-accent-warm, #fb923c)", fontSize: 14, margin: 0 }}>
            {errorMessage}
          </p>
        )}
        <button className="tt-btn tt-btn-primary" type="submit" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <form action={googleLogin} style={{ marginTop: 12 }}>
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
        <button className="tt-btn tt-btn-ghost" type="submit" style={{ width: "100%" }}>
          Continue with Google
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: 14 }}>
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}
