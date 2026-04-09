// PURPOSE: Charts for revenue, orders volume, category mix, and top SKUs.

import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/server-store";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Analytics" breadcrumbs={["Insights", "Analytics"]} />
      <div className="space-y-6 p-6">
        <PageHeader title="Analytics" description="Visualize performance across the catalog." />
        <AnalyticsDashboard tenantId={tenant.id} currency={tenant.currency} />
      </div>
    </div>
  );
}
