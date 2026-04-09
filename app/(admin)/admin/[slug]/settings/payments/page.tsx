// PURPOSE: Payment gateway configuration placeholder for Stripe-style integrations.

import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/server-store";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminPaymentsSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Payments" breadcrumbs={["Config", "Settings", "Payments"]} />
      <div className="p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Payment gateways</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Connect Stripe or another processor using environment keys. This demo UI is
              static — wire `STRIPE_SECRET_KEY` in production.
            </p>
            <Button variant="outline" asChild>
              <Link href={`/admin/${slug}/settings`}>Back to settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
