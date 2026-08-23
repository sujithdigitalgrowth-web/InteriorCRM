import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Period } from "@/lib/finance";

const PERIODS: { key: Period; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "yearly", label: "Yearly" },
];

export function PeriodToggle({ period }: { period: Period }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-surface-muted p-1">
      {PERIODS.map((p) => (
        <Link
          key={p.key}
          href={p.key === "monthly" ? "/finance" : `/finance?period=${p.key}`}
          className={cn(
            "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            period === p.key ? "bg-sidebar text-white shadow-sm" : "text-muted hover:text-foreground"
          )}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
