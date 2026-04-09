// PURPOSE: Thin wrapper around the persisted cart store for storefront components.

"use client";

import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

export function useCart(tenantSlug: string) {
  const store = useCartStore();

  return {
    items: store.items,
    addItem: (product: Product, qty?: number) => {
      store.setTenantSlug(tenantSlug);
      store.addItem(product, qty);
    },
    removeItem: store.removeItem,
    updateQty: store.updateQty,
    clearCart: store.clearCart,
    getTotal: store.getTotal,
    getItemCount: store.getItemCount,
    setTenantSlug: store.setTenantSlug,
  };
}
