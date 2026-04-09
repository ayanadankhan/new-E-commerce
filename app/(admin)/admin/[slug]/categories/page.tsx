// PURPOSE: Category list with modal create flow for merchandising.

import { notFound } from "next/navigation";
import { getTenantBySlug, listCategoriesForTenant } from "@/lib/server-store";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage({
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
      <AdminTopbar title="Categories" breadcrumbs={["Catalog", "Categories"]} />
      <div className="space-y-6 p-6">
        <PageHeader title="Categories" description="Organize catalog navigation." />
        <CategoriesManager tenantId={tenant.id} initial={categories} />
      </div>
    </div>
  );
}
