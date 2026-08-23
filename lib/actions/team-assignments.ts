"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const AssignSchema = z.object({
  teamMemberId: z.string().min(1, "Team member is required"),
  role: z.string().optional(),
});

export async function assignTeamMember(projectId: string, formData: FormData) {
  const data = AssignSchema.parse({
    teamMemberId: formData.get("teamMemberId"),
    role: formData.get("role") || undefined,
  });
  await prisma.teamAssignment.upsert({
    where: {
      projectId_teamMemberId: {
        projectId,
        teamMemberId: data.teamMemberId,
      },
    },
    update: { role: data.role || null },
    create: {
      projectId,
      teamMemberId: data.teamMemberId,
      role: data.role || null,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function removeTeamAssignment(id: string, projectId: string) {
  await prisma.teamAssignment.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}
