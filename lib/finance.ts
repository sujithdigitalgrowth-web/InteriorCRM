export type Period = "weekly" | "monthly" | "quarterly" | "yearly";

type TxLike = { amount: number; paidDate: Date | null; type: string; status: string };

function buildBuckets(period: Period, now: Date) {
  const buckets: { label: string; start: Date; end: Date }[] = [];

  if (period === "weekly") {
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
      buckets.push({ label: start.toLocaleDateString("en-IN", { weekday: "short" }), start, end });
    }
  } else if (period === "monthly") {
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = `${start.toLocaleString("en-IN", { month: "short" })} '${String(start.getFullYear()).slice(2)}`;
      buckets.push({ label, start, end });
    }
  } else if (period === "quarterly") {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    for (let i = 3; i >= 0; i--) {
      const qIndex = currentQuarter - i;
      const year = now.getFullYear() + Math.floor(qIndex / 4);
      const q = ((qIndex % 4) + 4) % 4;
      const start = new Date(year, q * 3, 1);
      const end = new Date(year, q * 3 + 3, 1);
      buckets.push({ label: `Q${q + 1} '${String(year).slice(2)}`, start, end });
    }
  } else {
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      buckets.push({ label: String(year), start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) });
    }
  }

  return buckets;
}

export function buildCashFlowSeries(transactions: TxLike[], period: Period, now: Date = new Date()) {
  const buckets = buildBuckets(period, now);

  return buckets.map(({ label, start, end }) => {
    let inflow = 0;
    let outflow = 0;
    for (const t of transactions) {
      if (t.status !== "PAID" || !t.paidDate) continue;
      const d = new Date(t.paidDate);
      if (d < start || d >= end) continue;
      if (t.type === "CLIENT_PAYMENT") inflow += t.amount;
      else if (t.type === "VENDOR_PAYMENT" || t.type === "EXPENSE") outflow += t.amount;
    }
    return { label, inflow, outflow };
  });
}

export function buildExpenseBreakdown(
  transactions: { amount: number; type: string; status: string; expenseCategory: string | null }[]
) {
  const buckets: Record<string, number> = { VENDOR: 0, LABOR: 0, OFFICE: 0, TRANSPORT: 0, MISCELLANEOUS: 0 };
  for (const t of transactions) {
    if (t.status !== "PAID") continue;
    if (t.type === "VENDOR_PAYMENT") buckets.VENDOR += t.amount;
    else if (t.type === "EXPENSE") buckets[t.expenseCategory ?? "MISCELLANEOUS"] += t.amount;
  }
  return buckets;
}
