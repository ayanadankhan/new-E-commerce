// PURPOSE: Customer profile overview with session-backed email and link to orders.

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenantBySlug } from "@/lib/server-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function StoreAccountPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect(`/store/${slug}/login?callbackUrl=/store/${slug}/account`);
  }
  const tenant = await getTenantBySlug(slug);
  if (!tenant) redirect("/");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span>{" "}
            {session.user.name}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            {session.user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Store:</span> {tenant.name}
          </p>
        </CardContent>
      </Card>
      <Button asChild>
        <Link href={`/store/${slug}/orders`}>View order history</Link>
      </Button>
    </div>
  );
}
