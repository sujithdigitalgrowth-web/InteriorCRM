"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

export function PaymentsSummaryChart({ paid, pending }: { paid: number; pending: number }) {
  const total = paid + pending;
  const data = [
    { key: "Paid", value: paid, color: "var(--color-sage)" },
    { key: "Pending", value: pending, color: "var(--color-ochre)" },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return <div className="flex h-48 items-center justify-center text-sm text-muted">No payments recorded yet</div>;
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => [formatCurrency(Number(value) || 0), name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-foreground">{formatCompactCurrency(paid)}</p>
          <p className="text-[10px] text-muted">Paid</p>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ background: d.color }} />
            <div>
              <p className="font-medium text-foreground">
                {formatCompactCurrency(d.value)}{" "}
                <span className="font-normal text-muted">{Math.round((d.value / total) * 100)}%</span>
              </p>
              <p className="text-xs text-muted">{d.key}</p>
            </div>
          </div>
        ))}
        <div className="border-t border-border pt-2 text-sm">
          <p className="font-semibold text-foreground">{formatCompactCurrency(total)}</p>
          <p className="text-xs text-muted">Total</p>
        </div>
      </div>
    </div>
  );
}
