import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="tt-section">
      <div className="tt-container" style={{ maxWidth: 420 }}>
        <div className="tt-section-header">
          <span className="tt-section-eyebrow">&gt; account</span>
          <h1 className="tt-section-title">Sign up</h1>
          <p className="tt-section-sub">Create an account.</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
