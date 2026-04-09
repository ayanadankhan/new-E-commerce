// UI: Single line in the POS cart with quantity controls.

"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as Line } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface POSCartItemProps {
  line: Line;
  currency?: string;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}

export function POSCartItem({
  line,
  currency = "USD",
  onInc,
  onDec,
  onRemove,
}: POSCartItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{line.product.name}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {formatCurrency(line.product.price, currency)} × {line.quantity}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={onDec} aria-label="Decrease">
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center font-mono">{line.quantity}</span>
        <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={onInc} aria-label="Increase">
          <Plus className="h-3 w-3" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={onRemove} aria-label="Remove">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
