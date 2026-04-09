// UI: Modal to pick payment method, enter tender, and finalize a POS sale.

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export interface POSPaymentModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  total: number;
  currency?: string;
  onComplete: () => Promise<void>;
}

export function POSPaymentModal({
  open,
  onOpenChange,
  total,
  currency = "USD",
  onComplete,
}: POSPaymentModalProps) {
  const [method, setMethod] = React.useState<"CASH" | "CARD" | "SPLIT" | null>(null);
  const [tender, setTender] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const tenderNum = Number(tender) || 0;
  const change = Math.max(0, tenderNum - total);

  async function charge() {
    if (!method) {
      toast.error("Select a payment method");
      return;
    }
    setLoading(true);
    try {
      void method;
      void tenderNum;
      await onComplete();
      onOpenChange(false);
      setMethod(null);
      setTender("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>
        <p className="font-mono text-lg">
          Total due: {formatCurrency(total, currency)}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(["CASH", "CARD", "SPLIT"] as const).map((m) => (
            <Button
              key={m}
              type="button"
              variant={method === m ? "default" : "outline"}
              onClick={() => setMethod(m)}
            >
              {m}
            </Button>
          ))}
        </div>
        {method === "CASH" ? (
          <div>
            <Label htmlFor="tender">Tendered</Label>
            <Input
              id="tender"
              className="mt-1 font-mono"
              type="number"
              min={0}
              step="0.01"
              value={tender}
              onChange={(e) => setTender(e.target.value)}
            />
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Change: {formatCurrency(change, currency)}
            </p>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={loading} onClick={() => void charge()}>
            Complete sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
