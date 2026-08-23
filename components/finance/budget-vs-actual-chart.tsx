"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

const BUDGET_COLOR = "#2a78d6";
const ACTUAL_COLOR = "#eb6834";

export function BudgetVsActualChart({ data }: { data: { name: string; budget: number; actual: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted">No project budgets yet</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 20 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={68}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickFormatter={(v) => formatCompactCurrency(v)}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-muted)" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => [formatCurrency(Number(value) || 0), name === "budget" ? "Budget" : "Actual"]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (value === "budget" ? "Budget" : "Actual")}
          />
          <Bar dataKey="budget" fill={BUDGET_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="actual" fill={ACTUAL_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
