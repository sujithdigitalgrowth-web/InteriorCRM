"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeamAssignForm } from "@/components/projects/team-assign-form";

export function TeamAssignDialog({
  projectId,
  members,
}: {
  projectId: string;
  members: { id: string; name: string; role: string }[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus /> Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Team Member</DialogTitle>
          <DialogDescription>Add someone from the studio team to this project.</DialogDescription>
        </DialogHeader>
        {members.length === 0 ? (
          <p className="text-sm text-muted">Everyone active is already assigned to this project.</p>
        ) : (
          <TeamAssignForm projectId={projectId} members={members} />
        )}
      </DialogContent>
    </Dialog>
  );
}
