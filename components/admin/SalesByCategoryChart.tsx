// UI: Donut-style pie chart for share of sales by category.

"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "hsl(142 71% 45%)",
  "hsl(217 91% 60%)",
  "hsl(280 65% 60%)",
  "hsl(38 92% 50%)",
  "hsl(350 70% 55%)",
];

export interface SalesByCategoryChartProps {
  data: { name: string; revenue: number }[];
}

export function SalesByCategoryChart({ data }: SalesByCategoryChartProps) {
  return (
    <div className="h-[260px] w-full" role="img" aria-label="Sales by category chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
