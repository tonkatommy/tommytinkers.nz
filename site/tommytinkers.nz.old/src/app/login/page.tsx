import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="tt-section">
      <div className="tt-container" style={{ maxWidth: 420 }}>
        <div className="tt-section-header">
          <span className="tt-section-eyebrow">&gt; account</span>
          <h1 className="tt-section-title">Log in</h1>
          <p className="tt-section-sub">Access your account.</p>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
