import { formatCompactCurrency, titleCase } from "@/lib/utils";

export type ActivityIcon =
  | "client"
  | "payment"
  | "agreement"
  | "milestone"
  | "milestone-delayed"
  | "project"
  | "quotation";

export type ActivityItem = {
  id: string;
  icon: ActivityIcon;
  text: string;
  subtext?: string;
  timestamp: Date;
};

export function buildRecentActivity({
  clients,
  payments,
  agreements,
  milestones,
  projects,
  quotations = [],
}: {
  clients: { id: string; name: string; createdAt: Date }[];
  payments: { id: string; amount: number; paidDate: Date | null; client: { name: string } | null }[];
  agreements: { id: string; title: string; status: string; updatedAt: Date }[];
  milestones: {
    id: string;
    title: string;
    status: string;
    completedAt: Date | null;
    updatedAt: Date;
    project: { name: string };
  }[];
  projects: { id: string; name: string; status: string; createdAt: Date; updatedAt: Date }[];
  quotations?: { id: string; quotationNumber: string; title: string | null; updatedAt: Date }[];
}): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const c of clients) {
    items.push({
      id: `client-${c.id}`,
      icon: "client",
      text: "New enquiry added",
      subtext: `from ${c.name}`,
      timestamp: c.createdAt,
    });
  }

  for (const t of payments) {
    if (!t.paidDate) continue;
    items.push({
      id: `payment-${t.id}`,
      icon: "payment",
      text: "Payment received",
      subtext: `${formatCompactCurrency(t.amount)}${t.client ? ` from ${t.client.name}` : ""}`,
      timestamp: t.paidDate,
    });
  }

  for (const a of agreements) {
    if (a.status !== "SIGNED") continue;
    items.push({
      id: `agreement-${a.id}`,
      icon: "agreement",
      text: "Agreement signed",
      subtext: a.title,
      timestamp: a.updatedAt,
    });
  }

  for (const m of milestones) {
    if (m.completedAt) {
      items.push({
        id: `milestone-${m.id}`,
        icon: "milestone",
        text: "Task completed",
        subtext: `${m.title} · ${m.project.name}`,
        timestamp: m.completedAt,
      });
    } else if (m.status === "DELAYED") {
      items.push({
        id: `milestone-delayed-${m.id}`,
        icon: "milestone-delayed",
        text: "Milestone delayed",
        subtext: `${m.title} · ${m.project.name}`,
        timestamp: m.updatedAt,
      });
    }
  }

  for (const q of quotations) {
    items.push({
      id: `quotation-${q.id}`,
      icon: "quotation",
      text: "Quote updated",
      subtext: q.title || q.quotationNumber,
      timestamp: q.updatedAt,
    });
  }

  for (const p of projects) {
    if (p.updatedAt.getTime() === p.createdAt.getTime()) continue;
    items.push({
      id: `project-${p.id}`,
      icon: "project",
      text: "Stage updated",
      subtext: `${p.name} moved to ${titleCase(p.status)}`,
      timestamp: p.updatedAt,
    });
  }

  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function formatActivityTime(date: Date, now: Date = new Date()) {
  const d = new Date(date);
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
