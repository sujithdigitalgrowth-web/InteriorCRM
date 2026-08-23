import Link from "next/link";
import { Mail, Phone, FolderKanban } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TeamMemberFormDialog } from "@/components/team/team-member-form-dialog";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { deleteTeamMember } from "@/lib/actions/team";
import { titleCase } from "@/lib/utils";
import type { TeamMember, TeamAssignment, Project } from "@prisma/client";

const VISIBLE_PROJECTS = 4;

type MemberWithAssignments = TeamMember & {
  assignments: (TeamAssignment & { project: Project })[];
};

export function TeamMemberCard({ member }: { member: MemberWithAssignments }) {
  const activeProjects = member.assignments
    .filter((a) => !["COMPLETED", "CANCELLED"].includes(a.project.status))
    .map((a) => a.project);
  const visible = activeProjects.slice(0, VISIBLE_PROJECTS);
  const remaining = activeProjects.length - visible.length;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3">
          <Avatar name={member.name} size="lg" />
          <div>
            <p className="text-sm font-semibold text-foreground">{member.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{titleCase(member.role)}</Badge>
              <Badge variant={member.status === "ACTIVE" ? "sage" : "neutral"}>
                {titleCase(member.status)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-1.5">
          {member.email && (
            <div className="flex items-center gap-2 text-muted">
              <Mail className="size-3.5" /> {member.email}
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-2 text-muted">
              <Phone className="size-3.5" /> {member.phone}
            </div>
          )}
          {!member.email && !member.phone && (
            <p className="text-xs text-muted">No contact details on file.</p>
          )}
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <FolderKanban className="size-3.5 text-muted" />
            {activeProjects.length === 0
              ? "No active projects"
              : `${activeProjects.length} active project${activeProjects.length === 1 ? "" : "s"}`}
          </div>
          {activeProjects.length > 0 && (
            <ul className="mt-2 space-y-1">
              {visible.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-xs text-muted hover:text-primary hover:underline"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
              {remaining > 0 && (
                <li className="text-xs text-muted">+{remaining} more</li>
              )}
            </ul>
          )}
        </div>

        <div className="flex gap-2 border-t border-border pt-3">
          <TeamMemberFormDialog member={member} />
          <ConfirmDeleteButton
            action={deleteTeamMember.bind(null, member.id)}
            confirmMessage={`Remove ${member.name} from the team? This will also remove their assignments from all projects.`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
