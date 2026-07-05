"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "./actions";

export default function SignupForm() {
  const [errorMessage, formAction, pending] = useActionState(signup, undefined);

  return (
    <div className="tt-card">
      <form action={formAction} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
          Name
          <input className="tt-input" type="text" name="name" required autoComplete="name" />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
          Email
          <input className="tt-input" type="email" name="email" required autoComplete="email" />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
          Password
          <input
            className="tt-input"
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {errorMessage && (
          <p role="alert" style={{ color: "var(--color-accent-warm, #fb923c)", fontSize: 14, margin: 0 }}>
            {errorMessage}
          </p>
        )}
        <button className="tt-btn tt-btn-primary" type="submit" disabled={pending}>
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: 14 }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
