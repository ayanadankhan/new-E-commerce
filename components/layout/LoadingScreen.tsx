// UI: Full-viewport centered spinner for route transitions and suspense.

import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div
      className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
