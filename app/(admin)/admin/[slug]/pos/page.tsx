// PURPOSE: Launch pad linking operators to the fullscreen POS experience.

import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/server-store";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonitorSmartphone } from "lucide-react";

export default async function AdminPosLaunchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  return (
    <div className="min-h-screen">
      <AdminTopbar title="POS" breadcrumbs={["Operations", "POS"]} />
      <div className="p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5" />
              Point of sale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Open the dedicated POS layout optimized for touchscreens and fast checkout.
            </p>
            <Button asChild size="lg">
              <Link href={`/pos/${slug}`} target="_blank" rel="noreferrer">
                Launch POS
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
