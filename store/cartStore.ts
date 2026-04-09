// PURPOSE: Persisted Zustand store for the public storefront shopping cart per tenant.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

export interface CartStore {
  items: CartItem[];
  tenantSlug: string;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setTenantSlug: (slug: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tenantSlug: "",
      setTenantSlug: (slug) => {
        const prev = get().tenantSlug;
        if (prev && prev !== slug) {
          set({ items: [], tenantSlug: slug });
        } else {
          set({ tenantSlug: slug });
        }
      },
      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: qty }] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },
      updateQty: (productId, qty) => {
        if (qty < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity: qty } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: "nexus-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        items: s.items,
        tenantSlug: s.tenantSlug,
      }),
    }
  )
);
