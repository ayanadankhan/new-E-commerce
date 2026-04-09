// PURPOSE: POS cart operations with totals derived from the POS Zustand store.

"use client";

import { usePOSStore } from "@/store/posStore";
import type { Product, User } from "@/types";

export function usePOSCart(tenantSlug: string) {
  const store = usePOSStore();

  return {
    items: store.items,
    discount: store.discount,
    cashier: store.cashier,
    sessionStart: store.sessionStart,
    addItem: (product: Product) => {
      store.setTenantSlug(tenantSlug);
      store.addItem(product);
    },
    removeItem: store.removeItem,
    updateQty: store.updateQty,
    setDiscount: store.setDiscount,
    clearCart: store.clearCart,
    setCashier: (u: User | null) => store.setCashier(u),
    startSession: store.startSession,
    getSubtotal: store.getSubtotal,
    getTax: store.getTax,
    getTotal: store.getTotal,
  };
}
