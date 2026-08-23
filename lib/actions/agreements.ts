"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const AgreementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["DESIGN_AGREEMENT", "EXECUTION_CONTRACT", "VENDOR_CONTRACT", "NDA", "OTHER"]),
  status: z.enum(["DRAFT", "SENT", "SIGNED", "EXPIRED", "CANCELLED"]),
  value: z.coerce.number().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  fileUrl: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
});

function parse(formData: FormData) {
  const value = formData.get("value");
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  return AgreementSchema.parse({
    title: formData.get("title"),
    type: formData.get("type"),
    status: formData.get("status"),
    value: value ? Number(value) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    fileUrl: formData.get("fileUrl") || undefined,
    notes: formData.get("notes") || undefined,
    projectId: formData.get("projectId") || undefined,
    clientId: formData.get("clientId") || undefined,
  });
}

export async function createAgreement(formData: FormData) {
  const data = parse(formData);
  await prisma.agreement.create({
    data: {
      ...data,
      value: data.value ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      fileUrl: data.fileUrl || null,
      notes: data.notes || null,
      projectId: data.projectId || null,
      clientId: data.clientId || null,
    },
  });
  revalidatePath("/agreements");
  revalidatePath("/");
}

export async function updateAgreement(id: string, formData: FormData) {
  const data = parse(formData);
  await prisma.agreement.update({
    where: { id },
    data: {
      ...data,
      value: data.value ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      fileUrl: data.fileUrl || null,
      notes: data.notes || null,
      projectId: data.projectId || null,
      clientId: data.clientId || null,
    },
  });
  revalidatePath("/agreements");
}

export async function updateAgreementStatus(id: string, status: string) {
  const parsedStatus = z
    .enum(["DRAFT", "SENT", "SIGNED", "EXPIRED", "CANCELLED"])
    .parse(status);
  await prisma.agreement.update({ where: { id }, data: { status: parsedStatus } });
  revalidatePath("/agreements");
}

export async function deleteAgreement(id: string) {
  await prisma.agreement.delete({ where: { id } });
  revalidatePath("/agreements");
}
