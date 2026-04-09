// UI: Dropdown to change order status and persist via API.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function OrderStatusUpdate({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [value, setValue] = React.useState(current);

  async function onChange(next: OrderStatus) {
    setValue(next);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
      toast.error(json.error ?? "Update failed");
      setValue(current);
      return;
    }
    toast.success("Status updated");
    router.refresh();
  }

  return (
    <Select value={value} onValueChange={(v) => onChange(v as OrderStatus)}>
      <SelectTrigger className="w-[180px]" aria-label="Order status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
