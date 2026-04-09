// UI: Horizontal bar chart of top-selling products by revenue.

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TopProductsChartProps {
  data: { name: string; revenue: number }[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <div className="h-[260px] w-full" role="img" aria-label="Top products chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 10 }}
          />
          <Tooltip />
          <Bar dataKey="revenue" fill="hsl(142 71% 45%)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
