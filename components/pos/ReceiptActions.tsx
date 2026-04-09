// UI: Print and navigation actions below the receipt on screen.

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ReceiptActions({ posHref }: { posHref: string }) {
  return (
    <div className="mt-8 flex justify-center gap-2 print:hidden">
      <Button type="button" variant="outline" onClick={() => window.print()}>
        Print
      </Button>
      <Button asChild>
        <Link href={posHref}>New sale</Link>
      </Button>
    </div>
  );
}
