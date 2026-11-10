import type { CSSProperties } from "react";

/**
 * The mono prompt label above a section heading, e.g. "> 01. benches".
 * It types itself in as it scrolls into view (CSS only, see .tt-label-type).
 */
export function SectionLabel({ children }: { children: string }) {
  // The typing animation moves in whole-character steps, so the CSS needs
  // to know how many characters there are.
  const style = { "--n": children.length } as CSSProperties;
  return (
    <span className="tt-label">
      <span className="tt-label-type" style={style}>
        {children}
      </span>
    </span>
  );
}
