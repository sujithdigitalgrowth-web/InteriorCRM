import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Tag, Pencil, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/ui/status-dot";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { StarToggleButton } from "@/components/clients/star-toggle-button";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { deleteClient } from "@/lib/actions/clients";
import { formatCompactCurrency, formatDate, titleCase } from "@/lib/utils";
import type { Client } from "@prisma/client";

function MetricColumn({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-muted">{label}</p>
      <div className="mt-1 text-base font-semibold text-foreground">{value}</div>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}

export function ClientHeader({
  client,
  projectCount,
  activeProjectCount,
  totalValue,
  receivedAmount,
  hasRevenue = true,
}: {
  client: Client;
  projectCount: number;
  activeProjectCount: number;
  totalValue: number;
  receivedAmount: number;
  hasRevenue?: boolean;
}) {
  return (
    <div>
      <Link href="/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Clients
      </Link>

      <Card className="mb-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={client.name} className="size-14 text-base" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-medium text-foreground">{client.name}</h1>
                <StarToggleButton clientId={client.id} isPriority={client.isPriority} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {client.phone}
                </span>
                {client.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" /> {client.email}
                  </span>
                )}
                {(client.address || client.city) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {client.address}
                    {client.address && client.city ? ", " : ""}
                    {client.city}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Tag className="size-3.5" /> Source: {titleCase(client.source)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <MetricColumn
              label="PROJECTS"
              value={String(projectCount)}
              sub={`${activeProjectCount} Active`}
            />
            <MetricColumn
              label="TOTAL VALUE"
              value={hasRevenue ? formatCompactCurrency(totalValue) : "Restricted"}
              sub="Pipeline Value"
            />
            <MetricColumn
              label="PAYMENTS"
              value={hasRevenue ? formatCompactCurrency(receivedAmount) : "Restricted"}
              sub="Received"
            />
            <MetricColumn
              label="STATUS"
              value={<StatusDot status={client.status} />}
              sub={`Client Since ${formatDate(client.createdAt)}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <ClientFormDialog
              client={client}
              trigger={
                <Button variant="outline" size="sm">
                  <Pencil /> Edit Client
                </Button>
              }
            />
            <ProjectFormDialog
              clients={[{ id: client.id, name: client.name }]}
              defaultClientId={client.id}
              trigger={
                <Button size="sm">
                  <Plus /> New Project
                </Button>
              }
            />
            <ConfirmDeleteButton
              action={deleteClient.bind(null, client.id)}
              confirmMessage={`Delete ${client.name}? This will also remove their linked projects, agreements and transactions.`}
              label=""
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
