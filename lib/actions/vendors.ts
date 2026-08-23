"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const VendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "FURNITURE",
    "ELECTRICAL",
    "PLUMBING",
    "CIVIL",
    "CARPENTRY",
    "PAINTING",
    "FLOORING",
    "LIGHTING",
    "SOFT_FURNISHING",
    "MODULAR_KITCHEN",
    "GLASS_METAL",
    "OTHER",
  ]),
  contactName: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
  paymentTerms: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")),
  notes: z.string().optional(),
});

function parse(formData: FormData) {
  const ratingRaw = formData.get("rating");
  return VendorSchema.parse({
    name: formData.get("name"),
    category: formData.get("category"),
    contactName: formData.get("contactName") || undefined,
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    address: formData.get("address") || undefined,
    gstin: formData.get("gstin") || undefined,
    paymentTerms: formData.get("paymentTerms") || undefined,
    rating: ratingRaw ? ratingRaw : "",
    notes: formData.get("notes") || undefined,
  });
}

export async function createVendor(formData: FormData) {
  const data = parse(formData);
  const vendor = await prisma.vendor.create({
    data: {
      ...data,
      email: data.email || null,
      rating: data.rating === "" ? null : data.rating,
    },
  });
  revalidatePath("/vendors");
  revalidatePath("/");
  redirect(`/vendors/${vendor.id}`);
}

export async function updateVendor(id: string, formData: FormData) {
  const data = parse(formData);
  await prisma.vendor.update({
    where: { id },
    data: {
      ...data,
      email: data.email || null,
      rating: data.rating === "" ? null : data.rating,
    },
  });
  revalidatePath("/vendors");
  revalidatePath(`/vendors/${id}`);
}

export async function deleteVendor(id: string) {
  await prisma.vendor.delete({ where: { id } });
  revalidatePath("/vendors");
  redirect("/vendors");
}
