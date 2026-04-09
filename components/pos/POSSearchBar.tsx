// UI: Search input to filter POS catalog by name or SKU.

"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface POSSearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function POSSearchBar({ value, onChange }: POSSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9 font-mono"
        placeholder="Search or scan…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search products"
      />
    </div>
  );
}
