import Link from "next/link";
import { FolderKanban, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { colorFor } from "@/components/ui/avatar";
import { formatCompactCurrency, formatDate, initials, titleCase } from "@/lib/utils";

export type ClientProjectRow = {
  id: string;
  name: string;
  status: string;
  type: string;
  city: string | null;
  startDate: Date | null;
  targetEndDate: Date | null;
  budget: number | null;
  paid: number;
  due: number;
  paidPct: number;
};

export function ClientProjectsList({
  projects,
  hasRevenue = true,
}: {
  projects: ClientProjectRow[];
  hasRevenue?: boolean;
}) {
  if (projects.length === 0) {
    return <EmptyState icon={FolderKanban} title="No projects yet" className="py-8" />;
  }

  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}`}
          className="block rounded-xl border border-border p-3.5 transition-colors hover:bg-surface-muted"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                style={{ background: colorFor(p.id) }}
              >
                {initials(p.name) || "?"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {titleCase(p.type)}
                  {p.city && (
                    <span className="ml-1.5 inline-flex items-center gap-1">
                      <MapPin className="size-3" /> {p.city}
                    </span>
                  )}
                </p>
                {(p.startDate || p.targetEndDate) && (
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDate(p.startDate)} – {formatDate(p.targetEndDate)}
                  </p>
                )}
              </div>
            </div>
            {hasRevenue && (
              <div className="flex gap-4 text-right text-xs">
                <div>
                  <p className="text-muted">Project Value</p>
                  <p className="font-semibold text-foreground">{formatCompactCurrency(p.budget)}</p>
                </div>
                <div>
                  <p className="text-muted">Paid</p>
                  <p className="font-semibold text-sage">{formatCompactCurrency(p.paid)}</p>
                </div>
                <div>
                  <p className="text-muted">Due</p>
                  <p className="font-semibold text-ochre">{formatCompactCurrency(p.due)}</p>
                </div>
              </div>
            )}
          </div>
          {hasRevenue && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-sage" style={{ width: `${Math.min(100, p.paidPct)}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-medium text-muted">{p.paidPct}%</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
