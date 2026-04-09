// UI: Vertical timeline of order status changes.

import { formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export interface OrderTimelineProps {
  history: { status: OrderStatus; at: string }[];
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  if (!history.length) {
    return <p className="text-sm text-muted-foreground">No history yet.</p>;
  }
  return (
    <ol className="relative border-l border-border pl-6">
      {history.map((h, i) => (
        <li key={`${h.at}-${i}`} className="mb-6 ml-1">
          <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
          <p className="text-sm font-medium">{ORDER_STATUS_LABELS[h.status]}</p>
          <p className="text-xs text-muted-foreground">{formatDate(h.at, "PPpp")}</p>
        </li>
      ))}
    </ol>
  );
}
