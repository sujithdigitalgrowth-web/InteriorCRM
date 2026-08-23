import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IndianRupee,
  ExternalLink,
  Receipt,
  HandCoins,
  Clock,
  TrendingUp,
  CheckCircle2,
  FileSignature,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProjectHeader } from "@/components/projects/project-header";
import { MilestoneFormDialog } from "@/components/projects/milestone-form-dialog";
import { MilestoneTimeline } from "@/components/projects/milestone-timeline";
import { MilestoneProgressBar } from "@/components/projects/milestone-progress-bar";
import { TeamTab } from "@/components/projects/team-tab";
import { TeamAssignDialog } from "@/components/projects/team-assign-dialog";
import { VendorsTab } from "@/components/projects/vendors-tab";
import { QuickContactCard } from "@/components/projects/quick-contact-card";
import { ClientInfoCard } from "@/components/projects/client-info-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { NoPermission } from "@/components/ui/no-permission";
import { buildRecentActivity } from "@/lib/activity";
import { can } from "@/lib/auth/permissions";
import { formatCompactCurrency, formatCurrency, formatDate, titleCase } from "@/lib/utils";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      milestones: { orderBy: [{ order: "asc" }, { dueDate: "asc" }] },
      vendorLinks: { include: { vendor: true }, orderBy: { createdAt: "desc" } },
      transactions: { orderBy: { createdAt: "desc" } },
      agreements: { orderBy: { createdAt: "desc" } },
      quotations: { orderBy: { updatedAt: "desc" } },
      assignments: { include: { teamMember: true }, orderBy: { assignedAt: "asc" } },
    },
  });

  if (!project) notFound();

  const hasRevenue = await can("revenue");

  const [clients, activeMembers, vendors] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.teamMember.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
    prisma.vendor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, category: true } }),
  ]);

  const budget = project.budget ?? 0;
  const collectedAmount = project.transactions
    .filter((t) => t.type === "CLIENT_PAYMENT" && t.status === "PAID")
    .reduce((sum, t) => sum + t.amount, 0);
  const spentAmount = project.transactions
    .filter((t) => (t.type === "VENDOR_PAYMENT" || t.type === "EXPENSE") && t.status === "PAID")
    .reduce((sum, t) => sum + t.amount, 0);
  const collectionPct = budget > 0 ? Math.min(100, Math.round((collectedAmount / budget) * 100)) : 0;
  const remaining = Math.max(budget - collectedAmount, 0);
  const grossProfit = budget - spentAmount;
  const marginPct = budget > 0 ? Math.round((grossProfit / budget) * 100) : 0;
  const doneMilestones = project.milestones.filter((m) => m.status === "DONE").length;
  const completionPct = project.milestones.length
    ? Math.round(project.milestones.reduce((sum, m) => sum + m.progressPct, 0) / project.milestones.length)
    : 0;

  const assignedVendorIds = new Set(project.vendorLinks.map((v) => v.vendorId));
  const assignedMemberIds = new Set(project.assignments.map((a) => a.teamMemberId));
  const availableMembers = activeMembers.filter((m) => !assignedMemberIds.has(m.id));

  const activity = buildRecentActivity({
    clients: [],
    payments: hasRevenue
      ? project.transactions
          .filter((t) => t.type === "CLIENT_PAYMENT" && t.status === "PAID" && t.paidDate)
          .map((t) => ({ id: t.id, amount: t.amount, paidDate: t.paidDate, client: { name: project.client.name } }))
      : [],
    agreements: project.agreements.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      updatedAt: a.updatedAt,
    })),
    milestones: project.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      completedAt: m.completedAt,
      updatedAt: m.updatedAt,
      project: { name: project.name },
    })),
    quotations: project.quotations.map((q) => ({
      id: q.id,
      quotationNumber: q.quotationNumber,
      title: q.title,
      updatedAt: q.updatedAt,
    })),
    projects: [
      { id: project.id, name: project.name, status: project.status, createdAt: project.createdAt, updatedAt: project.updatedAt },
    ],
  }).slice(0, 8);

  return (
    <div>
      <ProjectHeader
        project={project}
        clients={clients}
        projects={[{ id: project.id, name: project.name }]}
        clientsForPayment={[{ id: project.clientId, name: project.client.name }]}
        vendors={vendors}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="documents">Agreements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {hasRevenue ? (
              <>
                <StatCard
                  label="Budget"
                  value={formatCompactCurrency(project.budget)}
                  icon={IndianRupee}
                  tone="primary"
                  trendLabel="Project total"
                />
                <StatCard
                  label="Spent"
                  value={formatCompactCurrency(spentAmount)}
                  icon={Receipt}
                  tone="ochre"
                  trendLabel={budget > 0 ? `${Math.round((spentAmount / budget) * 100)}% of budget` : "No budget set"}
                />
                <StatCard
                  label="Paid by Client"
                  value={formatCompactCurrency(collectedAmount)}
                  icon={HandCoins}
                  tone="sage"
                  trendLabel={budget > 0 ? `${collectionPct}% received` : "No budget set"}
                  subtitleTone="sage"
                />
                <StatCard
                  label="Remaining"
                  value={formatCompactCurrency(remaining)}
                  icon={Clock}
                  tone="info"
                  trendLabel="To be collected"
                />
                <StatCard
                  label="Gross Profit"
                  value={formatCompactCurrency(grossProfit)}
                  icon={TrendingUp}
                  tone={grossProfit >= 0 ? "sage" : "danger"}
                  trendLabel={budget > 0 ? `${marginPct}% margin` : "No budget set"}
                  subtitleTone={grossProfit >= 0 ? "sage" : "danger"}
                />
              </>
            ) : (
              <div className="col-span-2 sm:col-span-3 lg:col-span-5">
                <StatCard label="Financials" value="Restricted" icon={IndianRupee} tone="primary" trendLabel="No revenue access" />
              </div>
            )}
            <StatCard
              label="Completion"
              value={`${completionPct}%`}
              icon={CheckCircle2}
              tone="primary"
              trendLabel={
                project.milestones.length ? `${doneMilestones}/${project.milestones.length} done` : "No milestones yet"
              }
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {project.milestones.length === 0 ? (
                  <EmptyState title="No milestones yet" className="py-8" />
                ) : (
                  <div className="space-y-4">
                    {project.milestones.map((m) => {
                      const overdue = Boolean(m.dueDate) && m.status !== "DONE" && new Date(m.dueDate as Date) < new Date();
                      return (
                        <div key={m.id}>
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-foreground">{m.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted">{m.progressPct}%</span>
                              <StatusBadge status={overdue ? "DELAYED" : m.status} />
                            </div>
                          </div>
                          <MilestoneProgressBar status={m.status} progressPct={m.progressPct} overdue={overdue} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Assigned Team</CardTitle>
                <TeamAssignDialog projectId={project.id} members={availableMembers} />
              </CardHeader>
              <CardContent>
                {project.assignments.length === 0 ? (
                  <EmptyState title="No one assigned yet" className="py-8" />
                ) : (
                  <div className="space-y-2">
                    {project.assignments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={a.teamMember.name} size="md" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{a.teamMember.name}</p>
                            <p className="text-xs text-muted">{titleCase(a.teamMember.role)}</p>
                          </div>
                        </div>
                        {a.role && <Badge variant="primary">{a.role}</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed items={activity} />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <QuickContactCard phone={project.client.phone} email={project.client.email} />
              <ClientInfoCard client={project.client} />
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {project.description ? (
                <p className="text-sm text-foreground">{project.description}</p>
              ) : (
                <p className="text-sm text-muted">No description added.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="mb-4 flex justify-end">
            <MilestoneFormDialog projectId={project.id} />
          </div>
          <MilestoneTimeline projectId={project.id} milestones={project.milestones} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab projectId={project.id} assignments={project.assignments} availableMembers={availableMembers} />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorsTab
            projectId={project.id}
            links={project.vendorLinks}
            availableVendors={vendors.filter((v) => !assignedVendorIds.has(v.id))}
          />
        </TabsContent>

        <TabsContent value="financials">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Transactions</CardTitle>
              <Link href="/finance" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Manage in Finance <ExternalLink className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {!hasRevenue ? (
                <NoPermission />
              ) : project.transactions.length === 0 ? (
                <EmptyState icon={Receipt} title="No transactions yet" className="py-10" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-foreground">{titleCase(t.type)}</TableCell>
                        <TableCell>{formatCurrency(t.amount)}</TableCell>
                        <TableCell className="text-muted">{formatDate(t.dueDate)}</TableCell>
                        <TableCell className="text-muted">{formatDate(t.paidDate)}</TableCell>
                        <TableCell>
                          <StatusBadge status={t.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Agreements</CardTitle>
              <Link href="/agreements" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Open <ExternalLink className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {project.agreements.length === 0 ? (
                <EmptyState icon={FileSignature} title="No agreements yet" className="py-8" />
              ) : (
                <div className="space-y-2">
                  {project.agreements.map((a) => (
                    <Link
                      key={a.id}
                      href="/agreements"
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-muted"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.title}</p>
                        <p className="text-xs text-muted">{titleCase(a.type)}{hasRevenue ? ` · ${formatCurrency(a.value)}` : ""}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
