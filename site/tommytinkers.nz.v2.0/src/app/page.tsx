import { WrenchIcon } from "@phosphor-icons/react/ssr";

// Phase 0 placeholder: proves the shell, fonts, tokens and icons work end to
// end. The real home page is ported from the prototype in Phase 1.
export default function HomePage() {
  return (
    <main className="tt-container" style={{ paddingBlock: "var(--space-24)" }}>
      <p className="mono-label">$ make ideas</p>
      <p className="eyebrow" style={{ marginTop: "var(--space-4)" }}>
        Maker of things
      </p>
      <h1 style={{ marginTop: "var(--space-2)", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <WrenchIcon size={48} weight="duotone" aria-hidden />
        v2 is on the bench
      </h1>
      <p style={{ marginTop: "var(--space-6)", color: "var(--color-text-secondary)", maxWidth: "60ch" }}>
        I&apos;m rebuilding tommytinkers.nz. The shop, Codebench and The Shed are coming back soon.
      </p>
    </main>
  );
}
