"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "../../../auth";

const SignupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export async function signup(_prevState: string | undefined, formData: FormData) {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid input.";
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return "An account with that email already exists.";
  }

  const userRole = await prisma.role.findUniqueOrThrow({ where: { name: "USER" } });
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, roleId: userRole.id },
  });

  await signIn("credentials", { email, password, redirectTo: "/account" });
}
