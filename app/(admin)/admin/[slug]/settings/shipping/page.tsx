// PURPOSE: Shipping zones and rates configuration screen (UI scaffold).

import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/server-store";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminShippingSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Shipping" breadcrumbs={["Config", "Settings", "Shipping"]} />
      <div className="p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Shipping zones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Define domestic and international zones with flat or weight-based rates.</p>
            <Button variant="outline" asChild>
              <Link href={`/admin/${slug}/settings`}>Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
