import type { ReactNode } from "react";

type StateCardProps = {
  /** A 24px Phosphor icon. It is decoration, so pass it with aria-hidden. */
  icon: ReactNode;
  title: string;
  children: ReactNode;
  /** Buttons or links offered as the way forward. */
  actions?: ReactNode;
  /** "error" announces itself to screen readers and gets a red border. */
  tone?: "neutral" | "error";
};

/**
 * One centred message card. Used wherever a list has nothing to show:
 * empty, failed to load, page not found.
 */
export function StateCard({ icon, title, children, actions, tone = "neutral" }: StateCardProps) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : undefined}
      className={`tt-card flex flex-col items-center gap-3 px-8 py-12 text-center ${isError ? "border-error" : ""}`}
    >
      <span
        className={`grid size-14 place-items-center rounded-full bg-raised ${isError ? "text-error" : "text-ink-secondary"}`}
      >
        {icon}
      </span>
      {/* Words carry the meaning; in light mode error red fails contrast on
          cream, so the text stays ink and only the icon is red. */}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="max-w-[360px] text-sm text-ink-secondary">{children}</p>
      {actions ? <div className="flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
