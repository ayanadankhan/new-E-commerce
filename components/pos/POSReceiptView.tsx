// UI: Printable receipt layout for a completed POS or online order.

import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export interface POSReceiptViewProps {
  order: Order;
  storeName: string;
}

export function POSReceiptView({ order, storeName }: POSReceiptViewProps) {
  return (
    <div className="mx-auto max-w-sm p-6 font-mono text-sm print:p-0">
      <h1 className="text-center text-base font-bold">{storeName}</h1>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {formatDate(order.createdAt, "PPpp")}
      </p>
      <p className="mt-4 text-center text-xs">Order {order.orderNumber}</p>
      <p className="text-center text-xs">{order.channel}</p>
      <ul className="mt-4 space-y-2 border-t border-dashed border-foreground pt-4">
        {order.items.map((i) => (
          <li key={i.productId + i.name} className="flex justify-between gap-2">
            <span className="min-w-0 flex-1 truncate">
              {i.name} ×{i.quantity}
            </span>
            <span>{formatCurrency(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-1 border-t border-dashed border-foreground pt-4 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{formatCurrency(order.shipping)}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
      <p className="mt-8 text-center text-xs">Thank you for your purchase</p>
    </div>
  );
}
