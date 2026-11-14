// Better Auth: accounts, sessions, email verification and password reset.
//
// Everything a browser can do to an account goes through the endpoints this
// creates under /api/auth (see src/app/api/auth/[...all]/route.ts). Those
// endpoints are public, so every rule that matters is enforced HERE, in
// hooks that run on the server for every request, never only in a form:
//   - the password rules
//   - the 5-tries, 15-minute sign-in lockout
//   - the bot check on sign-up
//   - when the "13 or older" box was ticked
import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { captcha } from "better-auth/plugins";
import { isPasswordOk } from "@/lib/password";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";
import { beginSignInAttempt, clearSignInAttempts } from "@/server/sign-in-throttle";

const DAY = 60 * 60 * 24;
const HOUR = 60 * 60;

// Optional pieces switch on when their keys are present, so the app still
// builds and runs (and tests pass) on a machine with no keys at all.
const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

export const googleEnabled = Boolean(googleId && googleSecret);

export const auth = betterAuth({
  appName: "tommy tinkers NZ",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),

  user: {
    // Our own columns on User. `input: false` means a browser can never set
    // them through sign-up or update-user; only server code can.
    additionalFields: {
      roleId: { type: "string", required: false, input: false },
      // `input: true` only so sign-up can say "the box was ticked". The value
      // sent is thrown away and replaced with the server's clock below.
      ageConfirmedAt: { type: "date", required: false, input: true },
      town: { type: "string", required: false, input: false },
      bio: { type: "string", required: false, input: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    // No session until the email is confirmed. This also makes sign-up answer
    // the same way for a new and an already-used address, so it can't be used
    // to find out who has an account.
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: HOUR,
    // A reset usually means "someone might know my old password", so every
    // device is signed out and has to use the new one.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Set a new password for tommy tinkers NZ",
        text: `Hi ${user.name},\n\nSomeone asked to reset the password for your tommy tinkers NZ account. If that was you, use the link below. It works for 1 hour, and only once.\n\nIf it wasn't you, ignore this email. Your password stays as it is.`,
        action: { label: "Set a new password", url },
      });
    },
    // Someone signed up with an address that already has an account. The
    // page says "check your email" either way; this is the email they get.
    onExistingUserSignUp: async ({ user }) => {
      await sendEmail({
        to: user.email,
        subject: "You already have a tommy tinkers NZ account",
        text: `Hi ${user.name},\n\nSomeone just tried to create a tommy tinkers NZ account with this email address, but you already have one. If that was you, sign in instead. If you've forgotten your password, you can reset it from the sign-in page.\n\nIf it wasn't you, there's nothing to do. Nobody got in.`,
        action: { label: "Sign in", url: `${process.env.BETTER_AUTH_URL ?? ""}/login` },
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    // Signing in before verifying sends a fresh link.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: DAY,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirm your email for tommy tinkers NZ",
        text: `Hi ${user.name},\n\nThanks for pulling up a stool. Confirm your email with the link below and your account is ready. It works for 24 hours.\n\nIf you didn't sign up, ignore this email and nothing happens.`,
        action: { label: "Confirm my email", url },
      });
    },
  },

  socialProviders: googleEnabled
    ? { google: { clientId: googleId!, clientSecret: googleSecret! } }
    : {},

  account: {
    // Signing in with Google on an address that already has a password
    // account joins the two. Safe for Google because it verifies the email.
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },

  // Better Auth's own per-IP limits on its endpoints (on in production).
  rateLimit: {
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60 * 10, max: 5 },
      // The pages show a 60 second "send it again" countdown to match.
      "/send-verification-email": { window: 60, max: 1 },
      "/request-password-reset": { window: 60, max: 2 },
    },
  },

  advanced: {
    // Behind the Cloudflare Tunnel every request arrives from cloudflared, so
    // the visitor's real address is in this header. It can be trusted only
    // because the app publishes no port of its own.
    ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const member = await db.role.findUnique({ where: { name: "member" }, select: { id: true } });
          return {
            data: {
              ...user,
              roleId: member?.id ?? null,
              // Whatever the browser sent only means "ticked". The time that
              // is saved is always the server's.
              ageConfirmedAt: user.ageConfirmedAt ? new Date() : null,
            },
          };
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // ---- lockout: count the attempt before the password is checked ----
      if (ctx.path === "/sign-in/email") {
        const email = String(ctx.body?.email ?? "");
        const allowed = await beginSignInAttempt(email);
        if (!allowed) {
          throw new APIError("TOO_MANY_REQUESTS", {
            code: "SIGN_IN_PAUSED",
            message: "Sign-in is paused for this account. Try again in a few minutes.",
          });
        }
      }

      // ---- password rules, wherever a password is set ----
      const settingPassword =
        ctx.path === "/sign-up/email"
          ? { password: ctx.body?.password, email: ctx.body?.email }
          : ctx.path === "/reset-password" || ctx.path === "/change-password"
            ? { password: ctx.body?.newPassword, email: undefined }
            : null;
      if (settingPassword && !isPasswordOk(String(settingPassword.password ?? ""), settingPassword.email)) {
        throw new APIError("BAD_REQUEST", {
          code: "WEAK_PASSWORD",
          message: "That password needs at least 10 characters, a number and a symbol.",
        });
      }
    }),

    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const returned = ctx.context.returned;
      // A new session means the password was right: wipe the count. So does
      // "email not verified", which is only ever said for a right password.
      const notVerified = returned instanceof APIError && returned.body?.code === "EMAIL_NOT_VERIFIED";
      if (ctx.context.newSession || notVerified) {
        await clearSignInAttempts(String(ctx.body?.email ?? ""));
      }
    }),
  },

  plugins: [
    // Cloudflare Turnstile on email sign-up only. Google sign-up has
    // Google's own bot checks.
    ...(turnstileSecret
      ? [captcha({ provider: "cloudflare-turnstile", secretKey: turnstileSecret, endpoints: ["/sign-up/email"] })]
      : []),
    // Lets server actions set the session cookie. Must stay last.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
