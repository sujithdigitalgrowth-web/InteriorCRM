"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SettingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  tagline: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  quote: z.string().optional(),
  quoteAuthor: z.string().optional(),
});

export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
}

export async function updateSettings(formData: FormData) {
  const data = SettingsSchema.parse({
    businessName: formData.get("businessName"),
    tagline: formData.get("tagline") || undefined,
    logoUrl: formData.get("logoUrl") || "",
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    website: formData.get("website") || undefined,
    quote: formData.get("quote") || undefined,
    quoteAuthor: formData.get("quoteAuthor") || undefined,
  });

  const shared = {
    businessName: data.businessName,
    tagline: data.tagline || "",
    logoUrl: data.logoUrl || null,
    address: data.address || null,
    phone: data.phone || null,
    website: data.website || null,
    quote: data.quote || "",
    quoteAuthor: data.quoteAuthor || "",
  };

  await prisma.settings.upsert({
    where: { id: "default" },
    create: { id: "default", ...shared },
    update: shared,
  });

  revalidatePath("/", "layout");
}
