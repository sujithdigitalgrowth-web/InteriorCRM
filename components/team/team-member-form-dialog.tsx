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
import { createTeamMember, updateTeamMember } from "@/lib/actions/team";
import type { TeamMember } from "@prisma/client";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "PRINCIPAL_DESIGNER", label: "Principal Designer" },
  { value: "DESIGNER", label: "Designer" },
  { value: "ARCHITECT", label: "Architect" },
  { value: "SITE_SUPERVISOR", label: "Site Supervisor" },
  { value: "PROCUREMENT", label: "Procurement" },
  { value: "ACCOUNTS", label: "Accounts" },
  { value: "ADMIN", label: "Admin" },
];

const ACCESS_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "ADMIN", label: "Admin — full access, including revenue" },
  { value: "FINANCE", label: "Finance — full access, including revenue" },
  { value: "EMPLOYEE", label: "Employee — no finance or revenue access" },
];

export function TeamMemberFormDialog({ member }: { member?: TeamMember }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(member);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (member) {
        await updateTeamMember(member.id, formData);
        toast.success("Team member updated");
      } else {
        await createTeamMember(formData);
        toast.success("Team member added");
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
            <Plus /> New Team Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Team Member" : "New Team Member"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this team member's details." : "Add a member to the studio team."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full name *</Label>
              <Input id="name" name="name" required defaultValue={member?.name} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" defaultValue={member?.role ?? "DESIGNER"}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={member?.status ?? "ACTIVE"}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={member?.email ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={member?.phone ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="accessRole">Access Level</Label>
              <Select id="accessRole" name="accessRole" defaultValue={member?.accessRole ?? "EMPLOYEE"}>
                {ACCESS_ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-muted">Controls what this member can see. Fine-tune per role in Settings → Access & Permissions.</p>
            </div>
            <div className="col-span-2">
              <Label htmlFor="password">
                {isEdit ? "Reset password (leave blank to keep current)" : "Login password"}
              </Label>
              <Input id="password" name="password" type="password" minLength={6} placeholder="At least 6 characters" />
              <p className="mt-1 text-xs text-muted">
                Set this (with an email above) to give this member login access. Leave blank if they don&apos;t need it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
