"use client";
import { ResponsiveContainer, AreaChart as RC, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { faDigits } from "@/lib/amount";
import { compactRial } from "@/lib/amount";

export function AmountAreaChart({ data, xKey, yKey, height = 260 }: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  height?: number;
}) {
  return (
    <div dir="ltr" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RC data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
          <defs>
            <linearGradient id="amountFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10.5, fill: "#94A3B8", fontFamily: "inherit" }} tickFormatter={(v) => faDigits(String(v))} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10.5, fill: "#94A3B8", fontFamily: "inherit" }} tickFormatter={(v) => compactRial(Number(v))} axisLine={false} tickLine={false} width={64} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontFamily: "inherit", direction: "rtl", fontSize: 12 }}
            formatter={(v: number) => [compactRial(Number(v)) + " ریال", "هزینه تاییدشده"]}
            labelFormatter={(l) => faDigits(String(l))}
          />
          <Area type="monotone" dataKey={yKey} stroke="#2563EB" strokeWidth={2.4} fill="url(#amountFill)" />
        </RC>
      </ResponsiveContainer>
    </div>
  );
}
