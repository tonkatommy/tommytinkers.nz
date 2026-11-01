import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    roleName?: string;
    permissions?: string[];
  }

  interface Session {
    user: {
      roleName?: string;
      permissions?: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleName?: string;
    permissions?: string[];
  }
}

// `next-auth/jwt`'s `JWT` type is a re-export of `@auth/core/jwt`'s `JWT` —
// the augmentation has to target the original declaration site to merge correctly.
declare module "@auth/core/jwt" {
  interface JWT {
    roleName?: string;
    permissions?: string[];
  }
}
