// UI: Horizontal category chips for narrowing the POS grid.

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export interface POSCategoryFilterProps {
  categories: Category[];
  activeId: string | "all";
  onChange: (id: string | "all") => void;
}

export function POSCategoryFilter({
  categories,
  activeId,
  onChange,
}: POSCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Category filters">
      <Button
        type="button"
        size="sm"
        variant={activeId === "all" ? "default" : "outline"}
        onClick={() => onChange("all")}
        role="tab"
        aria-selected={activeId === "all"}
      >
        All
      </Button>
      {categories.map((c) => (
        <Button
          key={c.id}
          type="button"
          size="sm"
          variant={activeId === c.id ? "default" : "outline"}
          onClick={() => onChange(c.id)}
          role="tab"
          aria-selected={activeId === c.id}
          className={cn("max-w-[140px] truncate")}
        >
          {c.name}
        </Button>
      ))}
    </div>
  );
}
