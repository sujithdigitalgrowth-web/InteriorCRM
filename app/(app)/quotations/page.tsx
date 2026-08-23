import Link from "next/link";
import { FileBarChart, IndianRupee, CheckCircle2, FileClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { QuotationFormDialog } from "@/components/quotations/quotation-form-dialog";
import { computeQuotationTotals } from "@/lib/quotation";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export default async function QuotationsPage() {
  const [quotations, projects] = await Promise.all([
    prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { include: { client: true } }, items: true },
    }),
    prisma.project.findMany({
      orderBy: { name: "asc" },
      include: { client: true },
    }),
  ]);

  const rows = quotations.map((q) => ({
    ...q,
    totals: computeQuotationTotals(q.items, q.discountPct),
  }));

  const totalValue = rows.reduce((sum, q) => sum + q.totals.finalAmount, 0);
  const acceptedCount = rows.filter((q) => q.status === "ACCEPTED").length;
  const pendingCount = rows.filter((q) => q.status === "DRAFT" || q.status === "SENT").length;

  return (
    <div>
      <PageHeader
        title="Quotations"
        description={`${quotations.length} room-wise quotations across the studio`}
        action={<QuotationFormDialog projects={projects} />}
      />

      {quotations.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Quotations"
            value={String(quotations.length)}
            icon={FileBarChart}
            tone="primary"
            trendLabel="Across all projects"
          />
          <StatCard
            label="Total Value"
            value={formatCompactCurrency(totalValue)}
            icon={IndianRupee}
            tone="info"
            trendLabel="After discounts"
          />
          <StatCard
            label="Accepted"
            value={String(acceptedCount)}
            icon={CheckCircle2}
            tone="sage"
            trendLabel="Ready to convert"
            subtitleTone="sage"
          />
          <StatCard
            label="Pending"
            value={String(pendingCount)}
            icon={FileClock}
            tone="ochre"
            trendLabel="Draft or sent"
          />
        </div>
      )}

      {quotations.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="No quotations yet"
          description="Create your first room-wise quotation for a project."
          action={<QuotationFormDialog projects={projects} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation</TableHead>
              <TableHead>Project / Client</TableHead>
              <TableHead>Date Raised</TableHead>
              <TableHead>Final Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((q) => (
              <TableRow key={q.id} className="group">
                <TableCell>
                  <Link href={`/quotations/${q.id}`} className="font-medium text-foreground group-hover:text-primary">
                    {q.quotationNumber}
                  </Link>
                  {q.title && <p className="text-xs text-muted">{q.title}</p>}
                </TableCell>
                <TableCell>
                  <Link href={`/projects/${q.project.id}`} className="text-sm text-foreground hover:text-primary">
                    {q.project.name}
                  </Link>
                  <p className="text-xs text-muted">{q.project.client.name}</p>
                </TableCell>
                <TableCell className="text-muted">{formatDate(q.createdAt)}</TableCell>
                <TableCell className="font-semibold text-foreground">
                  {formatCompactCurrency(q.totals.finalAmount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={q.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
