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
import { createProject, updateProject } from "@/lib/actions/projects";
import { PROJECT_TYPE_OPTIONS, PROJECT_STATUS_OPTIONS } from "@/lib/project-options";
import { formatDateInput } from "@/lib/utils";
import type { Project } from "@prisma/client";

export function ProjectFormDialog({
  project,
  clients,
  trigger,
  defaultClientId,
}: {
  project?: Project;
  clients: { id: string; name: string }[];
  trigger?: React.ReactNode;
  defaultClientId?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(project);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (project) {
        await updateProject(project.id, formData);
        toast.success("Project updated");
        setOpen(false);
      } else {
        await createProject(formData);
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
              <Plus /> New Project
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Project" : "New Project"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update project details." : "Start a new project for a client."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" name="name" required defaultValue={project?.name} />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" defaultValue={project?.code ?? ""} placeholder="e.g. RS-2026-01" />
            </div>
            <div>
              <Label htmlFor="clientId">Client *</Label>
              <Select id="clientId" name="clientId" required defaultValue={project?.clientId ?? defaultClientId ?? ""}>
                <option value="" disabled>
                  Select client
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" defaultValue={project?.type ?? "INTERIOR_DESIGN"}>
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={project?.status ?? "ENQUIRY"}>
                {PROJECT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={project?.city ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={project?.address ?? ""} />
            </div>
            <div>
              <Label htmlFor="area">Area (sqft)</Label>
              <Input id="area" name="area" type="number" step="any" defaultValue={project?.area ?? ""} />
            </div>
            <div>
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input id="budget" name="budget" type="number" step="any" defaultValue={project?.budget ?? ""} />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={formatDateInput(project?.startDate)}
              />
            </div>
            <div>
              <Label htmlFor="targetEndDate">Target End Date</Label>
              <Input
                id="targetEndDate"
                name="targetEndDate"
                type="date"
                defaultValue={formatDateInput(project?.targetEndDate)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} defaultValue={project?.description ?? ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
