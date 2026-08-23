import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export type QuoteRow = {
  id: string;
  label: string;
  status: string;
  total: number;
  updatedAt: Date;
};

export function ClientQuotesCard({ quotes }: { quotes: QuoteRow[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Quotes</CardTitle>
        {quotes.length > 0 && (
          <Link href="/quotations" className="text-xs font-medium text-primary hover:underline">
            View All
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <EmptyState title="No quotes yet" className="py-6" />
        ) : (
          <div className="space-y-2.5">
            {quotes.map((q) => (
              <Link
                key={q.id}
                href={`/quotations/${q.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-muted"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{q.label}</p>
                    <StatusBadge status={q.status} />
                  </div>
                  <p className="text-xs text-muted">{formatDate(q.updatedAt)}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-foreground">{formatCompactCurrency(q.total)}</p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
