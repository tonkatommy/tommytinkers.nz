import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

const FAILED_LOGIN_LIMIT = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const adapter = PrismaAdapter(prisma);

adapter.createUser = async (data) => {
  const userRole = await prisma.role.findUniqueOrThrow({ where: { name: "USER" } });
  const user = await prisma.user.create({ data: { ...data, roleId: userRole.id } });
  return { ...user, email: user.email ?? "", roleName: userRole.name, permissions: userRole.permissions };
};

adapter.getUserByAccount = async ({ provider, providerAccountId }) => {
  const account = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: { include: { role: true } } },
  });
  if (!account) return null;
  const { role, ...user } = account.user;
  return { ...user, email: user.email ?? "", roleName: role.name, permissions: role.permissions };
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  ...authConfig,
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
        if (!user?.passwordHash) return null;
        if (user.lockedUntil && user.lockedUntil > new Date()) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          const attempts = user.failedLoginCount + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: attempts,
              lockedUntil: attempts >= FAILED_LOGIN_LIMIT ? new Date(Date.now() + LOCKOUT_MS) : null,
            },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleName: user.role.name,
          permissions: user.role.permissions,
        };
      },
    }),
  ],
});
