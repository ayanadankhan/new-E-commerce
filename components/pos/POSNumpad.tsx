// UI: Numeric keypad for entering discount amounts or tendered cash.

"use client";

import { Button } from "@/components/ui/button";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"] as const;

export interface POSNumpadProps {
  onKey: (k: string) => void;
}

export function POSNumpad({ onKey }: POSNumpadProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Numeric keypad">
      {KEYS.map((k) => (
        <Button
          key={k}
          type="button"
          variant="secondary"
          className="h-12 text-lg font-mono"
          onClick={() => onKey(k === "⌫" ? "back" : k)}
        >
          {k}
        </Button>
      ))}
    </div>
  );
}
