import { cn } from "@/lib/utils";

export function MilestoneProgressBar({
  status,
  progressPct,
  overdue,
  size = "md",
}: {
  status: string;
  progressPct: number;
  overdue?: boolean;
  size?: "sm" | "md";
}) {
  const barColor =
    status === "DONE"
      ? "bg-sage"
      : overdue || status === "DELAYED"
        ? "bg-danger"
        : status === "IN_PROGRESS"
          ? "bg-primary"
          : "bg-border-strong";
  const height = size === "sm" ? "h-1.5" : "h-2";
  const pct = Math.min(100, Math.max(0, progressPct));

  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-surface-muted", height)}>
      <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
    </div>
  );
}
