// UI: Sidebar filters for category, price range, and in-stock toggle.

"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ProductFiltersProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onToggleCategory: (id: string, checked: boolean) => void;
  priceRange: [number, number];
  onPriceRange: (range: [number, number]) => void;
  maxPrice: number;
  inStockOnly: boolean;
  onInStockOnly: (v: boolean) => void;
}

export function ProductFilters({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  priceRange,
  onPriceRange,
  maxPrice,
  inStockOnly,
  onInStockOnly,
}: ProductFiltersProps) {
  const cap = Math.max(100, maxPrice);
  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-64" aria-label="Product filters">
      <div>
        <h2 className="mb-3 text-sm font-semibold">Categories</h2>
        <ScrollArea className="h-48 pr-3">
          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${c.id}`}
                  checked={selectedCategoryIds.includes(c.id)}
                  onCheckedChange={(ch) =>
                    onToggleCategory(c.id, ch === true)
                  }
                  aria-label={`Filter by ${c.name}`}
                />
                <Label htmlFor={`cat-${c.id}`} className="text-sm font-normal">
                  {c.name}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <Separator />
      <div>
        <h2 className="mb-3 text-sm font-semibold">Price range</h2>
        <Slider
          min={0}
          max={cap}
          step={1}
          value={[priceRange[0], Math.min(priceRange[1], cap)]}
          onValueChange={(v) => onPriceRange([v[0] ?? 0, v[1] ?? cap])}
          aria-label="Price range"
        />
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          ${priceRange[0]} – ${Math.min(priceRange[1], cap)}
        </p>
      </div>
      <Separator />
      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={(ch) => onInStockOnly(ch === true)}
          aria-label="In stock only"
        />
        <Label htmlFor="in-stock" className="text-sm font-normal">
          In stock only
        </Label>
      </div>
    </aside>
  );
}
