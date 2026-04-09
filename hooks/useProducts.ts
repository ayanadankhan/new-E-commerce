// PURPOSE: Client-side fetch hook for paginated product listings with filters.

"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export interface ProductListFilters {
  tenantId: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "popular";
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export function useProducts(filters: ProductListFilters) {
  const [data, setData] = useState<ProductListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters.search ?? "", 300);

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    if (!filters.tenantId) {
      setLoading(true);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("tenantId", filters.tenantId);
    if (filters.category) params.set("category", filters.category);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.minPrice !== undefined)
      params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined)
      params.set("maxPrice", String(filters.maxPrice));
    if (filters.inStock !== undefined)
      params.set("inStock", String(filters.inStock));
    params.set("page", String(filters.page ?? 1));
      params.set("limit", String(filters.limit ?? 12));
    if (filters.sort) params.set("sort", filters.sort);

    try {
      const res = await fetch(`/api/products?${params.toString()}`, {
        signal,
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: ProductListResult;
        error?: string;
      };
      if (!res.ok || !json.success || !json.data) {
        setError(json.error ?? "Failed to load products");
        setData(null);
      } else {
        setData(json.data);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setError("Failed to load products");
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [
    filters.tenantId,
    filters.category,
    debouncedSearch,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.page,
    filters.limit,
    filters.sort,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchProducts(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchProducts]);

  return { data, loading, error, refetch: fetchProducts };
}
