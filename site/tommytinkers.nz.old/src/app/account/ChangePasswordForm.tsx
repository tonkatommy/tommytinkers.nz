"use client";

import { useActionState } from "react";
import { changePassword } from "./actions";

export default function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [message, formAction, pending] = useActionState(changePassword, undefined);

  return (
    <form action={formAction} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      {hasPassword && (
        <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
          Current password
          <input className="tt-input" type="password" name="currentPassword" required autoComplete="current-password" />
        </label>
      )}
      <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
        {hasPassword ? "New password" : "Set a password"}
        <input className="tt-input" type="password" name="newPassword" required minLength={8} autoComplete="new-password" />
      </label>
      {message && (
        <p role="status" style={{ fontSize: 14, margin: 0 }}>
          {message}
        </p>
      )}
      <button className="tt-btn tt-btn-primary" type="submit" disabled={pending} style={{ justifySelf: "start" }}>
        {pending ? "Saving…" : hasPassword ? "Update password" : "Set password"}
      </button>
    </form>
  );
}
