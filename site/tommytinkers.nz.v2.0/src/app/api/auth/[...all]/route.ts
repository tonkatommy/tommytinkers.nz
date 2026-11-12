import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth";

// Every Better Auth endpoint lives under /api/auth: sign-in, sign-up,
// sign-out, the email verification and reset links, and the Google callback.
// The rules they follow are in src/server/auth.ts.
export const { GET, POST } = toNextJsHandler(auth);
