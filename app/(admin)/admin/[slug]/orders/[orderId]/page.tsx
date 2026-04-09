// PURPOSE: Single order detail with items, customer, status update, and timeline.

import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTenantBySlug, getOrderById } from "@/lib/server-store";
import { serializeOrder } from "@/lib/serializers";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderTimeline } from "@/components/admin/OrderTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusUpdate } from "@/components/admin/OrderStatusUpdate";
import { PrintInvoiceButton } from "@/components/admin/PrintInvoiceButton";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  const { slug, orderId } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  const raw = await getOrderById(orderId);
  if (!raw || String(raw.tenantId) !== tenant.id) notFound();
  const order = serializeOrder(raw);

  return (
    <div className="min-h-screen">
      <AdminTopbar
        title={`Order ${order.orderNumber}`}
        breadcrumbs={["Sales", "Orders", order.orderNumber]}
      />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt, "PPpp")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono">
                {order.channel}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <OrderStatusUpdate orderId={order.id} current={order.status} />
            <PrintInvoiceButton />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((i) => (
                <div key={i.productId + i.name} className="flex gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={i.image ?? "/placeholder-product.png"}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{i.name}</p>
                    <p className="font-mono text-muted-foreground">
                      {formatCurrency(i.price)} × {i.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{order.customer.name}</p>
                <p className="text-muted-foreground">{order.customer.email}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{order.shippingAddress.line1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 font-mono text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal, tenant.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax, tenant.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shipping, tenant.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total, tenant.currency)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline history={order.statusHistory ?? []} />
          </CardContent>
        </Card>
        <Button variant="link" asChild>
          <Link href={`/admin/${slug}/orders`}>← Back to orders</Link>
        </Button>
      </div>
    </div>
  );
}
