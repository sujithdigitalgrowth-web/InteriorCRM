"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  { key: "VENDOR", label: "Vendor", color: "#2a78d6" },
  { key: "LABOR", label: "Labor", color: "#eb6834" },
  { key: "OFFICE", label: "Office", color: "#1baf7a" },
  { key: "TRANSPORT", label: "Transport", color: "#eda100" },
  { key: "MISCELLANEOUS", label: "Misc", color: "#e87ba4" },
];

export function ExpenseBreakdownChart({ breakdown }: { breakdown: Record<string, number> }) {
  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  const rows = CATEGORIES.map((c) => ({ ...c, value: breakdown[c.key] ?? 0 })).filter((r) => r.value > 0);

  if (total === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted">No expenses recorded yet</div>;
  }

  return (
    <div className="flex h-64 items-center gap-6">
      <div className="h-full w-1/2 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="label"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {rows.map((r) => (
                <Cell key={r.key} fill={r.color} />
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
      </div>
      <div className="flex-1 space-y-2.5">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className="size-2.5 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="font-semibold text-foreground">{Math.round((r.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
