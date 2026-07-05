"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/require-permission";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(72),
});

export async function changePassword(_prevState: string | undefined, formData: FormData) {
  const session = await requireSession();

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") || undefined,
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid input.";
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  if (user.passwordHash) {
    const currentOk = parsed.data.currentPassword
      ? await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
      : false;
    if (!currentOk) return "Current password is incorrect.";
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return "Password updated.";
}
