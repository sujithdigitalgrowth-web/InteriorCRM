"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { nextQuotationNumber } from "@/lib/quotation";

const CreateSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().optional(),
  discountLabel: z.string().optional(),
  discountPct: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});

const UpdateSchema = z.object({
  title: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]),
  discountLabel: z.string().optional(),
  discountPct: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});

const ItemSchema = z.object({
  room: z.string().min(1, "Room is required"),
  description: z.string().min(1, "Description is required"),
  lengthFt: z.coerce.number().min(0).optional(),
  breadthFt: z.coerce.number().min(0).optional(),
  areaOrQty: z.coerce.number().min(0).optional(),
  pricingType: z.enum(["FIXED", "NOTE"]),
  amount: z.coerce.number().min(0).optional(),
  amountNote: z.string().optional(),
});

export async function createQuotation(formData: FormData) {
  const data = CreateSchema.parse({
    projectId: formData.get("projectId"),
    title: formData.get("title") || undefined,
    discountLabel: formData.get("discountLabel") || undefined,
    discountPct: formData.get("discountPct") || 0,
    notes: formData.get("notes") || undefined,
  });

  const project = await prisma.project.findUnique({ where: { id: data.projectId }, select: { clientId: true } });
  if (!project) throw new Error("Project not found");

  const count = await prisma.quotation.count();

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: nextQuotationNumber(count),
      title: data.title || null,
      projectId: data.projectId,
      clientId: project.clientId,
      discountLabel: data.discountLabel || null,
      discountPct: data.discountPct,
      notes: data.notes || null,
    },
  });

  revalidatePath("/quotations");
  redirect(`/quotations/${quotation.id}`);
}

export async function updateQuotation(id: string, formData: FormData) {
  const data: Record<string, unknown> = {};

  if (formData.has("status")) {
    const parsed = UpdateSchema.parse({
      title: formData.get("title") || undefined,
      status: formData.get("status"),
      discountLabel: formData.get("discountLabel") || undefined,
      discountPct: formData.get("discountPct") || 0,
      notes: formData.get("notes") || undefined,
    });
    data.title = parsed.title || null;
    data.status = parsed.status;
    data.discountLabel = parsed.discountLabel || null;
    data.discountPct = parsed.discountPct;
    data.notes = parsed.notes || null;
  } else if (formData.has("discountPct")) {
    data.discountLabel = formData.get("discountLabel") || null;
    data.discountPct = z.coerce.number().min(0).max(100).parse(formData.get("discountPct"));
  }

  await prisma.quotation.update({ where: { id }, data });
  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}`);
}

export async function deleteQuotation(id: string) {
  await prisma.quotation.delete({ where: { id } });
  revalidatePath("/quotations");
  redirect("/quotations");
}

function parseItem(formData: FormData) {
  const data = ItemSchema.parse({
    room: formData.get("room"),
    description: formData.get("description"),
    lengthFt: formData.get("lengthFt") || undefined,
    breadthFt: formData.get("breadthFt") || undefined,
    areaOrQty: formData.get("areaOrQty") || undefined,
    pricingType: formData.get("pricingType") || "FIXED",
    amount: formData.get("amount") || undefined,
    amountNote: formData.get("amountNote") || undefined,
  });

  return {
    room: data.room,
    description: data.description,
    lengthFt: data.lengthFt ?? null,
    breadthFt: data.breadthFt ?? null,
    areaOrQty: data.areaOrQty ?? null,
    amount: data.pricingType === "FIXED" ? (data.amount ?? 0) : null,
    amountNote: data.pricingType === "NOTE" ? data.amountNote || "TBD" : null,
  };
}

export async function createQuotationItem(quotationId: string, formData: FormData) {
  const data = parseItem(formData);

  const last = await prisma.quotationItem.aggregate({ where: { quotationId }, _max: { order: true } });

  await prisma.quotationItem.create({
    data: { ...data, quotationId, order: (last._max.order ?? -1) + 1 },
  });

  revalidatePath(`/quotations/${quotationId}`);
}

export async function updateQuotationItem(id: string, quotationId: string, formData: FormData) {
  const data = parseItem(formData);
  await prisma.quotationItem.update({ where: { id }, data });
  revalidatePath(`/quotations/${quotationId}`);
}

export async function deleteQuotationItem(id: string, quotationId: string) {
  await prisma.quotationItem.delete({ where: { id } });
  revalidatePath(`/quotations/${quotationId}`);
}
