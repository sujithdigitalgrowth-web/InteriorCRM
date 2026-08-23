"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MilestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  phase: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE", "DELAYED"]),
  progressPct: z.coerce.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  order: z.coerce.number().optional(),
  notes: z.string().optional(),
});

function parse(formData: FormData) {
  return MilestoneSchema.parse({
    title: formData.get("title"),
    phase: formData.get("phase") || undefined,
    status: formData.get("status") || "PENDING",
    progressPct: formData.get("progressPct") || undefined,
    startDate: formData.get("startDate") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    order: formData.get("order") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

function resolveProgress(status: string, progressPct: number | undefined) {
  if (status === "DONE") return 100;
  if (progressPct !== undefined) return progressPct;
  return status === "PENDING" ? 0 : undefined;
}

export async function createMilestone(projectId: string, formData: FormData) {
  const data = parse(formData);
  const count = await prisma.milestone.count({ where: { projectId } });
  await prisma.milestone.create({
    data: {
      title: data.title,
      phase: data.phase || null,
      status: data.status,
      progressPct: resolveProgress(data.status, data.progressPct) ?? 0,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      completedAt: data.status === "DONE" ? new Date() : null,
      order: data.order ?? count,
      notes: data.notes || null,
      projectId,
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function updateMilestone(id: string, projectId: string, formData: FormData) {
  const data = parse(formData);
  const existing = await prisma.milestone.findUnique({ where: { id } });
  await prisma.milestone.update({
    where: { id },
    data: {
      title: data.title,
      phase: data.phase || null,
      status: data.status,
      progressPct: resolveProgress(data.status, data.progressPct) ?? existing?.progressPct ?? 0,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      completedAt:
        data.status === "DONE" ? existing?.completedAt ?? new Date() : null,
      order: data.order ?? existing?.order ?? 0,
      notes: data.notes || null,
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function updateMilestoneStatus(id: string, projectId: string, formData: FormData) {
  const status = z
    .enum(["PENDING", "IN_PROGRESS", "DONE", "DELAYED"])
    .parse(formData.get("status"));
  const existing = await prisma.milestone.findUnique({ where: { id } });
  await prisma.milestone.update({
    where: { id },
    data: {
      status,
      progressPct: status === "DONE" ? 100 : (existing?.progressPct ?? 0),
      completedAt: status === "DONE" ? new Date() : null,
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function deleteMilestone(id: string, projectId: string) {
  await prisma.milestone.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}
