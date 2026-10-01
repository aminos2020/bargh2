"use client";
import { ResponsiveContainer, PieChart as RC, Pie, Cell, Tooltip, Legend } from "recharts";
import { faDigits } from "@/lib/amount";

export const CHART_PALETTE = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#0891B2", "#7C3AED", "#DB2777", "#059669"];

export function StatusPieChart({ data, height = 260 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RC>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="78%" paddingAngle={3} strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontFamily: "inherit", direction: "rtl", fontSize: 12 }}
            formatter={(v: number) => faDigits(v)}
          />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "inherit" }} />
        </RC>
      </ResponsiveContainer>
    </div>
  );
}
