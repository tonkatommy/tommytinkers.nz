import NextAuth from "next-auth";
import authConfig from "../auth.config";
import { PERMISSIONS } from "@/lib/auth/permissions";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!req.auth) {
      const url = new URL("/login", req.nextUrl);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return Response.redirect(url);
    }
    const perms = req.auth.user?.permissions ?? [];
    if (!perms.includes(PERMISSIONS.ACCESS_ADMIN)) {
      return Response.redirect(new URL("/", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
