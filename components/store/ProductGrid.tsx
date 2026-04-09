// UI: Responsive grid wrapper for product cards.

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProductGridProps extends React.HTMLAttributes<HTMLDivElement> {
  list?: boolean;
}

export function ProductGrid({
  className,
  list,
  children,
  ...props
}: ProductGridProps) {
  return (
    <div
      className={cn(
        list
          ? "flex flex-col gap-4"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
