// PURPOSE: Searchable product catalog with filters, sort, grid/list toggle, and pagination.

"use client";

import * as React from "react";
import type { Category } from "@/types";
import { useParams, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductFilters } from "@/components/store/ProductFilters";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { LayoutGrid, List } from "lucide-react";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function StoreProductsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [page, setPage] = useState(1);
  const [sort, setSort] = React.useState<
    "price_asc" | "price_desc" | "newest" | "popular"
  >("newest");
  const [list, setList] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    void (async () => {
      const [tr, cr] = await Promise.all([
        fetch(`/api/tenants/${slug}`),
        fetch(`/api/categories?tenantSlug=${encodeURIComponent(slug)}`),
      ]);
      const [tj, cj] = (await Promise.all([tr.json(), cr.json()])) as [
        { success: boolean; data?: { tenant: { id: string; currency: string } } },
        { success: boolean; data?: { categories: typeof categories } },
      ];
      if (tj.success && tj.data) {
        setTenantId(tj.data.tenant.id);
        setCurrency(tj.data.tenant.currency);
      }
      if (cj.success && cj.data) setCategories(cj.data.categories);
    })();
  }, [slug]);

  const categoryFilter =
    selectedCats.length === 1 ? selectedCats[0] : undefined;

  const { data, loading, error } = useProducts({
    tenantId: tenantId ?? "",
    category: categoryFilter,
    search: q,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    inStock: inStockOnly || undefined,
    page,
    limit: 12,
    sort,
  });

  if (!tenantId) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <ProductFilters
        categories={categories}
        selectedCategoryIds={selectedCats}
        onToggleCategory={(id, on) =>
          setSelectedCats((prev) =>
            on ? [...prev, id] : prev.filter((x) => x !== id)
          )
        }
        priceRange={priceRange}
        onPriceRange={setPriceRange}
        maxPrice={5000}
        inStockOnly={inStockOnly}
        onInStockOnly={setInStockOnly}
      />
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${data?.total ?? 0} result${(data?.total ?? 0) === 1 ? "" : "s"}`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sort}
              onValueChange={(v) =>
                setSort(v as typeof sort)
              }
            >
              <SelectTrigger className="w-[160px]" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to high</SelectItem>
                <SelectItem value="price_desc">Price: High to low</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
            <Toggle
              pressed={!list}
              onPressedChange={(p) => setList(!p)}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={list}
              onPressedChange={(p) => setList(p)}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
        {!loading && data && data.products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No products match your filters.</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                setSelectedCats([]);
                setInStockOnly(false);
                setPriceRange([0, 5000]);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <ProductGrid list={list}>
            {(data?.products ?? []).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                slug={slug}
                currency={currency}
                list={list}
              />
            ))}
          </ProductGrid>
        )}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : null}
        {data && data.totalPages > 1 ? (
          <DataTablePagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </div>
  );
}
