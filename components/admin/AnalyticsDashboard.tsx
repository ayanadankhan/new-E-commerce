// UI: Client dashboard that loads /api/analytics and renders charts.

"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { TopProductsChart } from "@/components/admin/TopProductsChart";
import { SalesByCategoryChart } from "@/components/admin/SalesByCategoryChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AnalyticsDashboard({
  tenantId,
  currency,
}: {
  tenantId: string;
  currency: string;
}) {
  const { data, loading, error } = useAnalytics({ tenantId });

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }
  if (error || !data) {
    return <p className="text-sm text-destructive">{error ?? "No data"}</p>;
  }

  const topBar = data.topProducts.slice(0, 6).map((p) => ({
    name: p.name.slice(0, 18),
    revenue: p.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.orderCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg order</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold font-mono">
            {new Intl.NumberFormat("en", { style: "currency", currency }).format(
              data.avgOrderValue
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top SKU revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold font-mono">
            {data.topProducts[0]
              ? new Intl.NumberFormat("en", { style: "currency", currency }).format(
                  data.topProducts[0].revenue
                )
              : "—"}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={data.revenue} currency={currency} />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders volume</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ordersVolume}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales by category</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesByCategoryChart data={data.salesByCategory} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top products</CardTitle>
        </CardHeader>
        <CardContent>
          <TopProductsChart data={topBar} />
        </CardContent>
      </Card>
    </div>
  );
}
