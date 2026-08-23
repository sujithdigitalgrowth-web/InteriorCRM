import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

type UpcomingTransaction = {
  id: string;
  amount: number;
  dueDate: Date | null;
  status: string;
  project: { name: string } | null;
  client: { name: string } | null;
  vendor: { name: string } | null;
};

export function UpcomingPayments({ transactions }: { transactions: UpcomingTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Nothing due soon"
        description="No payments due in the next 30 days."
        className="py-10"
      />
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => {
        const overdue = t.status === "OVERDUE";
        const name = t.project?.name ?? t.client?.name ?? t.vendor?.name ?? "—";
        return (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-3"
          >
            <div className="flex items-start gap-2.5">
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ background: overdue ? "var(--color-danger)" : "var(--color-info)" }}
              />
              <div>
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted">{formatDate(t.dueDate)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{formatCurrency(t.amount)}</p>
              <Badge variant={overdue ? "danger" : "info"} className="mt-1">
                {overdue ? "Overdue" : "Upcoming"}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
