// UI: Triggers the browser print dialog for order invoices.

"use client";

import { Button } from "@/components/ui/button";

export function PrintInvoiceButton() {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()}>
      Print invoice
    </Button>
  );
}
