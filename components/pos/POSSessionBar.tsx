// UI: Top status bar showing cashier name and session duration.

"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";

export interface POSSessionBarProps {
  cashierName: string;
  sessionStart: Date | null;
}

export function POSSessionBar({ cashierName, sessionStart }: POSSessionBarProps) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed =
    sessionStart && formatDistanceToNow(sessionStart, { addSuffix: false });

  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-background px-4">
      <p className="text-sm">
        <span className="text-muted-foreground">Cashier:</span>{" "}
        <span className="font-medium">{cashierName}</span>
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        Session: {elapsed ?? "—"}
      </p>
    </div>
  );
}
