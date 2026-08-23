import { IndianRupee, Receipt, HandCoins, Clock, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/auth/permissions";
import { NoPermission } from "@/components/ui/no-permission";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PeriodToggle } from "@/components/finance/period-toggle";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { BudgetVsActualChart } from "@/components/finance/budget-vs-actual-chart";
import { ExpenseBreakdownChart } from "@/components/finance/expense-breakdown-chart";
import { CashFlowChart } from "@/components/finance/cash-flow-chart";
import { UpcomingPayments } from "@/components/finance/upcoming-payments";
import { TransactionFormDialog } from "@/components/finance/transaction-form-dialog";
import { TransactionsTable } from "@/components/finance/transactions-table";
import { buildCashFlowSeries, buildExpenseBreakdown, type Period } from "@/lib/finance";
import { formatCompactCurrency } from "@/lib/utils";

const PERIODS: Period[] = ["weekly", "monthly", "quarterly", "yearly"];

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  if (!(await can("finance"))) {
    return (
      <div>
        <PageHeader title="Finance" description="Studio-wide revenue, expenses, and cash flow." />
        <NoPermission />
      </div>
    );
  }

  const { period: rawPeriod } = await searchParams;
  const period: Period = PERIODS.includes(rawPeriod as Period) ? (rawPeriod as Period) : "monthly";

  const [transactions, projects, clients, vendors] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        vendor: { select: { id: true, name: true } },
      },
    }),
    prisma.project.findMany({
      where: { budget: { not: null } },
      orderBy: { budget: "desc" },
      select: { id: true, name: true, budget: true },
    }),
    prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.vendor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget ?? 0), 0);
  const totalSpent = transactions
    .filter((t) => t.status === "PAID" && (t.type === "VENDOR_PAYMENT" || t.type === "EXPENSE"))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = transactions
    .filter((t) => t.status === "PAID" && t.type === "CLIENT_PAYMENT")
    .reduce((sum, t) => sum + t.amount, 0);
  const receivable = transactions
    .filter((t) => t.type === "CLIENT_PAYMENT" && (t.status === "PENDING" || t.status === "OVERDUE"))
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalReceived - totalSpent;
  const marginPct = totalReceived > 0 ? Math.round((netProfit / totalReceived) * 100) : 0;

  const budgetVsActual = projects.slice(0, 5).map((p) => {
    const actual = transactions
      .filter(
        (t) => t.projectId === p.id && t.status === "PAID" && (t.type === "VENDOR_PAYMENT" || t.type === "EXPENSE")
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name: p.name.length > 16 ? `${p.name.slice(0, 15)}…` : p.name,
      budget: p.budget ?? 0,
      actual,
    };
  });

  const expenseBreakdown = buildExpenseBreakdown(transactions);
  const cashFlowSeries = buildCashFlowSeries(transactions, period);
  const revenueTrend = cashFlowSeries.map((d) => ({ month: d.label, amount: d.inflow }));

  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const upcomingPayments = transactions
    .filter(
      (t) =>
        t.type === "CLIENT_PAYMENT" &&
        (t.status === "PENDING" || t.status === "OVERDUE") &&
        t.dueDate &&
        new Date(t.dueDate) <= in30Days
    )
    .sort((a, b) => new Date(a.dueDate as Date).getTime() - new Date(b.dueDate as Date).getTime())
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Financial Dashboard"
        description="Comprehensive financial overview · ROAR Studio"
        action={
          <div className="flex items-center gap-2">
            <PeriodToggle period={period} />
            <TransactionFormDialog projects={projects} clients={clients} vendors={vendors} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Budget"
          value={formatCompactCurrency(totalBudget)}
          icon={IndianRupee}
          tone="primary"
          trendLabel="Across all projects"
        />
        <StatCard
          label="Total Spent"
          value={formatCompactCurrency(totalSpent)}
          icon={Receipt}
          tone="ochre"
          trendLabel={totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% of budget` : "No budget set"}
        />
        <StatCard
          label="Total Received"
          value={formatCompactCurrency(totalReceived)}
          icon={HandCoins}
          tone="sage"
          trendLabel="Collections to date"
          subtitleTone="sage"
        />
        <StatCard
          label="Receivable"
          value={formatCompactCurrency(receivable)}
          icon={Clock}
          tone="ochre"
          trendLabel="Pending collection"
        />
        <StatCard
          label="Net Profit"
          value={formatCompactCurrency(netProfit)}
          icon={TrendingUp}
          tone={netProfit >= 0 ? "sage" : "danger"}
          trendLabel={totalReceived > 0 ? `${marginPct}% margin` : "No collections yet"}
          subtitleTone={netProfit >= 0 ? "sage" : "danger"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
            <p className="text-xs text-muted">Per project comparison</p>
          </CardHeader>
          <CardContent>
            <BudgetVsActualChart data={budgetVsActual} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <p className="text-xs text-muted">By category</p>
          </CardHeader>
          <CardContent>
            <ExpenseBreakdownChart breakdown={expenseBreakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <p className="text-xs text-muted">{period[0].toUpperCase() + period.slice(1)} collections</p>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueTrend} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
            <p className="text-xs text-muted">Inflow vs outflow</p>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={cashFlowSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <p className="text-xs text-muted">Next 30 days</p>
          </CardHeader>
          <CardContent>
            <UpcomingPayments transactions={upcomingPayments} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <TransactionsTable transactions={transactions} projects={projects} clients={clients} vendors={vendors} />
      </div>
    </div>
  );
}
