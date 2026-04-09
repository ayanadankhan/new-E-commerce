// PURPOSE: Signed-in customer order history for the current store.

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenantBySlug, listOrdersForTenant } from "@/lib/server-store";
import { serializeOrder } from "@/lib/serializers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Button } from "@/components/ui/button";

export default async function StoreOrdersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect(`/store/${slug}/login?callbackUrl=/store/${slug}/orders`);
  }
  const tenant = await getTenantBySlug(slug);
  if (!tenant) redirect("/");

  const raw = await listOrdersForTenant(tenant.id, 50);
  const orders = raw
    .filter(
      (o) =>
        o.customer?.email?.toLowerCase() ===
        session.user?.email?.toLowerCase()
    )
    .map((o) => serializeOrder(o));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your orders</h1>
        <Button variant="outline" asChild>
          <Link href={`/store/${slug}/products`}>Shop</Link>
        </Button>
      </div>
      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
          No orders yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(o.createdAt, "PP")}
                </p>
              </div>
              <OrderStatusBadge status={o.status} />
              <p className="font-mono text-sm">{formatCurrency(o.total, tenant.currency)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
