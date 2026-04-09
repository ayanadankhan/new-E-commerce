// UI: Touch-friendly product grid for ringing up sales on the POS.

"use client";

import Image from "next/image";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface POSProductGridProps {
  products: Product[];
  currency?: string;
  onAdd: (p: Product) => void;
  tappedId: string | null;
}

export function POSProductGrid({
  products,
  currency = "USD",
  onAdd,
  tappedId,
}: POSProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => {
        const img = p.images[0] ?? "/placeholder-product.png";
        return (
          <button
            key={p.id}
            type="button"
            disabled={p.stock <= 0}
            onClick={() => onAdd(p)}
            className={cn(
              "flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-transform active:scale-[0.98]",
              tappedId === p.id && "ring-2 ring-primary",
              p.stock <= 0 && "opacity-40"
            )}
            aria-label={`Add ${p.name}`}
          >
            <div className="relative aspect-[4/3] bg-muted">
              <Image src={img} alt="" fill className="object-cover" sizes="200px" />
            </div>
            <div className="p-2">
              <p className="line-clamp-2 text-sm font-medium leading-tight">{p.name}</p>
              <p className="mt-1 font-mono text-sm text-primary">
                {formatCurrency(p.price, currency)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
