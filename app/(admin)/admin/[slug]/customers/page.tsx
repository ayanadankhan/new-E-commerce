// PURPOSE: Customer directory for the tenant with spend metrics.

import { notFound } from "next/navigation";
import { getTenantBySlug, listCustomersForTenant } from "@/lib/server-store";
import { serializeCustomer } from "@/lib/serializers";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomersTable } from "@/components/admin/CustomersTable";

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  const rows = await listCustomersForTenant(tenant.id);
  const customers = rows.map((c) => serializeCustomer(c));

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Customers" breadcrumbs={["Sales", "Customers"]} />
      <div className="space-y-6 p-6">
        <PageHeader title="Customers" description="CRM-lite view of buyers." />
        <CustomersTable slug={slug} customers={customers} currency={tenant.currency} />
      </div>
    </div>
  );
}
