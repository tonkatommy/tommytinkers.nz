'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/codebench", label: "Codebench" },
  { href: "/shed", label: "The Shed" },
];

export default function Nav() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tt-theme-v1") as "dark" | "light" | null;
    if (stored) setTheme(stored);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("tt-theme-v1", next); } catch {}
  }

  return (
    <nav className="tt-nav">
      <div className="tt-container">
        <div className="tt-nav-inner">
          <Link href="/" className="tt-brand" style={{ textDecoration: "none" }}>
            <Image src="/assets/logo.png" alt="TT Logo" width={36} height={36} style={{ borderRadius: "50%" }} />
            <span className="tt-brand-text">
              Tommy Tinkers<span className="nz">.nz</span>
            </span>
          </Link>

          <div className="tt-nav-links">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`tt-nav-link${pathname === l.href ? " active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="tt-nav-actions">
            <button
              className="tt-icon-btn"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              className="tt-icon-btn"
              aria-label={`Cart (${count} items)`}
              onClick={openCart}
            >
              <ShoppingBag size={16} />
              {count > 0 && <span className="tt-cart-badge">{count}</span>}
            </button>

            <Link href="/codebench" className="tt-cta-pill tt-desktop-only">
              Hire Me <ArrowRight size={14} />
            </Link>

            <button
              className="tt-icon-btn"
              aria-label="Menu"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: "none" }}
              id="tt-mobile-menu-btn"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          #tt-mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>

      {menuOpen && (
        <div style={{
          position: "absolute", top: "64px", left: 0, right: 0,
          background: "var(--color-bg-overlay)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border-subtle)",
          padding: "12px 0", zIndex: 99,
        }}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`tt-nav-link${pathname === l.href ? " active" : ""}`}
              style={{ display: "block", padding: "12px 24px" }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ padding: "12px 24px" }}>
            <Link href="/codebench" className="tt-cta-pill" onClick={() => setMenuOpen(false)}>
              Hire Me <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
