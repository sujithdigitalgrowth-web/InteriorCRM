"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ItemSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  projectId: z.string().min(1, "Project is required"),
  category: z.enum(["TRANSPORT", "LABOR", "MISCELLANEOUS"]),
  itemName: z.string().min(1, "Item is required"),
  rate: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0),
  discountPct: z.coerce.number().min(0).max(100).optional(),
});

function parse(formData: FormData) {
  return ItemSchema.parse({
    vendorId: formData.get("vendorId"),
    projectId: formData.get("projectId"),
    category: formData.get("category"),
    itemName: formData.get("itemName"),
    rate: formData.get("rate"),
    quantity: formData.get("quantity"),
    discountPct: formData.get("discountPct") || 0,
  });
}

export async function createVendorOrderItem(formData: FormData) {
  const data = parse(formData);
  const last = await prisma.vendorOrderItem.aggregate({
    where: { vendorId: data.vendorId },
    _max: { order: true },
  });

  await prisma.vendorOrderItem.create({
    data: {
      vendorId: data.vendorId,
      projectId: data.projectId,
      category: data.category,
      itemName: data.itemName,
      rate: data.rate,
      quantity: data.quantity,
      discountPct: data.discountPct ?? 0,
      order: (last._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/vendors/quota");
}

export async function updateVendorOrderItem(id: string, formData: FormData) {
  const data = parse(formData);
  await prisma.vendorOrderItem.update({
    where: { id },
    data: {
      vendorId: data.vendorId,
      projectId: data.projectId,
      category: data.category,
      itemName: data.itemName,
      rate: data.rate,
      quantity: data.quantity,
      discountPct: data.discountPct ?? 0,
    },
  });

  revalidatePath("/vendors/quota");
}

export async function deleteVendorOrderItem(id: string) {
  await prisma.vendorOrderItem.delete({ where: { id } });
  revalidatePath("/vendors/quota");
}
