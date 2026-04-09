// PURPOSE: Zustand store for POS session cart, discount, and cashier context.

import { create } from "zustand";
import type { CartItem, Product, User } from "@/types";

export interface POSStore {
  items: CartItem[];
  discount: number;
  cashier: User | null;
  sessionStart: Date | null;
  tenantSlug: string;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  setDiscount: (amount: number) => void;
  clearCart: () => void;
  setCashier: (user: User | null) => void;
  startSession: () => void;
  setTenantSlug: (slug: string) => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  items: [],
  discount: 0,
  cashier: null,
  sessionStart: null,
  tenantSlug: "",
  setTenantSlug: (slug) => {
    const prev = get().tenantSlug;
    if (prev && prev !== slug) {
      set({ items: [], discount: 0, tenantSlug: slug });
    } else {
      set({ tenantSlug: slug });
    }
  },
  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
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
  setDiscount: (amount) => set({ discount: Math.max(0, amount) }),
  clearCart: () => set({ items: [], discount: 0 }),
  setCashier: (user) => set({ cashier: user }),
  startSession: () => set({ sessionStart: new Date() }),
  getSubtotal: () => {
    return get().items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );
  },
  getTax: () => {
    const sub = get().getSubtotal();
    return Math.round(sub * 0.1 * 100) / 100;
  },
  getTotal: () => {
    const sub = get().getSubtotal();
    const tax = get().getTax();
    return Math.max(0, sub + tax - get().discount);
  },
}));
