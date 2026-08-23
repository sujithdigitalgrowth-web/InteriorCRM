"use client";

import * as React from "react";
import { Receipt } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { TransactionFormDialog } from "@/components/finance/transaction-form-dialog";
import { MarkPaidButton } from "@/components/finance/mark-paid-button";
import { deleteTransaction } from "@/lib/actions/transactions";
import { formatCurrency, formatDate, titleCase } from "@/lib/utils";
import type { Transaction } from "@prisma/client";

type Option = { id: string; name: string };

export type TransactionRow = Transaction & {
  project: { id: string; name: string } | null;
  client: { id: string; name: string } | null;
  vendor: { id: string; name: string } | null;
};

const TABS = [
  { value: "ALL", label: "All" },
  { value: "CLIENT_PAYMENT", label: "Client Payments" },
  { value: "VENDOR_PAYMENT", label: "Vendor Payments" },
  { value: "EXPENSE", label: "Expenses" },
  { value: "REFUND", label: "Refunds" },
] as const;

export function TransactionsTable({
  transactions,
  projects,
  clients,
  vendors,
}: {
  transactions: TransactionRow[];
  projects: Option[];
  clients: Option[];
  vendors: Option[];
}) {
  const [tab, setTab] = React.useState<string>("ALL");

  const filtered = tab === "ALL" ? transactions : transactions.filter((t) => t.type === tab);

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={tab}>
        {filtered.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions" description="No transactions match this filter yet." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due / Paid</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const relatedName = t.project?.name ?? t.client?.name ?? t.vendor?.name ?? "—";
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Badge variant="outline">{titleCase(t.type)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{relatedName}</TableCell>
                    <TableCell className="font-semibold text-foreground">{formatCurrency(t.amount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="text-muted">
                      {t.paidDate ? formatDate(t.paidDate) : formatDate(t.dueDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {(t.status === "PENDING" || t.status === "OVERDUE") && (
                          <MarkPaidButton id={t.id} />
                        )}
                        <TransactionFormDialog
                          transaction={t}
                          projects={projects}
                          clients={clients}
                          vendors={vendors}
                        />
                        <ConfirmDeleteButton
                          action={deleteTransaction.bind(null, t.id)}
                          confirmMessage="Delete this transaction? This cannot be undone."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TabsContent>
    </Tabs>
  );
}
