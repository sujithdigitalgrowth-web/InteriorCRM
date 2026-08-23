import Link from "next/link";
import { IndianRupee, FolderKanban, Users, AlertTriangle, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NoPermission } from "@/components/ui/no-permission";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ProjectStatusChart } from "@/components/dashboard/project-status-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DateRangeSelect } from "@/components/dashboard/date-range-select";
import { TopbarPortal } from "@/components/layout/topbar-portal";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { colorFor } from "@/components/ui/avatar";
import { buildRecentActivity } from "@/lib/activity";
import { getSettings } from "@/lib/actions/settings";
import { can } from "@/lib/auth/permissions";
import { greeting, pctChange, resolveDateRange, TREND_COMPARISON_LABEL, type DateRange } from "@/lib/dashboard";
import { formatCompactCurrency, formatDate, initials } from "@/lib/utils";

const RANGES: DateRange[] = ["thisMonth", "lastMonth", "thisQuarter", "thisYear", "allTime", "custom"];

function parseDateParam(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { range: rawRange, from: rawFrom, to: rawTo } = await searchParams;
  let range: DateRange = RANGES.includes(rawRange as DateRange) ? (rawRange as DateRange) : "thisMonth";

  const customFrom = parseDateParam(rawFrom);
  const customTo = parseDateParam(rawTo);
  const customRange = customFrom && customTo && customFrom <= customTo ? { from: customFrom, to: customTo } : undefined;
  if (range === "custom" && !customRange) range = "thisMonth";

  const hasRevenue = await can("revenue");
  const now = new Date();
  const { start: periodStart } = resolveDateRange(range, now, customRange);
  const trendLabelSuffix = TREND_COMPARISON_LABEL[range];

  const [
    activeProjects,
    allProjects,
    clients,
    pendingPayments,
    overduePayments,
    upcomingMilestones,
    collectedTransactions,
    recentClients,
    recentPayments,
    recentAgreements,
    recentMilestones,
    recentlyUpdatedProjects,
    settings,
  ] = await Promise.all([
    prisma.project.findMany({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.project.findMany({ select: { id: true, status: true, budget: true, createdAt: true } }),
    prisma.client.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, createdAt: true } }),
    prisma.transaction.aggregate({
      where: { type: "CLIENT_PAYMENT", status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.findMany({
      where: { type: "CLIENT_PAYMENT", status: "OVERDUE" },
      include: { client: true, project: true },
      take: 5,
    }),
    prisma.milestone.findMany({
      where: { status: { in: ["PENDING", "IN_PROGRESS"] }, dueDate: { not: null } },
      include: { project: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: { status: "PAID", paidDate: { not: null } },
      orderBy: { paidDate: "asc" },
    }),
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.transaction.findMany({
      where: { status: "PAID", type: "CLIENT_PAYMENT", paidDate: { not: null } },
      orderBy: { paidDate: "desc" },
      take: 5,
      select: { id: true, amount: true, paidDate: true, client: { select: { name: true } } },
    }),
    prisma.agreement.findMany({
      where: { status: "SIGNED" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    prisma.milestone.findMany({
      where: { status: "DONE", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        completedAt: true,
        updatedAt: true,
        project: { select: { name: true } },
      },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, name: true, status: true, createdAt: true, updatedAt: true },
    }),
    getSettings(),
  ]);

  const isActive = (p: { status: string }) => !["COMPLETED", "CANCELLED"].includes(p.status);

  const activeCount = allProjects.filter(isActive).length;
  const activeCountPrev = allProjects.filter((p) => isActive(p) && p.createdAt < periodStart).length;

  const totalClients = clients.length;
  const totalClientsPrev = clients.filter((c) => c.createdAt < periodStart).length;

  const totalBudget = allProjects.filter(isActive).reduce((sum, p) => sum + (p.budget ?? 0), 0);
  const totalBudgetPrev = allProjects
    .filter((p) => isActive(p) && p.createdAt < periodStart)
    .reduce((sum, p) => sum + (p.budget ?? 0), 0);

  const pendingAmount = pendingPayments._sum.amount ?? 0;

  const statusCounts = allProjects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  const monthlyRevenue = buildMonthlySeries(collectedTransactions);

  const activity = buildRecentActivity({
    clients: recentClients,
    payments: hasRevenue ? recentPayments : [],
    agreements: recentAgreements,
    milestones: recentMilestones,
    projects: recentlyUpdatedProjects,
  }).slice(0, 6);

  const showTrend = range !== "allTime";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.75rem] font-medium tracking-tight text-foreground">
            {greeting(now)}, {settings.businessName} 👋
          </h1>
          <p className="mt-0.5 text-sm text-muted">Here&apos;s what&apos;s happening with your studio today.</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelect range={range} from={rawFrom} to={rawTo} />
        </div>
      </div>
      <TopbarPortal>
        <ProjectFormDialog clients={clients} />
      </TopbarPortal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Projects"
          value={String(activeCount)}
          icon={FolderKanban}
          tone="primary"
          href="/projects"
          trend={showTrend ? pctChange(activeCount, activeCountPrev) : undefined}
          trendLabel={trendLabelSuffix}
        />
        <StatCard
          label="Total Clients"
          value={String(totalClients)}
          icon={Users}
          tone="info"
          href="/clients"
          trend={showTrend ? pctChange(totalClients, totalClientsPrev) : undefined}
          trendLabel={trendLabelSuffix}
        />
        {hasRevenue ? (
          <StatCard
            label="Pipeline Value"
            value={formatCompactCurrency(totalBudget)}
            icon={IndianRupee}
            tone="sage"
            href="/projects"
            trend={showTrend ? pctChange(totalBudget, totalBudgetPrev) : undefined}
            trendLabel={trendLabelSuffix}
          />
        ) : (
          <StatCard label="Pipeline Value" value="Restricted" icon={Lock} tone="sage" trendLabel="No revenue access" />
        )}
        {hasRevenue ? (
          <StatCard
            label="Pending Collections"
            value={formatCompactCurrency(pendingAmount)}
            icon={AlertTriangle}
            tone="ochre"
            href="/finance"
            trendLabel={`${pendingPayments._count} invoices due`}
          />
        ) : (
          <StatCard label="Pending Collections" value="Restricted" icon={Lock} tone="ochre" trendLabel="No revenue access" />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Collections Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {hasRevenue ? <RevenueChart data={monthlyRevenue} /> : <NoPermission title="Revenue data is restricted" description="" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Projects by Stage</CardTitle>
            <Link href="/projects" className="text-xs font-medium text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart data={statusCounts} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Active Projects</CardTitle>
            <Link href="/projects" className="text-xs font-medium text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {activeProjects.length === 0 ? (
              <EmptyState icon={FolderKanban} title="No active projects" className="py-8" />
            ) : (
              <div className="space-y-2">
                {activeProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-muted"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                        style={{ background: colorFor(p.id) }}
                      >
                        {initials(p.name) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                        <p className="truncate text-xs text-muted">{p.client.name}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={p.status} />
                      {hasRevenue && (
                        <p className="mt-1 text-xs font-medium text-foreground">
                          {formatCompactCurrency(p.budget)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMilestones.length === 0 ? (
              <EmptyState title="Nothing due soon" className="py-8" />
            ) : (
              <div className="space-y-3">
                {upcomingMilestones.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 text-sm">
                    <span className="w-20 shrink-0 whitespace-nowrap pt-0.5 text-xs text-muted">
                      {formatDate(m.dueDate)}
                    </span>
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{m.title}</p>
                      <p className="truncate text-xs text-muted">{m.project.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={activity} />
          </CardContent>
        </Card>
      </div>

      {hasRevenue && overduePayments.length > 0 && (
        <Card className="mt-6 border-danger/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="size-4" /> Overdue Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overduePayments.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{t.client?.name ?? "—"}</p>
                  <p className="text-xs text-muted">{t.project?.name}</p>
                </div>
                <p className="font-semibold text-danger">{formatCompactCurrency(t.amount)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function buildMonthlySeries(transactions: { amount: number; paidDate: Date | null; type: string }[]) {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months[`${d.toLocaleString("en-IN", { month: "short" })} '${String(d.getFullYear()).slice(2)}`] = 0;
  }
  for (const t of transactions) {
    if (!t.paidDate || t.type !== "CLIENT_PAYMENT") continue;
    const d = new Date(t.paidDate);
    const key = `${d.toLocaleString("en-IN", { month: "short" })} '${String(d.getFullYear()).slice(2)}`;
    if (key in months) months[key] += t.amount;
  }
  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}
