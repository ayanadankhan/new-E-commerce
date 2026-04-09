// UI: Checkout sidebar summarizing line totals, tax, and shipping.

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CartItem } from "@/types";
import { DEFAULT_TAX_RATE } from "@/lib/constants";

export interface OrderSummaryCardProps {
  items: CartItem[];
  shipping: number;
  currency?: string;
}

export function OrderSummaryCard({
  items,
  shipping,
  currency = "USD",
}: OrderSummaryCardProps) {
  const subtotal = items.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  );
  const tax = Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100;
  const total = subtotal + tax + shipping;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-base">Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {items.map((i) => (
            <li key={i.product.id} className="flex justify-between gap-2">
              <span className="truncate">
                {i.product.name} × {i.quantity}
              </span>
              <span className="shrink-0 font-mono">
                {formatCurrency(i.product.price * i.quantity, currency)}
              </span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex justify-between font-mono">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between font-mono text-muted-foreground">
          <span>Shipping</span>
          <span>{formatCurrency(shipping, currency)}</span>
        </div>
        <div className="flex justify-between font-mono text-muted-foreground">
          <span>Tax</span>
          <span>{formatCurrency(tax, currency)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-mono text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total, currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
