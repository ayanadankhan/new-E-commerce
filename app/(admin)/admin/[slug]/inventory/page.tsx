// PURPOSE: Stock levels with inline edits and low-stock emphasis.

import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getTenantBySlug } from "@/lib/server-store";
import { Product } from "@/models/Product";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { serializeProduct } from "@/lib/serializers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { InventoryPageClient } from "@/components/admin/InventoryPageClient";

export default async function AdminInventoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  await connectDB();
  const rows = await Product.find({ tenantId: new mongoose.Types.ObjectId(tenant.id) })
    .sort({ stock: 1 })
    .lean();
  const products = rows.map((r) => serializeProduct(r));
  const low = products.filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  );

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Inventory" breadcrumbs={["Catalog", "Inventory"]} />
      <div className="space-y-6 p-6">
        <PageHeader title="Inventory" description="Monitor and adjust on-hand stock." />
        {low.length ? (
          <Alert>
            <AlertTitle>Low stock</AlertTitle>
            <AlertDescription>
              {low.length} SKU{low.length === 1 ? "" : "s"} below {LOW_STOCK_THRESHOLD}{" "}
              units.
            </AlertDescription>
          </Alert>
        ) : null}
        <InventoryPageClient tenantId={tenant.id} products={products} />
      </div>
    </div>
  );
}
