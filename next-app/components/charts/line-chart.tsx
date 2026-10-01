"use client";
import { ResponsiveContainer, LineChart as RC, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { faDigits } from "@/lib/amount";

export function TrendLineChart({ data, xKey, lines, height = 260 }: {
  data: Record<string, string | number>[];
  xKey: string;
  lines: { key: string; color: string; name: string }[];
  height?: number;
}) {
  return (
    <div dir="ltr" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RC data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10.5, fill: "#94A3B8", fontFamily: "inherit" }} tickFormatter={(v) => faDigits(String(v))} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10.5, fill: "#94A3B8", fontFamily: "inherit" }} tickFormatter={(v) => faDigits(String(v))} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontFamily: "inherit", direction: "rtl", fontSize: 12 }}
            formatter={(v: number, n: string) => [faDigits(v), n]}
            labelFormatter={(l) => faDigits(String(l))}
          />
          {lines.map((l) => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} />
          ))}
        </RC>
      </ResponsiveContainer>
    </div>
  );
}
