"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A main nav link that knows when it is the current section.
 * Client component because only the browser knows the current path without
 * making the whole page render per request.
 */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  // "/shop" is current on /shop and on anything under it, like /shop/some-product.
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className="tt-navlink" aria-current={isCurrent ? "page" : undefined}>
      {children}
    </Link>
  );
}
