"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  altPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  status: z.enum(["LEAD", "ACTIVE", "PAST", "ON_HOLD"]),
  source: z.enum(["REFERRAL", "WEBSITE", "SOCIAL_MEDIA", "WALK_IN", "EXHIBITION", "OTHER"]),
  notes: z.string().optional(),
  clientType: z.enum(["INDIVIDUAL", "COMPANY"]),
  companyName: z.string().optional(),
  occupation: z.string().optional(),
  preferredCommunication: z.string().optional(),
  referredBy: z.string().optional(),
  anniversary: z.string().optional(),
});

function parse(formData: FormData) {
  return ClientSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    altPhone: formData.get("altPhone") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    status: formData.get("status"),
    source: formData.get("source"),
    notes: formData.get("notes") || undefined,
    clientType: formData.get("clientType") || "INDIVIDUAL",
    companyName: formData.get("companyName") || undefined,
    occupation: formData.get("occupation") || undefined,
    preferredCommunication: formData.get("preferredCommunication") || undefined,
    referredBy: formData.get("referredBy") || undefined,
    anniversary: formData.get("anniversary") || undefined,
  });
}

export async function createClient(formData: FormData) {
  const data = parse(formData);
  const client = await prisma.client.create({
    data: {
      ...data,
      email: data.email || null,
      companyName: data.companyName || null,
      occupation: data.occupation || null,
      preferredCommunication: data.preferredCommunication || null,
      referredBy: data.referredBy || null,
      anniversary: data.anniversary ? new Date(data.anniversary) : null,
    },
  });
  revalidatePath("/clients");
  revalidatePath("/");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const data = parse(formData);
  await prisma.client.update({
    where: { id },
    data: {
      ...data,
      email: data.email || null,
      companyName: data.companyName || null,
      occupation: data.occupation || null,
      preferredCommunication: data.preferredCommunication || null,
      referredBy: data.referredBy || null,
      anniversary: data.anniversary ? new Date(data.anniversary) : null,
    },
  });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function toggleClientPriority(id: string, currentValue: boolean) {
  await prisma.client.update({ where: { id }, data: { isPriority: !currentValue } });
  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
}
