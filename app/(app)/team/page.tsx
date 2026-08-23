import { Users, UserCheck, Briefcase, UserX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/auth/permissions";
import { NoPermission } from "@/components/ui/no-permission";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { TeamMemberFormDialog } from "@/components/team/team-member-form-dialog";
import { TeamMemberCard } from "@/components/team/team-member-card";

const ROLE_ORDER = [
  "PRINCIPAL_DESIGNER",
  "ARCHITECT",
  "DESIGNER",
  "SITE_SUPERVISOR",
  "PROCUREMENT",
  "ACCOUNTS",
  "ADMIN",
];

export default async function TeamPage() {
  if (!(await can("manageTeam"))) {
    return (
      <div>
        <PageHeader title="Team" description="Studio team members and access." />
        <NoPermission />
      </div>
    );
  }

  const members = await prisma.teamMember.findMany({
    include: { assignments: { include: { project: true } } },
  });

  const sorted = [...members].sort((a, b) => {
    if (a.status !== b.status) return a.status === "ACTIVE" ? -1 : 1;
    const roleDiff = ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
    if (roleDiff !== 0) return roleDiff;
    return a.name.localeCompare(b.name);
  });

  const activeMembers = members.filter((m) => m.status === "ACTIVE").length;
  const onProjects = members.filter((m) => m.assignments.length > 0).length;
  const inactiveMembers = members.filter((m) => m.status === "INACTIVE").length;

  return (
    <div>
      <PageHeader
        title="Team"
        description={`${members.length} people on the studio team`}
        action={<TeamMemberFormDialog />}
      />

      {members.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Team"
            value={String(members.length)}
            icon={Users}
            tone="primary"
            trendLabel={`${members.length} in system`}
          />
          <StatCard
            label="Active"
            value={String(activeMembers)}
            icon={UserCheck}
            tone="sage"
            trendLabel="On the roster"
            subtitleTone="sage"
          />
          <StatCard
            label="On Projects"
            value={String(onProjects)}
            icon={Briefcase}
            tone="info"
            trendLabel="Currently assigned"
          />
          <StatCard
            label="Inactive"
            value={String(inactiveMembers)}
            icon={UserX}
            tone="danger"
            trendLabel="Not active"
            subtitleTone="danger"
          />
        </div>
      )}

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Add designers, architects and staff to the studio team."
          action={<TeamMemberFormDialog />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
