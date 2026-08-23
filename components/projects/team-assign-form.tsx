"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { assignTeamMember } from "@/lib/actions/team-assignments";
import { titleCase } from "@/lib/utils";

export function TeamAssignForm({
  projectId,
  members,
}: {
  projectId: string;
  members: { id: string; name: string; role: string }[];
}) {
  const [pending, setPending] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    if (!formData.get("teamMemberId")) {
      toast.error("Pick a team member first");
      return;
    }
    setPending(true);
    try {
      await assignTeamMember(projectId, formData);
      toast.success("Team member assigned");
      formRef.current?.reset();
    } catch {
      toast.error("Could not assign team member");
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[12rem] flex-1">
        <Select name="teamMemberId" defaultValue="" required>
          <option value="" disabled>
            Select team member
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {titleCase(m.role)}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-w-[9rem]">
        <Input name="role" placeholder="Role on project (e.g. Lead)" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        <UserPlus /> {pending ? "Assigning…" : "Assign"}
      </Button>
    </form>
  );
}
