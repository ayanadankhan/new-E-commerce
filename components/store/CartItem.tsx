// UI: Single cart line with quantity stepper and remove action.

"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as Line } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";

export interface CartItemProps {
  slug: string;
  line: Line;
}

export function CartItem({ slug: _slug, line }: CartItemProps) {
  void _slug;
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const img = line.product.images[0] ?? "/placeholder-product.png";

  return (
    <div className="flex gap-3 rounded-lg border border-border p-2">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image src={img} alt="" fill className="object-cover" sizes="64px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{line.product.name}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {formatCurrency(line.product.price)} each
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            aria-label="Decrease quantity"
            onClick={() => updateQty(line.product.id, line.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-mono text-sm">{line.quantity}</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            aria-label="Increase quantity"
            onClick={() => updateQty(line.product.id, line.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="ml-auto h-8 w-8 text-destructive"
            aria-label="Remove item"
            onClick={() => removeItem(line.product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
