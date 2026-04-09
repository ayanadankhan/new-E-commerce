// UI: Client wrapper to allow inventory table refresh after PATCH.

"use client";

import * as React from "react";
import type { Product } from "@/types";
import { InventoryTable } from "@/components/admin/InventoryTable";

export function InventoryPageClient({
  tenantId,
  products: initial,
}: {
  tenantId: string;
  products: Product[];
}) {
  const [products, setProducts] = React.useState(initial);

  return (
    <InventoryTable
      products={products}
      onSaved={async () => {
        const r = await fetch(`/api/inventory?tenantId=${tenantId}`);
        const j = (await r.json()) as {
          success: boolean;
          data?: { products: Product[] };
        };
        if (j.success && j.data) setProducts(j.data.products);
      }}
    />
  );
}
