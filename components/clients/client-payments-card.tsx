import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export type ClientPaymentRow = {
  id: string;
  reference: string | null;
  status: string;
  amount: number;
  dueDate: Date | null;
  paidDate: Date | null;
};

export function ClientPaymentsCard({ payments }: { payments: ClientPaymentRow[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Payments</CardTitle>
        {payments.length > 0 && (
          <Link href="/finance" className="text-xs font-medium text-primary hover:underline">
            View All
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <EmptyState title="No payments yet" className="py-6" />
        ) : (
          <div className="space-y-2.5">
            {payments.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{t.reference || "Client Payment"}</p>
                  <p className="text-xs text-muted">{formatDate(t.paidDate ?? t.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCompactCurrency(t.amount)}</p>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
