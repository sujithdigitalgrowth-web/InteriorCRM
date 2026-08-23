import { prisma } from "@/lib/prisma";
import { NotificationBell } from "@/components/layout/notification-bell";
import { AccountMenu } from "@/components/layout/account-menu";
import { TopbarActionsSlot, TopbarTitleSlot } from "@/components/layout/topbar-slot";
import { formatCompactCurrency } from "@/lib/utils";
import type { TeamMember } from "@prisma/client";

export async function Topbar({ member }: { member: TeamMember }) {
  const now = new Date();
  const [overdueTransactions, overdueMilestones] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: "OVERDUE" },
      include: { client: true, project: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.milestone.findMany({
      where: { status: { not: "DONE" }, dueDate: { lt: now } },
      include: { project: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  const notifications = [
    ...overdueTransactions.map((t) => ({
      id: `t-${t.id}`,
      text: "Payment overdue",
      subtext: `${t.client?.name ?? t.project?.name ?? "—"} · ${formatCompactCurrency(t.amount)}`,
    })),
    ...overdueMilestones.map((m) => ({
      id: `m-${m.id}`,
      text: "Milestone overdue",
      subtext: `${m.title} · ${m.project.name}`,
    })),
  ];

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-3 bg-background px-4 md:px-8 print:hidden">
      <TopbarTitleSlot />
      <div className="flex items-center gap-3">
        <TopbarActionsSlot />
        <NotificationBell items={notifications} />
        <AccountMenu member={member} />
      </div>
    </header>
  );
}
