// UI: Colored badge reflecting the current order fulfillment status.

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const colors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  PROCESSING: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  SHIPPED: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  DELIVERED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", colors[status])}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
