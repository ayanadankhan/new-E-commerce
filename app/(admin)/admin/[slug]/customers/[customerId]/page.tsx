// PURPOSE: Single customer profile with lifetime value summary.

import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getTenantBySlug } from "@/lib/server-store";
import { Customer } from "@/models/Customer";
import { serializeCustomer } from "@/lib/serializers";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ slug: string; customerId: string }>;
}) {
  const { slug, customerId } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  if (!mongoose.isValidObjectId(customerId)) notFound();
  await connectDB();
  const doc = await Customer.findOne({
    _id: customerId,
    tenantId: new mongoose.Types.ObjectId(tenant.id),
  }).lean();
  if (!doc) notFound();
  const c = serializeCustomer(doc);

  return (
    <div className="min-h-screen">
      <AdminTopbar title={c.name} breadcrumbs={["Sales", "Customers", c.name]} />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {c.email}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span> {c.phone ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Joined:</span>{" "}
              {c.createdAt ? formatDate(c.createdAt, "PP") : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lifetime value</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-8 font-mono text-sm">
            <div>
              <p className="text-muted-foreground">Orders</p>
              <p className="text-xl font-semibold">{c.totalOrders}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="text-xl font-semibold">
                {formatCurrency(c.totalSpent, tenant.currency)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Button variant="link" asChild>
          <Link href={`/admin/${slug}/customers`}>← Customers</Link>
        </Button>
      </div>
    </div>
  );
}
