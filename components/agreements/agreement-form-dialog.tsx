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
import { createAgreement, updateAgreement } from "@/lib/actions/agreements";
import { formatDateInput } from "@/lib/utils";
import type { Agreement, Client, Project } from "@prisma/client";

export function AgreementFormDialog({
  agreement,
  projects,
  clients,
}: {
  agreement?: Agreement;
  projects: Pick<Project, "id" | "name">[];
  clients: Pick<Client, "id" | "name">[];
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(agreement);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (agreement) {
        await updateAgreement(agreement.id, formData);
        toast.success("Agreement updated");
      } else {
        await createAgreement(formData);
        toast.success("Agreement created");
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
        {isEdit ? (
          <Button variant="outline" size="sm">
            <Pencil /> Edit
          </Button>
        ) : (
          <Button>
            <Plus /> New Agreement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Agreement" : "New Agreement"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update agreement details."
              : "Log a design agreement, contract, or NDA for a client or project."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required defaultValue={agreement?.title} />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" defaultValue={agreement?.type ?? "DESIGN_AGREEMENT"}>
                <option value="DESIGN_AGREEMENT">Design Agreement</option>
                <option value="EXECUTION_CONTRACT">Execution Contract</option>
                <option value="VENDOR_CONTRACT">Vendor Contract</option>
                <option value="NDA">NDA</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={agreement?.status ?? "DRAFT"}>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="SIGNED">Signed</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="clientId">Client</Label>
              <Select id="clientId" name="clientId" defaultValue={agreement?.clientId ?? ""}>
                <option value="">— None —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="projectId">Project</Label>
              <Select id="projectId" name="projectId" defaultValue={agreement?.projectId ?? ""}>
                <option value="">— None —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Value (₹)</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                defaultValue={agreement?.value ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={formatDateInput(agreement?.startDate)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={formatDateInput(agreement?.endDate)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="fileUrl">Document link</Label>
              <Input
                id="fileUrl"
                name="fileUrl"
                type="url"
                placeholder="https://…"
                defaultValue={agreement?.fileUrl ?? ""}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={agreement?.notes ?? ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Agreement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
