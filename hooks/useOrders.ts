// PURPOSE: Fetch orders list and single order for admin and storefront order history.

"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order } from "@/types";

export function useOrdersList(params: {
  tenantId: string;
  status?: string;
  start?: string;
  end?: string;
  page?: number;
  limit?: number;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!params.tenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const q = new URLSearchParams();
    q.set("tenantId", params.tenantId);
    if (params.status) q.set("status", params.status);
    if (params.start) q.set("startDate", params.start);
    if (params.end) q.set("endDate", params.end);
    q.set("page", String(params.page ?? 1));
    q.set("limit", String(params.limit ?? 20));
    const res = await fetch(`/api/orders?${q.toString()}`);
    const json = (await res.json()) as {
      success: boolean;
      data?: { orders: Order[]; total: number; totalPages: number };
      error?: string;
    };
    if (!res.ok || !json.success || !json.data) {
      setError(json.error ?? "Failed to load orders");
      setOrders([]);
    } else {
      setOrders(json.data.orders);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    }
    setLoading(false);
  }, [
    params.tenantId,
    params.status,
    params.start,
    params.end,
    params.page,
    params.limit,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  return { orders, total, totalPages, loading, error, refetch: load };
}

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}`);
    const json = (await res.json()) as {
      success: boolean;
      data?: { order: Order };
      error?: string;
    };
    if (!res.ok || !json.success || !json.data) {
      setError(json.error ?? "Failed to load order");
      setOrder(null);
    } else {
      setOrder(json.data.order);
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { order, loading, error, refetch: load };
}
