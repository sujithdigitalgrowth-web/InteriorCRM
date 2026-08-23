import Link from "next/link";
import { FileText, FileCheck2, FileClock, FileX2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { AgreementFormDialog } from "@/components/agreements/agreement-form-dialog";
import { AgreementStatusSelect } from "@/components/agreements/agreement-status-select";
import { deleteAgreement } from "@/lib/actions/agreements";
import { formatCompactCurrency, formatCurrency, formatDate, titleCase } from "@/lib/utils";

export default async function AgreementsPage() {
  const [agreements, projects, clients] = await Promise.all([
    prisma.agreement.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: true, client: true },
    }),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const signedAgreements = agreements.filter((a) => a.status === "SIGNED");
  const signedValue = signedAgreements.reduce((sum, a) => sum + (a.value ?? 0), 0);
  const pendingAgreements = agreements.filter((a) => a.status === "DRAFT" || a.status === "SENT");
  const expiredAgreements = agreements.filter((a) => a.status === "EXPIRED");

  return (
    <div>
      <PageHeader
        title="Agreements"
        description={`${agreements.length} agreements & contracts on file`}
        action={<AgreementFormDialog projects={projects} clients={clients} />}
      />

      {agreements.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Agreements"
            value={String(agreements.length)}
            icon={FileText}
            tone="primary"
            trendLabel={`${agreements.length} on file`}
          />
          <StatCard
            label="Signed"
            value={String(signedAgreements.length)}
            icon={FileCheck2}
            tone="sage"
            trendLabel={`${formatCompactCurrency(signedValue)} value`}
            subtitleTone="sage"
          />
          <StatCard
            label="Pending"
            value={String(pendingAgreements.length)}
            icon={FileClock}
            tone="ochre"
            trendLabel="Awaiting signature"
          />
          <StatCard
            label="Expired"
            value={String(expiredAgreements.length)}
            icon={FileX2}
            tone="danger"
            trendLabel="Needs renewal"
            subtitleTone="danger"
          />
        </div>
      )}

      {agreements.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No agreements yet"
          description="Add a design agreement, execution contract, or NDA to get started."
          action={<AgreementFormDialog projects={projects} clients={clients} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Linked to</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agreements.map((agreement) => (
              <TableRow key={agreement.id}>
                <TableCell>
                  <span className="font-medium text-foreground">{agreement.title}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{titleCase(agreement.type)}</Badge>
                </TableCell>
                <TableCell className="text-muted">
                  <div className="flex flex-col gap-0.5 text-xs">
                    {agreement.client && (
                      <Link
                        href={`/clients/${agreement.client.id}`}
                        className="text-foreground hover:text-primary hover:underline"
                      >
                        {agreement.client.name}
                      </Link>
                    )}
                    {agreement.project && (
                      <Link
                        href={`/projects/${agreement.project.id}`}
                        className="text-foreground hover:text-primary hover:underline"
                      >
                        {agreement.project.name}
                      </Link>
                    )}
                    {!agreement.client && !agreement.project && "—"}
                  </div>
                </TableCell>
                <TableCell className="text-muted">{formatCurrency(agreement.value)}</TableCell>
                <TableCell className="text-muted">{formatDate(agreement.startDate)}</TableCell>
                <TableCell className="text-muted">{formatDate(agreement.endDate)}</TableCell>
                <TableCell>
                  <AgreementStatusSelect id={agreement.id} status={agreement.status} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <AgreementFormDialog agreement={agreement} projects={projects} clients={clients} />
                    <ConfirmDeleteButton
                      action={deleteAgreement.bind(null, agreement.id)}
                      confirmMessage={`Delete "${agreement.title}"? This cannot be undone.`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
