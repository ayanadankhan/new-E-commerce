// UI: Product search input that navigates to the catalog with a query string.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface SearchBarProps {
  slug: string;
}

export function SearchBar({ slug }: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        router.push(`/store/${slug}/products?${params.toString()}`);
      }}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        className="pl-9"
        aria-label="Search products"
      />
    </form>
  );
}
