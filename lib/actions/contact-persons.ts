"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ContactPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  isPrimary: z.coerce.boolean().optional(),
});

export async function createContactPerson(clientId: string, formData: FormData) {
  const data = ContactPersonSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || "",
    isPrimary: formData.get("isPrimary") === "on",
  });

  if (data.isPrimary) {
    await prisma.contactPerson.updateMany({ where: { clientId }, data: { isPrimary: false } });
  }

  const existingCount = await prisma.contactPerson.count({ where: { clientId } });

  await prisma.contactPerson.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      isPrimary: data.isPrimary || existingCount === 0,
      clientId,
    },
  });
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteContactPerson(id: string, clientId: string) {
  await prisma.contactPerson.delete({ where: { id } });
  revalidatePath(`/clients/${clientId}`);
}
