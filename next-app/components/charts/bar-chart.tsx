"use client";
import { ResponsiveContainer, BarChart as RC, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { faDigits } from "@/lib/amount";

export function SimpleBarChart({ data, xKey, yKey, color = "#2563EB", colors, height = 260 }: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  colors?: string[];
  height?: number;
}) {
  return (
    <div dir="ltr" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RC data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "inherit" }} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ fontSize: 10.5, fill: "#94A3B8", fontFamily: "inherit" }} tickFormatter={(v) => faDigits(String(v))} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontFamily: "inherit", direction: "rtl", fontSize: 12 }}
            formatter={(v: number) => [faDigits(v), "تعداد"]}
            cursor={{ fill: "rgba(59,130,246,0.06)" }}
          />
          <Bar dataKey={yKey} radius={[7, 7, 0, 0]} maxBarSize={38}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors ? colors[i % colors.length] : color} />
            ))}
          </Bar>
        </RC>
      </ResponsiveContainer>
    </div>
  );
}
