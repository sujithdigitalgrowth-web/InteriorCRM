import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { PrintButton } from "@/components/ui/print-button";
import { VendorOrderItemDialog } from "@/components/vendors/vendor-order-item-dialog";
import { colorFor } from "@/components/ui/avatar";
import { deleteVendorOrderItem } from "@/lib/actions/vendor-orders";
import { computeLineTotals, sumLineTotals } from "@/lib/vendor-order";
import { formatCurrency, initials } from "@/lib/utils";
import type { VendorOrderItem, Project } from "@prisma/client";

type ItemWithProject = VendorOrderItem & { project: Project };

export function VendorOrderCard({
  vendorId,
  vendorName,
  categoryLabel,
  items,
  projects,
  defaultCategory,
}: {
  vendorId: string;
  vendorName: string;
  categoryLabel: string;
  items: ItemWithProject[];
  projects: { id: string; name: string }[];
  defaultCategory: string;
}) {
  const totals = sumLineTotals(items);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/50 p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: colorFor(vendorId) }}
          >
            {initials(vendorName) || "?"}
          </div>
          <div>
            <p className="font-semibold text-foreground">{vendorName}</p>
            <p className="text-xs text-muted">
              {categoryLabel} · {items.length} order{items.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted">Total Value</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totals.withGst)}</p>
          </div>
          <VendorOrderItemDialog
            vendorId={vendorId}
            vendorName={vendorName}
            projects={projects}
            defaultCategory={defaultCategory}
          />
          <PrintButton />
        </div>
      </div>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project / Site</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Disc (%)</TableHead>
              <TableHead>Without GST</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>With GST</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const line = computeLineTotals(item);
              return (
                <TableRow key={item.id}>
                  <TableCell className="text-sm text-foreground">
                    <Link href={`/projects/${item.projectId}`} className="hover:text-primary hover:underline">
                      {item.project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{item.itemName}</TableCell>
                  <TableCell className="text-muted">{formatCurrency(item.rate)}</TableCell>
                  <TableCell className="text-muted">{item.quantity}</TableCell>
                  <TableCell className="text-muted">{item.discountPct.toFixed(2)}%</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(line.withoutGst)}</TableCell>
                  <TableCell className="text-ochre">{formatCurrency(line.gstAmount)}</TableCell>
                  <TableCell className="font-semibold text-sage">{formatCurrency(line.withGst)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <VendorOrderItemDialog
                        vendorId={vendorId}
                        vendorName={vendorName}
                        projects={projects}
                        defaultCategory={defaultCategory}
                        item={item}
                      />
                      <ConfirmDeleteButton
                        label=""
                        action={deleteVendorOrderItem.bind(null, item.id)}
                        confirmMessage={`Remove "${item.itemName}" from this order?`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex justify-end border-t border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            Total Value = <span className="text-primary">{formatCurrency(totals.withGst)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
