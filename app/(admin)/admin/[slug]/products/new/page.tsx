// PURPOSE: Create product form for the tenant catalog.

import { notFound } from "next/navigation";
import { getTenantBySlug, listCategoriesForTenant } from "@/lib/server-store";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  const categories = await listCategoriesForTenant(tenant.id);

  return (
    <div className="min-h-screen">
      <AdminTopbar title="New product" breadcrumbs={["Catalog", "New"]} />
      <div className="p-6">
        <ProductForm tenantId={tenant.id} categories={categories} />
      </div>
    </div>
  );
}
