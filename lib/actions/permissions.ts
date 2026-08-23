"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionMember } from "@/lib/auth/session";
import { PERMISSION_KEYS } from "@/lib/auth/permission-keys";

export async function updateRolePermissions(role: "FINANCE" | "EMPLOYEE", formData: FormData) {
  const member = await getSessionMember();
  if (!member || member.accessRole !== "ADMIN") {
    throw new Error("Only an admin can update permissions.");
  }

  const data: Record<string, boolean> = {};
  for (const key of PERMISSION_KEYS) {
    data[key] = formData.get(key) === "on";
  }

  await prisma.rolePermission.upsert({
    where: { role },
    create: { role, ...data },
    update: data,
  });

  revalidatePath("/settings/permissions");
}
