import Link from "next/link";
import { ArrowLeft, MapPin, CalendarRange, Ruler, Settings, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { TransactionFormDialog } from "@/components/finance/transaction-form-dialog";
import { deleteProject } from "@/lib/actions/projects";
import { statusVariant } from "@/lib/status";
import { formatDate, titleCase } from "@/lib/utils";
import type { Client, Project } from "@prisma/client";

type Option = { id: string; name: string };

const DOT_COLOR: Record<string, string> = {
  primary: "var(--color-primary)",
  sage: "var(--color-sage)",
  ochre: "var(--color-ochre)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  neutral: "var(--color-sidebar-muted)",
};

function DarkPill({ children, variant }: { children: React.ReactNode; variant: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white">
      <span className="size-1.5 rounded-full" style={{ background: DOT_COLOR[variant] }} />
      {children}
    </span>
  );
}

export function ProjectHeader({
  project,
  clients,
  projects,
  clientsForPayment,
  vendors,
}: {
  project: Project & { client: Client };
  clients: Option[];
  projects: Option[];
  clientsForPayment: Option[];
  vendors: Option[];
}) {
  return (
    <div className="-mx-4 -mt-6 mb-6 bg-sidebar px-4 pb-5 pt-4 md:-mx-8 md:px-8 md:pt-6">
      <Link
        href="/projects"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-sidebar-muted transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" /> Back to Projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {project.code && (
              <span className="font-mono text-xs text-sidebar-muted">{project.code}</span>
            )}
            <DarkPill variant={statusVariant(project.status)}>{titleCase(project.status)}</DarkPill>
          </div>
          <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-white">{project.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-sidebar-muted">
            <Link href={`/clients/${project.clientId}`} className="hover:text-white">
              {project.client.name}
            </Link>
            <span className="text-white/20">·</span>
            <span>{titleCase(project.type)}</span>
            {(project.address || project.city) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {project.address}
                {project.address && project.city ? ", " : ""}
                {project.city}
              </span>
            )}
            {project.area && (
              <span className="flex items-center gap-1.5">
                <Ruler className="size-3.5" /> {project.area.toLocaleString("en-IN")} sqft
              </span>
            )}
            {(project.startDate || project.targetEndDate) && (
              <span className="flex items-center gap-1.5">
                <CalendarRange className="size-3.5" />
                {formatDate(project.startDate)} – {formatDate(project.targetEndDate)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ProjectFormDialog
            project={project}
            clients={clients}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <Settings /> Edit Project Settings
              </Button>
            }
          />
          <TransactionFormDialog
            projects={projects}
            clients={clientsForPayment}
            vendors={vendors}
            defaultProjectId={project.id}
            defaultClientId={project.clientId}
            trigger={
              <Button size="sm" className="bg-info text-white hover:bg-info/90">
                <Wallet /> Add Payment
              </Button>
            }
          />
          <ConfirmDeleteButton
            action={deleteProject.bind(null, project.id)}
            confirmMessage={`Delete ${project.name}? This will also remove its milestones, links and transactions.`}
            className="border-white/15 bg-white/5 text-white hover:bg-danger/20 hover:text-danger"
          />
        </div>
      </div>
    </div>
  );
}
