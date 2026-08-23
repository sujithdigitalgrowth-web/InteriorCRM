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
import { createMilestone, updateMilestone } from "@/lib/actions/milestones";
import { formatDateInput } from "@/lib/utils";
import type { Milestone } from "@prisma/client";

export function MilestoneFormDialog({
  projectId,
  milestone,
}: {
  projectId: string;
  milestone?: Milestone;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(milestone);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (milestone) {
        await updateMilestone(milestone.id, projectId, formData);
        toast.success("Milestone updated");
      } else {
        await createMilestone(projectId, formData);
        toast.success("Milestone added");
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
          <Button variant="ghost" size="icon" aria-label="Edit milestone">
            <Pencil className="size-3.5" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> Add Milestone
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this milestone." : "Add a milestone to this project's timeline."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required defaultValue={milestone?.title} />
            </div>
            <div>
              <Label htmlFor="phase">Phase</Label>
              <Input id="phase" name="phase" defaultValue={milestone?.phase ?? ""} placeholder="e.g. Design" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={milestone?.status ?? "PENDING"}>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="DELAYED">Delayed</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="progressPct">Progress %</Label>
              <Input
                id="progressPct"
                name="progressPct"
                type="number"
                min="0"
                max="100"
                defaultValue={milestone?.progressPct ?? 0}
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={formatDateInput(milestone?.startDate)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={formatDateInput(milestone?.dueDate)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="order">Order</Label>
              <Input id="order" name="order" type="number" defaultValue={milestone?.order ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={milestone?.notes ?? ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
