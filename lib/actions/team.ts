"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionMember } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";

const TeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum([
    "PRINCIPAL_DESIGNER",
    "DESIGNER",
    "ARCHITECT",
    "SITE_SUPERVISOR",
    "PROCUREMENT",
    "ACCOUNTS",
    "ADMIN",
  ]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  accessRole: z.enum(["ADMIN", "FINANCE", "EMPLOYEE"]).optional(),
  password: z.string().min(6).optional().or(z.literal("")),
});

async function requireTeamManager() {
  const member = await getSessionMember();
  if (!member || member.accessRole !== "ADMIN") {
    throw new Error("Only an admin can manage the team.");
  }
}

function parse(formData: FormData) {
  return TeamMemberSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
    status: formData.get("status"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || undefined,
    accessRole: formData.get("accessRole") || undefined,
    password: formData.get("password") || "",
  });
}

export async function createTeamMember(formData: FormData) {
  await requireTeamManager();
  const data = parse(formData);
  await prisma.teamMember.create({
    data: {
      name: data.name,
      role: data.role,
      status: data.status,
      email: data.email || null,
      phone: data.phone || null,
      accessRole: data.accessRole ?? "EMPLOYEE",
      passwordHash: data.password ? hashPassword(data.password) : null,
    },
  });
  revalidatePath("/team");
}

export async function updateTeamMember(id: string, formData: FormData) {
  await requireTeamManager();
  const data = parse(formData);
  await prisma.teamMember.update({
    where: { id },
    data: {
      name: data.name,
      role: data.role,
      status: data.status,
      email: data.email || null,
      phone: data.phone || null,
      accessRole: data.accessRole ?? "EMPLOYEE",
      ...(data.password ? { passwordHash: hashPassword(data.password) } : {}),
    },
  });
  revalidatePath("/team");
}

export async function deleteTeamMember(id: string) {
  await requireTeamManager();
  await prisma.teamMember.delete({ where: { id } });
  revalidatePath("/team");
}
