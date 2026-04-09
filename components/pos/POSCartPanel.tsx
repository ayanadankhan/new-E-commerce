// UI: Right column cart summary with totals and charge action for POS.

"use client";

import type { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { POSCartItem } from "@/components/pos/POSCartItem";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface POSCartPanelProps {
  items: CartItem[];
  currency?: string;
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  onDiscount: (n: number) => void;
  onCharge: () => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
}

export function POSCartPanel({
  items,
  currency = "USD",
  subtotal,
  tax,
  total,
  discount,
  onDiscount,
  onCharge,
  onInc,
  onDec,
  onRemove,
}: POSCartPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col border-l border-border bg-card">
      <div className="border-b border-border p-3">
        <h2 className="text-sm font-semibold">Current sale</h2>
      </div>
      <ScrollArea className="min-h-0 flex-1 p-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tap products to add.</p>
        ) : (
          items.map((line) => (
            <POSCartItem
              key={line.product.id}
              line={line}
              currency={currency}
              onInc={() => onInc(line.product.id)}
              onDec={() => onDec(line.product.id)}
              onRemove={() => onRemove(line.product.id)}
            />
          ))
        )}
      </ScrollArea>
      <div className="space-y-3 border-t border-border p-3">
        <div>
          <Label htmlFor="disc">Discount ($)</Label>
          <Input
            id="disc"
            type="number"
            min={0}
            step="0.01"
            className="mt-1 font-mono"
            value={discount || ""}
            onChange={(e) => onDiscount(Number(e.target.value) || 0)}
          />
        </div>
        <Separator />
        <div className="space-y-1 font-mono text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{formatCurrency(tax, currency)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>
        <Button className="w-full" size="lg" onClick={onCharge} disabled={!items.length}>
          Charge
        </Button>
      </div>
    </div>
  );
}
