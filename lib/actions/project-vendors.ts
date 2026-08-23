"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const LinkSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  scope: z.string().optional(),
  poValue: z.coerce.number().optional(),
});

export async function linkVendor(projectId: string, formData: FormData) {
  const data = LinkSchema.parse({
    vendorId: formData.get("vendorId"),
    scope: formData.get("scope") || undefined,
    poValue: formData.get("poValue") || undefined,
  });
  await prisma.projectVendor.upsert({
    where: {
      projectId_vendorId: {
        projectId,
        vendorId: data.vendorId,
      },
    },
    update: { scope: data.scope || null, poValue: data.poValue ?? null },
    create: {
      projectId,
      vendorId: data.vendorId,
      scope: data.scope || null,
      poValue: data.poValue ?? null,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function removeProjectVendor(id: string, projectId: string) {
  await prisma.projectVendor.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}
