import { statusVariant } from "@/lib/status";
import { titleCase } from "@/lib/utils";

const ORDER = [
  "ENQUIRY",
  "DESIGN",
  "APPROVAL",
  "EXECUTION",
  "HANDOVER",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
];

const DOT_COLOR: Record<string, string> = {
  primary: "var(--color-primary)",
  sage: "var(--color-sage)",
  ochre: "var(--color-ochre)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  neutral: "var(--color-border-strong)",
};

export function ProjectStatusChart({ data }: { data: Record<string, number> }) {
  const rows = ORDER.filter((s) => data[s] > 0).map((s) => ({ status: s, count: data[s] }));
  const max = Math.max(...rows.map((r) => r.count), 1);

  if (rows.length === 0) {
    return <div className="flex h-40 items-center justify-center text-sm text-muted">No projects yet</div>;
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const dotColor = DOT_COLOR[statusVariant(r.status)];
        return (
          <div key={r.status}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="size-2 rounded-full" style={{ background: dotColor }} />
                {titleCase(r.status)}
              </span>
              <span className="text-muted">{r.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${(r.count / max) * 100}%`, background: dotColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
