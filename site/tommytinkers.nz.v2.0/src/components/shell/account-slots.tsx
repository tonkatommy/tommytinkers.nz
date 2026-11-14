import { GearSixIcon, SignInIcon, SignOutIcon, UserCircleIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { signOutAction } from "@/app/(auth)/actions";
import { AccountMenu, type MenuUser } from "@/components/shell/account-menu";
import { LinkButton, buttonClass } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/server/session";

// The two places the nav changes when someone is signed in: the desktop
// account menu and the bottom of the mobile menu.
//
// Both read the session, which only a real request has. The nav wraps each
// in <Suspense>, so the rest of the page is still prerendered and these
// stream in a moment later.

async function getMenuUser(): Promise<MenuUser | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    return { name: user.name, email: user.email, isAdmin: hasPermission(user.permissions, "access_admin") };
  } catch {
    // The nav is on every page, including the error page. If the database is
    // down it shows the signed-out menu rather than taking the page with it.
    return null;
  }
}

export async function AccountMenuSlot() {
  return <AccountMenu user={await getMenuUser()} />;
}

/** Holds the menu's place while the session is looked up. */
export function AccountMenuFallback() {
  return (
    <span className={buttonClass({ variant: "ghost", iconOnly: true })} aria-hidden>
      <UserCircleIcon size={20} />
    </span>
  );
}

const mobileItem =
  "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-ink no-underline hover:bg-raised hover:text-ink";

export async function MobileAccountSlot() {
  const user = await getMenuUser();

  if (!user) {
    return (
      <div className="mt-2 flex flex-col gap-3">
        <LinkButton href="/login" variant="primary" block>
          <SignInIcon size={20} aria-hidden />
          Sign in
        </LinkButton>
        <LinkButton href="/signup" variant="secondary" block>
          Create a free account
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-1">
      <span className="tt-eyebrow px-1 py-2">Signed in as {user.name}</span>
      <Link href="/account" className={mobileItem}>
        <GearSixIcon size={20} aria-hidden className="text-ink-secondary" />
        Account settings
      </Link>
      <form action={signOutAction}>
        <button type="submit" className={mobileItem}>
          <SignOutIcon size={20} aria-hidden className="text-ink-secondary" />
          Sign out
        </button>
      </form>
    </div>
  );
}
