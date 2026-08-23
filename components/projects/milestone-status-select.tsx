"use client";

import * as React from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { updateMilestoneStatus } from "@/lib/actions/milestones";

export function MilestoneStatusSelect({
  id,
  projectId,
  status,
}: {
  id: string;
  projectId: string;
  status: string;
}) {
  const [pending, setPending] = React.useState(false);

  return (
    <Select
      defaultValue={status}
      disabled={pending}
      className="h-8 w-[9.5rem] text-xs"
      onChange={async (e) => {
        const formData = new FormData();
        formData.set("status", e.target.value);
        setPending(true);
        try {
          await updateMilestoneStatus(id, projectId, formData);
          toast.success("Milestone status updated");
        } catch {
          toast.error("Could not update status");
        } finally {
          setPending(false);
        }
      }}
    >
      <option value="PENDING">Pending</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="DONE">Done</option>
      <option value="DELAYED">Delayed</option>
    </Select>
  );
}
