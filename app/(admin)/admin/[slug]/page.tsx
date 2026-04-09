// PURPOSE: Admin overview with KPI cards, revenue chart, and recent orders snapshot.

import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getTenantBySlug, listOrdersForTenant } from "@/lib/server-store";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Customer } from "@/models/Customer";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { serializeOrder } from "@/lib/serializers";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  await connectDB();
  const oid = new mongoose.Types.ObjectId(tenant.id);
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [revAgg, orderToday, productCount, customerCount, recentRaw] =
    await Promise.all([
      Order.aggregate<{ _id: string; total: number }>([
        {
          $match: {
            tenantId: oid,
            status: { $ne: "CANCELLED" },
            createdAt: { $gte: start },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.countDocuments({
        tenantId: oid,
        createdAt: { $gte: new Date(new Date().toDateString()) },
      }),
      Product.countDocuments({ tenantId: oid, isActive: true }),
      Customer.countDocuments({ tenantId: oid }),
      listOrdersForTenant(tenant.id, 10),
    ]);

  const totalRev = revAgg.reduce((s, d) => s + d.total, 0);
  const revenueData = revAgg.map((d) => ({ date: d._id, amount: d.total }));
  const recent = recentRaw.map((o) => serializeOrder(o));

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Dashboard" breadcrumbs={["Overview"]} />
      <div className="space-y-8 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Revenue (30d)"
            value={formatCurrency(totalRev, tenant.currency)}
            trend="up"
            hint="Paid orders"
          />
          <StatsCard
            label="Orders today"
            value={String(orderToday)}
            trend="flat"
          />
          <StatsCard
            label="Active products"
            value={String(productCount)}
            trend="up"
          />
          <StatsCard
            label="Customers"
            value={String(customerCount)}
            trend="up"
          />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href={`/admin/${slug}/products/new`}>Add product</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/admin/${slug}/orders`}>View orders</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} currency={tenant.currency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent orders</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/${slug}/inventory`}>Manage inventory</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <OrdersTable slug={slug} orders={recent} currency={tenant.currency} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
