"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const TransactionSchema = z.object({
  type: z.enum(["CLIENT_PAYMENT", "VENDOR_PAYMENT", "EXPENSE", "REFUND"]),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  expenseCategory: z.enum(["LABOR", "OFFICE", "TRANSPORT", "MISCELLANEOUS"]).optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  method: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  vendorId: z.string().optional(),
});

function parse(formData: FormData) {
  return TransactionSchema.parse({
    type: formData.get("type"),
    status: formData.get("status"),
    amount: formData.get("amount"),
    expenseCategory: formData.get("expenseCategory") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    paidDate: formData.get("paidDate") || undefined,
    method: formData.get("method") || undefined,
    reference: formData.get("reference") || undefined,
    notes: formData.get("notes") || undefined,
    projectId: formData.get("projectId") || undefined,
    clientId: formData.get("clientId") || undefined,
    vendorId: formData.get("vendorId") || undefined,
  });
}

export async function createTransaction(formData: FormData) {
  const data = parse(formData);
  await prisma.transaction.create({
    data: {
      type: data.type,
      status: data.status,
      amount: data.amount,
      expenseCategory: data.type === "EXPENSE" ? (data.expenseCategory ?? "MISCELLANEOUS") : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      paidDate: data.paidDate ? new Date(data.paidDate) : null,
      method: data.method || null,
      reference: data.reference || null,
      notes: data.notes || null,
      projectId: data.projectId || null,
      clientId: data.clientId || null,
      vendorId: data.vendorId || null,
    },
  });
  revalidatePath("/finance");
  revalidatePath("/");
}

export async function updateTransaction(id: string, formData: FormData) {
  const data = parse(formData);
  await prisma.transaction.update({
    where: { id },
    data: {
      type: data.type,
      status: data.status,
      amount: data.amount,
      expenseCategory: data.type === "EXPENSE" ? (data.expenseCategory ?? "MISCELLANEOUS") : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      paidDate: data.paidDate ? new Date(data.paidDate) : null,
      method: data.method || null,
      reference: data.reference || null,
      notes: data.notes || null,
      projectId: data.projectId || null,
      clientId: data.clientId || null,
      vendorId: data.vendorId || null,
    },
  });
  revalidatePath("/finance");
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/finance");
  revalidatePath("/");
}

export async function markTransactionPaid(id: string) {
  await prisma.transaction.update({
    where: { id },
    data: { status: "PAID", paidDate: new Date() },
  });
  revalidatePath("/finance");
  revalidatePath("/");
}
