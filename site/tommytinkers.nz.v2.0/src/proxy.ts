import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// The first, cheap gate (Next 16 calls this file "proxy"; it used to be
// "middleware"). It runs before the page and only asks one thing: is there a
// session cookie at all? No database, so it's fast.
//
// THIS IS NOT SECURITY. A cookie can be made up. It just saves a signed-out
// visitor from loading a page that would redirect them anyway. The real
// check is requireUser() / requirePermission() in src/server/session.ts,
// which every protected page and server action calls.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const login = new URL("/login", request.url);
  // Come back to where they were headed once signed in.
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
