import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, FolderKanban, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { ProjectFilters } from "@/components/projects/project-filters";
import { PROJECT_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS } from "@/lib/project-options";
import { can } from "@/lib/auth/permissions";
import { formatCompactCurrency, formatDate, titleCase } from "@/lib/utils";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const { status: statusParam, type: typeParam } = await searchParams;
  const hasRevenue = await can("revenue");
  const status = PROJECT_STATUS_OPTIONS.some((o) => o.value === statusParam) ? statusParam! : "ALL";
  const type = PROJECT_TYPE_OPTIONS.some((o) => o.value === typeParam) ? typeParam! : "ALL";

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const now = new Date();
  const runningProjects = projects.filter((p) => !["COMPLETED", "CANCELLED", "ON_HOLD"].includes(p.status));
  const nearHandover = runningProjects.filter((p) => p.status === "HANDOVER").length;
  const delayedProjects = projects.filter(
    (p) =>
      p.targetEndDate &&
      new Date(p.targetEndDate) < now &&
      !["COMPLETED", "CANCELLED"].includes(p.status)
  );
  const completedProjects = projects.filter((p) => p.status === "COMPLETED");
  const completedValue = completedProjects.reduce((sum, p) => sum + (p.budget ?? 0), 0);

  const filteredProjects = projects.filter(
    (p) => (status === "ALL" || p.status === status) && (type === "ALL" || p.type === type)
  );

  return (
    <div>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects across the studio`}
        action={<ProjectFormDialog clients={clients} />}
      />

      {projects.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Projects"
            value={String(projects.length)}
            icon={FolderKanban}
            tone="primary"
            trendLabel={`${projects.length} in system`}
          />
          <StatCard
            label="Running"
            value={String(runningProjects.length)}
            icon={Activity}
            tone="info"
            trendLabel={`${nearHandover} near handover`}
          />
          <StatCard
            label="Delayed"
            value={String(delayedProjects.length)}
            icon={AlertTriangle}
            tone="danger"
            trendLabel="Needs attention"
            subtitleTone="danger"
          />
          <StatCard
            label="Completed"
            value={String(completedProjects.length)}
            icon={CheckCircle2}
            tone="sage"
            trendLabel={hasRevenue ? `${formatCompactCurrency(completedValue)} delivered` : "Value restricted"}
            subtitleTone="sage"
          />
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start tracking timelines, team and budget."
          action={<ProjectFormDialog clients={clients} />}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <ProjectFilters status={status} type={type} />
            <p className="text-xs text-muted">
              {filteredProjects.length} of {projects.length} projects
            </p>
          </div>

          {filteredProjects.length === 0 ? (
            <EmptyState title="No projects match these filters" className="py-14" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City</TableHead>
                  {hasRevenue && <TableHead>Budget</TableHead>}
                  <TableHead>Target End</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="group">
                    <TableCell>
                      <Link href={`/projects/${project.id}`} className="block">
                        <span className="font-medium text-foreground group-hover:text-primary">
                          {project.name}
                        </span>
                        {project.code && (
                          <span className="ml-2 text-xs text-muted">{project.code}</span>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/clients/${project.clientId}`}
                        className="text-sm text-muted hover:text-foreground"
                      >
                        {project.client.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{titleCase(project.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted">
                      {project.city ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="size-3" /> {project.city}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    {hasRevenue && (
                      <TableCell className="text-foreground">{formatCompactCurrency(project.budget)}</TableCell>
                    )}
                    <TableCell className="text-muted">{formatDate(project.targetEndDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
