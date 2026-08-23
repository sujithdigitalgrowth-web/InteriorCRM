"use client";

import * as React from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import { formatDateInput } from "@/lib/utils";
import type { Transaction } from "@prisma/client";

type Option = { id: string; name: string };

export function TransactionFormDialog({
  transaction,
  projects,
  clients,
  vendors,
  defaultProjectId,
  defaultClientId,
  trigger,
}: {
  transaction?: Transaction;
  projects: Option[];
  clients: Option[];
  vendors: Option[];
  defaultProjectId?: string;
  defaultClientId?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [type, setType] = React.useState(transaction?.type ?? "CLIENT_PAYMENT");
  const isEdit = Boolean(transaction);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (transaction) {
        await updateTransaction(transaction.id, formData);
        toast.success("Transaction updated");
      } else {
        await createTransaction(formData);
        toast.success("Transaction created");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong. Check the required fields.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ??
          (isEdit ? (
            <Button variant="outline" size="sm">
              <Pencil /> Edit
            </Button>
          ) : (
            <Button>
              <Plus /> New Transaction
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaction" : "New Transaction"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this transaction's details."
              : "Record a client payment, vendor payment, expense or refund."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                id="type"
                name="type"
                required
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
              >
                <option value="CLIENT_PAYMENT">Client Payment</option>
                <option value="VENDOR_PAYMENT">Vendor Payment</option>
                <option value="EXPENSE">Expense</option>
                <option value="REFUND">Refund</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select id="status" name="status" required defaultValue={transaction?.status ?? "PENDING"}>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
            {type === "EXPENSE" && (
              <div className="col-span-2">
                <Label htmlFor="expenseCategory">Expense Category</Label>
                <Select
                  id="expenseCategory"
                  name="expenseCategory"
                  defaultValue={transaction?.expenseCategory ?? "MISCELLANEOUS"}
                >
                  <option value="LABOR">Labor</option>
                  <option value="OFFICE">Office</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="MISCELLANEOUS">Miscellaneous</option>
                </Select>
              </div>
            )}
            <div className="col-span-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={transaction?.amount ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={formatDateInput(transaction?.dueDate)} />
            </div>
            <div>
              <Label htmlFor="paidDate">Paid Date</Label>
              <Input id="paidDate" name="paidDate" type="date" defaultValue={formatDateInput(transaction?.paidDate)} />
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <Input id="method" name="method" placeholder="Bank Transfer, UPI…" defaultValue={transaction?.method ?? ""} />
            </div>
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" name="reference" placeholder="ADV-1000" defaultValue={transaction?.reference ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="projectId">Project (optional)</Label>
              <Select id="projectId" name="projectId" defaultValue={transaction?.projectId ?? defaultProjectId ?? ""}>
                <option value="">— None —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="clientId">Client (optional)</Label>
              <Select id="clientId" name="clientId" defaultValue={transaction?.clientId ?? defaultClientId ?? ""}>
                <option value="">— None —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="vendorId">Vendor (optional)</Label>
              <Select id="vendorId" name="vendorId" defaultValue={transaction?.vendorId ?? ""}>
                <option value="">— None —</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={transaction?.notes ?? ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
