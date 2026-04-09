// UI: Area chart of daily revenue using Recharts for the admin dashboard.

"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RevenueChartProps {
  data: { date: string; amount: number }[];
  currency?: string;
}

export function RevenueChart({ data, currency = "USD" }: RevenueChartProps) {
  return (
    <div className="h-[280px] w-full" role="img" aria-label="Revenue over time chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
          <YAxis
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
            tickFormatter={(v) =>
              new Intl.NumberFormat("en", {
                style: "currency",
                currency,
                notation: "compact",
              }).format(Number(v))
            }
          />
          <Tooltip
            formatter={(v: number) =>
              new Intl.NumberFormat("en", { style: "currency", currency }).format(v)
            }
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(142 71% 45%)"
            fill="url(#rev)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
