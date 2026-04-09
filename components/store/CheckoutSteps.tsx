// UI: Horizontal step indicator for multi-step checkout.

import { cn } from "@/lib/utils";

const STEPS = ["Details", "Shipping", "Payment"] as const;

export interface CheckoutStepsProps {
  current: number;
}

export function CheckoutSteps({ current }: CheckoutStepsProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 sm:gap-4">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && !done && "border-primary text-primary",
                  !done && !active && "border-muted-foreground/30 text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className="hidden text-muted-foreground sm:inline" aria-hidden>
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
