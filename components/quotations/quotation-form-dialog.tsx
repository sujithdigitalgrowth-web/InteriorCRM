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
import { createQuotation, updateQuotation } from "@/lib/actions/quotations";
import type { Quotation } from "@prisma/client";

type ProjectOption = { id: string; name: string; client: { name: string } };

export function QuotationFormDialog({
  quotation,
  projects,
  trigger,
  defaultProjectId,
}: {
  quotation?: Quotation;
  projects: ProjectOption[];
  trigger?: React.ReactNode;
  defaultProjectId?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(quotation);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (quotation) {
        await updateQuotation(quotation.id, formData);
        toast.success("Quotation updated");
        setOpen(false);
      } else {
        await createQuotation(formData);
      }
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
              <Plus /> New Quotation
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Quotation" : "New Quotation"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this quotation's details."
              : "Create a room-wise quotation for a project. You can add line items next."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <div className="col-span-2">
                <Label htmlFor="projectId">Project *</Label>
                <Select id="projectId" name="projectId" required defaultValue={defaultProjectId ?? ""}>
                  <option value="" disabled>
                    Select a project
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.client.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div className="col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g. Full House Interiors" defaultValue={quotation?.title ?? ""} />
            </div>
            {isEdit && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={quotation?.status ?? "DRAFT"}>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="discountPct">Discount %</Label>
              <Input
                id="discountPct"
                name="discountPct"
                type="number"
                min={0}
                max={100}
                step="0.01"
                defaultValue={quotation?.discountPct ?? 0}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="discountLabel">Discount Label</Label>
              <Input
                id="discountLabel"
                name="discountLabel"
                placeholder="e.g. Discount on woodwork"
                defaultValue={quotation?.discountLabel ?? ""}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={quotation?.notes ?? ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Quotation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
