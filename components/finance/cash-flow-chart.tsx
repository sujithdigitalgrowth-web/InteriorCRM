"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

const INFLOW_COLOR = "#008300";
const OUTFLOW_COLOR = "#e34948";

export function CashFlowChart({ data }: { data: { label: string; inflow: number; outflow: number }[] }) {
  const hasData = data.some((d) => d.inflow > 0 || d.outflow > 0);

  if (!hasData) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted">No cash movement recorded yet</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted)" }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={68}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickFormatter={(v) => formatCompactCurrency(v)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => [formatCurrency(Number(value) || 0), name === "inflow" ? "Inflow" : "Outflow"]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => (v === "inflow" ? "Inflow" : "Outflow")} />
          <Area
            type="monotone"
            dataKey="inflow"
            stroke={INFLOW_COLOR}
            strokeWidth={2}
            fill={INFLOW_COLOR}
            fillOpacity={0.1}
          />
          <Area
            type="monotone"
            dataKey="outflow"
            stroke={OUTFLOW_COLOR}
            strokeWidth={2}
            fill={OUTFLOW_COLOR}
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
