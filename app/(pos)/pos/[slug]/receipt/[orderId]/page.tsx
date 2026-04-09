// PURPOSE: Printable receipt view after completing a POS transaction.

import { notFound } from "next/navigation";
import { getTenantBySlug, getOrderById } from "@/lib/server-store";
import { serializeOrder } from "@/lib/serializers";
import { POSReceiptView } from "@/components/pos/POSReceiptView";
import { ReceiptActions } from "@/components/pos/ReceiptActions";

export default async function POSReceiptPage({
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
    <div className="overflow-y-auto p-6">
      <POSReceiptView order={order} storeName={tenant.name} />
      <ReceiptActions posHref={`/pos/${slug}`} />
    </div>
  );
}
