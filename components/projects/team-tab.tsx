import { UsersRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { TeamAssignForm } from "@/components/projects/team-assign-form";
import { removeTeamAssignment } from "@/lib/actions/team-assignments";
import { titleCase } from "@/lib/utils";
import type { TeamAssignment, TeamMember } from "@prisma/client";

type AssignmentWithMember = TeamAssignment & { teamMember: TeamMember };

export function TeamTab({
  projectId,
  assignments,
  availableMembers,
}: {
  projectId: string;
  assignments: AssignmentWithMember[];
  availableMembers: { id: string; name: string; role: string }[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <TeamAssignForm projectId={projectId} members={availableMembers} />
      </div>

      {assignments.length === 0 ? (
        <EmptyState icon={UsersRound} title="No one assigned yet" className="py-10" />
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar name={a.teamMember.name} size="md" />
                <div>
                  <p className="text-sm font-medium text-foreground">{a.teamMember.name}</p>
                  <p className="text-xs text-muted">{titleCase(a.teamMember.role)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {a.role && <Badge variant="primary">{a.role}</Badge>}
                <ConfirmDeleteButton
                  label=""
                  action={removeTeamAssignment.bind(null, a.id, projectId)}
                  confirmMessage={`Remove ${a.teamMember.name} from this project?`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
