import { requireSession } from "@/lib/auth/require-permission";
import { prisma } from "@/lib/prisma";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function AccountPage() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { accounts: { select: { provider: true } } },
  });

  return (
    <div className="tt-section">
      <div className="tt-container" style={{ maxWidth: 480 }}>
        <div className="tt-section-header">
          <span className="tt-section-eyebrow">&gt; account</span>
          <h1 className="tt-section-title">My account</h1>
        </div>

        <div className="tt-card" style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, color: "var(--color-text-secondary)" }}>Name</p>
          <p style={{ margin: "0 0 16px" }}>{user.name ?? "—"}</p>
          <p style={{ margin: "0 0 4px", fontSize: 14, color: "var(--color-text-secondary)" }}>Email</p>
          <p style={{ margin: 0 }}>{user.email}</p>
          {user.accounts.length > 0 && (
            <>
              <p style={{ margin: "16px 0 4px", fontSize: 14, color: "var(--color-text-secondary)" }}>Linked accounts</p>
              <p style={{ margin: 0, textTransform: "capitalize" }}>
                {user.accounts.map((a) => a.provider).join(", ")}
              </p>
            </>
          )}
        </div>

        <div className="tt-card">
          <h2 style={{ marginTop: 0, fontSize: 18 }}>
            {user.passwordHash ? "Change password" : "Set a password"}
          </h2>
          <ChangePasswordForm hasPassword={!!user.passwordHash} />
        </div>
      </div>
    </div>
  );
}
