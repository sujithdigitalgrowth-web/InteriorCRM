import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ruler } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { QuotationFormDialog } from "@/components/quotations/quotation-form-dialog";
import { QuotationItemDialog } from "@/components/quotations/quotation-item-dialog";
import { QuotationPrintView } from "@/components/quotations/quotation-print-view";
import { DownloadPdfButton } from "@/components/quotations/download-pdf-button";
import { deleteQuotation, deleteQuotationItem } from "@/lib/actions/quotations";
import { computeQuotationTotals, groupByRoom } from "@/lib/quotation";
import { getSettings } from "@/lib/actions/settings";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [quotation, projects, settings] = await Promise.all([
    prisma.quotation.findUnique({
      where: { id },
      include: {
        project: { include: { client: true } },
        client: true,
        items: { orderBy: { order: "asc" } },
      },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" }, include: { client: true } }),
    getSettings(),
  ]);

  if (!quotation) notFound();

  const totals = computeQuotationTotals(quotation.items, quotation.discountPct);
  const rows = groupByRoom(quotation.items);

  return (
    <>
      <div className="mx-auto max-w-4xl print:hidden">
        <Link
          href="/quotations"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to Quotations
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{quotation.quotationNumber}</h1>
              <StatusBadge status={quotation.status} />
            </div>
            {quotation.title && <p className="mt-0.5 text-sm text-foreground">{quotation.title}</p>}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Link href={`/projects/${quotation.project.id}`} className="hover:text-primary">
                {quotation.project.name}
              </Link>
              <span>·</span>
              <Link href={`/clients/${quotation.client.id}`} className="hover:text-primary">
                {quotation.client.name}
              </Link>
              <span>· Raised {formatDate(quotation.createdAt)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <DownloadPdfButton />
            <QuotationFormDialog quotation={quotation} projects={projects} />
            <ConfirmDeleteButton
              action={deleteQuotation.bind(null, quotation.id)}
              confirmMessage={`Delete ${quotation.quotationNumber}? This will remove all its line items.`}
            />
          </div>
        </div>

        {quotation.notes && <Card className="mb-6 p-4 text-sm text-muted">{quotation.notes}</Card>}

        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Line Items ({quotation.items.length})</CardTitle>
            <QuotationItemDialog quotationId={quotation.id} />
          </CardHeader>
          <CardContent className="pt-0">
            {quotation.items.length === 0 ? (
              <EmptyState
                icon={Ruler}
                title="No line items yet"
                description="Add room-wise costing lines to build up this quotation."
                className="py-8"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Area / Qty</TableHead>
                    <TableHead>Final Total</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm font-medium text-foreground">
                        {item.showRoom ? item.room : ""}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{item.description}</TableCell>
                      <TableCell className="text-muted">
                        {item.lengthFt != null && item.breadthFt != null
                          ? `${item.lengthFt} X ${item.breadthFt}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted">
                        {item.areaOrQty != null ? item.areaOrQty.toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {item.amount != null ? formatCurrency(item.amount) : <em>{item.amountNote}</em>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <QuotationItemDialog quotationId={quotation.id} item={item} />
                          <ConfirmDeleteButton
                            action={deleteQuotationItem.bind(null, item.id, quotation.id)}
                            label=""
                            confirmMessage={`Remove "${item.description}" from this quotation?`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Total Amount</span>
                <span className="text-foreground">{formatCurrency(totals.totalAmount)}</span>
              </div>
              {quotation.discountPct > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">{quotation.discountLabel || `Discount (${quotation.discountPct}%)`}</span>
                  <span className="text-danger">-{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-base font-semibold text-foreground">Final Amount</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(totals.finalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <QuotationPrintView quotation={quotation} settings={settings} totals={totals} />
    </>
  );
}
