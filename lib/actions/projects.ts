"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  type: z.enum([
    "RESIDENTIAL",
    "COMMERCIAL",
    "RENOVATION",
    "TURNKEY",
    "CONSULTATION",
    "INTERIOR_DESIGN",
    "MODULAR_KITCHEN",
    "LANDSCAPE",
    "FURNITURE_FURNISHING",
  ]),
  status: z.enum([
    "ENQUIRY",
    "DESIGN",
    "APPROVAL",
    "EXECUTION",
    "HANDOVER",
    "COMPLETED",
    "ON_HOLD",
    "CANCELLED",
  ]),
  address: z.string().optional(),
  city: z.string().optional(),
  area: z.coerce.number().optional(),
  budget: z.coerce.number().optional(),
  startDate: z.string().optional(),
  targetEndDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  description: z.string().optional(),
});

function parse(formData: FormData) {
  return ProjectSchema.parse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    clientId: formData.get("clientId"),
    type: formData.get("type"),
    status: formData.get("status"),
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    area: formData.get("area") || undefined,
    budget: formData.get("budget") || undefined,
    startDate: formData.get("startDate") || undefined,
    targetEndDate: formData.get("targetEndDate") || undefined,
    actualEndDate: formData.get("actualEndDate") || undefined,
    description: formData.get("description") || undefined,
  });
}

function toData(parsed: ReturnType<typeof parse>) {
  return {
    name: parsed.name,
    code: parsed.code || null,
    clientId: parsed.clientId,
    type: parsed.type,
    status: parsed.status,
    address: parsed.address || null,
    city: parsed.city || null,
    area: parsed.area ?? null,
    budget: parsed.budget ?? null,
    startDate: parsed.startDate ? new Date(parsed.startDate) : null,
    targetEndDate: parsed.targetEndDate ? new Date(parsed.targetEndDate) : null,
    actualEndDate: parsed.actualEndDate ? new Date(parsed.actualEndDate) : null,
    description: parsed.description || null,
  };
}

export async function createProject(formData: FormData) {
  const data = parse(formData);
  const project = await prisma.project.create({ data: toData(data) });
  revalidatePath("/projects");
  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const data = parse(formData);
  await prisma.project.update({ where: { id }, data: toData(data) });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  revalidatePath("/");
  redirect("/projects");
}
