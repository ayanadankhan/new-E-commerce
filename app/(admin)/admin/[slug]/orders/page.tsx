// PURPOSE: Filterable orders table for fulfillment teams.

import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getTenantBySlug } from "@/lib/server-store";
import { Order } from "@/models/Order";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { serializeOrder } from "@/lib/serializers";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  await connectDB();
  const rows = await Order.find({ tenantId: new mongoose.Types.ObjectId(tenant.id) })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  const orders = rows.map((o) => serializeOrder(o));

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Orders" breadcrumbs={["Sales", "Orders"]} />
      <div className="space-y-6 p-6">
        <PageHeader
          title="Orders"
          description="Track and update fulfillment across channels."
        />
        <OrdersTable slug={slug} orders={orders} currency={tenant.currency} />
      </div>
    </div>
  );
}
