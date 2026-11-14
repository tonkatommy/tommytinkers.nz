import { EnvelopeSimpleIcon, GithubLogoIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Brand } from "@/components/shell/brand";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { buttonClass } from "@/components/ui/button";

// Some of these pages arrive in later phases; until then they show the
// "page not found" screen. There is no "Case studies" link on purpose: it
// comes back when there are real ones to show.
const columns = [
  {
    id: "footer-shop",
    title: "Shop",
    links: [
      { href: "/shop", label: "Everything" },
      { href: "/shop?category=stickers", label: "Stickers & decals" },
      { href: "/shop?category=rc-parts", label: "RC car parts" },
      { href: "/shop?category=toys", label: "Kids' toys" },
      { href: "/shop?category=household", label: "Household" },
    ],
  },
  {
    id: "footer-codebench",
    title: "Codebench",
    links: [
      { href: "/codebench#services", label: "Services" },
      { href: "/codebench#plan", label: "Plan a build" },
    ],
  },
  {
    id: "footer-shed",
    title: "The Shed",
    links: [
      { href: "/shed", label: "Pinboard" },
      { href: "/shed/workshop", label: "Workshop" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    id: "footer-help",
    title: "Help",
    links: [
      { href: "/orders/find", label: "Find my order" },
      { href: "/terms", label: "Terms" },
      { href: "/terms#returns", label: "Returns and refunds" },
      { href: "/privacy", label: "Privacy" },
      { href: "/house-rules", label: "House rules" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line-subtle bg-canvas">
      <div className="tt-container flex flex-col gap-10 pt-12 pb-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div className="flex max-w-xs flex-col gap-3">
            <Brand />
            <span className="tt-eyebrow">Maker of things</span>
            <p className="text-sm text-ink-secondary">
              A one-person workshop in Helensville, New Zealand. Code on one bench, stickers and prints on the
              other.
            </p>
            <a
              href="mailto:hello@tommytinkers.nz"
              className="inline-flex min-h-11 items-center gap-2 self-start text-[15px]"
            >
              <EnvelopeSimpleIcon size={20} aria-hidden />
              hello@tommytinkers.nz
            </a>
          </div>

          {columns.map((column) => (
            // Each column is its own labelled <nav>, so a screen reader can
            // jump straight to "Help" or "Shop".
            <nav key={column.id} aria-labelledby={column.id}>
              <h2 id={column.id} className="tt-eyebrow mb-3 text-ink-secondary">
                {column.title}
              </h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-[15px] text-ink no-underline hover:text-accent-hover hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-subtle pt-6">
          <p className="text-sm text-ink-secondary">&copy; tommy tinkers NZ. Prices in NZD.</p>
          <div className="flex items-center gap-1">
            <a
              href="https://github.com/tonkatommy/tommytinkers.nz"
              className={buttonClass({ variant: "ghost", iconOnly: true })}
              aria-label="tommy tinkers NZ on GitHub"
              rel="noopener noreferrer"
            >
              <GithubLogoIcon size={20} aria-hidden />
            </a>
            <ThemeToggle variant="labelled" />
          </div>
        </div>
      </div>
    </footer>
  );
}
