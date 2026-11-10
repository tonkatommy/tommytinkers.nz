import { CaretRightIcon, SignInIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { AccountMenu } from "@/components/shell/account-menu";
import { Brand } from "@/components/shell/brand";
import { CartButton } from "@/components/shell/cart-button";
import { MobileMenu } from "@/components/shell/mobile-menu";
import { NavLink } from "@/components/shell/nav-link";
import { NavShell } from "@/components/shell/nav-shell";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { LinkButton } from "@/components/ui/button";

const mobileLink =
  "flex min-h-14 items-center justify-between border-b border-line-subtle px-1 text-xl font-semibold text-ink no-underline hover:text-ink";
const mobileSubLink =
  "flex min-h-12 items-center border-b border-line-subtle pr-1 pl-5 font-medium text-ink-secondary no-underline hover:text-ink";

/**
 * The site nav. A server component: only the pieces that react to the
 * visitor (scroll, menus, theme, cart) are client components inside it.
 *
 * Below 1024px the links, theme toggle and account links move into the
 * mobile menu. The cart stays in the bar so it is always one tap away.
 */
export function SiteNav() {
  return (
    <NavShell>
      <div className="tt-container flex h-full items-center gap-6">
        <Brand />

        <nav aria-label="Main" className="hidden items-center gap-2 lg:flex">
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/codebench">Codebench</NavLink>
          <NavLink href="/shed">The Shed</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="hidden items-center gap-1 lg:flex">
            <ThemeToggle variant="icon" />
            <AccountMenu />
          </div>
          <CartButton />
          <MobileMenu>
            <Link href="/shop" className={mobileLink}>
              Shop
              <CaretRightIcon size={20} aria-hidden className="text-ink-secondary" />
            </Link>
            <Link href="/codebench" className={mobileLink}>
              Codebench
              <CaretRightIcon size={20} aria-hidden className="text-ink-secondary" />
            </Link>
            <Link href="/shed" className={mobileLink}>
              The Shed
              <CaretRightIcon size={20} aria-hidden className="text-ink-secondary" />
            </Link>
            <Link href="/shed" className={mobileSubLink}>
              Pinboard
            </Link>
            <Link href="/shed/workshop" className={mobileSubLink}>
              Workshop
            </Link>
            <Link href="/contact" className={mobileLink}>
              Contact
              <CaretRightIcon size={20} aria-hidden className="text-ink-secondary" />
            </Link>

            <div className="flex items-center justify-between gap-4 px-1 py-4">
              <span className="text-sm text-ink-secondary">Theme</span>
              <ThemeToggle variant="labelled" look="secondary" />
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <LinkButton href="/login" variant="primary" block>
                <SignInIcon size={20} aria-hidden />
                Sign in
              </LinkButton>
              <LinkButton href="/signup" variant="secondary" block>
                Create a free account
              </LinkButton>
            </div>
          </MobileMenu>
        </div>
      </div>
    </NavShell>
  );
}
