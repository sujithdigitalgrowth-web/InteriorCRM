"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function login(formData: FormData): Promise<{ error?: string }> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const member = await prisma.teamMember.findUnique({ where: { email: parsed.data.email } });
  if (
    !member ||
    !member.passwordHash ||
    member.status !== "ACTIVE" ||
    !verifyPassword(parsed.data.password, member.passwordHash)
  ) {
    return { error: "Invalid email or password." };
  }

  await createSession(member.id);
  return {};
}

export async function logout(): Promise<void> {
  await destroySession();
}

export async function hasAnyAdminAccount(): Promise<boolean> {
  const existing = await prisma.teamMember.findFirst({ where: { passwordHash: { not: null } } });
  return Boolean(existing);
}

const SetupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function setupAdmin(formData: FormData): Promise<{ error?: string }> {
  const alreadySetUp = await hasAnyAdminAccount();
  if (alreadySetUp) return { error: "An admin account already exists. Please sign in instead." };

  const parsed = SetupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields and try again." };

  const existingEmail = await prisma.teamMember.findUnique({ where: { email: parsed.data.email } });
  if (existingEmail) return { error: "That email is already in use." };

  const member = await prisma.teamMember.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: "ADMIN",
      accessRole: "ADMIN",
      passwordHash: hashPassword(parsed.data.password),
    },
  });

  await createSession(member.id);
  return {};
}
