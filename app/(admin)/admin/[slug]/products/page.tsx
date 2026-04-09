// PURPOSE: Admin product list with search, table, and bulk actions entry points.

import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getTenantBySlug, listCategoriesForTenant } from "@/lib/server-store";
import { Product } from "@/models/Product";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Button } from "@/components/ui/button";
import { serializeProduct } from "@/lib/serializers";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  await connectDB();
  const rows = await Product.find({ tenantId: new mongoose.Types.ObjectId(tenant.id) })
    .sort({ createdAt: -1 })
    .lean();
  const products = rows.map((r) => serializeProduct(r));
  const categories = await listCategoriesForTenant(tenant.id);
  const catNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Products" breadcrumbs={["Catalog", "Products"]} />
      <div className="space-y-6 p-6">
        <PageHeader title="Products" description="Manage catalog and merchandising.">
          <Button asChild>
            <Link href={`/admin/${slug}/products/new`}>Add product</Link>
          </Button>
        </PageHeader>
        <ProductsTable
          slug={slug}
          products={products}
          currency={tenant.currency}
          categoryNames={catNames}
        />
      </div>
    </div>
  );
}
