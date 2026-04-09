// PURPOSE: Edit existing product with the same form as creation.

import { notFound } from "next/navigation";
import {
  getTenantBySlug,
  listCategoriesForTenant,
  getProductById,
} from "@/lib/server-store";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  const product = await getProductById(productId);
  if (!product || product.tenantId !== tenant.id) notFound();
  const categories = await listCategoriesForTenant(tenant.id);

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Edit product" breadcrumbs={["Catalog", product.name]} />
      <div className="p-6">
        <ProductForm
          tenantId={tenant.id}
          categories={categories}
          initial={product}
        />
      </div>
    </div>
  );
}
