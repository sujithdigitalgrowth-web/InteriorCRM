import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { MilestoneFormDialog } from "@/components/projects/milestone-form-dialog";
import { MilestoneStatusSelect } from "@/components/projects/milestone-status-select";
import { MilestoneProgressBar } from "@/components/projects/milestone-progress-bar";
import { deleteMilestone } from "@/lib/actions/milestones";
import { formatDate } from "@/lib/utils";
import type { Milestone } from "@prisma/client";

export function MilestoneTimeline({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: Milestone[];
}) {
  if (milestones.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No milestones yet"
        description="Add the first milestone to start this project's timeline."
        className="py-10"
      />
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {milestones.map((m) => {
        const overdue =
          m.dueDate && m.status !== "DONE" && new Date(m.dueDate) < new Date();
        return (
          <li key={m.id} className="relative">
            <span
              className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full border-2 border-surface"
              style={{
                backgroundColor:
                  m.status === "DONE"
                    ? "var(--color-sage)"
                    : overdue
                      ? "var(--color-danger)"
                      : m.status === "IN_PROGRESS"
                        ? "var(--color-primary)"
                        : "var(--color-border-strong)",
              }}
            />
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    {m.phase && <Badge variant="outline">{m.phase}</Badge>}
                    {overdue && <Badge variant="danger">Overdue</Badge>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
                    {m.startDate && <span>Start {formatDate(m.startDate)}</span>}
                    {m.dueDate && <span>Due {formatDate(m.dueDate)}</span>}
                    {m.completedAt && <span>Completed {formatDate(m.completedAt)}</span>}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-40 max-w-[50vw]">
                      <MilestoneProgressBar status={m.status} progressPct={m.progressPct} overdue={Boolean(overdue)} />
                    </div>
                    <span className="text-xs font-medium text-muted">{m.progressPct}%</span>
                  </div>
                  {m.notes && <p className="mt-2 text-xs text-muted">{m.notes}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <MilestoneStatusSelect id={m.id} projectId={projectId} status={m.status} />
                  <MilestoneFormDialog projectId={projectId} milestone={m} />
                  <ConfirmDeleteButton
                    label=""
                    action={deleteMilestone.bind(null, m.id, projectId)}
                    confirmMessage={`Delete milestone "${m.title}"?`}
                  />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
