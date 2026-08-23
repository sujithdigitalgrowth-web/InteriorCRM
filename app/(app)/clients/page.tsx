import Link from "next/link";
import { Users, UserCheck, UserPlus, PauseCircle, Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { titleCase } from "@/lib/utils";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });

  const activeClients = clients.filter((c) => c.status === "ACTIVE").length;
  const leadClients = clients.filter((c) => c.status === "LEAD").length;
  const onHoldClients = clients.filter((c) => c.status === "ON_HOLD").length;

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} clients & leads in the studio`}
        action={<ClientFormDialog />}
      />

      {clients.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Clients"
            value={String(clients.length)}
            icon={Users}
            tone="primary"
            trendLabel={`${clients.length} in system`}
          />
          <StatCard
            label="Active"
            value={String(activeClients)}
            icon={UserCheck}
            tone="sage"
            trendLabel="Engaged"
            subtitleTone="sage"
          />
          <StatCard
            label="Leads"
            value={String(leadClients)}
            icon={UserPlus}
            tone="info"
            trendLabel="To convert"
          />
          <StatCard
            label="On Hold"
            value={String(onHoldClients)}
            icon={PauseCircle}
            tone="danger"
            trendLabel="Needs follow-up"
            subtitleTone="danger"
          />
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client or lead to get started."
          action={<ClientFormDialog />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} className="group">
                <TableCell>
                  <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                    <Avatar name={client.name} size="sm" />
                    <span className="font-medium text-foreground group-hover:text-primary">
                      {client.name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-muted">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Phone className="size-3" /> {client.phone}
                  </div>
                  {client.email && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                      <Mail className="size-3" /> {client.email}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-muted">{client.city || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{titleCase(client.source)}</Badge>
                </TableCell>
                <TableCell className="text-muted">{client._count.projects}</TableCell>
                <TableCell>
                  <StatusBadge status={client.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
