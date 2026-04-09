// PURPOSE: Store settings hub with tabs for general, payments, shipping, staff, and danger zone.

import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/server-store";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SettingsGeneralForm } from "@/components/admin/SettingsGeneralForm";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  return (
    <div className="min-h-screen">
      <AdminTopbar title="Settings" breadcrumbs={["Config", "Settings"]} />
      <div className="p-6">
        <Tabs defaultValue="general">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="danger">Danger zone</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Store identity and regional defaults.</CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsGeneralForm tenant={tenant} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>Connect Stripe or Adyen in production.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href={`/admin/${slug}/settings/payments`}>Open payments</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
                <CardDescription>Zones and carrier rates.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href={`/admin/${slug}/settings/shipping`}>Configure shipping</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="staff" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff</CardTitle>
                <CardDescription>Invite teammates and assign roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href={`/admin/${slug}/settings/staff`}>Manage staff</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="danger" className="mt-6">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle>Danger zone</CardTitle>
                <CardDescription>Irreversible actions for the tenant.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Contact support to delete a production tenant.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
